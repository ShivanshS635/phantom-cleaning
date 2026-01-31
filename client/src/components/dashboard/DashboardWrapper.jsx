import { useState, useEffect, Suspense, lazy } from "react";
import AdminUnlockModal from "../admin/AdminUnlockModal";
import { isAdminUnlocked, lockAdmin } from "../../utils/adminAuth";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import DashboardLoading from "./DashboardLoading";

// Lazy load the dashboard to improve performance
const DashboardPanel = lazy(() => import("./DashboardPanel"));

export default function DashboardWrapper() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return isAdminUnlocked();
    } catch (error) {
      console.error("Error checking admin unlock status:", error);
      return false;
    }
  });
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkLockStatus = () => {
      try {
        if (!isAdminUnlocked()) {
          lockAdmin();
          setUnlocked(false);
        }
      } catch (err) {
        console.error("Error checking lock status:", err);
        setError("Failed to verify admin access");
      }
    };

    // Initial check
    checkLockStatus();

    // Set up periodic checks
    const interval = setInterval(checkLockStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleUnlockSuccess = () => {
    try {
      setUnlocked(true);
      setError(null);
    } catch (err) {
      console.error("Error handling unlock success:", err);
      setError("Failed to unlock dashboard");
    }
  };

  const handleLock = () => {
    try {
      lockAdmin();
      setUnlocked(false);
    } catch (err) {
      console.error("Error locking dashboard:", err);
      setError("Failed to lock dashboard");
    }
  };

  const handleNavigateBack = () => {
    try {
      navigate(-1);
    } catch (err) {
      console.error("Error navigating back:", err);
      // Fallback to home if navigation fails
      navigate("/");
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 max-w-md w-full p-8">
          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">!</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setError(null);
                  setUnlocked(false);
                }}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleNavigateBack}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show unlock modal if not unlocked
  if (!unlocked) {
    return (
      <ErrorBoundary>
        <AdminUnlockModal
          onSuccess={handleUnlockSuccess}
          onClose={handleNavigateBack}
        />
      </ErrorBoundary>
    );
  }

  // Show dashboard with error boundary and loading state
  return (
    <ErrorBoundary onReset={() => setUnlocked(false)}>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardPanel onLock={handleLock} />
      </Suspense>
    </ErrorBoundary>
  );
}