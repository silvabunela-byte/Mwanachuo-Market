"use client";

import { useEffect, useState } from "react";

const OTHER = "__other__";

/** Chaguo za "Hali" ya bidhaa. Mtumiaji anaweza pia kuandika mwenyewe. */
export const CONDITION_OPTIONS = ["Mpya", "Imetumika", "Haihusiki"];

/**
 * Orodha ya kuchagua + chaguo la "Nyingine" linalofungua kisanduku
 * cha kuandika mwenyewe.
 */
export default function SelectOrType({
  value,
  onChange,
  options,
  inputClass,
  placeholder = "Andika hapa...",
  otherLabel = "Nyingine (andika mwenyewe)",
  maxLength = 60,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  inputClass: string;
  placeholder?: string;
  otherLabel?: string;
  maxLength?: number;
}) {
  const [custom, setCustom] = useState(
    value.trim() !== "" && !options.includes(value)
  );

  // Wakati wa kuhariri: thamani isiyo kwenye orodha ifungue kisanduku cha kuandika
  useEffect(() => {
    if (value.trim() !== "" && !options.includes(value)) setCustom(true);
  }, [value, options]);

  return (
    <div className="space-y-2">
      <select
        className={inputClass}
        value={custom ? OTHER : value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === OTHER) {
            setCustom(true);
            onChange("");
          } else {
            setCustom(false);
            onChange(v);
          }
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
        <option value={OTHER}>{otherLabel}</option>
      </select>
      {custom && (
        <input
          className={inputClass}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
