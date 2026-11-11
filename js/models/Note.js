export function createNote(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    descriptionColor: "",
    descriptionSize: "16",
    textColor: "",
    textSize: 18,
    code: "",
    color: "#FDE68A",
    x: 80,
    y: 80,
    width: 320,
    height: 250,
    columnId: null,
    order: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
