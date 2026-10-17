
import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { savePrediction } from "../utils/history";
import "./PredictionForm.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

type FormValues = {
  TransactionID: string;
  Amount: string;
  Hour: string;
  DayOfWeek: string;
  MerchantCategory: string;
  PaymentMethod: string;
  DeviceType: string;
  Country: string;
  AccountAgeDays: string;
  PreviousTransactions: string;
  AverageTransactionAmount: string;
  TransactionsLast24H: string;
  FailedTransactionsLast24H: string;
  IsInternational: string;
  DistanceFromHomeKm: string;
  DeviceChange: string;
  IPRiskScore: string;
  MerchantRiskScore: string;
};

type PredictionResult = {
  TransactionID: string;
  prediction: {
    predicted: number;
    confidence: number;
    output_probability: Record<string, number>;
  };
};

const initialValues: FormValues = {
  TransactionID: `TXN-${Date.now()}`,
  Amount: "150.00",
  Hour: "14",
  DayOfWeek: "2",
  MerchantCategory: "",
  PaymentMethod: "",
  DeviceType: "",
  Country: "",
  AccountAgeDays: "180",
  PreviousTransactions: "20",
  AverageTransactionAmount: "75.00",
  TransactionsLast24H: "3",
  FailedTransactionsLast24H: "0",
  IsInternational: "0",
  DistanceFromHomeKm: "5",
  DeviceChange: "0",
  IPRiskScore: "20",
  MerchantRiskScore: "15",
};

const sections = [
  {
    title: "Transaction details",
    description: "Enter the transaction and merchant information.",
    fields: [
      { name: "TransactionID", label: "Transaction ID", type: "text" },
      { name: "Amount", label: "Transaction amount", type: "number", step: "0.01", min: "0" },
      { name: "Hour", label: "Hour of transaction (0–23)", type: "number", min: "0", max: "23" },
      { name: "DayOfWeek", label: "Day of week (training encoding)", type: "number", min: "0", max: "6" },
      {
      name: "MerchantCategory",
      label: "Merchant category",
      type: "select",
      },
     { name: "PaymentMethod", label: "Payment method", type: "select" },
     { name: "DeviceType", label: "Device type", type: "select" },
     { name: "Country", label: "Country", type: "select" },
    ],
  },
  {
    title: "Account activity",
    description: "Describe the customer's account and recent activity.",
    fields: [
      { name: "AccountAgeDays", label: "Account age (days)", type: "number", min: "0" },
      { name: "PreviousTransactions", label: "Previous transactions", type: "number", min: "0" },
      { name: "AverageTransactionAmount", label: "Average transaction amount", type: "number", min: "0", step: "0.01" },
      { name: "TransactionsLast24H", label: "Transactions in last 24 hours", type: "number", min: "0" },
      { name: "FailedTransactionsLast24H", label: "Failed transactions in last 24 hours", type: "number", min: "0" },
    ],
  },
  {
    title: "Risk signals",
    description: "Provide the risk features used by your model.",
    fields: [
      { name: "IsInternational", label: "International transaction", type: "select" },
      { name: "DistanceFromHomeKm", label: "Distance from home (km)", type: "number", min: "0", step: "0.1" },
      { name: "DeviceChange", label: "Device changed", type: "select" },
      { name: "IPRiskScore", label: "IP risk score", type: "number", min: "0" },
      { name: "MerchantRiskScore", label: "Merchant risk score", type: "number", min: "0" },
    ],
  },
] as const;

type FieldName = keyof FormValues;



function AppField({
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
}: {
  name: FieldName;
  label: string;
  type: string;
  value: string;
  onChange: (name: FieldName, value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <label className="prediction-field">
      <span>{label}</span>

      {type === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          required
        >
          {name === "MerchantCategory" ? (
            <>
              <option value="">Select merchant category</option>
              <option value="Clothing">Clothing</option>
              <option value="Electronics">Electronics</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Food">Food</option>
              <option value="Grocery">Grocery</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Online">Online</option>
              <option value="Travel">Travel</option>
            </>
          ) : name === "PaymentMethod" ? (
            <>
              <option value="">Select payment method</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="UPI">UPI</option>
              <option value="Wallet">Wallet</option>
            </>
          ) : name === "DeviceType" ? (
            <>
              <option value="">Select device type</option>
              <option value="Desktop">Desktop</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
            </>
          ) : name === "Country" ? (
            <>
              <option value="">Select country</option>
              <option value="Australia">Australia</option>
              <option value="Canada">Canada</option>
              <option value="Germany">Germany</option>
              <option value="India">India</option>
              <option value="Pakistan">Pakistan</option>
              <option value="UAE">UAE</option>
              <option value="UK">UK</option>
              <option value="USA">USA</option>
            </>
          ) : (
            <>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </>
          )}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required
        />
      )}
    </label>
  );
}



