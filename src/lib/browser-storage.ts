"use client";
import { useCallback, useSyncExternalStore } from "react";
type Kind = "local" | "session";
const listeners = new Set<() => void>();
// Memory fallback keeps the page usable when browser storage is blocked/full.
const fallback = new Map<string, string | null>();
export function readStorage(key: string, kind: Kind = "local"): string | null {
  const id = kind + ":" + key;
  if (fallback.has(id)) return fallback.get(id) ?? null;
  try { return (kind === "local" ? localStorage : sessionStorage).getItem(key); } catch { return null; }
}
export function writeStorage(key: string, value: string | null, kind: Kind = "local") {
  const id = kind + ":" + key;
  try {
    const storage = kind === "local" ? localStorage : sessionStorage;
    if (value === null) storage.removeItem(key); else storage.setItem(key,value);
    fallback.delete(id);
  } catch { fallback.set(id,value); }
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => { listeners.delete(listener); window.removeEventListener("storage", listener); };
}
const serverSnapshot = () => null;
export function useStoredValue(key: string, kind: Kind = "local") {
  return useSyncExternalStore(subscribe, useCallback(() => readStorage(key,kind),[key,kind]),serverSnapshot);
}
const clientReady = () => true;
const serverReady = () => false;
export function useBrowserReady() { return useSyncExternalStore(subscribe,clientReady,serverReady); }
