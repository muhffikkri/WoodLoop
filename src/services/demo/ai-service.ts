import type { AISuggestion, WoodForm, VisibleCondition } from "@/domain/types";
import type { AiAnalysisService } from "@/services/repositories";

export class DemoAiService implements AiAnalysisService {
  /**
   * Generates a sample AI suggestion for demonstration purposes.
   * Explicitly flagged as "demo_example", never certified or disguised as real analysis.
   */
  getSampleSuggestion(form?: WoodForm): AISuggestion {
    const suggestedForm: WoodForm = form ?? "board";
    const conditions: VisibleCondition[] = ["apparently_intact"];

    return {
      id: `ai-sample-${crypto.randomUUID().slice(0, 8)}`,
      modelId: "woodloop-cv-demo-v0.2",
      status: "demo_example",
      suggestedForm,
      visibleConditions: conditions,
      confidence: 0.85,
      explanation:
        "Uniform rectangular offcut detected with clean visible edges. Manual physical inspection of moisture, grain, and dimensions is required before confirming.",
      reviewedBySupplier: false,
    };
  }

  async analyzePhotos(photoIds: string[]): Promise<AISuggestion> {
    if (photoIds.length === 0) {
      return {
        id: `ai-err-${Date.now()}`,
        status: "failed",
        visibleConditions: [],
        explanation: "No photos provided for analysis.",
        reviewedBySupplier: false,
      };
    }

    // In demo environment without connected inference worker:
    // Return sample analysis with explicit demo status
    await new Promise((resolve) => setTimeout(resolve, 600));

    return this.getSampleSuggestion();
  }
}

export const demoAiService = new DemoAiService();
