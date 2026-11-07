const PALETTE = ["#FDE68A", "#FED7AA", "#FCA5A5", "#FBCFE8", "#DDD6FE", "#BFDBFE", "#A5F3FC", "#BBF7D0", "#D9F99D", "#E2E8F0"];

function button(label, className = "button") { const node = document.createElement("button"); node.type = "button"; node.className = className; node.textContent = label; return node; }
function ordered(items) { return [...items].sort((a, b) => a.order - b.order); }

export function renderKanbanBoard(root, board, actions) {
  root.replaceChildren();
  const page = document.createElement("section"); page.className = "kanban-board";
  const header = document.createElement("header"); header.className = "kanban-toolbar";
  const back = button("← Quadros"); back.addEventListener("click", actions.back);
  const title = document.createElement("h1"); title.textContent = board.name;
  const addColumn = button("+ Nova coluna", "button button--primary"); addColumn.addEventListener("click", () => openNameDialog("Nova coluna", "Nome da coluna", (name) => { actions.createColumn(name); renderKanbanBoard(root, board, actions); }));
  header.append(back, title, addColumn);
  const columns = document.createElement("div"); columns.className = "kanban-columns";
  ordered(board.columns).forEach((column) => columns.append(renderColumn(column, board, actions, root)));
  page.append(header, columns); root.append(page);
  bindColumnReorder(columns, actions);
}

function renderColumn(column, board, actions, root) {
  const element = document.createElement("section"); element.className = "kanban-column"; element.dataset.columnId = column.id;
  const header = document.createElement("header"); header.className = "kanban-column__header";
  const handle = button("⠿", "kanban-column__drag"); handle.ariaLabel = `Mover coluna ${column.name}`;
  const name = document.createElement("h2"); name.textContent = column.name;
  const options = document.createElement("div"); options.className = "kanban-column__options";
  const rename = button("✎", "kanban-column__action"); rename.ariaLabel = `Renomear ${column.name}`; rename.title = "Renomear";
  const remove = button("×", "kanban-column__action"); remove.ariaLabel = `Excluir ${column.name}`; remove.title = "Excluir";
  rename.addEventListener("click", () => openNameDialog("Renomear coluna", "Nome da coluna", (value) => { actions.renameColumn(column.id, value); renderKanbanBoard(root, board, actions); }, column.name));
  remove.addEventListener("click", () => openColumnDeleteDialog(column, board, actions, root));
  options.append(rename, remove); header.append(handle, name, options);
  const cards = document.createElement("div"); cards.className = "kanban-column__cards"; cards.dataset.columnId = column.id;
  ordered(board.notes.filter((note) => note.columnId === column.id)).forEach((note) => cards.append(renderCard(note, actions)));
  const addCard = button("+ Adicionar cartão", "kanban-column__add"); addCard.addEventListener("click", () => { const card = actions.createCard(column.id); cards.append(renderCard(card, actions)); requestAnimationFrame(() => cards.lastElementChild.querySelector("input").focus()); });
  element.append(header, cards, addCard); bindCardDrop(cards, actions); return element;
}

function renderCard(note, actions) {
  const card = document.createElement("article"); card.className = "kanban-card"; card.dataset.noteId = note.id; card.style.setProperty("--card-color", note.color);
  const header = document.createElement("div"); header.className = "kanban-card__header";
  const drag = button("⠿", "kanban-card__drag"); drag.ariaLabel = "Mover cartão";
  const duplicate = button("⧉", "kanban-card__tool"); duplicate.ariaLabel = "Duplicar cartão"; duplicate.title = "Duplicar";
  const remove = button("×", "kanban-card__tool"); remove.ariaLabel = "Excluir cartão"; remove.title = "Excluir"; header.append(drag, duplicate, remove);
  const title = document.createElement("input"); title.className = "kanban-card__title"; title.value = note.title; title.placeholder = "Título"; title.maxLength = 120;
  const description = document.createElement("textarea"); description.className = "kanban-card__description"; description.value = note.description; description.placeholder = "Descrição"; description.maxLength = 2000;
  const palette = document.createElement("div"); palette.className = "kanban-card__palette";
  PALETTE.forEach((color) => { const choice = button("", "kanban-card__color"); choice.style.background = color; choice.ariaLabel = `Usar cor ${color}`; choice.addEventListener("click", () => { card.style.setProperty("--card-color", color); actions.updateCard(note.id, { color }); }); palette.append(choice); });
  card.append(header, title, description, palette);
  let timer; const save = () => { clearTimeout(timer); timer = setTimeout(() => actions.updateCard(note.id, { title: title.value, description: description.value }), 350); };
  title.addEventListener("input", save); description.addEventListener("input", save);
  [title, description].forEach((field) => field.addEventListener("blur", () => { clearTimeout(timer); actions.updateCard(note.id, { title: title.value, description: description.value }); actions.removeIfEmpty(note.id, card); }));
  duplicate.addEventListener("click", () => { const copy = actions.duplicateCard(note.id); card.parentElement.append(renderCard(copy, actions)); });
  remove.addEventListener("click", () => confirmCardDeletion(card, note.id, actions));
  bindCardDrag(card, actions); return card;
}

