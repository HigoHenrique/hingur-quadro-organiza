import { BoardService } from "./services/BoardService.js";
import { NoteService } from "./services/NoteService.js";
import { ColumnService } from "./services/ColumnService.js";
import { StorageService } from "./services/StorageService.js";
import { Router } from "./core/Router.js";
import { renderBoardPlaceholder, renderDashboard } from "./views/DashboardView.js";
import { renderFreeBoard } from "./views/FreeBoardView.js";
import { renderKanbanBoard } from "./views/KanbanBoardView.js";

const root = document.querySelector("#app");
const storage = new StorageService();
const boardService = new BoardService(storage);
const noteService = new NoteService(boardService);
const columnService = new ColumnService(boardService);
const router = new Router(renderRoute);

router.start();

function button(label, className = "button") {
  const element = document.createElement("button");
  element.type = "button";
  element.className = className;
  element.textContent = label;
  return element;
}

function renderRoute(route) {
  const board = route.section === "board" ? boardService.getBoard(route.id) : null;
  if (board?.type === "free") return renderFreeBoard(root, board, {
    back: () => router.go("/dashboard"),
    create: (data) => noteService.create(board.id, data),
    update: (noteId, changes) => noteService.update(board.id, noteId, changes),
    duplicate: (noteId) => noteService.duplicate(board.id, noteId),
    remove: (noteId) => noteService.remove(board.id, noteId),
    updateSettings: (settings) => boardService.updateSettings(board.id, settings),
    getZoom: () => board.settings.zoom,
    removeIfEmpty: (noteId, element) => { noteService.removeIfEmpty(board.id, noteId); if (!board.notes.some((note) => note.id === noteId)) element.remove(); },
  });
  if (board?.type === "kanban") return renderKanbanBoard(root, board, {
    back: () => router.go("/dashboard"),
    createColumn: (name) => columnService.create(board.id, name),
    renameColumn: (columnId, name) => columnService.rename(board.id, columnId, name),
    deleteColumn: (columnId, destination) => columnService.delete(board.id, columnId, destination),
    reorderColumns: (ids) => columnService.reorder(board.id, ids),
    createCard: (columnId) => noteService.create(board.id, { columnId }),
    updateCard: (noteId, changes) => noteService.update(board.id, noteId, changes),
    duplicateCard: (noteId) => noteService.duplicate(board.id, noteId),
    removeCard: (noteId) => noteService.remove(board.id, noteId),
    removeIfEmpty: (noteId, element) => { noteService.removeIfEmpty(board.id, noteId); if (!board.notes.some((note) => note.id === noteId)) element.remove(); },
    syncCards: (columns) => noteService.syncKanban(board.id, columns),
  });
  if (board) return renderBoardPlaceholder(root, board, () => router.go("/dashboard"));
  renderDashboard(root, boardService.getBoards(), {
    create: () => openBoardModal(),
    open: (item) => router.go(`/board/${item.id}`),
    rename: (item) => openBoardModal(item),
    duplicate: (item) => { boardService.duplicateBoard(item.id); renderRoute(router.current()); },
    remove: (item) => openDeleteModal(item),
  });
}

function openBoardModal(board = null) {
  let type = board?.type ?? "free";
  const backdrop = document.createElement("div"); backdrop.className = "modal-backdrop";
  const dialog = document.createElement("form"); dialog.className = "modal"; dialog.setAttribute("aria-modal", "true"); dialog.setAttribute("role", "dialog");
  const title = document.createElement("h2"); title.textContent = board ? "Renomear quadro" : "Novo quadro";
  const field = document.createElement("label"); field.className = "field"; field.textContent = "Nome do quadro";
  const input = document.createElement("input"); input.required = true; input.maxLength = 120; input.value = board?.name ?? ""; input.placeholder = "Ex.: Planejamento semanal"; field.append(input); dialog.append(title, field);
  if (!board) { const typeField = document.createElement("div"); typeField.className = "field"; typeField.textContent = "Formato"; const picker = document.createElement("div"); picker.className = "type-picker"; [ ["free", "Quadro livre"], ["kanban", "Kanban"] ].forEach(([value, label]) => { const choice = button(label); choice.setAttribute("aria-pressed", String(value === type)); choice.addEventListener("click", () => { type = value; picker.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item.textContent === label))); }); picker.append(choice); }); typeField.append(picker); dialog.append(typeField); }
  const actions = document.createElement("div"); actions.className = "modal__actions"; const cancel = button("Cancelar"); cancel.addEventListener("click", close); const submit = button(board ? "Salvar" : "Criar quadro", "button button--primary"); submit.type = "submit"; actions.append(cancel, submit); dialog.append(actions);
  dialog.addEventListener("submit", (event) => { event.preventDefault(); if (board) boardService.renameBoard(board.id, input.value); else boardService.createBoard({ name: input.value, type }); close(); renderRoute(router.current()); }); backdrop.append(dialog); document.body.append(backdrop); input.focus();
  function close() { backdrop.remove(); }
}

function openDeleteModal(board) {
  const backdrop = document.createElement("div"); backdrop.className = "modal-backdrop"; const dialog = document.createElement("section"); dialog.className = "modal"; dialog.setAttribute("role", "dialog"); dialog.setAttribute("aria-modal", "true"); const heading = document.createElement("h2"); heading.textContent = "Excluir este quadro?"; const copy = document.createElement("p"); copy.textContent = `“${board.name}” e todos os seus post-its serão removidos.`; const actions = document.createElement("div"); actions.className = "modal__actions"; const cancel = button("Cancelar"); cancel.addEventListener("click", () => backdrop.remove()); const remove = button("Excluir quadro", "button button--primary"); remove.addEventListener("click", () => { boardService.deleteBoard(board.id); backdrop.remove(); renderRoute(router.current()); }); actions.append(cancel, remove); dialog.append(heading, copy, actions); backdrop.append(dialog); document.body.append(backdrop); cancel.focus();
}
