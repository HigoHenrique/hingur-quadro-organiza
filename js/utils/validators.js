import { BOARD_TYPES } from "../models/Board.js";

export const SCHEMA_VERSION = 1;

export function createEmptyDocument() {
  return { schemaVersion: SCHEMA_VERSION, boards: [] };
}

export function validateDocument(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) return false;
  if (document.schemaVersion !== SCHEMA_VERSION || !Array.isArray(document.boards)) return false;
  return document.boards.every(isValidBoard);
}

function isValidBoard(board) {
  if (!board || typeof board !== "object") return false;
  if (typeof board.id !== "string" || typeof board.name !== "string") return false;
  if (!Object.values(BOARD_TYPES).includes(board.type)) return false;
  if (!Array.isArray(board.columns) || !Array.isArray(board.notes)) return false;
  return true;
}
