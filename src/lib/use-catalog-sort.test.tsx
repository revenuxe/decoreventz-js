import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useCatalogSort } from "./use-catalog-sort";

const { update, single, eq } = vi.hoisted(() => ({ update: vi.fn(), single: vi.fn(), eq: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ from: () => ({ update }) }) }));
const rows = [{ id: "a", sort_order: 0 }, { id: "b", sort_order: 0 }, { id: "c", sort_order: 8 }];
let api: ReturnType<typeof useCatalogSort>;
let root: ReturnType<typeof createRoot>;
const sorted = vi.fn();
const reload = vi.fn();

beforeEach(async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.clearAllMocks();
  single.mockResolvedValue({ data: { id: "saved" }, error: null });
  eq.mockReturnValue({ select: () => ({ single }) });
  update.mockReturnValue({ eq });
  reload.mockResolvedValue(undefined);
  function Probe() {
    api = useCatalogSort("subcategories", rows, sorted, reload);
    return null;
  }
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(<Probe />));
});
afterEach(async () => { await act(async () => root.unmount()); });

it("moves to the chosen position, normalizes tied orders, and only writes supplied siblings", async () => {
  await act(async () => { await api.move("a", "c"); });
  expect(sorted).toHaveBeenCalledWith([{ id: "b", sort_order: 1 }, { id: "c", sort_order: 2 }, { id: "a", sort_order: 3 }]);
  expect(eq.mock.calls).toEqual([["id", "b"], ["id", "c"], ["id", "a"]]);
  expect(api.status).toBe("Order saved");
});

it("ignores targets outside the selected category", async () => {
  await act(async () => { await api.move("a", "another-category-row"); });
  expect(update).not.toHaveBeenCalled();
});

it("reloads persisted order and reports failed writes", async () => {
  single.mockResolvedValue({ error: { message: "Denied" } });
  await act(async () => { await api.move("c", "a"); });
  expect(reload).toHaveBeenCalledOnce();
  expect(api.status).toContain("could not be fully saved");
  expect(api.saving).toBe(false);
});
