import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import api from "../api/axios";
import { showSuccess, showError } from "../utils/toast";

export default function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log(password);
      const res = await api.post("/auth/login", { password });
      localStorage.setItem("token", res.data.token);
      showSuccess("Dashboard Unlocked!");
      navigate("/", { replace: true });
    } catch (err) {
      showError(err.response?.data?.message || "Unlock failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── Left Brand Panel ────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] sidebar-bg flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-800/10 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-float">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white">Phantom Cleaning</p>
            <p className="text-xs text-slate-400 tracking-widest uppercase">Admin Portal</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/20 border border-brand-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-xs font-medium text-brand-300">Operations Dashboard</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Run your cleaning<br />
              business <span className="text-gradient">smarter.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Real-time job tracking, team management, and financial insights — all in one place.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-slate-600">
          © 2026 Phantom Cleaning. All rights reserved.
        </p>
      </div>

      {/* ── Right Form Panel ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface-0">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <p className="font-bold text-ink-primary">Phantom Cleaning</p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-ink-primary">Admin Access</h2>
            <p className="text-ink-secondary mt-2">Enter the master password to unlock the dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink-secondary">Secret Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter access code"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="input-premium pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 py-3 text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Unlocking...
                </>
              ) : (
                <>
                  Unlock Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}