function confirmCardDeletion(card, noteId, actions) {
  if (card.querySelector(".kanban-card__confirm")) return;
  const layer = document.createElement("div"); layer.className = "kanban-card__confirm"; const message = document.createElement("span"); message.textContent = "Excluir?"; const cancel = button("Não", "kanban-card__confirm-button"); const accept = button("Sim", "kanban-card__confirm-button kanban-card__confirm-button--danger"); cancel.addEventListener("click", () => layer.remove()); accept.addEventListener("click", () => { actions.removeCard(noteId); card.remove(); }); layer.append(message, cancel, accept); card.append(layer); cancel.focus();
}

function bindCardDrag(card, actions) {
  card.addEventListener("pointerdown", (event) => {
    if (event.target.closest("input, textarea, button")) return;
    event.preventDefault(); card.classList.add("kanban-card--dragging");
    const move = (pointer) => { const target = document.elementFromPoint(pointer.clientX, pointer.clientY)?.closest(".kanban-column__cards"); if (!target) return; const sibling = [...target.querySelectorAll(".kanban-card:not(.kanban-card--dragging)")].find((item) => pointer.clientY < item.getBoundingClientRect().top + item.offsetHeight / 2); target.insertBefore(card, sibling ?? null); };
    const end = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", end); document.removeEventListener("pointercancel", end); card.classList.remove("kanban-card--dragging"); syncCards(card.closest(".kanban-columns"), actions); };
    document.addEventListener("pointermove", move); document.addEventListener("pointerup", end); document.addEventListener("pointercancel", end);
  });
}

function bindCardDrop(cards, actions) { cards.addEventListener("pointerup", () => syncCards(cards.closest(".kanban-columns"), actions)); }
function syncCards(columns, actions) { actions.syncCards([...columns.querySelectorAll(".kanban-column__cards")].map((container) => ({ columnId: container.dataset.columnId, noteIds: [...container.querySelectorAll(".kanban-card")].map((card) => card.dataset.noteId) }))); }

function bindColumnReorder(columns, actions) {
  columns.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest(".kanban-column__drag"); if (!handle) return; event.preventDefault(); handle.setPointerCapture(event.pointerId); const column = handle.closest(".kanban-column"); column.classList.add("kanban-column--dragging");
    const move = (pointer) => { const sibling = [...columns.querySelectorAll(".kanban-column:not(.kanban-column--dragging)")].find((item) => pointer.clientX < item.getBoundingClientRect().left + item.offsetWidth / 2); columns.insertBefore(column, sibling ?? null); };
    const end = () => { columns.removeEventListener("pointermove", move); column.classList.remove("kanban-column--dragging"); actions.reorderColumns([...columns.querySelectorAll(".kanban-column")].map((item) => item.dataset.columnId)); };
    columns.addEventListener("pointermove", move); columns.addEventListener("pointerup", end, { once: true }); columns.addEventListener("pointercancel", end, { once: true });
  });
}

function openNameDialog(heading, label, submit, value = "") {
  const backdrop = document.createElement("div"); backdrop.className = "modal-backdrop"; const form = document.createElement("form"); form.className = "modal"; const title = document.createElement("h2"); title.textContent = heading; const field = document.createElement("label"); field.className = "field"; field.textContent = label; const input = document.createElement("input"); input.required = true; input.maxLength = 100; input.value = value; field.append(input); const actions = document.createElement("div"); actions.className = "modal__actions"; const cancel = button("Cancelar"); cancel.addEventListener("click", () => backdrop.remove()); const confirm = button("Salvar", "button button--primary"); confirm.type = "submit"; actions.append(cancel, confirm); form.append(title, field, actions); form.addEventListener("submit", (event) => { event.preventDefault(); submit(input.value); backdrop.remove(); }); backdrop.append(form); document.body.append(backdrop); input.focus();
}

function openColumnDeleteDialog(column, board, actions, root) {
  const cards = board.notes.filter((note) => note.columnId === column.id); if (!cards.length) return openNameDialog("Excluir coluna?", "Digite EXCLUIR para confirmar", (value) => { if (value === "EXCLUIR") { actions.deleteColumn(column.id); renderKanbanBoard(root, board, actions); } });
  const backdrop = document.createElement("div"); backdrop.className = "modal-backdrop"; const dialog = document.createElement("div"); dialog.className = "modal"; const title = document.createElement("h2"); title.textContent = "Mover ou excluir cartões?"; const copy = document.createElement("p"); copy.textContent = `A coluna “${column.name}” contém ${cards.length} cartão(ões).`;
  const field = document.createElement("label"); field.className = "field"; field.textContent = "Destino dos cartões"; const select = document.createElement("select"); const discard = document.createElement("option"); discard.value = "delete"; discard.textContent = "Excluir cartões"; select.append(discard); board.columns.filter((item) => item.id !== column.id).forEach((item) => { const option = document.createElement("option"); option.value = item.id; option.textContent = `Mover para: ${item.name}`; select.append(option); }); field.append(select); const footer = document.createElement("div"); footer.className = "modal__actions"; const cancel = button("Cancelar"); cancel.addEventListener("click", () => backdrop.remove()); const confirm = button("Confirmar", "button button--primary"); confirm.addEventListener("click", () => { actions.deleteColumn(column.id, select.value); backdrop.remove(); renderKanbanBoard(root, board, actions); }); footer.append(cancel, confirm); dialog.append(title, copy, field, footer); backdrop.append(dialog); document.body.append(backdrop);
}
