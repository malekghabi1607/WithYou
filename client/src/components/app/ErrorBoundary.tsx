import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0a0a0a", color: "#f4f4f5", fontFamily: "Inter, sans-serif" }}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Une erreur est survenue</h1>
            <p style={{ opacity: 0.8, marginBottom: "1rem" }}>Recharge la page pour reprendre la session.</p>
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
