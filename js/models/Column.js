export function createColumn(name = "Nova coluna") {
  return { id: crypto.randomUUID(), name: String(name).trim() || "Nova coluna", order: 0 };
}
