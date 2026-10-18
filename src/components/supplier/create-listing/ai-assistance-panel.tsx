"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AISuggestion, WoodForm } from "@/domain/types";
import { demoAiService } from "@/services/demo/ai-service";

export function AIAssistancePanel({
  photoIds,
  currentWoodForm,
  onAcceptSuggestion,
  onDismissSuggestion,
  initialSuggestion,
}: {
  photoIds: string[];
  currentWoodForm: WoodForm;
  onAcceptSuggestion: (form: WoodForm, noteTag?: string) => void;
  onDismissSuggestion: () => void;
  initialSuggestion?: AISuggestion;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(
    initialSuggestion ?? null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAccepted, setIsAccepted] = useState(
    initialSuggestion?.reviewedBySupplier ?? false,
  );

  async function handlePreviewExample() {
    setIsAnalyzing(true);
    try {
      const sample = demoAiService.getSampleSuggestion(currentWoodForm);
      setSuggestion(sample);
      setIsAccepted(false);
      setIsOpen(true);
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleAnalyzePhotos() {
    if (photoIds.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await demoAiService.analyzePhotos(photoIds);
      setSuggestion(result);
      setIsAccepted(false);
      setIsOpen(true);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleAccept() {
    if (!suggestion) return;
    setIsAccepted(true);
    const formToApply = suggestion.suggestedForm ?? currentWoodForm;
    const conditionTag =
      suggestion.visibleConditions.length > 0
        ? `Visible observation (${suggestion.visibleConditions.join(", ")}): ${suggestion.explanation ?? "Manual inspection confirmed."}`
        : undefined;
    onAcceptSuggestion(formToApply, conditionTag);
  }

  function handleIgnore() {
    setSuggestion(null);
    setIsAccepted(false);
    onDismissSuggestion();
  }

  return (
    <div className="border-line bg-surface rounded-lg border p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-sage-100 flex size-8 items-center justify-center rounded-md text-brand-900">
            <Bot aria-hidden="true" className="size-4" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-ink-900">
              AI Surface & Form Assistance (Optional)
            </h3>
            <p className="text-ink-600 text-xs">
              Advisory tool only. Never certifies species, moisture, or strength.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Collapse AI assistance" : "Expand AI assistance"}
          className="h-8 px-2 text-xs"
        >
          {isOpen ? (
            <ChevronUp aria-hidden="true" className="size-4" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-4" />
          )}
        </Button>
      </div>

      {/* Action triggers when collapsed or empty */}
      {!suggestion && (
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={handlePreviewExample}
            disabled={isAnalyzing}
            className="h-8 px-3 text-xs"
          >
            <Sparkles aria-hidden="true" className="mr-1.5 size-3.5 text-timber-600" />
            {isAnalyzing ? "Analyzing..." : "Preview example AI suggestions"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAnalyzePhotos}
            disabled={isAnalyzing || photoIds.length === 0}
            className="h-8 px-3 text-xs"
          >
            <RefreshCw
              aria-hidden="true"
              className={`mr-1.5 size-3.5 ${isAnalyzing ? "animate-spin" : ""}`}
            />
            Analyze uploaded photos
          </Button>
        </div>
      )}

      {/* Expanded Suggestions Panel */}
      {isOpen && suggestion && (
        <div className="border-line mt-4 rounded-md border bg-sage-100/50 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="demo" className="text-[11px]">
                Demo example, not generated from your photo
              </Badge>
              {suggestion.confidence ? (
                <span className="text-ink-600 text-xs font-medium">
                  {Math.round(suggestion.confidence * 100)}% visual match
                </span>
              ) : null}
            </div>

            {isAccepted ? (
              <Badge variant="available" className="text-[11px]">
                <Check aria-hidden="true" className="mr-1 size-3" />
                Accepted by supplier
              </Badge>
            ) : null}
          </div>

          <div className="mt-3 grid gap-2 text-xs sm:text-sm text-ink-900">
            {suggestion.suggestedForm ? (
              <div>
                <span className="font-semibold text-ink-600">Suggested Form: </span>
                <span className="capitalize font-medium">{suggestion.suggestedForm}</span>
              </div>
            ) : null}

            {suggestion.visibleConditions.length > 0 ? (
              <div>
                <span className="font-semibold text-ink-600">Surface Tags: </span>
                <span className="font-medium">
                  {suggestion.visibleConditions
                    .map((c) => c.replace("_", " "))
                    .join(", ")}
                </span>
              </div>
            ) : null}

            {suggestion.explanation ? (
              <p className="text-ink-600 italic">
                &ldquo;{suggestion.explanation}&rdquo;
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-ink-600">
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0 text-timber-600"
            />
            <span>
              A possible mark or knot is a prompt to inspect physically, not a
              safety verdict. Confirm all details yourself.
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-line">
            {!isAccepted ? (
              <Button
                type="button"
                onClick={handleAccept}
                className="h-8 px-3 text-xs"
              >
                <Check aria-hidden="true" className="mr-1.5 size-3.5" />
                Accept suggestion
              </Button>
            ) : (
              <span className="text-xs font-semibold text-brand-900">
                Form updated to &quot;{suggestion.suggestedForm}&quot;
              </span>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={handleIgnore}
              className="h-8 px-3 text-xs"
            >
              <X aria-hidden="true" className="mr-1.5 size-3.5" />
              Ignore suggestion
            </Button>
          </div>
        </div>
      )}

      {isOpen && !suggestion && (
        <Alert className="mt-4 text-xs">
          AI analysis not connected to live external vision model in demo mode. You can publish
          with your own supplier-verified details.
        </Alert>
      )}
    </div>
  );
}
