import { useState, useEffect } from "react";
import AdminUnlockModal from "../admin/AdminUnlockModal";
import DashboardPanel from "./DashboardPanel";
import { isAdminUnlocked, lockAdmin } from "../../utils/adminAuth";

export default function DashboardWrapper() {
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());

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
        onClose={() => window.history.back()}
      />
    );
  }

  return <DashboardPanel onLock={() => setUnlocked(false)} />;
}
