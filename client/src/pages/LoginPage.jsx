import { useState } from "react";
import { api } from "../api";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      setResult(res.data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || { message: "Erreur inconnue" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full px-3 py-2 rounded bg-slate-700"
            placeholder="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            className="w-full px-3 py-2 rounded bg-slate-700"
            placeholder="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 py-2 rounded font-semibold"
          >
            Se connecter
          </button>
        </form>

        {result && (
          <div className="mt-4 text-sm text-emerald-300">
            <div>Connexion OK ✅</div>
            <div>ID: {result.id_user}</div>
            <div>Email: {result.email}</div>
          </div>
        )}

        {error && (
          <pre className="mt-4 text-sm text-red-300 whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}