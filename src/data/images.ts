// Free-tier Unsplash photo IDs, hand-picked per decor theme. Each ID was
// resolved from a real unsplash.com/photos/<slug> permalink (not guessed)
// so the hotlinked image is guaranteed to exist.
const PHOTO = {
  balloonArch: "1756621716318-9eec89d42715",
  marigold: "1711180674489-c5b50e0e55db",
  canopyTent: "1618106494700-4b0049e83ed8",
  goldBalloon: "1512412646187-ea209a3cd3a6",
  weddingCar: "1691343327025-4b0cc1dc053f",
  heartFloral: "1769230359465-815291dc92f4",
  stageLights: "1599739291127-15c456e459ee",
  balloonWallPinkWhite: "1625527575307-616f0bb84ad2",
  balloonWallPurplePink: "1587160728015-924483626a1a",
  redCandleRose: "1550951956-017f785756a9",
  manPortrait1: "1651684215020-f7a5b6610f23",
  womanPortrait1: "1500771181897-517651ae4eda",
  manPortrait2: "1523970592527-a59047319659",
} as const;

export type PhotoKey = keyof typeof PHOTO;

export function unsplash(key: PhotoKey, width = 1200, height?: number) {
  const h = height ? `&h=${height}` : "";
  return `https://images.unsplash.com/photo-${PHOTO[key]}?q=80&w=${width}&auto=format&fit=crop${h}`;
}
