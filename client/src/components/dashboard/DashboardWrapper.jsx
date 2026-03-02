import { useState, useEffect, Suspense, lazy } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import AdminUnlockModal from "../admin/AdminUnlockModal";
import { isAdminUnlocked, lockAdmin } from "../../utils/adminAuth";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import DashboardLoading from "./DashboardLoading";

const DashboardPanel = lazy(() => import("./DashboardPanel"));

export default function DashboardWrapper() {
  const [unlocked, setUnlocked] = useState(() => {
    try { return isAdminUnlocked(); }
    catch { return false; }
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLockStatus = () => {
      try {
        if (!isAdminUnlocked()) { lockAdmin(); setUnlocked(false); }
      } catch (err) {
        setError("Failed to verify admin access");
      }
    };
    checkLockStatus();
    const interval = setInterval(checkLockStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlockSuccess = () => { setUnlocked(true); setError(null); };
  const handleLock = () => { try { lockAdmin(); setUnlocked(false); } catch { setError("Failed to lock"); } };
  const handleNavigateBack = () => { try { navigate(-1); } catch { navigate("/"); } };

  // ── Error State ──
  if (error) {
    return (
      <div className="min-h-screen bg-surface-1 flex items-center justify-center p-6">
        <div className="card border-rose-200 max-w-md w-full p-10 text-center animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={24} className="text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-ink-primary mb-2">Access Error</h2>
          <p className="text-sm text-ink-secondary mb-8">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => { setError(null); setUnlocked(false); }}
              className="btn-primary w-full py-3"
            >
              Try Again
            </button>
            <button onClick={handleNavigateBack} className="btn-secondary w-full py-3">
              <ArrowLeft size={15} /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Locked State ──
  if (!unlocked) {
    return (
      <ErrorBoundary>
        <AdminUnlockModal onSuccess={handleUnlockSuccess} onClose={handleNavigateBack} />
      </ErrorBoundary>
    );
  }

  // ── Dashboard ──
  return (
    <ErrorBoundary onReset={() => setUnlocked(false)}>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardPanel onLock={handleLock} />
      </Suspense>
    </ErrorBoundary>
  );
}