"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CircleHelp,
  HeartHandshake,
  Loader2,
  Palette,
  Plus,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

type ContentKind = "included_set" | "faq_set" | "delivery_note" | "care_note";
type Tab = "palettes" | "included" | "faqs" | "delivery" | "care";
type ContentItem = {
  id: string;
  name: string;
  kind: ContentKind;
  content: Json;
};
type Faq = { question: string; answer: string };
type PalettePair = {
  id: string;
  color1: { name: string; hex: string };
  color2: { name: string; hex: string };
};
type PaletteItem = { id: string; name: string; content: Json };

const TABS: {
  key: Tab;
  label: string;
  icon: typeof Palette;
  kind?: ContentKind;
}[] = [
  { key: "palettes", label: "Balloon palettes", icon: Palette },
  {
    key: "included",
    label: "What's included",
    icon: Check,
    kind: "included_set",
  },
  { key: "faqs", label: "FAQs", icon: CircleHelp, kind: "faq_set" },
  { key: "delivery", label: "Delivery", icon: Truck, kind: "delivery_note" },
  { key: "care", label: "Care info", icon: HeartHandshake, kind: "care_note" },
];

const QUERY_KEY = ["admin", "decoration-content"];

function asRecord(value: Json): Record<string, Json> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};
}

function readLines(value: Json, key: "included" | "not_included"): string[] {
  const lines = asRecord(value)[key];
  return Array.isArray(lines)
    ? lines.filter((line): line is string => typeof line === "string")
    : [];
}

function readFaqs(value: Json): Faq[] {
  const rows = asRecord(value).faqs;
  return Array.isArray(rows)
    ? rows.flatMap((row) => {
        const record =
          row && typeof row === "object" && !Array.isArray(row) ? row : null;
        return record &&
          typeof record.question === "string" &&
          typeof record.answer === "string"
          ? [{ question: record.question, answer: record.answer }]
          : [];
      })
    : [];
}

function readText(value: Json) {
  const text = asRecord(value).text;
  return typeof text === "string" ? text : "";
}

async function fetchContent(): Promise<ContentItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("decoration_content_items")
    .select("id,name,kind,content")
    .neq("kind", "balloon_palette")
    .order("name");
  if (error) throw error;
  return (data ?? []) as ContentItem[];
}

async function fetchPalettes(): Promise<PaletteItem[]> {
  const { data, error } = await createClient()
    .from("decoration_content_items")
    .select("id,name,content")
    .eq("kind", "balloon_palette")
    .order("name");
  if (error) throw error;
  return (data ?? []) as PaletteItem[];
}

