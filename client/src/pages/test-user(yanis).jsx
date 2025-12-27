import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function TestUserYanis() 
{
  // Formulaire inscription
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // Formulaire login
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("jwt_token") ?? "");

  const handleChangeRegister = (e) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeLogin = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setOutput("Erreur register : " + JSON.stringify(data, null, 2));
        return;
      }

      setOutput("Succès register :\n" + JSON.stringify(data, null, 2));
    } catch (error) {
      setOutput("Erreur réseau register : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setOutput("Erreur login : " + JSON.stringify(data, null, 2));
        return;
      }

      const t = data.access_token || data.token || data.jwt || "";
      if (t) {
        localStorage.setItem("jwt_token", t);
        localStorage.setItem("token", t);
        setToken(t);
      }
      
      setOutput("Succès login :\n" + JSON.stringify(data, null, 2));
    } catch (error) {
      setOutput("Erreur réseau login : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMe = async () => {
    const currentToken = token || localStorage.getItem("jwt_token");

    if (!currentToken) {
      setOutput("Aucun token trouvé dans localStorage. Fais un login d'abord.");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setOutput("Erreur /me : " + JSON.stringify(data, null, 2));
        return;
      }

      setOutput("Réponse /me :\n" + JSON.stringify(data, null, 2));
    } catch (error) {
      setOutput("Erreur réseau /me : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutLocal = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("token");
    setToken("");
    setOutput("Token supprimé du localStorage.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 16px",
        backgroundColor: "#0f172a",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 900 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Page de test Auth (Yanis)
        </h1>
        <p style={{ marginBottom: 24, color: "#9ca3af" }}>
          Cette page sert uniquement à tester rapidement les routes
          <code> /api/auth/register</code>, <code>/api/auth/login</code> et
          <code> /api/auth/me</code> de ton API Laravel.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
            marginBottom: 24,
          }}
        >
          {/* Bloc Register */}
          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #1f2937",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              Register
            </h2>
            <form onSubmit={handleRegister} style={{ display: "grid", gap: 8 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span>Nom</span>
                <input
                  type="text"
                  name="username"
                  value={registerForm.name}
                  onChange={handleChangeRegister}
                  style={inputStyle}
                  placeholder="Yanis"
                  required
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleChangeRegister}
                  style={inputStyle}
                  placeholder="yanis@example.com"
                  required
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span>Mot de passe</span>
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleChangeRegister}
                  style={inputStyle}
                  required
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span>Confirmation</span>
                <input
                  type="password"
                  name="password_confirmation"
                  value={registerForm.password_confirmation}
                  onChange={handleChangeRegister}
                  style={inputStyle}
                  required
                />
              </label>
              <button type="submit" style={buttonStyle} disabled={loading}>
                {loading ? "Chargement..." : "Tester /api/auth/register"}
              </button>
            </form>
          </div>

          {/* Bloc Login */}
          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #1f2937",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              Login
            </h2>
            <form onSubmit={handleLogin} style={{ display: "grid", gap: 8 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleChangeLogin}
                  style={inputStyle}
                  required
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span>Mot de passe</span>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleChangeLogin}
                  style={inputStyle}
                  required
                />
              </label>
              <button type="submit" style={buttonStyle} disabled={loading}>
                {loading ? "Chargement..." : "Tester /api/auth/login"}
              </button>
            </form>

            <div style={{ marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
              Token actuel :
              <br />
              <code
                style={{
                  wordBreak: "break-all",
                  fontSize: 11,
                  backgroundColor: "#020617",
                }}
              >
                {token || "(aucun)"}
              </code>
              <br />
              <button
                type="button"
                onClick={handleLogoutLocal}
                style={{ ...buttonStyle, marginTop: 8, backgroundColor: "#b91c1c" }}
              >
                Vider le token local
              </button>
            </div>
          </div>

          {/* Bloc /me */}
          <div
            style={{
              backgroundColor: "#020617",
              borderRadius: 12,
              padding: 16,
              border: "1px solid #1f2937",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              /api/auth/me
            </h2>
            <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 12 }}>
              Appelle la route <code>/api/auth/me</code> avec le token stocké dans
              le localStorage.
            </p>
            <button type="button" style={buttonStyle} onClick={handleMe} disabled={loading}>
              {loading ? "Chargement..." : "Tester /api/auth/me"}
            </button>
          </div>
        </div>

        {/* Zone d'output */}
        <div
          style={{
            backgroundColor: "#020617",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #1f2937",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            Réponse API
          </h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 13,
              maxHeight: 320,
              overflow: "auto",
            }}
          >
            {output || "Aucune requête envoyée pour l'instant."}
          </pre>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #374151",
  backgroundColor: "#020617",
  color: "#e5e7eb",
  fontSize: 14,
};

const buttonStyle = {
  marginTop: 8,
  padding: "8px 12px",
  borderRadius: 9999,
  border: "none",
  backgroundColor: "#4f46e5",
  color: "white",
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
