/**
 * Pointer picking for explorable stations (the platform cubes). The 3D canvas
 * sits behind the page and takes no pointer events, so this listens on the
 * window: while such a station is the current one, it raycasts the pointer
 * into the scene each frame, lights the cube under it (or the cube whose
 * content card the pointer is on), flags <html data-cursor> for the cursor,
 * and opens a cube on click. Links, buttons and panels keep their clicks.
 */
import { Raycaster, Vector2, type Object3D, type PerspectiveCamera } from "three";
import {
  CLOSE_CURSOR, EXPLORE_CLOSE_EVENT, EXPLORE_CURSOR, EXPLORE_EVENT, EXPLORE_IDLE, EXPLORE_INDEX_ATTRIBUTE, exploreReducer, toDeviceCoords, type ExploreAction,
  type ExploreState,
} from "../explore";
import type { Explorable } from "./stations/kit";

/** Anything the visitor reads or uses: the pointer there is about the page, not the 3D behind it. */
const CONTENT = "a, button, input, select, textarea, summary, label, .glass, header, footer, [role=dialog]";

type Pointer = { x: number; y: number; overContent: boolean; cardIndex: number | null };
export type Explorer = { update: (station: number) => void; dispose: () => void };

function describeTarget(target: EventTarget | null): { overContent: boolean; cardIndex: number | null } {
  const el = target instanceof Element ? target : null;
  const card = el?.closest(`[${EXPLORE_INDEX_ATTRIBUTE}]`);
  const index = card ? Number(card.getAttribute(EXPLORE_INDEX_ATTRIBUTE)) : NaN;
  return { overContent: Boolean(el?.closest(CONTENT)), cardIndex: Number.isInteger(index) ? index : null };
}

function setCursorHint(hint: typeof EXPLORE_CURSOR | typeof CLOSE_CURSOR | null): void {
  const root = document.documentElement;
  if (hint) root.dataset.cursor = hint;
  else if (root.dataset.cursor === EXPLORE_CURSOR || root.dataset.cursor === CLOSE_CURSOR) delete root.dataset.cursor;
}

/** Which explorable item, if any, is at a screen position. */
function createPicker(camera: PerspectiveCamera): (targets: Explorable["targets"], x: number, y: number) => number | null {
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  return (targets, x, y) => {
    const p = toDeviceCoords(x, y, window.innerWidth, window.innerHeight);
    raycaster.setFromCamera(ndc.set(p.x, p.y), camera);
    const hit = raycaster.intersectObjects(targets as Object3D[], false)[0];
    return hit ? (hit.object.userData.exploreIndex as number) : null;
  };
}

type Handlers = {
  move: (e: PointerEvent) => void;
  out: (e: PointerEvent) => void;
  click: (e: MouseEvent) => void;
  key: (e: KeyboardEvent) => void;
  close: () => void;
};

function listen(h: Handlers): () => void {
  window.addEventListener("pointermove", h.move, { passive: true });
  document.addEventListener("pointerout", h.out);
  window.addEventListener("click", h.click);
  window.addEventListener("keydown", h.key);
  window.addEventListener(EXPLORE_CLOSE_EVENT, h.close);
  return () => {
    window.removeEventListener("pointermove", h.move);
    document.removeEventListener("pointerout", h.out);
    window.removeEventListener("click", h.click);
    window.removeEventListener("keydown", h.key);
    window.removeEventListener(EXPLORE_CLOSE_EVENT, h.close);
  };
}

export function createExplorer(camera: PerspectiveCamera, explorables: ReadonlyMap<number, Explorable>): Explorer {
  const pick = createPicker(camera);
  let pointer: Pointer | null = null;
  let state: ExploreState = EXPLORE_IDLE;
  let active: Explorable | null = null;
  const dispatch = (action: ExploreAction) => {
    const next = exploreReducer(state, action);
    if (next === state) return;
    const openedChanged = next.opened !== state.opened;
    state = next;
    active?.setHovered(state.hovered);
    active?.setOpened(state.opened);
    if (openedChanged) window.dispatchEvent(new CustomEvent(EXPLORE_EVENT, { detail: { index: state.opened } }));
  };
  const stop = listen({
    move: (e) => (pointer = { x: e.clientX, y: e.clientY, ...describeTarget(e.target) }),
    out: (e) => e.relatedTarget === null && (pointer = null),
    click: (e) => active && !describeTarget(e.target).overContent && dispatch({ type: "click", index: pick(active.targets, e.clientX, e.clientY) }),
    key: (e) => e.key === "Escape" && dispatch({ type: "escape" }),
    close: () => dispatch({ type: "escape" }),
  });
  const update = (station: number) => {
    const here = explorables.get(station) ?? null;
    if (here !== active) {
      dispatch({ type: "leave" });
      active = here;
    }
    const cube = active && pointer && !pointer.overContent ? pick(active.targets, pointer.x, pointer.y) : null;
    setCursorHint(cube === null ? null : cube === state.opened ? CLOSE_CURSOR : EXPLORE_CURSOR);
    if (active) dispatch({ type: "hover", index: cube ?? pointer?.cardIndex ?? null });
  };
  return { update, dispose: () => (stop(), setCursorHint(null)) };
}
