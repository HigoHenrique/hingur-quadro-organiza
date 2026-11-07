export const BOARD_TYPES = Object.freeze({ FREE: "free", KANBAN: "kanban" });

export function createBoard({ name, type }) {
  if (!Object.values(BOARD_TYPES).includes(type)) {
    throw new TypeError("Tipo de quadro inválido.");
  }

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: String(name ?? "Novo quadro").trim() || "Novo quadro",
    type,
    createdAt: now,
    updatedAt: now,
    settings: { zoom: 1, viewportX: 0, viewportY: 0, isInitialView: true },
    columns: [],
    notes: [],
  };
}
