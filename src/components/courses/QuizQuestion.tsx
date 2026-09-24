"use client";

import { useState } from "react";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import type { QuizQuestion as QuizQuestionData } from "@/data/course-content";

export default function QuizQuestion({
  question,
  index,
}: {
  question: QuizQuestionData;
  index: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <div>
      <p className="text-sm font-medium leading-6 text-foreground">
        {index + 1}. {question.question}
      </p>
      <div className="mt-3 grid gap-2">
        {question.options.map((option, optionIndex) => {
          const isCorrect = optionIndex === question.correctIndex;
          const isSelected = optionIndex === selected;
          const showCorrect = answered && isCorrect;
          const showWrong = answered && isSelected && !isCorrect;

          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => setSelected(optionIndex)}
              className={`flex items-start gap-2 rounded-lg px-3 py-2 text-left text-sm leading-5 transition-colors ${
                showCorrect
                  ? "bg-primary/10 text-foreground"
                  : showWrong
                    ? "bg-destructive/10 text-foreground"
                    : answered
                      ? "text-muted-foreground/70"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {showCorrect ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              ) : showWrong ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
              ) : (
                <Circle className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" aria-hidden="true" />
              )}
              <span>{option}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{question.explanation}</p>
      )}
    </div>
  );
}
