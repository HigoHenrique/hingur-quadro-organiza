import { getActivePalette } from "../core/themes.js";
import { refreshLinks } from "../utils/richContent.js";
import { compressImage, copyNoteContent } from "../utils/image.js";

function makeButton(label, className = "button") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

function plusIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24"); icon.setAttribute("width", "28"); icon.setAttribute("height", "28"); icon.setAttribute("aria-hidden", "true"); icon.setAttribute("fill", "none"); icon.setAttribute("stroke", "currentColor"); icon.setAttribute("stroke-width", "2.5"); icon.setAttribute("stroke-linecap", "round");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("d", "M12 5v14M5 12h14"); icon.append(path);
  return icon;
}

export function renderFreeBoard(root, board, actions) {
  root.replaceChildren();
  const page = document.createElement("section"); page.className = "free-board";
  const toolbar = document.createElement("header"); toolbar.className = "board-toolbar";
  const back = makeButton("← Quadros"); back.addEventListener("click", actions.back);
  const center = document.createElement("div"); center.className = "board-toolbar__center";
  const title = document.createElement("h1"); title.textContent = board.name;
  const add = makeButton("", "board-toolbar__add"); add.append(plusIcon()); add.ariaLabel = "Novo post-it"; add.title = "Novo post-it";
  center.append(title);
  toolbar.append(back, center, document.createElement("span"));
  const controls = document.createElement("div"); controls.className = "board-controls";
  const zoomOut = makeButton("−", "board-controls__button"); zoomOut.ariaLabel = "Diminuir zoom";
  const zoomLabel = document.createElement("span"); zoomLabel.className = "board-controls__zoom";
  const zoomIn = makeButton("+", "board-controls__button"); zoomIn.ariaLabel = "Aumentar zoom";
  const centerView = makeButton("Centralizar", "board-controls__text-button");
  const fitView = makeButton("Enquadrar", "board-controls__text-button");
  controls.append(zoomOut, zoomLabel, zoomIn, centerView, fitView);
  const viewport = document.createElement("div"); viewport.className = "free-board__viewport";
  const canvas = document.createElement("div"); canvas.className = "free-board__canvas";
  viewport.append(canvas); page.append(toolbar, viewport, controls, add); root.append(page);

  const settings = { zoom: board.settings.zoom ?? 1, viewportX: board.settings.viewportX ?? 0, viewportY: board.settings.viewportY ?? 0, isInitialView: board.settings.isInitialView === true };
  const clampZoom = (value) => Math.min(2, Math.max(.1, value));
  const applyView = (persist = false) => { canvas.style.transform = `translate(${settings.viewportX}px, ${settings.viewportY}px) scale(${settings.zoom})`; zoomLabel.textContent = `${Math.round(settings.zoom * 100)}%`; if (persist) actions.updateSettings(settings); };
  const setZoom = (nextZoom, focusX = viewport.clientWidth / 2, focusY = viewport.clientHeight / 2) => { const zoom = clampZoom(nextZoom); const ratio = zoom / settings.zoom; settings.viewportX = focusX - (focusX - settings.viewportX) * ratio; settings.viewportY = focusY - (focusY - settings.viewportY) * ratio; settings.zoom = zoom; applyView(true); };
  if (settings.isInitialView) {
    settings.viewportX = viewport.clientWidth / 2 - 9600;
    settings.viewportY = viewport.clientHeight / 2 - 6600;
    settings.isInitialView = false;
    applyView(true);
  } else {
    applyView();
  }

  const createNote = () => {
    const note = actions.create({
      x: Math.max(48, (viewport.clientWidth / 2 - settings.viewportX) / settings.zoom - 160),
      y: Math.max(48, (viewport.clientHeight / 2 - settings.viewportY) / settings.zoom - 125),
      color: getActivePalette()[0],
    });
    const noteElement = renderNote(canvas, note, actions);
    canvas.append(noteElement);
    requestAnimationFrame(() => noteElement.querySelector("input").focus());
  };
  add.addEventListener("click", createNote);
  canvas.addEventListener("dblclick", (event) => { if (event.target === canvas) createNote(); });
  board.notes.forEach((note) => canvas.append(renderNote(canvas, note, actions)));
  zoomOut.addEventListener("click", () => setZoom(settings.zoom - .1)); zoomIn.addEventListener("click", () => setZoom(settings.zoom + .1));
  centerView.addEventListener("click", () => { settings.zoom = 1; settings.viewportX = viewport.clientWidth / 2 - 9600; settings.viewportY = viewport.clientHeight / 2 - 6600; applyView(true); });
  fitView.addEventListener("click", () => {
    if (!board.notes.length) return centerView.click();
    const left = Math.min(...board.notes.map((note) => note.x)); const top = Math.min(...board.notes.map((note) => note.y)); const right = Math.max(...board.notes.map((note) => note.x + note.width)); const bottom = Math.max(...board.notes.map((note) => note.y + note.height));
    settings.zoom = clampZoom(Math.min((viewport.clientWidth - 120) / (right - left), (viewport.clientHeight - 120) / (bottom - top)));
    settings.viewportX = (viewport.clientWidth - (right - left) * settings.zoom) / 2 - left * settings.zoom; settings.viewportY = (viewport.clientHeight - (bottom - top) * settings.zoom) / 2 - top * settings.zoom; applyView(true);
  });
  viewport.addEventListener("wheel", (event) => { if (!event.ctrlKey) return; event.preventDefault(); const bounds = viewport.getBoundingClientRect(); setZoom(settings.zoom + (event.deltaY < 0 ? .1 : -.1), event.clientX - bounds.left, event.clientY - bounds.top); }, { passive: false });
  let spacePressed = false; window.addEventListener("keydown", (event) => { if (event.code === "Space" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) spacePressed = true; }); window.addEventListener("keyup", (event) => { if (event.code === "Space") spacePressed = false; });
  viewport.addEventListener("pointerdown", (event) => {
    const shouldPan = event.button === 2 || (spacePressed && event.button === 0);
    if (!shouldPan) return; event.preventDefault(); viewport.setPointerCapture(event.pointerId); const startX = event.clientX; const startY = event.clientY; const originX = settings.viewportX; const originY = settings.viewportY; viewport.classList.add("free-board__viewport--panning");
    const move = (pointer) => { settings.viewportX = originX + pointer.clientX - startX; settings.viewportY = originY + pointer.clientY - startY; applyView(); };
    const end = () => { viewport.classList.remove("free-board__viewport--panning"); viewport.removeEventListener("pointermove", move); applyView(true); };
    viewport.addEventListener("pointermove", move); viewport.addEventListener("pointerup", end, { once: true }); viewport.addEventListener("pointercancel", end, { once: true });
  });
  viewport.addEventListener("contextmenu", (event) => event.preventDefault());

  const handleBoardPaste = async (event) => {
    if (!page.isConnected) return;
    if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
    const file = Array.from(event.clipboardData?.items ?? []).find((item) => item.type.startsWith("image/"))?.getAsFile();
    if (!file) return;
    event.preventDefault();
    try {
      const compressed = await compressImage(file);
      const aspectRatio = (compressed.width || 1) / (compressed.height || 1);
      const targetWidth = Math.min(450, Math.max(260, Math.round(compressed.width)));
      const targetHeight = Math.min(520, Math.max(220, Math.round(targetWidth / aspectRatio) + 70));

      const x = Math.max(48, (viewport.clientWidth / 2 - settings.viewportX) / settings.zoom - targetWidth / 2);
      const y = Math.max(48, (viewport.clientHeight / 2 - settings.viewportY) / settings.zoom - targetHeight / 2);

      const note = actions.create({
        x,
        y,
        width: targetWidth,
        height: targetHeight,
        color: getActivePalette()[0],
        image: compressed.dataUrl,
      });
      const noteElement = renderNote(canvas, note, actions);
      canvas.append(noteElement);
    } catch (err) {
      console.error("Falha ao criar post-it com imagem colada:", err);
    }
  };
  window.addEventListener("paste", handleBoardPaste);
}

