"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "../../src/redux/api/authApi";
import { parseAuthError, ParsedError } from "../../src/utils/errorParser";
import { FiLock, FiMail, FiUser, FiPlay, FiAlertCircle } from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorDetails, setErrorDetails] = useState<ParsedError | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);

    try {
      await register({
        username: username.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      }).unwrap();
      router.push("/");
    } catch (err: any) {
      setErrorDetails(parseAuthError(err, "register"));
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-[var(--accent-primary)]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[var(--accent-secondary)]/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] text-white flex items-center justify-center mx-auto shadow-lg shadow-[var(--accent-primary)]/30">
            <FiPlay className="w-6 h-6 fill-current translate-x-0.5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">Create Account</h1>
          <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)]">Join VibeShorts and start sharing viral shorts</p>
        </div>

        {errorDetails && errorDetails.title && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-xs">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorDetails.title}</span>
            </div>
            {errorDetails.details.length > 0 && (
              <ul className="text-xs space-y-1 pl-6 list-disc font-medium text-rose-400">
                {errorDetails.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Choose username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all font-medium"
              />
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Your display name..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all font-medium"
              />
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all font-medium"
              />
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Minimum 6 characters..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all font-medium"
              />
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11.5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] via-rose-500 to-[var(--accent-secondary)] text-white font-bold text-sm shadow-md shadow-[var(--accent-primary)]/20 hover:shadow-lg hover:shadow-[var(--accent-primary)]/35 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center text-xs font-semibold text-[var(--text-secondary)]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[var(--accent-primary)] hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
