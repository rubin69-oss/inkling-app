"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Loader2, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus("error");
      setError("Passwords don't match.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatus("error");
        setError(data.error || "Something went wrong.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Couldn't reach the server. Try again.");
    }
  };

  return (
    <div className="content-page">
      <Link href="/" className="legal-back">
        <ArrowLeft size={14} /> Back to Inkling
      </Link>
      <h1>Set a New Password</h1>

      {status === "done" ? (
        <p className="content-subtitle">
          Your password's been updated. You can close this tab and sign in with your new password.
        </p>
      ) : (
        <form className="modal-form reset-password-form" onSubmit={onSubmit}>
          <div className="field modal-field">
            <Lock className="icon" />
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="field modal-field">
            <Lock className="icon" />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button className="go-btn" type="submit" disabled={status === "loading"}>
            {status === "loading" ? <Loader2 className="spin" size={16} /> : "Update Password"}
          </button>
          {status === "error" && <p className="modal-error">{error}</p>}
        </form>
      )}
    </div>
  );
}
