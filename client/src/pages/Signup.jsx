import { useState } from "react";
import api from "../api/axios";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/signup", {
        name,
        email,
        password,
        role
      });

      localStorage.setItem("token", res.data.token);
      alert("Signup successful! Logging you in.");
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-xl shadow-lg w-[350px]"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Admin Signup
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 mb-4 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <select
          className="w-full border p-2 mb-4 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="SuperAdmin">Super Admin</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Cleaner">Cleaner</option>
        </select>

        <div className="relative mb-4">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-2 rounded pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <span
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-2 cursor-pointer text-sm text-blue-600"
          >
            {showPass ? "Hide" : "Show"}
          </span>
        </div>

        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          {loading ? "Creating..." : "Signup"}
        </button>

        <p className="text-sm mt-4 text-center">
          Already have account?{" "}
          <a href="/login" className="text-blue-600 underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}