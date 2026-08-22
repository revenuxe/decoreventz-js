"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

export function TagInput({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Existing tags used across other products, for autocomplete. */
  suggestions: string[];
}) {
  const [input, setInput] = useState("");

  const matches = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return suggestions.filter((s) => s.toLowerCase().includes(q) && !value.includes(s)).slice(0, 6);
  }, [input, suggestions, value]);

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(input);
            }
          }}
          placeholder="Add a tag, press Enter…"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        {matches.length > 0 && (
          <div className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
            {matches.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => addTag(m)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
              >
                #{m}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
