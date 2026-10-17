
export type PredictionHistoryItem = {
  TransactionID: string;
  Amount: number;
  predicted: number;
  confidence: number;
  legitimateProbability: number;
  fraudProbability: number;
  createdAt: string;
};

const STORAGE_KEY = "fraudguard_prediction_history";

export function getPredictionHistory(): PredictionHistoryItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as PredictionHistoryItem[];
  } catch {
    return [];
  }
}

export function savePrediction(
  item: PredictionHistoryItem,
): PredictionHistoryItem[] {
  const history = getPredictionHistory();

  // Keep the newest prediction first and limit storage to 500 records.
  const updated = [item, ...history].slice(0, 500);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("fraudguard-history-updated"));

  return updated;
}
