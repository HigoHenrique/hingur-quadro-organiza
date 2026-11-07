import { createColumn } from "../models/Column.js";

export class ColumnService {
  constructor(boardService) { this.boardService = boardService; }

  create(boardId, name) {
    const board = this.boardService.requireBoard(boardId);
    const column = createColumn(name);
    column.order = board.columns.length;
    board.columns.push(column);
    this.save(board);
    return column;
  }

  rename(boardId, columnId, name) {
    const board = this.boardService.requireBoard(boardId);
    const column = this.requireColumn(board, columnId);
    column.name = String(name ?? "").trim() || "Nova coluna";
    this.save(board);
  }

  delete(boardId, columnId, destinationId = "delete") {
    const board = this.boardService.requireBoard(boardId);
    this.requireColumn(board, columnId);
    const cards = board.notes.filter((note) => note.columnId === columnId);
    if (cards.length && destinationId !== "delete") {
      this.requireColumn(board, destinationId);
      cards.forEach((card) => { card.columnId = destinationId; });
    } else if (cards.length) {
      board.notes = board.notes.filter((note) => note.columnId !== columnId);
    }
    board.columns = board.columns.filter((column) => column.id !== columnId);
    this.order(board.columns);
    this.order(board.notes.filter((note) => note.columnId));
    this.save(board);
  }

  reorder(boardId, ids) {
    const board = this.boardService.requireBoard(boardId);
    const map = new Map(board.columns.map((column) => [column.id, column]));
    if (ids.length !== board.columns.length || ids.some((id) => !map.has(id))) throw new Error("Ordem de colunas inválida.");
    board.columns = ids.map((id, index) => ({ ...map.get(id), order: index }));
    this.save(board);
  }

  requireColumn(board, id) {
    const column = board.columns.find((item) => item.id === id);
    if (!column) throw new Error("Coluna não encontrada.");
    return column;
  }

  order(items) { items.forEach((item, index) => { item.order = index; }); }
  save(board) { board.updatedAt = new Date().toISOString(); this.boardService.storage.save(this.boardService.document); }
}
