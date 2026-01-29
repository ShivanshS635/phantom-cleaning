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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[320px]">
        <h2 className="text-xl font-bold mb-4 text-center">
          Admin Verification
        </h2>

        <input
          type="password"
          placeholder="Enter Admin Password"
          className="w-full border p-2 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={verifyAdmin}
            disabled={loading}
            className="flex-1 bg-black text-white py-2 rounded"
          >
            {loading ? "Verifying..." : "Enter"}
          </button>

          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-center mt-3 text-gray-500">
          Auto-locks after 10 minutes
        </p>
      </div>
    </div>
  );
}