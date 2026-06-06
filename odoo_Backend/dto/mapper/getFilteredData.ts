/**
 * Strips private fields from an object based on the requester's role
 */
export function getFilteredData<T extends Record<string, any>>(
  data: T,
  role: string,
  privateFieldsMap: Record<string, string[]>
): Partial<T> {
  const fieldsToStrip = privateFieldsMap[role] || [];
  const filtered: Record<string, any> = { ...data };

  for (const field of fieldsToStrip) {
    delete filtered[field];
  }

  return filtered as Partial<T>;
}
