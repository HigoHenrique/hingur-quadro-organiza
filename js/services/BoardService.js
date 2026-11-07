import { createBoard } from "../models/Board.js";

export class BoardService {
  constructor(storage) {
    this.storage = storage;
    this.document = storage.load();
  }

  getBoards() { return [...this.document.boards]; }

  createBoard(data) {
    const board = createBoard(data);
    this.document.boards.push(board);
    this.storage.save(this.document);
    return board;
  }

  getBoard(id) { return this.document.boards.find((board) => board.id === id) ?? null; }

  renameBoard(id, name) {
    const board = this.requireBoard(id);
    board.name = String(name ?? "").trim() || "Novo quadro";
    board.updatedAt = new Date().toISOString();
    this.storage.save(this.document);
    return board;
  }

  duplicateBoard(id) {
    const source = this.requireBoard(id);
    const now = new Date().toISOString();
    const columnIds = new Map(source.columns.map((column) => [column.id, crypto.randomUUID()]));
    const duplicate = {
      ...structuredClone(source),
      id: crypto.randomUUID(),
      name: `${source.name} (cópia)`,
      createdAt: now,
      updatedAt: now,
      columns: source.columns.map((column) => ({ ...column, id: columnIds.get(column.id) })),
      notes: source.notes.map((note) => ({ ...note, id: crypto.randomUUID(), columnId: note.columnId ? columnIds.get(note.columnId) : null, createdAt: now, updatedAt: now })),
    };
    this.document.boards.push(duplicate);
    this.storage.save(this.document);
    return duplicate;
  }

  deleteBoard(id) {
    const index = this.document.boards.findIndex((board) => board.id === id);
    if (index === -1) throw new Error("Quadro não encontrado.");
    this.document.boards.splice(index, 1);
    this.storage.save(this.document);
  }

  updateSettings(id, changes) {
    const board = this.requireBoard(id);
    Object.assign(board.settings, changes);
    board.updatedAt = new Date().toISOString();
    this.storage.save(this.document);
  }

  requireBoard(id) {
    const board = this.getBoard(id);
    if (!board) throw new Error("Quadro não encontrado.");
    return board;
  }
}
