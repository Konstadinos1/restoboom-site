/**
 * Station 07, examples: three chat bubbles carved from ice, the restaurant's
 * replies on the right, the guest's message on the left, each with lines of
 * warm "text". They pop in one after another as the examples scroll by.
 */
import { BoxGeometry, Group, Mesh } from "three";
import { speechBubbleOutline } from "../../stationShapes";
import { extrudeOutline, type StationKit, type StationScene, type StationTick } from "./kit";

const BUBBLE = { w: 1.7, h: 0.82, radius: 0.18, depth: 0.2 } as const;
// Guest on the left, restaurant on the right: x offset, y position and text line widths (share of the bubble).
const THREAD = [
  { side: -1, y: 1.05, lines: [0.78, 0.52] },
  { side: 1, y: 0, lines: [0.82, 0.7, 0.4] },
  { side: -1, y: -1.05, lines: [0.6] },
] as const;
const SIDE_OFFSET = 0.45;
const LINE = { h: 0.07, gap: 0.16 } as const;
// The examples' cards cover the scene from about a third of the way in: all three bubbles are out by then.
const POP_STAGGER = 0.07;
const POP_SPAN = 0.08;
const SCENE_SCALE = 1.25;

function createBubble(kit: StationKit, side: number, lines: readonly number[]): Group {
  const bubble = new Group();
  const body = new Mesh(extrudeOutline(speechBubbleOutline(BUBBLE.w, BUBBLE.h, BUBBLE.radius, 5), BUBBLE.depth, 0.03), kit.ice);
  // The outline's tail is bottom-left (the guest's side): mirror the restaurant's bubbles so theirs points right.
  body.scale.x = -side;
  bubble.add(body);
  const top = ((lines.length - 1) * LINE.gap) / 2;
  lines.forEach((share, i) => {
    const width = (BUBBLE.w - 0.4) * share;
    const line = new Mesh(new BoxGeometry(width, LINE.h, 0.02), i === 0 ? kit.ember : kit.emberSoft);
    line.position.set(-(BUBBLE.w - 0.4) / 2 + width / 2, top - i * LINE.gap, BUBBLE.depth / 2 + 0.04);
    bubble.add(line);
  });
  return bubble;
}

export function createMessagesScene(kit: StationKit): StationScene {
  const group = new Group();
  group.scale.setScalar(SCENE_SCALE);
  const bubbles = THREAD.map((m) => {
    const bubble = createBubble(kit, m.side, m.lines);
    bubble.position.set(m.side * SIDE_OFFSET, m.y, 0);
    group.add(bubble);
    return bubble;
  });
  const update = ({ time, local }: StationTick) => {
    bubbles.forEach((b, i) => {
      const pop = Math.min(1, Math.max(0, (local - i * POP_STAGGER) / POP_SPAN));
      b.scale.setScalar(Math.max(0.001, pop));
      b.position.y = THREAD[i].y + Math.sin(time * 0.8 + i * 1.9) * 0.05;
      b.rotation.y = Math.sin(time * 0.5 + i) * 0.12;
    });
    group.rotation.set(0.04, 0.38, 0);
  };
  return { group, update };
}