function renderNote(canvas, note, actions) {
  const element = document.createElement("article"); element.className = "sticky-note"; element.dataset.noteId = note.id;
  element.style.setProperty("--note-color", note.color); element.style.left = `${note.x}px`; element.style.top = `${note.y}px`; element.style.width = `${note.width}px`; element.style.height = `${note.height}px`;
  const header = document.createElement("div"); header.className = "sticky-note__header";
  const drag = makeButton("⠿", "sticky-note__drag"); drag.ariaLabel = "Mover post-it";
  const menu = document.createElement("div"); menu.className = "sticky-note__tools";
  const copy = makeButton("⎘", "sticky-note__tool"); copy.ariaLabel = "Copiar conteúdo"; copy.title = "Copiar conteúdo";
  const duplicate = makeButton("⧉", "sticky-note__tool"); duplicate.ariaLabel = "Duplicar post-it"; duplicate.title = "Duplicar";
  const remove = makeButton("×", "sticky-note__tool"); remove.ariaLabel = "Excluir post-it"; remove.title = "Excluir";
  menu.append(copy, duplicate, remove); header.append(drag, menu);
  const title = document.createElement("input"); title.className = "sticky-note__title"; title.value = note.title; title.placeholder = "Título"; title.maxLength = 120; title.ariaLabel = "Título do post-it";
  const media = document.createElement("div"); media.className = "sticky-note__media";
  const img = document.createElement("img"); img.className = "sticky-note__image"; img.alt = "Imagem do post-it";
  const removeMedia = makeButton("×", "sticky-note__media-remove");
  removeMedia.title = "Remover imagem";
  removeMedia.ariaLabel = "Remover imagem";
  removeMedia.addEventListener("click", (event) => {
    event.stopPropagation();
    note.image = null;
    updateMedia();
    actions.update(note.id, { image: null });
  });
  media.append(img, removeMedia);
  const updateMedia = () => {
    if (note.image) {
      img.src = note.image;
      media.hidden = false;
    } else {
      img.removeAttribute("src");
      media.hidden = true;
    }
  };
  updateMedia();
  const formatBar = document.createElement("div"); formatBar.className = "sticky-note__format";
  const black = makeButton("Preto", "sticky-note__format-button"); const white = makeButton("Branco", "sticky-note__format-button"); const decrease = makeButton("A−", "sticky-note__format-button"); const increase = makeButton("A+", "sticky-note__format-button"); decrease.ariaLabel = "Diminuir texto"; increase.ariaLabel = "Aumentar texto"; formatBar.append(black, white, decrease, increase);
  const description = document.createElement("textarea"); description.className = "sticky-note__description"; description.value = note.description; description.placeholder = "Escreva algo…"; description.maxLength = 2000; description.ariaLabel = "Descrição do post-it";
  const initialTextSize = Number(note.textSize ?? 18); element.style.setProperty("--note-content-color", note.textColor || ""); element.style.setProperty("--note-scale", `${initialTextSize}px`); title.style.fontSize = `${initialTextSize + 3}px`; description.style.fontSize = `${initialTextSize}px`;
  const footer = document.createElement("footer"); footer.className = "sticky-note__footer";
  const colors = document.createElement("div"); colors.className = "color-palette"; colors.ariaLabel = "Cor do post-it";
  getActivePalette().forEach((color) => { const choice = makeButton("", "color-palette__choice"); choice.style.background = color; choice.ariaLabel = `Usar cor ${color}`; choice.title = "Alterar cor"; choice.addEventListener("click", () => setColor(color)); colors.append(choice); });
  footer.append(colors, formatBar);
  const links = document.createElement("div"); links.className = "content-links";
  refreshLinks(links, `${note.title} ${note.description}`);
  const resize = document.createElement("span"); resize.className = "sticky-note__resize"; resize.ariaLabel = "Redimensionar post-it"; resize.setAttribute("role", "presentation");
  element.append(header, media, title, description, links, footer, resize);

  element.addEventListener("paste", async (event) => {
    const file = Array.from(event.clipboardData?.items ?? []).find((item) => item.type.startsWith("image/"))?.getAsFile();
    if (!file) return;
    event.preventDefault();
    try {
      const compressed = await compressImage(file);
      note.image = compressed.dataUrl;
      updateMedia();
      actions.update(note.id, { image: compressed.dataUrl });
    } catch (err) {
      console.error("Falha ao colar imagem no post-it:", err);
    }
  });

  let typingTimer;
  const updateLinks = () => refreshLinks(links, `${title.value} ${description.value}`);
  const saveText = () => {
    updateLinks();
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => actions.update(note.id, { title: title.value, description: description.value }), 350);
  };
  title.addEventListener("input", saveText); description.addEventListener("input", saveText);
  const setTextColor = (color) => { element.style.setProperty("--note-content-color", color); actions.update(note.id, { textColor: color }); };
  black.addEventListener("click", () => setTextColor("#000000")); white.addEventListener("click", () => setTextColor("#ffffff"));
  const resizeText = (amount) => { const current = Number.parseInt(element.style.getPropertyValue("--note-scale"), 10) || 18; const size = Math.min(28, Math.max(13, current + amount)); note.textSize = size; element.style.setProperty("--note-scale", `${size}px`); title.style.fontSize = `${size + 3}px`; description.style.fontSize = `${size}px`; actions.update(note.id, { textSize: size }); };
  decrease.addEventListener("click", () => resizeText(-1)); increase.addEventListener("click", () => resizeText(1));
  [title, description].forEach((field) => field.addEventListener("blur", () => {
    clearTimeout(typingTimer);
    updateLinks();
    actions.update(note.id, { title: title.value, description: description.value });
    actions.removeIfEmpty(note.id, element);
  }));
  duplicate.addEventListener("click", () => { const copy = actions.duplicate(note.id); const copyElement = renderNote(canvas, copy, actions); canvas.append(copyElement); requestAnimationFrame(() => copyElement.querySelector("input").focus()); });
  copy.addEventListener("click", async () => { await copyNoteContent({ text: description.value, image: note.image }); copy.title = "Copiado"; setTimeout(() => { copy.title = "Copiar conteúdo"; }, 1500); });
  remove.addEventListener("click", () => requestRemoval());
  function setColor(color) { element.style.setProperty("--note-color", color); actions.update(note.id, { color }); }
  bindMove(element, header, note, actions); bindResize(element, resize, note, actions);
  return element;

  function requestRemoval() {
    if (element.querySelector(".sticky-note__confirm")) return;
    const confirm = document.createElement("div"); confirm.className = "sticky-note__confirm";
    const message = document.createElement("span"); message.textContent = "Excluir?";
    const cancel = makeButton("Não", "sticky-note__confirm-button");
    const accept = makeButton("Sim", "sticky-note__confirm-button sticky-note__confirm-button--danger");
    cancel.addEventListener("click", () => confirm.remove());
    accept.addEventListener("click", () => { actions.remove(note.id); element.remove(); });
    confirm.append(message, cancel, accept); element.append(confirm); cancel.focus();
  }
}

