import { useState } from "react";
import api from "../../api/axios";
import { showSuccess, showError } from "../../utils/toast";
import { unlockAdmin } from "../../utils/adminAuth";

export default function AdminUnlockModal({ onSuccess, onClose }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyAdmin = async () => {
    try {
      setLoading(true);

      await api.post("/admin/verify", {
        adminPassword: password
      });

      showSuccess("Admin verified successfully");
      unlockAdmin();
      onSuccess();
    } catch (err) {
      showError(err.response?.data?.message || "Invalid admin password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-primary/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-surface-0 p-6 sm:p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-surface-3 animate-in zoom-in-95 duration-300">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-brand-50 mx-auto flex items-center justify-center mb-4">
            <span className="text-xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-ink-primary">
            Admin Verification
          </h2>
          <p className="text-sm text-ink-muted mt-1">Please enter your password to continue</p>
        </div>

        <input
          type="password"
          placeholder="Enter Admin Password"
          className="input-premium mb-5 text-center tracking-widest text-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && verifyAdmin()}
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary text-sm"
          >
            Cancel
          </button>
          <button
            onClick={verifyAdmin}
            disabled={loading}
            className="flex-1 btn-primary text-sm shadow-brand relative"
          >
            {loading ? <span className="animate-pulse">Verifying...</span> : "Enter"}
          </button>
        </div>

        <p className="text-[11px] font-medium text-center mt-5 text-ink-muted uppercase tracking-wider">
          Auto-locks after 10 minutes
        </p>
      </div>
    </div>
  );
}