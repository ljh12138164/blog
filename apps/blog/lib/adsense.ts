// An unset slot must never load the ad library or send an ad request.
export function isAdSlot(slot: unknown): slot is string {
  return typeof slot === 'string' && /^\d{10}$/.test(slot)
}
