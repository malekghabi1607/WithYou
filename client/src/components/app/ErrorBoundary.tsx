import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  errorMessage?: string;
  errorStack?: string;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    const normalized =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error), stack: undefined };

    return {
      hasError: true,
      errorMessage: normalized.message,
      errorStack: normalized.stack,
    };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0a0a0a", color: "#f4f4f5", fontFamily: "Inter, sans-serif" }}>
          <div style={{ textAlign: "center", padding: "2rem", maxWidth: 760, width: "100%" }}>
            <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Une erreur est survenue</h1>
            <p style={{ opacity: 0.8, marginBottom: "1rem" }}>Recharge la page pour reprendre la session.</p>
            {this.state.errorMessage && (
              <div
                style={{
                  textAlign: "left",
                  margin: "0 auto 1rem",
                  padding: "0.9rem 1rem",
                  borderRadius: 12,
                  background: "rgba(24,24,27,0.96)",
                  border: "1px solid rgba(244,63,94,0.35)",
                  color: "#fecdd3",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {this.state.errorMessage}
              </div>
            )}
            {this.state.errorStack && (
              <details
                style={{
                  textAlign: "left",
                  margin: "0 auto 1rem",
                  padding: "0.85rem 1rem",
                  borderRadius: 12,
                  background: "rgba(24,24,27,0.72)",
                  border: "1px solid rgba(63,63,70,0.9)",
                  color: "#d4d4d8",
                }}
              >
                <summary style={{ cursor: "pointer", marginBottom: "0.65rem" }}>Détails techniques</summary>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "0.78rem" }}>
                  {this.state.errorStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "0.6rem 0.9rem", cursor: "pointer" }}
            >
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
