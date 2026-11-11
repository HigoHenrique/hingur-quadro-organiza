import { BoardService } from "./services/BoardService.js";
import { NoteService } from "./services/NoteService.js";
import { ColumnService } from "./services/ColumnService.js";
import { BackupService } from "./services/BackupService.js";
import { ThemeService } from "./services/ThemeService.js";
import { THEMES, getActivePalette } from "./core/themes.js";
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
const backupService = new BackupService(boardService);
const themeService = new ThemeService(boardService);
themeService.apply(themeService.load());

window.addEventListener("sticky-board:storage-error", (event) => showMessage("Alterações não foram salvas", event.detail));
document.addEventListener("keydown", (event) => {
  const modals = document.querySelectorAll(".modal-backdrop");
  const backdrop = modals[modals.length - 1];
  if (!backdrop) return;
  if (event.key === "Escape") { event.preventDefault(); backdrop.remove(); return; }
  if (event.key !== "Tab") return;
  const focusable = [...backdrop.querySelectorAll("button, input, select, textarea, [href], [tabindex]:not([tabindex='-1'])")].filter((item) => !item.disabled);
  if (!focusable.length) return;
  const first = focusable[0]; const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
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
    createCard: (columnId) => noteService.create(board.id, { columnId, color: getActivePalette()[0] }),
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
    exportData: () => backupService.export(),
    importData: () => selectBackupFile(),
    theme: () => openThemeModal(),
  });
}

function openThemeModal() {
  const backdrop = document.createElement("div"); backdrop.className = "modal-backdrop"; const dialog = document.createElement("section"); dialog.className = "modal"; dialog.setAttribute("role", "dialog"); dialog.setAttribute("aria-modal", "true"); const title = document.createElement("h2"); title.textContent = "Escolher tema"; const copy = document.createElement("p"); copy.textContent = "O tema escolhido será lembrado neste navegador."; const choices = document.createElement("div"); choices.className = "theme-picker";
  Object.entries(THEMES).forEach(([id, theme]) => { const choice = button(theme.label, "theme-picker__choice"); choice.dataset.theme = id; choice.style.setProperty("--theme-preview", theme.palette[0]); choice.setAttribute("aria-pressed", String(themeService.load() === id)); choice.addEventListener("click", () => { themeService.set(id); backdrop.remove(); renderRoute(router.current()); }); choices.append(choice); });
  const actions = document.createElement("div"); actions.className = "modal__actions"; const close = button("Cancelar"); close.addEventListener("click", () => backdrop.remove()); actions.append(close); dialog.append(title, copy, choices, actions); backdrop.append(dialog); document.body.append(backdrop); close.focus();
}

function selectBackupFile() {
  const input = document.createElement("input"); input.type = "file"; input.accept = "application/json,.json";
  input.addEventListener("change", async () => {
    const [file] = input.files;
    if (!file) return;
    try { openImportModal(backupService.parse(await file.text())); } catch (error) { showMessage("Não foi possível importar", error.message); }
  });
  input.click();
}

function openImportModal(documentToImport) {
  const backdrop = document.createElement("div"); backdrop.className = "modal-backdrop"; const dialog = document.createElement("section"); dialog.className = "modal"; dialog.setAttribute("role", "dialog"); dialog.setAttribute("aria-modal", "true");
  const title = document.createElement("h2"); title.textContent = "Importar backup"; const copy = document.createElement("p"); copy.textContent = `O arquivo contém ${documentToImport.boards.length} quadro(s). Escolha como deseja aplicar os dados.`;
  const actions = document.createElement("div"); actions.className = "modal__actions"; const cancel = button("Cancelar"); cancel.addEventListener("click", () => backdrop.remove()); const merge = button("Mesclar", "button"); merge.addEventListener("click", () => { backupService.merge(documentToImport); backdrop.remove(); renderRoute(router.current()); }); const replace = button("Substituir tudo", "button button--primary"); replace.addEventListener("click", () => { backupService.replace(documentToImport); backdrop.remove(); renderRoute(router.current()); }); actions.append(cancel, merge, replace); dialog.append(title, copy, actions); backdrop.append(dialog); document.body.append(backdrop);
}

function showMessage(titleText, copyText) {
  const backdrop = document.createElement("div"); backdrop.className = "modal-backdrop"; const dialog = document.createElement("section"); dialog.className = "modal"; dialog.setAttribute("role", "alertdialog"); dialog.setAttribute("aria-modal", "true"); const title = document.createElement("h2"); title.textContent = titleText; const copy = document.createElement("p"); copy.textContent = copyText; const close = button("Entendi", "button button--primary"); close.addEventListener("click", () => backdrop.remove()); const actions = document.createElement("div"); actions.className = "modal__actions"; actions.append(close); dialog.append(title, copy, actions); backdrop.append(dialog); document.body.append(backdrop); close.focus();
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
