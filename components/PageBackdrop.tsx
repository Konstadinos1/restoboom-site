import type { CSSProperties } from "react";
import { assetPath } from "@/lib/site";
import { PHONE_MEDIA, STILLS, type StillName } from "@/lib/world/stills";

/**
 * The top of a secondary page: a rendered still of the 3D world that fades into the page, with a
 * light veil on the text side. Decorative. A plain <img> high in the HTML so the browser fetches it
 * straight away (it is usually the largest thing on screen, so it sets the page's LCP).
 */
export default function PageBackdrop({ still }: { still: StillName }) {
  const { src, width, height, focus, phoneFocus, phone } = STILLS[still];
  const crop = { "--focus": focus, "--phone-focus": phone ? phone.focus : phoneFocus } as CSSProperties;
  return (
    <div className="page-backdrop" aria-hidden="true" data-testid="page-backdrop" style={crop}>
      <picture>
        {phone && <source media={PHONE_MEDIA} srcSet={assetPath(phone.src)} width={phone.width} height={phone.height} />}
        <img src={assetPath(src)} alt="" width={width} height={height} fetchPriority="high" decoding="async" />
      </picture>
    </div>
  );
}
