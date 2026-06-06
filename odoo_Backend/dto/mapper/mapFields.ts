/**
 * Dynamically maps keys of an object to a new schema mapping
 */
export function mapFields<T extends Record<string, any>>(
  data: T,
  keyMap: Record<string, string>
): Record<string, any> {
  const mapped: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const targetKey = keyMap[key] || key;
    mapped[targetKey] = value;
  }

  return mapped;
}
