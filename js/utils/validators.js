import { BOARD_TYPES } from "../models/Board.js";

export const SCHEMA_VERSION = 1;

export function createEmptyDocument() {
  return { schemaVersion: SCHEMA_VERSION, boards: [] };
}

export function validateDocument(document) {
  try { assertValidDocument(document); return true; } catch { return false; }
}

export function assertValidDocument(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) throw new TypeError("O arquivo não contém um documento válido.");
  if (document.schemaVersion !== SCHEMA_VERSION) throw new TypeError("A versão deste backup não é suportada.");
  if (!Array.isArray(document.boards)) throw new TypeError("A lista de quadros está ausente.");
  const boardIds = new Set();
  document.boards.forEach((board) => {
    if (!board || typeof board !== "object" || typeof board.id !== "string" || !board.id || typeof board.name !== "string") throw new TypeError("Um quadro do backup é inválido.");
    if (boardIds.has(board.id)) throw new TypeError("O backup contém IDs de quadro duplicados."); boardIds.add(board.id);
    if (!Object.values(BOARD_TYPES).includes(board.type) || !Array.isArray(board.columns) || !Array.isArray(board.notes)) throw new TypeError("A estrutura de um quadro é inválida.");
    const columnIds = new Set();
    board.columns.forEach((column) => { if (!column || typeof column.id !== "string" || !column.id || typeof column.name !== "string" || !Number.isFinite(column.order) || columnIds.has(column.id)) throw new TypeError("Uma coluna do backup é inválida."); columnIds.add(column.id); });
    const noteIds = new Set();
    board.notes.forEach((note) => {
      if (!note || typeof note.id !== "string" || !note.id || typeof note.title !== "string" || typeof note.description !== "string" || (note.code !== undefined && typeof note.code !== "string") || (note.image !== undefined && note.image !== null && typeof note.image !== "string") || typeof note.color !== "string" || !Number.isFinite(note.order) || noteIds.has(note.id)) throw new TypeError("Um post-it do backup é inválido.");
      const validPosition = Number.isFinite(note.x) && Number.isFinite(note.y) && Number.isFinite(note.width) && Number.isFinite(note.height);
      if (!validPosition) throw new TypeError("A posição de um post-it é inválida.");
      if (note.columnId !== null && (typeof note.columnId !== "string" || !columnIds.has(note.columnId))) throw new TypeError("Um cartão referencia uma coluna inexistente."); noteIds.add(note.id);
    });
  });
}
