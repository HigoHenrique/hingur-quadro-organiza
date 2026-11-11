import { createNote } from "../models/Note.js";

export class NoteService {
  constructor(boardService) { this.boardService = boardService; }

  create(boardId, data = {}) {
    const board = this.boardService.requireBoard(boardId);
    const note = createNote({ order: board.notes.length, ...data });
    board.notes.push(note);
    this.save(board);
    return note;
  }

  update(boardId, noteId, changes) {
    const board = this.boardService.requireBoard(boardId);
    const note = this.requireNote(board, noteId);
    Object.assign(note, changes, { updatedAt: new Date().toISOString() });
    this.save(board);
    return note;
  }

  duplicate(boardId, noteId) {
    const board = this.boardService.requireBoard(boardId);
    const source = this.requireNote(board, noteId);
    const { id, createdAt, updatedAt, ...content } = structuredClone(source);
    const duplicate = createNote({
      ...content,
      x: source.x + 28,
      y: source.y + 28,
      order: board.notes.length,
    });
    board.notes.push(duplicate);
    this.save(board);
    return duplicate;
  }

  remove(boardId, noteId) {
    const board = this.boardService.requireBoard(boardId);
    const index = board.notes.findIndex((note) => note.id === noteId);
    if (index === -1) throw new Error("Post-it não encontrado.");
    board.notes.splice(index, 1);
    this.save(board);
  }

  removeIfEmpty(boardId, noteId) {
    const board = this.boardService.requireBoard(boardId);
    const note = this.requireNote(board, noteId);
    if (!note.title.trim() && !note.description.trim() && !String(note.code ?? "").trim()) this.remove(boardId, noteId);
  }

  syncKanban(boardId, columns) {
    const board = this.boardService.requireBoard(boardId);
    const noteIds = new Set();
    columns.forEach(({ columnId, noteIds: ids }) => ids.forEach((id, order) => {
      const note = this.requireNote(board, id);
      note.columnId = columnId;
      note.order = order;
      note.updatedAt = new Date().toISOString();
      noteIds.add(id);
    }));
    if (noteIds.size !== board.notes.filter((note) => note.columnId).length) throw new Error("Cartões do Kanban inválidos.");
    this.save(board);
  }

  requireNote(board, noteId) {
    const note = board.notes.find((item) => item.id === noteId);
    if (!note) throw new Error("Post-it não encontrado.");
    return note;
  }

  save(board) {
    board.updatedAt = new Date().toISOString();
    this.boardService.storage.save(this.boardService.document);
  }
}
