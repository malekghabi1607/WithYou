import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

type SalonMemberPivot = {
  salon_id: string;
  user_id: string;
  join_date: string | null;
  is_active: boolean;
};

type SalonMember = {
  id_user: string;
  username: string;
  email: string;
  pivot: SalonMemberPivot;
};

type SalonOwner = {
  id_user: string;
  username: string;
  email: string;
};

type Salon = {
  id_salon: string;
  name: string;
  date_created: string | null;
  owner_id: string;
  current_video_id: string | null;
  owner?: SalonOwner;
  members?: SalonMember[];
};

const TestPageSalon: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [salonId, setSalonId] = useState<string>("");
  const [salon, setSalon] = useState<Salon | null>(null);
  const [responseLog, setResponseLog] = useState<string>("");

  useEffect(() => {
    const storedToken = window.localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }

    const params = new URLSearchParams(window.location.search);
    const urlSalonId = params.get("salon") || params.get("salonId");
    if (urlSalonId) {
      setSalonId(urlSalonId);
    }
  }, []);

  const authHeaders = () => {
    if (!token) {
      throw new Error("Aucun token JWT n'est défini. Connecte-toi sur la page test-user.");
    }

    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleLoadSalon = async () => {
    if (!salonId.trim()) {
      setResponseLog("Merci de renseigner un id_salon.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/salons/${encodeURIComponent(salonId.trim())}`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setSalon(data);
      setResponseLog(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResponseLog(
        `Erreur CHARGEMENT SALON:\n${error?.message ?? String(error)}`
      );
    }
  };

  const handleConnectSalon = async () => {
    if (!salonId.trim()) {
      setResponseLog("Merci de renseigner un id_salon avant de se connecter.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/salons/${encodeURIComponent(salonId.trim())}/connect`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setSalon(data);
      setResponseLog(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResponseLog(
        `Erreur CONNECT SALON:\n${error?.message ?? String(error)}`
      );
    }
  };

  const handleDisconnectSalon = async () => {
    if (!salonId.trim()) {
      setResponseLog("Merci de renseigner un id_salon avant de se déconnecter.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/salons/${encodeURIComponent(salonId.trim())}/disconnect`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setSalon(data);
      setResponseLog(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResponseLog(
        `Erreur DISCONNECT SALON:\n${error?.message ?? String(error)}`
      );
    }
  };

  useEffect(() => {
    if (!token || !salonId.trim()) return;

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/salons/${encodeURIComponent(salonId.trim())}/connect`,
          {
            method: "POST",
            headers: authHeaders(),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setSalon(data);
          setResponseLog(JSON.stringify(data, null, 2));
        }
      } catch {
      }
    })();

    return () => {
      (async () => {
        try {
          await fetch(
            `${API_BASE_URL}/salons/${encodeURIComponent(
              salonId.trim()
            )}/disconnect`,
            {
              method: "POST",
              headers: authHeaders(),
            }
          );
        } catch {
        }
      })();
    };
  }, [token, salonId]);

  return (
    <div
      style={{
        padding: "24px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <h1>Test Page Salon (Room)</h1>

      {/* Zone Token */}
      <section
        style={{
          marginTop: "16px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Token JWT</h2>
        <p style={{ marginBottom: 8 }}>
          Le token est normalement déjà renseigné depuis la page test-user.
        </p>
        <input
          type="text"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            window.localStorage.setItem("token", e.target.value);
          }}
          placeholder="Bearer token..."
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontFamily: "monospace",
          }}
        />
      </section>

      {/* Zone Salon ID + actions */}
      <section
        style={{
          marginTop: "16px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Salon ciblé</h2>
        <p style={{ marginBottom: 8 }}>
          Renseigne l&apos;id_salon (tu peux le copier depuis la page test-salon).
          Tu peux aussi mettre ?salon=&lt;id_salon&gt; dans l&apos;URL.
        </p>
        <input
          type="text"
          value={salonId}
          onChange={(e) => setSalonId(e.target.value)}
          placeholder="id_salon du salon"
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontFamily: "monospace",
            marginBottom: "8px",
          }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={handleLoadSalon}>Charger le salon (GET /salons/:id)</button>
          <button onClick={handleConnectSalon}>Se connecter au salon</button>
          <button onClick={handleDisconnectSalon}>Se déconnecter du salon</button>
        </div>
      </section>

      {/* Détails du salon */}
      <section
        style={{
          marginTop: "16px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Détails du salon</h2>
        {!salon && <p>Aucun salon chargé pour l&apos;instant.</p>}

        {salon && (
          <div>
            <h3>
              {salon.name}{" "}
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                ({salon.id_salon})
              </span>
            </h3>
            <p>
              Propriétaire :{" "}
              <strong>
                {salon.owner?.username ??
                  salon.owner?.email ??
                  salon.owner_id}
              </strong>
            </p>

            <h4>Membres</h4>
            {(!salon.members || salon.members.length === 0) && (
              <p>Aucun membre pour l&apos;instant.</p>
            )}

            {salon.members && salon.members.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {salon.members.map((membre) => (
                  <li
                    key={membre.id_user}
                    style={{
                      padding: "6px 8px",
                      marginBottom: "4px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{membre.username ?? membre.email}</strong>
                      <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                        id_user : {membre.id_user}
                      </div>
                    </div>
                    <div>
                      {membre.pivot?.is_active ? (
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "999px",
                            backgroundColor: "#bbf7d0",
                            color: "#166534",
                            fontSize: "0.8rem",
                          }}
                        >
                          En ligne
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "999px",
                            backgroundColor: "#e5e7eb",
                            color: "#4b5563",
                            fontSize: "0.8rem",
                          }}
                        >
                          Hors ligne
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Log API */}
      <section
        style={{
          marginTop: "16px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Dernière réponse API</h2>
        <pre
          style={{
            background: "#111827",
            color: "#e5e7eb",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            overflowX: "auto",
          }}
        >
          {responseLog || "// Aucune requête effectuée pour l'instant"}
        </pre>
      </section>
    </div>
  );
};

export default TestPageSalon;
