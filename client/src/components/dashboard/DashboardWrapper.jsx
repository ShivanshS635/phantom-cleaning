import { useState, useEffect } from "react";
import AdminUnlockModal from "../admin/AdminUnlockModal";
import DashboardPanel from "./DashboardPanel";
import { isAdminUnlocked, lockAdmin } from "../../utils/adminAuth";
import { useNavigate } from "react-router-dom";

export default function DashboardWrapper() {
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAdminUnlocked()) {
        lockAdmin();
        setUnlocked(false);
      }
    }, 5000); // check every 5 sec

    return () => clearInterval(interval);
  }, []);

  if (!unlocked) {
    return (
      <AdminUnlockModal
        onSuccess={() => setUnlocked(true)}
        onClose={() => navigate(-1)}
      />
    );
  }

  return <DashboardPanel onLock={() => setUnlocked(false)} />;
}
