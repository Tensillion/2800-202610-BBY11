import { useEffect, useRef, useState } from "react";
import "./AskAIPopUp.css";
import type { Plant } from "../PlantData";
const BACKEND_URL = "http://localhost:3000";

type AskAIPopUpProps = {
  plantInfo: Plant;
};

const PRESET_QUESTIONS = [
  "Dangerous lookalikes?",
  "Identification tips?",
  "Beginner safety advice?",
  "Where does this grow?",
  "How should this be prepared?",
];

const COOLDOWN_MS = 5000;
const MIN_QUESTION_LENGTH = 3;
const MAX_QUESTION_LENGTH = 200;

const isAbortError = (value: unknown): value is { name: string } => {
  return typeof value === "object" && value !== null && "name" in value;
};

export default function AskAIPopUp({ plantInfo }: AskAIPopUpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const cooldownRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      if (cooldownRef.current !== null) {
        window.clearTimeout(cooldownRef.current);
      }
    };
  }, []);

  const startCooldown = () => {
    setIsCooldown(true);
    if (cooldownRef.current !== null) {
      window.clearTimeout(cooldownRef.current);
    }
    cooldownRef.current = window.setTimeout(() => {
      setIsCooldown(false);
      cooldownRef.current = null;
    }, COOLDOWN_MS);
  };

  const resetState = () => {
    setQuestion("");
    setAnswer("");
    setError("");
    setIsSubmitting(false);
    setIsCooldown(false);
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (cooldownRef.current !== null) {
      window.clearTimeout(cooldownRef.current);
      cooldownRef.current = null;
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    resetState();
  };

  const submitQuestion = async (
    rawQuestion: string,
    clearAfterStart = false,
  ) => {
    if (isSubmitting || isCooldown) {
      return;
    }

    const trimmed = rawQuestion.trim();
    if (trimmed.length < MIN_QUESTION_LENGTH) {
      setError("Please enter a longer question.");
      return;
    }
    if (trimmed.length > MAX_QUESTION_LENGTH) {
      setError("Please keep the question under 200 characters.");
      return;
    }

    setQuestion(trimmed);
    setAnswer("");
    setError("");
    setIsSubmitting(true);
    if (clearAfterStart) {
      setQuestion("");
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      //Change the URL here
      const response = await fetch(`${BACKEND_URL}/ask-gemini`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmed, plantInfo }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      const answerText =
        typeof data?.answer === "string" ? data.answer.trim() : "";
      if (!answerText) {
        throw new Error("Empty response");
      }
      setAnswer(answerText);
    } catch (fetchError) {
      if (isAbortError(fetchError) && fetchError.name === "AbortError") {
        return;
      }
      setError("Unable to get an answer right now. Please try again.");
    } finally {
      if (!controller.signal.aborted) {
        setIsSubmitting(false);
        startCooldown();
      }
    }
  };

  const handlePresetClick = (preset: string) => {
    setQuestion(preset);
    submitQuestion(preset);
  };

  const handleSubmit = () => {
    submitQuestion(question);
  };

  return (
    <div className="ask-ai">
      {isOpen ? (
        <div className="ask-ai-panel" role="dialog" aria-label="Ask AI">
          <div className="ask-ai-header">
            <h2>Ask AI</h2>
            <button className="ask-ai-close" onClick={handleClose}>
              Close
            </button>
          </div>
          <p className="ask-ai-subtitle">
            Choose a preset question or ask your own.
          </p>
          <div className="ask-ai-presets">
            {PRESET_QUESTIONS.map((preset) => (
              <button
                className="ask-ai-preset"
                type="button"
                key={preset}
                onClick={() => handlePresetClick(preset)}
                disabled={isSubmitting || isCooldown}
              >
                {preset}
              </button>
            ))}
          </div>
          <div className="ask-ai-input-row">
            <input
              className="ask-ai-input"
              type="text"
              placeholder="Type your question..."
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitQuestion(question, true);
                }
              }}
              disabled={isSubmitting}
              maxLength={MAX_QUESTION_LENGTH}
            />
            <button
              className="ask-ai-submit"
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isCooldown}
            >
              {isSubmitting ? "Sending..." : "Submit"}
            </button>
          </div>
          {isCooldown ? (
            <p className="ask-ai-note">
              Please wait a few seconds before asking again.
            </p>
          ) : null}
          {error ? <p className="ask-ai-error">{error}</p> : null}
          {answer ? (
            <div className="ask-ai-answer">
              <h3>Answer</h3>
              <p>{answer}</p>
            </div>
          ) : null}
        </div>
      ) : null}
      <button className="ask-ai-fab" onClick={() => setIsOpen(!isOpen)}>
        Ask AI
      </button>
    </div>
  );
}
