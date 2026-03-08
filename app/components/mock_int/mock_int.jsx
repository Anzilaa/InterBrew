"use client";
import { useState, useEffect, useRef } from "react";
import { useSpeech } from "./useSpeech";
import { supabase } from "../../../lib/supabaseClient";

export default function MockInterviewPanel({ difficulty, onClose, topic }) {
  const [history, setHistory] = useState([]);
  const historyRef = useRef([]);
  const [status, setStatus] = useState("Ready");
  const [questionIndex, setQuestionIndex] = useState(0);
  const finishedRef = useRef(false);
  const systemPromptRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [favAdded, setFavAdded] = useState([]);

  async function addToFavourites(question) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) throw new Error('Not signed in');

      const { data, error } = await supabase.from('user_dashboards').select('favourite_questions').eq('user_id', userId).single();
      if (error) {
        console.error('Failed to fetch dashboard row', error);
        return false;
      }
      const favs = Array.isArray(data?.favourite_questions) ? data.favourite_questions : [];
      if (favs.includes(question)) {
        setFavAdded((s) => [...s, question]);
        return true;
      }
      const newFavs = [...favs, question];
      const { error: upErr } = await supabase.from('user_dashboards').update({ favourite_questions: newFavs }).eq('user_id', userId);
      if (upErr) {
        console.error('Failed to update favourites', upErr);
        return false;
      }
      try { window.dispatchEvent(new CustomEvent('favourites:updated', { detail: { question } })); } catch (e) {}
      setFavAdded((s) => [...s, question]);
      return true;
    } catch (e) {
      console.error('addToFavourites error', e);
      return false;
    }
  }

  // Initialize our custom speech hook
  const { isListening, startListening, stopListening, speak } = useSpeech(async (userText) => {
    // 1. User stopped talking, we got the text
    setStatus("Thinking...");
    
    // append user message to history state and ref so we always send the latest
    setHistory((prev) => {
      const next = [...prev, { role: "user", content: userText }];
      historyRef.current = next;
      return next;
    });

    try {
      // 2. Send text to our Next.js backend
        const res = await fetch("/api/mock_int", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText, history: historyRef.current, system: systemPromptRef.current }),
        });

      const data = await res.json();

      // 3. AI replied. Prefer structured JSON: { message: string, end: boolean }
      let assistantReplyRaw = data.reply || "";
      let assistantMessage = assistantReplyRaw;
      let isEnd = false;

      try {
        // Try direct parse
        const parsed = JSON.parse(assistantReplyRaw);
        if (parsed && typeof parsed.message === "string") {
          assistantMessage = parsed.message;
          isEnd = !!parsed.end;
        }
      } catch (e) {
        // Try to extract JSON substring
        const jsonMatch = assistantReplyRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && typeof parsed.message === "string") {
              assistantMessage = parsed.message;
              isEnd = !!parsed.end;
            }
          } catch (e2) {
            // fall back to heuristics
          }
        }
      }

      // fallback heuristics: trim multiple questions to first
      if (!isEnd) {
        const questionMarks = (assistantMessage.match(/\?/g) || []).length;
        if (questionMarks > 1) {
          const firstQ = assistantMessage.indexOf("?");
          assistantMessage = assistantMessage.slice(0, firstQ + 1).trim();
        }
      }

      // append assistant reply to history state and ref
      setHistory((prev) => {
        const next = [...prev, { role: "assistant", content: assistantMessage }];
        historyRef.current = next;
        return next;
      });
      setStatus("Ready");
      if (isEnd && !finishedRef.current) {
        finishedRef.current = true;
        try {
          await speak(assistantMessage);
        } catch (e) {
          console.error("TTS error:", e);
        }
        onClose?.();
      } else {
        // speak but don't await for non-final replies
        speak(assistantMessage).catch((e) => console.error("TTS error:", e));
        if (/\?/m.test(assistantMessage)) setQuestionIndex((q) => q + 1);
      }

    } catch (error) {
      console.error(error);
      setStatus("Error fetching response.");
    }
  });

  // helper to start interview by requesting the first question
  async function startInterview() {
    setStatus("Thinking...");
    setStarted(true);
    // Instruct the model to return structured JSON to enforce one-question-at-a-time and reliable ending
    const systemPrompt = `You are a pro technical interviewer. Follow these EXACT rules and output ONLY a JSON object (no extra text):\n
  1) Ask exactly one technical question at a time appropriate for the "${difficulty}" difficulty${topic ? ` about the topic: ${topic}` : ""}.\n
  2) After the user's answer, provide a brief correction if they are wrong (1-2 sentences), then ask the next question.\n
  3) After two questions and corrections, set \"end\": true and provide a short closing message.\n
  The JSON object must have the shape: {"message":"...", "end": false|true}.\n
  If you cannot follow JSON, return a JSON object with the message field containing the text and end=false.`;
    systemPromptRef.current = systemPrompt;

    try {
      const res = await fetch("/api/mock_int", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "__start__", history: historyRef.current, system: systemPromptRef.current }),
      });
      const data = await res.json();
      let assistantReplyRaw = data.reply || "";
      let assistantMessage = assistantReplyRaw;
      let isEnd = false;
      try {
        const parsed = JSON.parse(assistantReplyRaw);
        if (parsed && typeof parsed.message === "string") {
          assistantMessage = parsed.message;
          isEnd = !!parsed.end;
        }
      } catch (e) {
        const jsonMatch = assistantReplyRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && typeof parsed.message === "string") {
              assistantMessage = parsed.message;
              isEnd = !!parsed.end;
            }
          } catch (e2) {}
        }
      }
      // fallback: trim multiple questions to first
      if (!isEnd) {
        const questionMarks = (assistantMessage.match(/\?/g) || []).length;
        if (questionMarks > 1) {
          const firstQ = assistantMessage.indexOf("?");
          assistantMessage = assistantMessage.slice(0, firstQ + 1).trim();
        }
      }
      setHistory((h) => {
        const next = [...h, { role: "assistant", content: assistantMessage }];
        historyRef.current = next;
        return next;
      });
      setStatus("Ready");
      if (isEnd && !finishedRef.current) {
        finishedRef.current = true;
        try {
          await speak(assistantMessage);
        } catch (e) {
          console.error("TTS error:", e);
        }
        onClose?.();
      } else {
        speak(assistantMessage).catch((e) => console.error("TTS error:", e));
      }
    } catch (err) {
      console.error(err);
      setStatus("Error starting interview");
    }
  }

  useEffect(() => {
    // start is manual now; do not auto-start on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative p-6 rounded-lg bg-transparent recommended-card max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold">AI Mock Interview{difficulty ? ` — ${difficulty}` : ""}</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-md bg-white/10">Close</button>
        </div>
      
      <div className="flex items-center gap-4 mb-6">
        {!started ? (
          <button
            onClick={() => startInterview()}
            className={`px-6 py-3 rounded-full text-white font-semibold bg-blue-600 hover:bg-blue-700`}
          >
            Start Interview
          </button>
        ) : (
          <>
            <button
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              aria-pressed={isListening}
              className={`px-6 py-3 rounded-full text-white font-semibold transition-all ${
                isListening ? "bg-red-500 animate-pulse" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isListening ? "Listening... (click to stop)" : "Click to Speak"}
            </button>
          </>
        )}
        <span className="text-gray-600 font-medium">Status: {status}</span>
      </div>

      <div className="bg-white/5 p-4 rounded-md h-64 overflow-y-auto border border-white/10 scrollbar-hide">
        {history.length === 0 ? (
          <p className="text-gray-400 italic">Conversation will appear here...</p>
        ) : (
          history.map((msg, index) => (
            <div key={index} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <span className={`inline-block p-2 rounded-lg ${
                msg.role === "user" ? "bg-blue-100 text-blue-900" : "bg-green-100 text-green-900"
              }`}>
                <strong>{msg.role === "user" ? "You: " : "AI: "}</strong>
                {msg.content}
              </span>
              {msg.role === "assistant" && (
                <button
                  onClick={async (e) => { e.stopPropagation(); await addToFavourites(msg.content); }}
                  className={`ml-2 text-lg px-1 py-0.5 rounded ${favAdded.includes(msg.content) ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'}`}
                  aria-label="Add to favourites"
                >
                  {favAdded.includes(msg.content) ? '★' : '☆'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}