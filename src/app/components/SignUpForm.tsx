/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import axios from "axios";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignUpForm() {
  const [email, setEmail] = useState("testddd@test.com");
  const [password, setPassword] = useState("Test1234");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/signup", {
        email,
        password,
      });

      if (response.status === 201) {
        // Logger le user créé
        console.log("Utilisateur créé:", response.data.user);

        // Connexion automatique de l'utilisateur
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          setError(result.error);
          setSuccess("");
        } else {
          // Redirection après une connexion réussie
          window.location.href = "/admin/dashboard";
          setSuccess("Utilisateur créé et connecté avec succès !");
          setError("");
          setEmail("");
          setPassword("");
        }
      } else {
        setError("Échec de la création de l'utilisateur.");
        setSuccess("");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.error ||
          "Échec de la création de l'utilisateur. Veuillez réessayer."
      );
      setSuccess("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Inscription</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded-md text-slate-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mot de passe</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded-md text-slate-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          S&apos;inscrire
        </button>
      </form>
      <Link
        href="/auth/signin"
        className="text-blue-500 hover:underline mt-4 block"
      >
        Vous avez déjà un compte ? Connectez-vous
      </Link>
    </div>
  );
}
