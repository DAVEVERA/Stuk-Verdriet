export type PulsePointerSession = Readonly<{
  pointerId: number;
  pausedBeforeGesture: boolean;
  touchStartX: number | null;
}>;

export type PulsePointerResult = Readonly<{
  navigationDelta: -1 | 0 | 1;
  paused: boolean;
}>;

export function beginPulsePointerSession(
  pointerId: number,
  pointerType: string,
  clientX: number,
  pausedBeforeGesture: boolean
): PulsePointerSession {
  return {
    pointerId,
    pausedBeforeGesture,
    touchStartX: pointerType === "touch" ? clientX : null
  };
}

export function finishPulsePointerSession(
  session: PulsePointerSession,
  pointerId: number,
  clientX: number
): PulsePointerResult | null {
  if (session.pointerId !== pointerId) return null;

  const distance = session.touchStartX === null ? 0 : clientX - session.touchStartX;
  const navigationDelta = Math.abs(distance) > 54 ? (distance < 0 ? 1 : -1) : 0;

  return { navigationDelta, paused: session.pausedBeforeGesture };
}

export function cancelPulsePointerSession(session: PulsePointerSession, pointerId: number): boolean | null {
  if (session.pointerId !== pointerId) return null;
  return session.pausedBeforeGesture;
}
