export function getStat(stat: unknown): Record<string, number> {
  return (stat ?? {}) as Record<string, number>;
}
