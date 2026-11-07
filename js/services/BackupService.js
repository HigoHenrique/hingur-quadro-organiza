import { assertValidDocument } from "../utils/validators.js";

export class BackupService {
  constructor(boardService) { this.boardService = boardService; }

  export() {
    const backupDocument = structuredClone(this.boardService.document);
    assertValidDocument(backupDocument);
    const blob = new Blob([JSON.stringify(backupDocument, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = window.document.createElement("a");
    link.href = url; link.download = `sticky-board-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url);
  }

  parse(text) {
    let document;
    try { document = JSON.parse(text); } catch { throw new TypeError("O arquivo selecionado não é um JSON válido."); }
    assertValidDocument(document);
    return document;
  }

  replace(imported) {
    const document = structuredClone(imported); assertValidDocument(document);
    this.boardService.document = document; this.boardService.storage.save(document);
  }

  merge(imported) {
    assertValidDocument(imported);
    const document = this.boardService.document; const currentIds = new Set(document.boards.map((board) => board.id));
    const boards = imported.boards.map((board) => currentIds.has(board.id) ? duplicateBoard(board) : structuredClone(board));
    document.boards.push(...boards); this.boardService.storage.save(document);
  }
}

function duplicateBoard(source) {
  const copy = structuredClone(source); const columnIds = new Map(copy.columns.map((column) => [column.id, crypto.randomUUID()]));
  copy.id = crypto.randomUUID(); copy.name = `${copy.name} (cópia)`; copy.createdAt = new Date().toISOString(); copy.updatedAt = copy.createdAt;
  copy.columns.forEach((column) => { column.id = columnIds.get(column.id); });
  copy.notes.forEach((note) => { note.id = crypto.randomUUID(); note.columnId = note.columnId ? columnIds.get(note.columnId) : null; note.createdAt = copy.createdAt; note.updatedAt = copy.updatedAt; });
  return copy;
}