export default function DecorationsPage() {
  const [active, setActive] = useState<Tab>("palettes");
  const [editing, setEditing] = useState<ContentItem | null | undefined>(
    undefined,
  );
  const [editingPalette, setEditingPalette] = useState<
    PaletteItem | null | undefined
  >(undefined);
  const queryClient = useQueryClient();
  const { data: content = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchContent,
  });
  const { data: palettes = [], isLoading: palettesLoading } = useQuery({
    queryKey: ["admin", "balloon-palettes"],
    queryFn: fetchPalettes,
  });
  const currentTab = TABS.find((tab) => tab.key === active)!;
  const items = currentTab.kind
    ? content.filter((item) => item.kind === currentTab.kind)
    : [];

  async function remove(item: ContentItem) {
    if (
      !confirm(
        `Delete “${item.name}”? Products using it will switch back to their own custom content.`,
      )
    )
      return;
    const { error } = await createClient()
      .from("decoration_content_items")
      .delete()
      .eq("id", item.id);
    if (error) return alert(error.message);
    await fetch("/api/admin/revalidate-catalog", { method: "POST" });
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Decorations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable content that can be assigned to products.
          </p>
        </div>
        <button
          onClick={() =>
            active === "palettes" ? setEditingPalette(null) : setEditing(null)
          }
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
        >
          <Plus className="h-3.5 w-3.5" /> Create
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-border p-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${active === tab.key ? "bg-gradient-brand text-primary-foreground shadow-glow" : "border border-border bg-background"}`}
              >
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
        <div className="p-5">
          {active === "palettes" ? (
            <PaletteLibrary
              palettes={palettes}
              loading={palettesLoading}
              onEdit={setEditingPalette}
              onChanged={() =>
                queryClient.invalidateQueries({
                  queryKey: ["admin", "balloon-palettes"],
                })
              }
            />
          ) : isLoading ? (
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
          ) : items.length === 0 ? (
            <EmptyState
              label={currentTab.label}
              onCreate={() => setEditing(null)}
            />
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onEdit={() => setEditing(item)}
                  onDelete={() => void remove(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {editing !== undefined && currentTab.kind && (
        <ContentEditor
          kind={currentTab.kind}
          item={editing}
          onClose={() => setEditing(undefined)}
          onSaved={async () => {
            setEditing(undefined);
            await fetch("/api/admin/revalidate-catalog", { method: "POST" });
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
          }}
        />
      )}
      {editingPalette !== undefined && (
        <PaletteEditor
          item={editingPalette}
          onClose={() => setEditingPalette(undefined)}
          onSaved={async () => {
            setEditingPalette(undefined);
            await fetch("/api/admin/revalidate-catalog", { method: "POST" });
            queryClient.invalidateQueries({
              queryKey: ["admin", "balloon-palettes"],
            });
          }}
        />
      )}
    </section>
  );
}

function EmptyState({
  label,
  onCreate,
}: {
  label: string;
  onCreate: () => void;
}) {
  return (
    <div className="py-10 text-center">
      <p className="font-semibold">No {label.toLowerCase()} groups yet.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Create one once, then assign it to any product.
      </p>
      <button
        onClick={onCreate}
        className="mt-4 rounded-full bg-gradient-brand px-4 py-2 text-xs font-bold text-primary-foreground"
      >
        Create {label}
      </button>
    </div>
  );
}

function ContentCard({
  item,
  onEdit,
  onDelete,
}: {
  item: ContentItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const summary =
    item.kind === "included_set"
      ? `${readLines(item.content, "included").length} included items`
      : item.kind === "faq_set"
        ? `${readFaqs(item.content).length} questions`
        : readText(item.content).slice(0, 120) || "No text yet";
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="min-w-0">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="mt-1 truncate text-xs text-muted-foreground">{summary}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={onEdit}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          aria-label={`Delete ${item.name}`}
          className="grid h-8 w-8 place-items-center rounded-full border border-border text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ContentEditor({
  kind,
  item,
  onClose,
  onSaved,
}: {
  kind: ContentKind;
  item: ContentItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [included, setIncluded] = useState(() =>
    item ? readLines(item.content, "included") : [""],
  );
  const [notIncluded, setNotIncluded] = useState(() =>
    item ? readLines(item.content, "not_included") : [],
  );
  const [faqs, setFaqs] = useState(() =>
    item ? readFaqs(item.content) : [{ question: "", answer: "" }],
  );
  const [text, setText] = useState(() => (item ? readText(item.content) : ""));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const label = TABS.find((tab) => tab.kind === kind)?.label ?? "Content";
  const setLine = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string,
  ) => setter((lines) => lines.map((line, i) => (i === index ? value : line)));

  async function save() {
    const cleanName = name.trim();
    if (!cleanName) return setError("A group name is required.");
    const cleanIncluded = included.map((line) => line.trim()).filter(Boolean);
    const cleanExcluded = notIncluded
      .map((line) => line.trim())
      .filter(Boolean);
    const cleanFaqs = faqs
      .map((faq) => ({
        question: faq.question.trim(),
        answer: faq.answer.trim(),
      }))
      .filter((faq) => faq.question && faq.answer);
    if (kind === "included_set" && cleanIncluded.length === 0)
      return setError("Add at least one included item.");
    if (kind === "faq_set" && cleanFaqs.length === 0)
      return setError("Add at least one complete FAQ.");
    if ((kind === "delivery_note" || kind === "care_note") && !text.trim())
      return setError("Enter the information customers should see.");
    const content: Json =
      kind === "included_set"
        ? { included: cleanIncluded, not_included: cleanExcluded }
        : kind === "faq_set"
          ? { faqs: cleanFaqs }
          : { text: text.trim() };
    setSaving(true);
    const supabase = createClient();
    const result = item
      ? await supabase
          .from("decoration_content_items")
          .update({ name: cleanName, content })
          .eq("id", item.id)
      : await supabase
          .from("decoration_content_items")
          .insert({ kind, name: cleanName, content });
    setSaving(false);
    if (result.error)
      return setError(
        result.error.code === "23505"
          ? "A group with this name already exists."
          : result.error.message,
      );
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="mx-auto my-8 max-w-2xl rounded-3xl bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="font-display text-2xl">
              {item ? "Edit" : "Create"} {label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Reusable across any matching product field.
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block text-sm font-semibold">
            Group name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`e.g. Premium ${label}`}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 font-normal"
            />
          </label>
          {kind === "included_set" && (
            <LineEditor
              title="Included"
              lines={included}
              onChange={(index, value) => setLine(setIncluded, index, value)}
              onAdd={() => setIncluded((lines) => [...lines, ""])}
              onDelete={(index) =>
                setIncluded((lines) => lines.filter((_, i) => i !== index))
              }
            />
          )}
          {kind === "included_set" && (
            <LineEditor
              title="Not included (optional)"
              lines={notIncluded}
              onChange={(index, value) => setLine(setNotIncluded, index, value)}
              onAdd={() => setNotIncluded((lines) => [...lines, ""])}
              onDelete={(index) =>
                setNotIncluded((lines) => lines.filter((_, i) => i !== index))
              }
            />
          )}
          {kind === "faq_set" && (
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border p-3"
                >
                  <input
                    value={faq.question}
                    onChange={(event) =>
                      setFaqs((rows) =>
                        rows.map((row, i) =>
                          i === index
                            ? { ...row, question: event.target.value }
                            : row,
                        ),
                      )
                    }
                    placeholder="Question"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(event) =>
                      setFaqs((rows) =>
                        rows.map((row, i) =>
                          i === index
                            ? { ...row, answer: event.target.value }
                            : row,
                        ),
                      )
                    }
                    placeholder="Answer"
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() =>
                      setFaqs((rows) => rows.filter((_, i) => i !== index))
                    }
                    className="mt-2 text-xs font-semibold text-destructive"
                  >
                    Remove question
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setFaqs((rows) => [...rows, { question: "", answer: "" }])
                }
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Add question
              </button>
            </div>
          )}
          {(kind === "delivery_note" || kind === "care_note") && (
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={7}
              placeholder="Write the information customers should see"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            />
          )}
          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-5">
          <button
            onClick={onClose}
            className="rounded-full border px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving" : "Save group"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LineEditor({
  title,
  lines,
  onChange,
  onAdd,
  onDelete,
}: {
  title: string;
  lines: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="space-y-2">
        {lines.map((line, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={line}
              onChange={(event) => onChange(index, event.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={() => onDelete(index)}
              className="grid h-10 w-10 place-items-center rounded-xl border text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
      >
        <Plus className="h-3.5 w-3.5" /> Add line
      </button>
    </div>
  );
}

function palettePairs(content: Json): PalettePair[] {
  const pairs = asRecord(content).pairs;
  if (!Array.isArray(pairs)) return [];
  return pairs.flatMap((pair) => {
    const row =
      pair && typeof pair === "object" && !Array.isArray(pair) ? pair : null;
    const first =
      row?.color1 &&
      typeof row.color1 === "object" &&
      !Array.isArray(row.color1)
        ? row.color1
        : null;
    const second =
      row?.color2 &&
      typeof row.color2 === "object" &&
      !Array.isArray(row.color2)
        ? row.color2
        : null;
    return first &&
      second &&
      typeof first.name === "string" &&
      typeof first.hex === "string" &&
      typeof second.name === "string" &&
      typeof second.hex === "string"
      ? [
          {
            id:
              row && typeof row.id === "string" ? row.id : crypto.randomUUID(),
            color1: { name: first.name, hex: first.hex },
            color2: { name: second.name, hex: second.hex },
          },
        ]
      : [];
  });
}

const emptyPair = (): PalettePair => ({
  id: crypto.randomUUID(),
  color1: { name: "", hex: "#ffffff" },
  color2: { name: "", hex: "#000000" },
});

function PaletteLibrary({
  palettes,
  loading,
  onEdit,
  onChanged,
}: {
  palettes: PaletteItem[];
  loading: boolean;
  onEdit: (item: PaletteItem) => void;
  onChanged: () => void;
}) {
  async function remove(item: PaletteItem) {
    if (
      !confirm(
        `Delete “${item.name}”? Products using it will have no balloon palette.`,
      )
    )
      return;
    const { error } = await createClient()
      .from("decoration_content_items")
      .delete()
      .eq("id", item.id);
    if (error) return alert(error.message);
    await fetch("/api/admin/revalidate-catalog", { method: "POST" });
    onChanged();
  }
  if (loading)
    return (
      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
    );
  if (!palettes.length)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No balloon palettes yet. Use Create to add one.
      </p>
    );
  return (
    <div className="space-y-3">
      {palettes.map((palette) => (
        <div
          key={palette.id}
          className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background p-4"
        >
          <div>
            <h3 className="font-semibold">{palette.name}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {palettePairs(palette.content).map((pair) => (
                <span
                  key={pair.id}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                >
                  <i
                    className="h-3 w-3 rounded-full border"
                    style={{ backgroundColor: pair.color1.hex }}
                  />
                  {pair.color1.name}
                  <span>+</span>
                  <i
                    className="h-3 w-3 rounded-full border"
                    style={{ backgroundColor: pair.color2.hex }}
                  />
                  {pair.color2.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(palette)}
              className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            >
              Edit
            </button>
            <button
              onClick={() => void remove(palette)}
              className="grid h-8 w-8 place-items-center rounded-full border text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaletteEditor({
  item,
  onClose,
  onSaved,
}: {
  item: PaletteItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [pairs, setPairs] = useState<PalettePair[]>(() =>
    item ? palettePairs(item.content) : [emptyPair()],
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function save() {
    const cleanName = name.trim();
    if (!cleanName) return setError("A palette name is required.");
    if (
      !pairs.length ||
      pairs.some(
        (pair) =>
          !pair.color1.name.trim() ||
          !pair.color2.name.trim() ||
          !/^#[0-9a-f]{6}$/i.test(pair.color1.hex) ||
          !/^#[0-9a-f]{6}$/i.test(pair.color2.hex),
      )
    )
      return setError("Every pair needs two names and valid HEX colours.");
    setSaving(true);
    const content: Json = { pairs };
    const supabase = createClient();
    const result = item
      ? await supabase
          .from("decoration_content_items")
          .update({ name: cleanName, content })
          .eq("id", item.id)
      : await supabase
          .from("decoration_content_items")
          .insert({ kind: "balloon_palette", name: cleanName, content });
    setSaving(false);
    if (result.error) return setError(result.error.message);
    onSaved();
  }
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <div className="mx-auto my-8 max-w-2xl rounded-3xl bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-display text-2xl">
            {item ? "Edit" : "Create"} balloon palette
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block text-sm font-semibold">
            Palette name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1.5 w-full rounded-xl border px-3 py-2"
            />
          </label>
          {pairs.map((pair, index) => (
            <div
              key={pair.id}
              className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2"
            >
              {(["color1", "color2"] as const).map((key) => (
                <div key={key} className="flex gap-2">
                  <input
                    type="color"
                    value={pair[key].hex}
                    onChange={(event) =>
                      setPairs((rows) =>
                        rows.map((row, i) =>
                          i === index
                            ? {
                                ...row,
                                [key]: { ...row[key], hex: event.target.value },
                              }
                            : row,
                        ),
                      )
                    }
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      value={pair[key].name}
                      onChange={(event) =>
                        setPairs((rows) =>
                          rows.map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  [key]: {
                                    ...row[key],
                                    name: event.target.value,
                                  },
                                }
                              : row,
                          ),
                        )
                      }
                      placeholder="Colour name"
                      className="w-full rounded-lg border px-2 py-1 text-sm"
                    />
                    <input
                      value={pair[key].hex}
                      onChange={(event) =>
                        setPairs((rows) =>
                          rows.map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  [key]: {
                                    ...row[key],
                                    hex: event.target.value,
                                  },
                                }
                              : row,
                          ),
                        )
                      }
                      className="w-full rounded-lg border px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  setPairs((rows) => rows.filter((_, i) => i !== index))
                }
                disabled={pairs.length === 1}
                className="text-xs font-semibold text-destructive"
              >
                Remove pair
              </button>
            </div>
          ))}
          <button
            onClick={() => setPairs((rows) => [...rows, emptyPair()])}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Add pair
          </button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t p-5">
          <button onClick={onClose} className="rounded-full border px-4 py-2">
            Cancel
          </button>
          <button
            onClick={() => void save()}
            disabled={saving}
            className="rounded-full bg-gradient-brand px-4 py-2 font-semibold text-primary-foreground"
          >
            {saving ? "Saving" : "Save palette"}
          </button>
        </div>
      </div>
    </div>
  );
}