async function copyContent(content) {
  return copyNoteContent({ text: content });
}

function bindMove(element, handle, note, actions) {
  handle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    event.preventDefault(); handle.setPointerCapture(event.pointerId); const startX = event.clientX; const startY = event.clientY; const originX = note.x; const originY = note.y;
    const move = (pointer) => { const zoom = actions.getZoom?.() ?? 1; const x = Math.max(0, originX + (pointer.clientX - startX) / zoom); const y = Math.max(0, originY + (pointer.clientY - startY) / zoom); element.style.left = `${x}px`; element.style.top = `${y}px`; note.x = x; note.y = y; };
    const end = () => { handle.removeEventListener("pointermove", move); actions.update(note.id, { x: note.x, y: note.y }); };
    handle.addEventListener("pointermove", move); handle.addEventListener("pointerup", end, { once: true }); handle.addEventListener("pointercancel", end, { once: true });
  });
}

function bindResize(element, handle, note, actions) {
  handle.addEventListener("pointerdown", (event) => {
    event.preventDefault(); handle.setPointerCapture(event.pointerId); const startX = event.clientX; const startY = event.clientY; const originWidth = note.width; const originHeight = note.height;
    const move = (pointer) => { const zoom = actions.getZoom?.() ?? 1; const width = Math.max(180, originWidth + (pointer.clientX - startX) / zoom); const height = Math.max(150, originHeight + (pointer.clientY - startY) / zoom); element.style.width = `${width}px`; element.style.height = `${height}px`; note.width = width; note.height = height; };
    const end = () => { handle.removeEventListener("pointermove", move); actions.update(note.id, { width: note.width, height: note.height }); };
    handle.addEventListener("pointermove", move); handle.addEventListener("pointerup", end, { once: true }); handle.addEventListener("pointercancel", end, { once: true });
  });
}
