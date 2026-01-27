import { useEffect, useState } from "react";

export default function DashboardFilters({ from, to, setFrom, setTo }) {
  const [activePreset, setActivePreset] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (from && to && new Date(from) > new Date(to)) {
      setError("From date cannot be after To date");
    } else {
      setError("");
    }
  }, [from, to]);

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    setFrom(start.toISOString().split("T")[0]);
    setTo(end.toISOString().split("T")[0]);
    setActivePreset(days);
  };

  const resetFilters = () => {
    setFrom("");
    setTo("");
    setActivePreset("");
    setError("");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-6 py-5 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-semibold text-gray-800">
          Filter by date
        </p>

        <button
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-black transition"
        >
          Reset
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-3 mb-5">
        <PresetButton
          label="Today"
          active={activePreset === 0}
          onClick={() => applyPreset(0)}
        />
        <PresetButton
          label="Last 7 days"
          active={activePreset === 7}
          onClick={() => applyPreset(7)}
        />
        <PresetButton
          label="Last 30 days"
          active={activePreset === 30}
          onClick={() => applyPreset(30)}
        />
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          label="From"
          value={from}
          onChange={(v) => {
            setFrom(v);
            setActivePreset("");
          }}
          error={!!error}
        />

        <DateInput
          label="To"
          value={to}
          onChange={(v) => {
            setTo(v);
            setActivePreset("");
          }}
          error={!!error}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-3 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function PresetButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition
        ${
          active
            ? "bg-black text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
    >
      {label}
    </button>
  );
}

function DateInput({ label, value, onChange, error }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 px-4 rounded-lg border text-sm transition
          ${
            error
              ? "border-red-400 focus:ring-red-200"
              : "border-gray-300 focus:ring-black/20 focus:border-black"
          }
          focus:outline-none focus:ring-2
        `}
      />
    </div>
  );
}
