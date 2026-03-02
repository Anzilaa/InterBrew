"use client";
import { useState, useEffect, useRef } from "react";

export function useSpeech(onTextExtracted) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTextExtracted(transcript); // Send text back to UI
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, [onTextExtracted]);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text) => {
    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech before starting a new one
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        // Optional: tweak voice settings here (pitch, rate, specific voices)
        utterance.rate = 1.0;
        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        reject(e);
      }
    });
  };

  return { isListening, startListening, stopListening, speak };
}