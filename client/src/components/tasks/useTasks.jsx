import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks"); // → /api/tasks
      setTasks(res.data);
    } catch (err) {
      console.error("Task fetch failed");
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading };
}