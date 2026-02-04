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

const TestSalonPage: React.FC = () => {
  const [token, setToken] = useState<string>("");
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  const [newSalonName, setNewSalonName] = useState<string>("");
  const [joinSalonId, setJoinSalonId] = useState<string>("");

  const [responseLog, setResponseLog] = useState<string>("");

  useEffect(() => {
    const storedToken = window.localStorage.getItem("token");
    if (!storedToken) return;

    setToken(storedToken);

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/salons`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(JSON.stringify(data));
        }

        setSalons(data);
        setSelectedSalon(null);
        setResponseLog(JSON.stringify(data, null, 2));
      } catch (error: any) {
        setResponseLog(`Erreur LISTE SALONS AUTO:\n${error?.message ?? String(error)}`);
      }
    })();
  }, []);

  const authHeaders = () => {
    if (!token) {
      throw new Error("Aucun token renseigné");
    }

    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleListSalons = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/salons`, {
        method: "GET",
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setSalons(data);
      setSelectedSalon(null);
      setResponseLog(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResponseLog(`Erreur LISTE SALONS:\n${error?.message ?? String(error)}`);
    }
  };

  const handleCreateSalon = async () => {
    if (!newSalonName.trim()) {
      setResponseLog("Merci de renseigner un nom de salon.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/salons`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: newSalonName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setResponseLog(JSON.stringify(data, null, 2));
      setNewSalonName("");
      await handleListSalons();
    } catch (error: any) {
      setResponseLog(`Erreur CREATION SALON:\n${error?.message ?? String(error)}`);
    }
  };

  const handleJoinSalon = async () => {
    if (!joinSalonId.trim()) {
      setResponseLog("Merci de renseigner un id_salon à rejoindre.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/salons/join`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ salon_id: joinSalonId.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setResponseLog(JSON.stringify(data, null, 2));
      setJoinSalonId("");
      await handleListSalons();
    } catch (error: any) {
      setResponseLog(`Erreur JOIN SALON:\n${error?.message ?? String(error)}`);
    }
  };

  const handleShowSalon = async (salonId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/salons/${encodeURIComponent(salonId)}`, {
        method: "GET",
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setSelectedSalon(data);
      setResponseLog(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResponseLog(`Erreur SHOW SALON:\n${error?.message ?? String(error)}`);
    }
  };

  const handleConnectSalon = async (salonId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/salons/${encodeURIComponent(salonId)}/connect`, {
        method: "POST",
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setSelectedSalon(data);
      setResponseLog(JSON.stringify(data, null, 2));
      await handleListSalons();
    } catch (error: any) {
      setResponseLog(`Erreur CONNECT SALON:\n${error?.message ?? String(error)}`);
    }
  };

  const handleDisconnectSalon = async (salonId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/salons/${encodeURIComponent(salonId)}/disconnect`, {
        method: "POST",
        headers: authHeaders(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setSelectedSalon(data);
      setResponseLog(JSON.stringify(data, null, 2));
      await handleListSalons();
    } catch (error: any) {
      setResponseLog(`Erreur DISCONNECT SALON:\n${error?.message ?? String(error)}`);
    }
  };

  return (
    <div style={{ padding: "24px", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <h1>Test salons (API)</h1>

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
          Colle ici le token obtenu depuis la page de test utilisateur (login) si besoin.
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

      {/* Actions salons */}
      <section
        style={{
          marginTop: "16px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Actions salons</h2>

        {/* Liste des salons */}
        <div style={{ marginBottom: "12px" }}>
          <button onClick={handleListSalons}>Lister mes salons</button>
        </div>

        {/* Créer un salon */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ marginBottom: 4 }}>Créer un salon</div>
          <input
            type="text"
            value={newSalonName}
            onChange={(e) => setNewSalonName(e.target.value)}
            placeholder="Nom du salon"
            style={{ marginRight: 8, padding: 4 }}
          />
          <button onClick={handleCreateSalon}>Créer</button>
        </div>

        {/* Rejoindre un salon */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ marginBottom: 4 }}>Rejoindre un salon (id_salon)</div>
          <input
            type="text"
            value={joinSalonId}
            onChange={(e) => setJoinSalonId(e.target.value)}
            placeholder="id_salon à rejoindre"
            style={{ marginRight: 8, padding: 4 }}
          />
          <button onClick={handleJoinSalon}>Rejoindre</button>
        </div>
      </section>

      {/* Liste affichée des salons */}
      <section
        style={{
          marginTop: "16px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Mes salons</h2>
        {salons.length === 0 && <p>Aucun salon pour le moment.</p>}

        {salons.map((salon) => (
          <div
            key={salon.id_salon}
            style={{
              padding: "8px",
              border: "1px solid #eee",
              borderRadius: "6px",
              marginBottom: "8px",
            }}
          >
            <div>
              <strong>{salon.name}</strong> ({salon.id_salon})
            </div>
            <div style={{ fontSize: "0.9rem", color: "#555" }}>
              Proprio: {salon.owner?.username ?? salon.owner_id}
            </div>
            <div style={{ marginTop: 6 }}>
              <button
                style={{ marginRight: 8 }}
                onClick={() => handleShowSalon(salon.id_salon)}
              >
                Détails / show
              </button>
              <button
                style={{ marginRight: 8 }}
                onClick={() => handleConnectSalon(salon.id_salon)}
              >
                Se connecter
              </button>
              <button onClick={() => handleDisconnectSalon(salon.id_salon)}>
                Se déconnecter
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Log / réponse brute */}
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

      {/* Détails salon sélectionné */}
      {selectedSalon && (
        <section
          style={{
            marginTop: "16px",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h2>Détails du salon sélectionné</h2>
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
            {JSON.stringify(selectedSalon, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
};

export default TestSalonPage;