export default function PredictionForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(name: FieldName, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    if (!API_URL) {
      setError("API URL is missing. Check the VITE_API_BASE_URL setting in .env.local and restart Vite.");
      setLoading(false);
      return;
    }

    const numericFields: FieldName[] = [
      "Amount",
      "Hour",
      "DayOfWeek",
      "AccountAgeDays",
      "PreviousTransactions",
      "AverageTransactionAmount",
      "TransactionsLast24H",
      "FailedTransactionsLast24H",
      "IsInternational",
      "DistanceFromHomeKm",
      "DeviceChange",
      "IPRiskScore",
      "MerchantRiskScore",
    ];

    const payload: Record<string, string | number> = { ...values };

    for (const field of numericFields) {
      payload[field] = Number(values[field]);
    }

    try {
      const response = await fetch(`${API_URL.replace(/\/+$/, "")}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`API error ${response.status}: ${details}`);
      }

      const data = (await response.json()) as PredictionResult;
      if (!data.prediction || typeof data.prediction.predicted !== "number") {
        throw new Error("The API returned an unexpected response format.");
      }

      setResult(data);

try {
  savePrediction({
    TransactionID: data.TransactionID,
    Amount: Number(values.Amount),
    predicted: data.prediction.predicted,
    confidence: data.prediction.confidence,
    legitimateProbability:
      data.prediction.output_probability["0"] ?? 0,
    fraudProbability:
      data.prediction.output_probability["1"] ?? 0,
    createdAt: new Date().toISOString(),
  });
} catch {
  setError(
    "Prediction succeeded, but its history could not be saved in this browser.",
  );
}
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the prediction API.",
      );
    } finally {
      setLoading(false);
    }
  }

  const isFraud = result?.prediction.predicted === 1;
  const confidence = result
    ? (result.prediction.confidence * 100).toFixed(1)
    : "0.0";

  return (
    <section className="prediction-form-card">
      <div className="prediction-heading">
        <div>
          <span className="prediction-eyebrow">MODEL INFERENCE</span>
          <h2>Analyze a transaction</h2>
          <p>Submit transaction features for a fraud risk prediction.</p>
        </div>
        <div className="prediction-heading-icon">
          <ShieldCheck size={25} />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {sections.map((section) => (
          <div className="prediction-section" key={section.title}>
            <div className="prediction-section-heading">
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>

            <div className="prediction-fields-grid">
              {section.fields.map((field) => (
                <AppField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  value={values[field.name]}
                  onChange={updateField}
                  placeholder={
  "placeholder" in field && typeof field.placeholder === "string"
    ? field.placeholder
    : undefined
}
                  min={"min" in field ? field.min : undefined}
                  max={"max" in field ? field.max : undefined}
                  step={"step" in field ? field.step : undefined}
                />
              ))}
            </div>
          </div>
        ))}

        <button className="prediction-submit" type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Analyzing transaction...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Analyze transaction
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="prediction-error" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Prediction failed</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div
          className={`prediction-result ${isFraud ? "fraud-result" : "safe-result"}`}
          aria-live="polite"
        >
          <div className="result-title">
            {isFraud ? <ShieldAlert size={25} /> : <CheckCircle2 size={25} />}
            <div>
              <span>MODEL PREDICTION</span>
              <h3>{isFraud ? "Potential fraud detected" : "Likely legitimate"}</h3>
            </div>
          </div>

          <div className="result-confidence">
            <span>Model confidence</span>
            <strong>{confidence}%</strong>
          </div>

          <div className="probability-row">
            <span>Legitimate (class 0)</span>
            <strong>
              {((result.prediction.output_probability["0"] ?? 0) * 100).toFixed(1)}%
            </strong>
          </div>
          <div className="probability-track">
            <div
              className="probability-fill legitimate-fill"
              style={{
                width: `${Math.min(100, Math.max(0, (result.prediction.output_probability["0"] ?? 0) * 100))}%`,
              }}
            />
          </div>

          <div className="probability-row">
            <span>Fraud (class 1)</span>
            <strong>
              {((result.prediction.output_probability["1"] ?? 0) * 100).toFixed(1)}%
            </strong>
          </div>
          <div className="probability-track">
            <div
              className="probability-fill fraud-fill"
              style={{
                width: `${Math.min(100, Math.max(0, (result.prediction.output_probability["1"] ?? 0) * 100))}%`,
              }}
            />
          </div>

          <p className="result-disclaimer">
            This is a machine-learning prediction, not a guarantee. Review
            suspicious transactions before taking action.
          </p>
        </div>
      )}
    </section>
  );
}
