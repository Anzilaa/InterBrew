"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import "./lesson.css";

// Convert YouTube URL to embed URL
function getEmbedUrl(url) {
  if (!url) return null;
  // Already an embed URL
  if (url.includes("/embed/")) return url;
  // Extract video ID from various YouTube URL formats
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function LessonView({ module, onBack, onComplete }) {
  const [lessons, setLessons] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]); // 5 random quiz questions for the module
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [step, setStep] = useState(0); // 0 = explanation, 1 = video, 2 = quiz
  const [currentQuiz, setCurrentQuiz] = useState(0); // index within the 5 quiz questions
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({}); // track answers for all quiz questions { quizIndex: { selected, correct } }

  // Interview state
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [interviewInput, setInterviewInput] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [interviewQuestionIndex, setInterviewQuestionIndex] = useState(0);

  // Feedback state
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function fetchLessons() {
      if (!supabase || !module?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch lessons for this module
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("module_id", module.id)
          .order("order_number", { ascending: true });

        if (lessonError) {
          console.error("Error fetching lessons:", lessonError);
          setLoading(false);
          return;
        }

        if (lessonData && lessonData.length > 0) {
          setLessons(lessonData);

          // Fetch ALL quizzes for all lessons in this module
          const lessonIds = lessonData.map((l) => l.id);
          const { data: quizData, error: quizError } = await supabase
            .from("quizzes")
            .select("*")
            .in("lesson_id", lessonIds);

          if (!quizError && quizData && quizData.length > 0) {
            // Normalize options: handle array, object {A:...,B:...,C:...,D:...}, or JSON string
            const normalized = quizData.map((q) => {
              let opts = q.options;
              if (typeof opts === "string") {
                try {
                  opts = JSON.parse(opts);
                } catch {
                  opts = null;
                }
              }
              let correctAnswer = q.correct_answer;
              if (!Array.isArray(opts) && opts && typeof opts === "object") {
                // Resolve correct_answer key (e.g. "B") to its text value
                if (correctAnswer && opts[correctAnswer]) {
                  correctAnswer = opts[correctAnswer];
                }
                // Extract values in key order
                opts = Object.keys(opts)
                  .sort()
                  .map((k) => opts[k]);
              }
              if (!Array.isArray(opts)) opts = [];
              return { ...q, options: opts, correct_answer: correctAnswer };
            });
            // Shuffle and pick up to 5 random questions
            const shuffled = [...normalized].sort(() => Math.random() - 0.5);
            setQuizQuestions(shuffled.slice(0, 5));
          }
        }
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [module]);

  const lesson = lessons[currentLesson];
  const hasQuiz = quizQuestions.length > 0;
  const isLastLesson = currentLesson === lessons.length - 1;
  // Steps: explanation, [video], [quiz], interview, feedback
  let totalSteps = 1; // explanation always
  if (lesson?.video_url) totalSteps++;
  if (hasQuiz) totalSteps++;
  totalSteps++; // interview
  totalSteps++; // feedback always last
  const activeQuiz = hasQuiz ? quizQuestions[currentQuiz] : null;
  const isLastQuizQuestion = currentQuiz === quizQuestions.length - 1;

  // Generate mock interview questions based on module context
  const interviewQuestions = [
    `Tell me about your understanding of ${module?.title || "this topic"}.`,
    `Can you walk me through a real-world scenario where you'd apply what you learned in ${module?.title || "this module"}?`,
    `What challenges do you think someone might face when dealing with ${module?.title || "this topic"} in a professional setting?`,
    `How would you explain ${module?.title || "this concept"} to someone who has never heard of it?`,
    `What was the most important takeaway from this module for you?`,
  ];

  const handleNext = () => {
    const stepType = getStepType();

    // If on quiz step and more quiz questions remain, advance quiz question
    if (stepType === "quiz" && !isLastQuizQuestion) {
      setCurrentQuiz(currentQuiz + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      return;
    }

    // If on interview step, advance to feedback
    if (stepType === "interview") {
      generateFeedback();
      setStep(step + 1);
      return;
    }

    // If on feedback step, this means "Complete Module"
    if (stepType === "feedback") {
      if (isLastLesson) {
        onComplete?.();
      } else {
        setCurrentLesson(currentLesson + 1);
        setStep(0);
        setSelectedAnswer(null);
        setAnswered(false);
        setCurrentQuiz(0);
        resetInterview();
        setFeedback(null);
      }
      return;
    }

    if (step < totalSteps - 1) {
      setStep(step + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setCurrentQuiz(0);
    } else if (!isLastLesson) {
      setCurrentLesson(currentLesson + 1);
      setStep(0);
      setSelectedAnswer(null);
      setAnswered(false);
      setCurrentQuiz(0);
      resetInterview();
      setFeedback(null);
    } else {
      onComplete?.();
    }
  };

  const handlePrev = () => {
    const stepType = getStepType();

    // If on feedback step, go back to interview
    if (stepType === "feedback") {
      setStep(step - 1);
      return;
    }

    // If on interview step, go back to quiz (last question) or previous step
    if (stepType === "interview") {
      setStep(step - 1);
      if (hasQuiz) setCurrentQuiz(quizQuestions.length - 1);
      const prev = hasQuiz ? quizAnswers[quizQuestions.length - 1] : null;
      setSelectedAnswer(prev?.selected ?? null);
      setAnswered(!!prev);
      return;
    }

    // If on quiz step and not on first question, go back one quiz question
    if (stepType === "quiz" && currentQuiz > 0) {
      setCurrentQuiz(currentQuiz - 1);
      const prev = quizAnswers[currentQuiz - 1];
      setSelectedAnswer(prev?.selected ?? null);
      setAnswered(!!prev);
      return;
    }

    if (step > 0) {
      setStep(step - 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
      const prevLesson = lessons[currentLesson - 1];
      const prevHasVideo = !!prevLesson?.video_url;
      // Go to interview step of the previous lesson (last step)
      let prevTotalSteps = 1;
      if (prevHasVideo) prevTotalSteps++;
      if (hasQuiz) prevTotalSteps++;
      prevTotalSteps++; // interview
      prevTotalSteps++; // feedback
      setStep(prevTotalSteps - 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  const handleSelectAnswer = (option) => {
    if (answered) return;
    setSelectedAnswer(option);
    setAnswered(true);
    // Track this answer
    setQuizAnswers((prev) => ({
      ...prev,
      [currentQuiz]: {
        selected: option,
        correct: option === activeQuiz?.correct_answer,
      },
    }));
  };

  // Map step index to actual content type
  const getStepType = () => {
    const types = ["explanation"];
    if (lesson?.video_url) types.push("video");
    if (hasQuiz) types.push("quiz");
    types.push("interview");
    types.push("feedback");
    return types[step] || "explanation";
  };

  const resetInterview = () => {
    setInterviewMessages([]);
    setInterviewInput("");
    setInterviewStarted(false);
    setInterviewEnded(false);
    setInterviewQuestionIndex(0);
  };

  const generateFeedback = () => {
    // Quiz score
    const totalQuiz = Object.keys(quizAnswers).length;
    const correctCount = Object.values(quizAnswers).filter(
      (a) => a.correct,
    ).length;
    const quizPercent =
      totalQuiz > 0 ? Math.round((correctCount / totalQuiz) * 100) : 0;

    // Collect user's interview answers
    const userResponses = interviewMessages
      .filter((m) => m.role === "user")
      .map((m) => m.text);
    const avgResponseLength =
      userResponses.length > 0
        ? Math.round(
            userResponses.reduce((sum, r) => sum + r.split(" ").length, 0) /
              userResponses.length,
          )
        : 0;

    // Determine strengths and areas to improve
    const strengths = [];
    const improvements = [];

    if (quizPercent >= 80)
      strengths.push("Strong grasp of theoretical concepts");
    else if (quizPercent >= 50)
      improvements.push(
        "Review quiz topics to strengthen theoretical knowledge",
      );
    else
      improvements.push(
        "Revisit the explanation and video materials for better concept clarity",
      );

    if (avgResponseLength >= 20)
      strengths.push("Detailed and thoughtful interview responses");
    else if (avgResponseLength >= 10)
      improvements.push("Try to elaborate more in your interview answers");
    else
      improvements.push("Provide more detailed responses during the interview");

    if (userResponses.length === interviewQuestions.length)
      strengths.push("Completed all interview questions");
    if (correctCount === totalQuiz && totalQuiz > 0)
      strengths.push("Perfect quiz score!");

    if (strengths.length === 0)
      strengths.push("Completed the full module flow");
    if (improvements.length === 0)
      improvements.push("Continue practicing to maintain your skills");

    // Overall rating
    let overallRating;
    let ratingColor;
    if (quizPercent >= 80 && avgResponseLength >= 15) {
      overallRating = "Excellent";
      ratingColor = "emerald";
    } else if (quizPercent >= 60 && avgResponseLength >= 10) {
      overallRating = "Good";
      ratingColor = "blue";
    } else if (quizPercent >= 40) {
      overallRating = "Satisfactory";
      ratingColor = "amber";
    } else {
      overallRating = "Needs Improvement";
      ratingColor = "rose";
    }

    setFeedback({
      quizScore: {
        correct: correctCount,
        total: totalQuiz,
        percent: quizPercent,
      },
      interviewStats: {
        questionsAnswered: userResponses.length,
        avgWords: avgResponseLength,
      },
      strengths,
      improvements,
      overallRating,
      ratingColor,
    });
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setInterviewMessages([
      {
        role: "ai",
        text: `Welcome! I'll be conducting a brief interview about "${module?.title || "this module"}". Let's begin.\n\n${interviewQuestions[0]}`,
      },
    ]);
    setInterviewQuestionIndex(0);
  };

  const sendInterviewMessage = () => {
    if (!interviewInput.trim() || interviewEnded) return;

    const userMsg = { role: "user", text: interviewInput.trim() };
    const nextIdx = interviewQuestionIndex + 1;

    let aiResponse;
    if (nextIdx < interviewQuestions.length) {
      aiResponse = {
        role: "ai",
        text: `Great answer! Here's the next question:\n\n${interviewQuestions[nextIdx]}`,
      };
      setInterviewQuestionIndex(nextIdx);
    } else {
      aiResponse = {
        role: "ai",
        text: `Thank you for your thoughtful responses! You've completed the interview for "${module?.title || "this module"}". You demonstrated a solid understanding of the material. Click "Complete Module" to finish.`,
      };
      setInterviewEnded(true);
    }

    setInterviewMessages((prev) => [...prev, userMsg, aiResponse]);
    setInterviewInput("");
  };

  const stepType = getStepType();
  const stepLabels = ["Explanation"];
  if (lesson?.video_url) stepLabels.push("Video");
  if (hasQuiz) stepLabels.push(`Quiz (${quizQuestions.length})`);
  stepLabels.push("Interview");
  stepLabels.push("Feedback");

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading lessons...</p>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No lessons available for this module.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 rounded-lg bg-white/8 border border-white/15 text-white text-sm font-medium hover:bg-white/12 transition"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">
            Lesson {currentLesson + 1} of {lessons.length}
          </p>
          <h2 className="text-base font-semibold text-white">
            {lesson?.title}
          </h2>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-1.5 rounded-lg bg-white/8 border border-white/15 text-white text-sm font-medium hover:bg-white/12 transition"
        >
          Back to Modules
        </button>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-4">
        {stepLabels.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              i === step
                ? "bg-white/10 border-white/20 text-white"
                : i < step
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-white/3 border-white/8 text-gray-500"
            }`}
          >
            {i < step ? (
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : null}
            {label}
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="lesson-content flex-1 min-h-0">
        {/* Explanation slide */}
        {stepType === "explanation" && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <h3 className="text-base font-medium text-white mb-4">
              Explanation
            </h3>
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {lesson?.explanation || "No explanation available."}
            </div>
          </div>
        )}

        {/* Video slide */}
        {stepType === "video" && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">
              Video Lesson
            </h3>
            {lesson?.video_url ? (
              <div className="lesson-video-wrapper">
                <iframe
                  src={getEmbedUrl(lesson.video_url)}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No video available.</p>
            )}
          </div>
        )}

        {/* Quiz slide — cycles through 5 random questions */}
        {stepType === "quiz" && activeQuiz && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-white">Quiz</h3>
              <span className="text-xs text-gray-500">
                Question {currentQuiz + 1} of {quizQuestions.length}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-6">{activeQuiz.question}</p>
            <div className="grid grid-cols-2 gap-3">
              {(Array.isArray(activeQuiz.options)
                ? activeQuiz.options
                : []
              ).map((option, i) => {
                const isSelected = selectedAnswer === option;
                const isCorrect =
                  answered && option === activeQuiz.correct_answer;
                const isWrong =
                  answered &&
                  isSelected &&
                  option !== activeQuiz.correct_answer;

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(option)}
                    className={`quiz-option w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      isCorrect
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 quiz-correct"
                        : isWrong
                          ? "bg-rose-500/15 border-rose-500/40 text-rose-300 quiz-wrong"
                          : isSelected
                            ? "bg-white/10 border-white/20 text-white quiz-selected"
                            : "bg-white/3 border-white/8 text-gray-300"
                    }`}
                  >
                    <span className="font-medium text-gray-500 mr-2">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div
                className={`mt-4 text-sm font-medium ${
                  selectedAnswer === activeQuiz.correct_answer
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {selectedAnswer === activeQuiz.correct_answer
                  ? "Correct! Well done."
                  : `Incorrect. The correct answer is: ${activeQuiz.correct_answer}`}
              </div>
            )}
          </div>
        )}

        {/* Interview slide — AI chatbot mock */}
        {stepType === "interview" && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">AI Interview</h3>
                <p className="text-xs text-gray-500">
                  Practice answering interview-style questions
                </p>
              </div>
            </div>

            {!interviewStarted ? (
              <div className="flex flex-col items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 text-center max-w-sm">
                  Ready for a mock interview? The AI will ask you{" "}
                  {interviewQuestions.length} questions about{" "}
                  <span className="text-white font-medium">
                    {module?.title}
                  </span>
                  .
                </p>
                <button
                  onClick={startInterview}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition"
                >
                  Start Interview
                </button>
              </div>
            ) : (
              <>
                {/* Chat messages */}
                <div className="interview-messages flex-1 min-h-0 overflow-y-auto space-y-3 mb-4">
                  {interviewMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 rounded-br-md"
                            : "bg-white/5 border border-white/10 text-gray-300 rounded-bl-md"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input area */}
                {!interviewEnded ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={interviewInput}
                      onChange={(e) => setInterviewInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && sendInterviewMessage()
                      }
                      placeholder="Type your answer..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/40 transition"
                    />
                    <button
                      onClick={sendInterviewMessage}
                      disabled={!interviewInput.trim()}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        interviewInput.trim()
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-white/3 border-white/8 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-xs text-emerald-400/70">
                      Interview complete — click Next to see your feedback
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Feedback slide */}
        {stepType === "feedback" && feedback && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
            {/* Overall rating */}
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Overall Performance
              </p>
              <div
                className={`inline-block px-5 py-2 rounded-full text-sm font-semibold border ${
                  feedback.ratingColor === "emerald"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                    : feedback.ratingColor === "blue"
                      ? "bg-blue-500/15 border-blue-500/40 text-blue-400"
                      : feedback.ratingColor === "amber"
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                        : "bg-rose-500/15 border-rose-500/40 text-rose-400"
                }`}
              >
                {feedback.overallRating}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {feedback.quizScore.percent}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Quiz Score ({feedback.quizScore.correct}/
                  {feedback.quizScore.total})
                </p>
              </div>
              <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {feedback.interviewStats.questionsAnswered}/
                  {interviewQuestions.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Interview Questions (avg {feedback.interviewStats.avgWords}{" "}
                  words)
                </p>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {feedback.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-300 flex items-start gap-2"
                  >
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to improve */}
            <div>
              <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Areas to Improve
              </h4>
              <ul className="space-y-1.5">
                {feedback.improvements.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-300 flex items-start gap-2"
                  >
                    <span className="text-amber-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/8">
        <button
          onClick={handlePrev}
          disabled={currentLesson === 0 && step === 0}
          className={`px-5 py-2 rounded-lg border text-sm font-medium transition-all ${
            currentLesson === 0 && step === 0
              ? "bg-white/3 border-white/5 text-gray-600 cursor-not-allowed"
              : "bg-white/8 border-white/15 text-white hover:bg-white/12"
          }`}
        >
          Previous
        </button>

        <span className="text-xs text-gray-500">
          {stepType === "quiz"
            ? `Quiz ${currentQuiz + 1}/${quizQuestions.length}`
            : stepType === "interview"
              ? `Interview`
              : stepType === "feedback"
                ? `Feedback`
                : `${step + 1} / ${totalSteps}`}
        </span>

        <button
          onClick={handleNext}
          disabled={
            (stepType === "quiz" && !answered) ||
            (stepType === "interview" && !interviewEnded)
          }
          className={`px-5 py-2 rounded-lg border text-sm font-medium transition-all ${
            (stepType === "quiz" && !answered) ||
            (stepType === "interview" && !interviewEnded)
              ? "bg-white/3 border-white/5 text-gray-600 cursor-not-allowed"
              : isLastLesson && step === totalSteps - 1
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30"
                : "bg-white/8 border-white/15 text-white hover:bg-white/12"
          }`}
        >
          {isLastLesson &&
          step === totalSteps - 1 &&
          (stepType !== "quiz" || isLastQuizQuestion)
            ? "Complete Module"
            : stepType === "quiz" && !isLastQuizQuestion
              ? "Next Question"
              : "Next"}
        </button>
      </div>
    </div>
  );
}
