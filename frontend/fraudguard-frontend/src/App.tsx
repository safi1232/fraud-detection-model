
import { useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronDown,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  WalletCards,
  Zap,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./App.css";
import PredictionForm from "./components/PredictionForm";
import {
  getPredictionHistory,
  type PredictionHistoryItem,
} from "./utils/history";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Predictions", icon: ShieldCheck },
  { label: "Transactions", icon: WalletCards },
  { label: "Model performance", icon: Activity },
];

type ApiStatus = "checking" | "online" | "offline";

function App() {
  const [history, setHistory] = useState<PredictionHistoryItem[]>(
    () => getPredictionHistory(),
  );

  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [modelVersion, setModelVersion] = useState("Checking...");
  const [fraudClass, setFraudClass] = useState("Not reported");
  const [modelReady, setModelReady] = useState<boolean | null>(null);

  const [activePage, setActivePage] = useState("Overview");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [fraudAlerts, setFraudAlerts] = useState(
    () => localStorage.getItem("fraudguard_fraud_alerts") !== "false",
  );

  const [showApiDetails, setShowApiDetails] = useState(false);

  const apiUrl =
    import.meta.env.VITE_API_BASE_URL || "Not configured";

  useEffect(() => {
    const refreshHistory = () => {
      setHistory(getPredictionHistory());
    };

    window.addEventListener("fraudguard-history-updated", refreshHistory);
    window.addEventListener("storage", refreshHistory);

    return () => {
      window.removeEventListener("fraudguard-history-updated", refreshHistory);
      window.removeEventListener("storage", refreshHistory);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkApi = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      if (!baseUrl) {
        if (!cancelled) {
          setApiStatus("offline");
          setModelVersion("API not configured");
          setFraudClass("Not available");
          setModelReady(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${baseUrl.replace(/\/+$/, "")}/health`,
          { signal: AbortSignal.timeout(8000) },
        );

        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }

        const data: Record<string, unknown> = await response.json();

        if (cancelled) return;

        setApiStatus("online");

        const version =
          data.model_version ?? data.version ?? data.modelVersion;

        setModelVersion(
          typeof version === "string" || typeof version === "number"
            ? String(version)
            : "Not reported by API",
        );

        const label =
          data.fraud_class ?? data.positive_class ?? data.fraud_label;

        setFraudClass(
          typeof label === "string" || typeof label === "number"
            ? String(label)
            : "Not reported by API",
        );

        const ready =
          data.model_loaded ?? data.model_ready ?? data.modelReady;

        setModelReady(typeof ready === "boolean" ? ready : null);
      } catch {
        if (cancelled) return;

        setApiStatus("offline");
        setModelVersion("Unavailable");
        setFraudClass("Unavailable");
        setModelReady(false);
      }
    };

    void checkApi();

    const intervalId = window.setInterval(() => {
      void checkApi();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const totalTransactions = history.length;

  const fraudCount = history.filter(
    (item) => item.predicted === 1,
  ).length;

  const fraudRate =
    totalTransactions > 0
      ? (fraudCount / totalTransactions) * 100
      : 0;

  const activity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    const dayItems = history.filter((item) => {
      const created = new Date(item.createdAt);

      return (
        created.getFullYear() === date.getFullYear() &&
        created.getMonth() === date.getMonth() &&
        created.getDate() === date.getDate()
      );
    });

    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      transactions: dayItems.length,
      fraud: dayItems.filter((item) => item.predicted === 1).length,
    };
  });

  const scrollToSection = (label: string) => {
    const targets: Record<string, string> = {
      Overview: "overview",
      Predictions: "prediction",
      Transactions: "transactions",
      "Model performance": "model-performance",
    };

    setActivePage(label);

    document.getElementById(targets[label])?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    setShowApiDetails(false);
  };

  const connectionLabel =
    apiStatus === "checking"
      ? "Checking..."
      : apiStatus === "online"
        ? "Connected"
        : "Disconnected";

  const serviceLabel =
    apiStatus === "checking"
      ? "Checking..."
      : apiStatus === "online"
        ? "Online"
        : "Offline";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#overview"
          aria-label="FraudGuard home"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("Overview");
          }}
        >
          <span className="brand-icon">
            <ShieldCheck size={23} />
          </span>

          <span>
            <strong>FraudGuard</strong>
            <small>RISK INTELLIGENCE</small>
          </span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              className={`nav-item ${activePage === label ? "active" : ""}`}
              key={label}
              type="button"
              onClick={() => scrollToSection(label)}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Predictions" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={19} />
            </div>
            <strong>Need some help?</strong>
            <p>Learn how to interpret your model&apos;s predictions.</p>
            <a
              href="https://fastapi.tiangolo.com/"
              target="_blank"
              rel="noreferrer"
            >
              API documentation ↗
            </a>
          </div>

          <button
            className="nav-item settings-button"
            type="button"
            onClick={() => {
              setProfileMenuOpen(false);
              setSettingsOpen(true);
            }}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="profile-area">
            <button
              className="profile"
              type="button"
              aria-expanded={profileMenuOpen}
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              <div className="avatar">FG</div>
              <div className="profile-info">
                <strong>Fraud Analyst</strong>
                <span>FraudGuard Workspace</span>
              </div>
              <ChevronDown
                size={17}
                className={`muted-icon ${profileMenuOpen ? "chevron-open" : ""}`}
              />
            </button>

            {profileMenuOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-heading">
                  <div className="avatar">FG</div>
                  <div>
                    <strong>Fraud Analyst</strong>
                    <span>Workspace administrator</span>
                  </div>
                </div>

                <div className="profile-workspace">
                  <span className="workspace-mini-icon">
                    <ShieldCheck size={16} />
                  </span>
                  <div>
                    <strong>FraudGuard</strong>
                    <span>Machine learning workspace</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                >
                  <Settings size={16} />
                  Workspace settings
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    window.alert(
                      "FraudGuard is your transaction fraud detection workspace.",
                    );
                  }}
                >
                  <CircleHelp size={16} />
                  About this workspace
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <div
              className={`system-status api-${apiStatus}`}
              role="status"
              aria-live="polite"
            >
              <span className="status-dot" />
              {apiStatus === "checking"
                ? "Checking API..."
                : apiStatus === "online"
                  ? "API online"
                  : "API unavailable"}
            </div>

            <button
              className="icon-button"
              aria-label="Search transactions"
              type="button"
              onClick={() => scrollToSection("Transactions")}
            >
              <Search size={19} />
            </button>

            <button
              className="icon-button"
              aria-label="Notifications"
              type="button"
              onClick={() => {
                const flagged = history.filter(
                  (item) => item.predicted === 1,
                ).length;

                window.alert(
                  `Saved predictions: ${history.length}\nFraud-flagged predictions: ${flagged}`,
                );
              }}
            >
              <Bell size={19} />
            </button>
          </div>
        </header>

        <div className="page-content">
          <section id="overview" className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                FRAUD MONITORING
              </div>
              <h1>Overview</h1>
              <p className="page-description">
                Monitor transaction risk and evaluate your fraud detection model.
              </p>
            </div>

            <div className="header-actions">
              <span className="date-label">
                <Clock3 size={15} />
                Live monitoring
              </span>
              <button
                className="primary-button"
                type="button"
                onClick={() => scrollToSection("Predictions")}
              >
                <Zap size={17} />
                Analyze transaction
              </button>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-heading">
                <span>Total transactions</span>
                <span className="stat-icon teal">
                  <WalletCards size={19} />
                </span>
              </div>
              <div className="stat-value">
                {totalTransactions.toLocaleString()}
              </div>
              <div className="stat-footer">
                <span className="neutral-chip">Saved predictions</span>
                <span>Transaction volume</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-heading">
                <span>Fraud detected</span>
                <span className="stat-icon red">
                  <ShieldAlert size={19} />
                </span>
              </div>
              <div className="stat-value">
                {fraudCount.toLocaleString()}
              </div>
              <div className="stat-footer">
                <span className="neutral-chip">Model flagged</span>
                <span>Predicted fraud cases</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-heading">
                <span>Fraud rate</span>
                <span className="stat-icon amber">
                  <AlertTriangle size={19} />
                </span>
              </div>
              <div className="stat-value">{fraudRate.toFixed(1)}%</div>
              <div className="stat-footer">
                <span className="neutral-chip">Based on history</span>
                <span>Share flagged as fraud</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-heading">
                <span>Model version</span>
                <span className="stat-icon blue">
                  <Activity size={19} />
                </span>
              </div>
              <div className="stat-value version-value">{modelVersion}</div>
              <div className="stat-footer">
                <span className="neutral-chip">
                  {apiStatus === "online" ? "API connected" : "Live API status"}
                </span>
                <span>Version reported by API</span>
              </div>
            </article>
          </section>

          <section id="model-performance" className="analytics-grid">
            <article className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h2>Transaction activity</h2>
                  <p>Transaction volume and detected fraud over time</p>
                </div>
                <span className="select-button">
                  Last 7 days
                  <ChevronDown size={15} />
                </span>
              </div>

              <div className="chart-legend">
                <span>
                  <i className="legend-dot teal-dot" />
                  Transactions
                </span>
                <span>
                  <i className="legend-dot red-dot" />
                  Fraud detected
                </span>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activity}
                    margin={{ top: 10, right: 6, left: -16, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="transactionFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fraudFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.13} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#edf0f5" strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#8992a3", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#8992a3", fontSize: 12 }}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="transactions"
                      name="Transactions"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fill="url(#transactionFill)"
                    />
                    <Area
                      type="monotone"
                      dataKey="fraud"
                      name="Fraud detected"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#fraudFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-note">
                <Activity size={16} />
                Showing saved predictions from the last 7 days.
              </div>
            </article>

            <article className="panel model-panel">
              <div className="panel-heading">
                <div>
                  <h2>Model health</h2>
                  <p>Prediction service overview</p>
                </div>
                <span
                  className={`neutral-chip ${
                    apiStatus === "online" ? "api-health-online" : ""
                  }`}
                >
                  {connectionLabel}
                </span>
              </div>

              <div className="model-illustration">
                <div className="model-orbit orbit-one" />
                <div className="model-orbit orbit-two" />
                <div className="model-core">
                  <Shield size={34} strokeWidth={1.5} />
                </div>
                <span className="orbit-node node-one">
                  <Activity size={15} />
                </span>
                <span className="orbit-node node-two">
                  <Zap size={15} />
                </span>
                <span className="orbit-node node-three">
                  <ShieldCheck size={15} />
                </span>
              </div>

              <div className="model-info">
                <div>
                  <span>Model version</span>
                  <strong>{modelVersion}</strong>
                </div>
                <div>
                  <span>Fraud class</span>
                  <strong>{fraudClass}</strong>
                </div>
                <div>
                  <span>Service status</span>
                  <strong
                    className={
                      apiStatus === "online"
                        ? "status-online"
                        : "status-unverified"
                    }
                  >
                    {serviceLabel}
                  </strong>
                </div>
                <div>
                  <span>Model readiness</span>
                  <strong
                    className={
                      modelReady === true
                        ? "status-online"
                        : "status-unverified"
                    }
                  >
                    {modelReady === null
                      ? "Not reported by API"
                      : modelReady
                        ? "Ready"
                        : "Not ready"}
                  </strong>
                </div>
              </div>

              <div className="model-footnote">
                <span className="info-mark">i</span>
                API status refreshes every 30 seconds. Model details depend on
                the metadata returned by your backend.
              </div>
            </article>
          </section>

          <section id="prediction" className="prediction-panel">
            <PredictionForm />
          </section>

          <section id="transactions" className="panel history-panel">
            <div className="panel-heading">
              <div>
                <h2>Transaction history</h2>
                <p>Review transactions analyzed by your model</p>
              </div>
              <span className="neutral-chip">{history.length} records</span>
            </div>

            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Prediction</th>
                    <th>Confidence</th>
                    <th>Date and time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="history-empty">
                        No predictions yet. Analyze a transaction to see it here.
                      </td>
                    </tr>
                  ) : (
                    history.map((item, index) => (
                      <tr
                        key={`${item.TransactionID}-${item.createdAt}-${index}`}
                      >
                        <td className="history-id">{item.TransactionID}</td>
                        <td>
                          {item.Amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td>
                          <span
                            className={`prediction-badge ${
                              item.predicted === 1
                                ? "fraud-badge"
                                : "legitimate-badge"
                            }`}
                          >
                            {item.predicted === 1
                              ? "Fraud risk"
                              : "Likely legitimate"}
                          </span>
                        </td>
                        <td>{(item.confidence * 100).toFixed(1)}%</td>
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="footer">
            <span>
              FraudGuard <span className="footer-separator">·</span> Risk intelligence
            </span>
            <span>ML model v{modelVersion}</span>
          </footer>
        </div>

        {settingsOpen && (
          <div className="settings-overlay" onClick={closeSettings}>
            <section
              className="settings-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="settings-header">
                <div>
                  <span className="settings-kicker">PREFERENCES</span>
                  <h2 id="settings-title">Workspace settings</h2>
                  <p>Manage your FraudGuard workspace.</p>
                </div>
                <button
                  className="settings-close"
                  type="button"
                  aria-label="Close settings"
                  onClick={closeSettings}
                >
                  ×
                </button>
              </div>

              <div className="settings-section">
                <div className="settings-section-icon">
                  <Bell size={19} />
                </div>
                <div className="settings-section-content">
                  <h3>Fraud alerts</h3>
                  <p>Save your preference for fraud-related alerts.</p>
                </div>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={fraudAlerts}
                    onChange={(event) => {
                      const enabled = event.target.checked;
                      setFraudAlerts(enabled);
                      localStorage.setItem(
                        "fraudguard_fraud_alerts",
                        String(enabled),
                      );
                    }}
                  />
                  <span />
                </label>
              </div>

              <div className="settings-divider" />

              <div className="settings-section">
                <div className="settings-section-icon">
                  <ShieldCheck size={19} />
                </div>
                <div className="settings-section-content">
                  <h3>Prediction service</h3>
                  <p>Inspect the API configuration used for predictions.</p>
                  <div className="settings-api-row">
                    <span
                      className={`status-dot ${
                        apiStatus === "online"
                          ? "settings-status-online"
                          : apiStatus === "offline"
                            ? "settings-status-offline"
                            : ""
                      }`}
                    />
                    <span>
                      {apiStatus === "checking"
                        ? "Checking connection..."
                        : apiStatus === "online"
                          ? "API online"
                          : "API unavailable"}
                    </span>
                  </div>
                  <button
                    className="settings-text-button"
                    type="button"
                    onClick={() => setShowApiDetails((show) => !show)}
                  >
                    {showApiDetails ? "Hide API address" : "View API address"}
                  </button>
                  {showApiDetails && (
                    <code className="settings-api-url">{apiUrl}</code>
                  )}
                </div>
              </div>

              <div className="settings-divider" />

              <div className="settings-section">
                <div className="settings-section-icon">
                  <Activity size={19} />
                </div>
                <div className="settings-section-content">
                  <h3>Model information</h3>
                  <p>Review the current workspace configuration.</p>
                  <div className="settings-detail-grid">
                    <div>
                      <span>Application</span>
                      <strong>FraudGuard</strong>
                    </div>
                    <div>
                      <span>Version</span>
                      <strong>{modelVersion}</strong>
                    </div>
                    <div>
                      <span>Saved predictions</span>
                      <strong>{history.length}</strong>
                    </div>
                    <div>
                      <span>Model readiness</span>
                      <strong>
                        {modelReady === null
                          ? "Not reported"
                          : modelReady
                            ? "Ready"
                            : "Not ready"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-footer">
                <span>Preferences are saved in this browser.</span>
                <button
                  className="primary-button"
                  type="button"
                  onClick={closeSettings}
                >
                  Done
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
