"use client";

import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";

type Props = {
  id: string;
  name: string;
  disabled: boolean;
  onMove: (id: string, targetId: string) => void;
  ids: string[];
};

export function CatalogSortHandle({ id, name, disabled, onMove, ids }: Props) {
  const [dragging, setDragging] = useState(false);
  const target = useRef<HTMLElement | null>(null);
  const active = useRef(false);
  function clear() {
    target.current?.removeAttribute("data-sort-target");
    target.current = null;
    active.current = false;
    setDragging(false);
  }
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`Reorder ${name}`}
      title="Drag to reorder, or use the up and down arrow keys"
      aria-pressed={dragging}
      className="grid h-10 w-8 shrink-0 touch-none place-items-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-30 cursor-grab active:cursor-grabbing"
      onPointerDown={(event) => {
        if (event.button !== 0 || disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        active.current = true;
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (!active.current) return;
        target.current?.removeAttribute("data-sort-target");
        const row = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-sort-id]") ?? null;
        target.current = row && ids.includes(row.dataset.sortId ?? "") ? row : null;
        target.current?.setAttribute("data-sort-target", "true");
        if (event.clientY < 80) window.scrollBy(0, -20);
        if (event.clientY > window.innerHeight - 80) window.scrollBy(0, 20);
      }}
      onPointerUp={() => {
        const targetId = target.current?.dataset.sortId;
        const shouldMove = active.current && targetId && targetId !== id;
        clear();
        if (shouldMove) onMove(id, targetId);
      }}
      onPointerCancel={clear}
      onLostPointerCapture={clear}
      onKeyDown={(event) => {
        if (event.key === "Escape") { clear(); return; }
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        const targetId = ids[ids.indexOf(id) + (event.key === "ArrowUp" ? -1 : 1)];
        if (targetId && !disabled) onMove(id, targetId);
      }}
    >
      <GripVertical className="h-5 w-5" />
    </button>
  );
}
