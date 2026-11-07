export function createNote(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    color: "#FDE68A",
    x: 80,
    y: 80,
    width: 240,
    height: 180,
    columnId: null,
    order: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
