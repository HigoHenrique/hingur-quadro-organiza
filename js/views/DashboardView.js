function element(tag, options = {}) {
  const node = document.createElement(tag);
  Object.assign(node, options);
  return node;
}

function button(label, className = "button") { return element("button", { type: "button", className, textContent: label }); }

function formatDate(value) { return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

export function renderDashboard(root, boards, actions) {
  root.replaceChildren();
  const page = element("section", { className: "dashboard" });
  const header = element("header", { className: "dashboard__header" });
  const brand = element("div", { className: "brand" });
  brand.append(element("span", { className: "brand__mark", textContent: "S" }), document.createTextNode("Sticky Board"));
  const headerActions = element("div", { className: "dashboard__actions" });
  const theme = button("Tema", "button"); theme.addEventListener("click", actions.theme);
  const exportData = button("Exportar", "button"); exportData.addEventListener("click", actions.exportData);
  const importData = button("Importar", "button"); importData.addEventListener("click", actions.importData);
  const create = button("+ Novo quadro", "button button--primary"); create.addEventListener("click", actions.create); headerActions.append(theme, exportData, importData, create); header.append(brand, headerActions);
  const intro = element("div", { className: "dashboard__intro" }); intro.append(element("h1", { textContent: "Seus quadros" }), element("p", { textContent: "Capture uma ideia e organize o restante depois." })); page.append(header, intro);
  if (!boards.length) {
    const empty = element("section", { className: "empty-state" }); empty.append(element("div", { className: "empty-state__illustration", textContent: "✦" }), element("h2", { textContent: "Comece com um espaço em branco" }), element("p", { textContent: "Crie um quadro livre para ideias visuais ou um Kanban para acompanhar etapas." })); const emptyCreate = button("Criar meu primeiro quadro", "button button--primary"); emptyCreate.addEventListener("click", actions.create); empty.append(emptyCreate); page.append(empty);
  } else {
    const grid = element("section", { className: "board-grid", ariaLabel: "Lista de quadros" });
    boards.forEach((board) => {
      const card = element("article", { className: "board-card" }); card.tabIndex = 0; card.setAttribute("role", "link"); card.ariaLabel = `Abrir quadro ${board.name}`;
      const type = element("span", { className: `board-card__type${board.type === "kanban" ? " board-card__type--kanban" : ""}`, textContent: board.type === "kanban" ? "Kanban" : "Quadro livre" });
      const title = element("h2", { textContent: board.name }); const time = element("time", { textContent: `Atualizado ${formatDate(board.updatedAt)}`, dateTime: board.updatedAt });
      const cardActions = element("div", { className: "board-card__actions" });
      const rename = button("✎", "icon-button"); rename.ariaLabel = `Renomear ${board.name}`; rename.title = "Renomear"; rename.addEventListener("click", (event) => { event.stopPropagation(); actions.rename(board); });
      const duplicate = button("⧉", "icon-button"); duplicate.ariaLabel = `Duplicar ${board.name}`; duplicate.title = "Duplicar"; duplicate.addEventListener("click", (event) => { event.stopPropagation(); actions.duplicate(board); });
      const remove = button("×", "icon-button"); remove.ariaLabel = `Excluir ${board.name}`; remove.title = "Excluir"; remove.addEventListener("click", (event) => { event.stopPropagation(); actions.remove(board); });
      cardActions.append(rename, duplicate, remove); card.append(type, title, time, cardActions); card.addEventListener("click", () => actions.open(board)); card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); actions.open(board); } }); grid.append(card);
    }); page.append(grid);
  }
  root.append(page);
}

export function renderBoardPlaceholder(root, board, onBack) {
  root.replaceChildren(); const page = element("section", { className: "board-placeholder" }); const back = button("← Todos os quadros"); back.addEventListener("click", onBack); const card = element("div", { className: "board-placeholder__card" }); card.append(element("h1", { textContent: board.name }), element("p", { textContent: `O editor ${board.type === "kanban" ? "Kanban" : "de Quadro Livre"} será entregue na próxima etapa.` })); page.append(back, card); root.append(page);
}
