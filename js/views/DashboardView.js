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
  
  // Header com ações
  const header = element("header", { className: "dashboard__header" });
  const brand = element("div", { className: "brand" });
  const miniLogo = element("img", { className: "brand__logo", src: "./assets/logo.png", alt: "Hingur organiza" });
  const brandTitle = element("span", { className: "brand__name", textContent: "Hingur organiza" });
  brand.append(miniLogo, brandTitle);

  const headerActions = element("div", { className: "dashboard__actions" });
  const theme = button("Tema", "button"); theme.addEventListener("click", actions.theme);
  const exportData = button("Exportar", "button"); exportData.addEventListener("click", actions.exportData);
  const importData = button("Importar", "button"); importData.addEventListener("click", actions.importData);
  const create = button("+ Novo quadro", "button button--primary"); create.addEventListener("click", actions.create);
  headerActions.append(theme, exportData, importData, create);
  header.append(brand, headerActions);

  // Hero Principal com a LOGO EM DESTAQUE e apresentação
  const hero = element("section", { className: "home-hero" });
  const heroContent = element("div", { className: "home-hero__content" });
  const heroLogo = element("img", { className: "home-hero__logo", src: "./assets/logo.png", alt: "Logo Hingur organiza" });
  const heroText = element("div", { className: "home-hero__text" });
  const heroBadge = element("span", { className: "home-hero__badge", textContent: "Visual • Ágil • 100% Local" });
  const heroTitle = element("h1", { className: "home-hero__title", textContent: "Hingur organiza" });
  const heroDescription = element("p", {
    className: "home-hero__description",
    textContent: "Capture ideias com post-its inteligentes, cole imagens com Ctrl+V e estruture seus fluxos no Quadro Livre ou Kanban. Sem cadastros, sem nuvem — seus dados ficam salvos exclusivamente no seu computador."
  });
  heroText.append(heroBadge, heroTitle, heroDescription);
  heroContent.append(heroLogo, heroText);
  hero.append(heroContent);

  // Seção da lista de quadros (POSICIONADA IMEDIATAMENTE NO TOPO)
  const boardsSection = element("section", { className: "dashboard__boards" });
  const sectionHeader = element("div", { className: "dashboard__section-header" });
  const sectionTitle = element("h2", { textContent: "Seus quadros" });
  const sectionCount = element("span", { className: "dashboard__count", textContent: `${boards.length} quadro(s)` });
  sectionHeader.append(sectionTitle, sectionCount);
  boardsSection.append(sectionHeader);

  if (!boards.length) {
    const empty = element("section", { className: "empty-state" });
    empty.append(
      element("div", { className: "empty-state__illustration", textContent: "✦" }),
      element("h2", { textContent: "Comece com um espaço em branco" }),
      element("p", { textContent: "Crie um quadro livre para ideias visuais ou um Kanban para acompanhar etapas de projetos." })
    );
    const emptyCreate = button("Criar meu primeiro quadro", "button button--primary");
    emptyCreate.addEventListener("click", actions.create);
    empty.append(emptyCreate);
    boardsSection.append(empty);
  } else {
    const grid = element("section", { className: "board-grid", ariaLabel: "Lista de quadros" });
    boards.forEach((board) => {
      const card = element("article", { className: "board-card" });
      card.tabIndex = 0;
      card.setAttribute("role", "link");
      card.ariaLabel = `Abrir quadro ${board.name}`;
      const type = element("span", {
        className: `board-card__type${board.type === "kanban" ? " board-card__type--kanban" : ""}`,
        textContent: board.type === "kanban" ? "Kanban" : "Quadro livre"
      });
      const title = element("h3", { textContent: board.name });
      const time = element("time", { textContent: `Atualizado ${formatDate(board.updatedAt)}`, dateTime: board.updatedAt });
      const cardActions = element("div", { className: "board-card__actions" });
      const rename = button("✎", "icon-button");
      rename.ariaLabel = `Renomear ${board.name}`;
      rename.title = "Renomear";
      rename.addEventListener("click", (event) => { event.stopPropagation(); actions.rename(board); });
      const duplicate = button("⧉", "icon-button");
      duplicate.ariaLabel = `Duplicar ${board.name}`;
      duplicate.title = "Duplicar";
      duplicate.addEventListener("click", (event) => { event.stopPropagation(); actions.duplicate(board); });
      const remove = button("×", "icon-button");
      remove.ariaLabel = `Excluir ${board.name}`;
      remove.title = "Excluir";
      remove.addEventListener("click", (event) => { event.stopPropagation(); actions.remove(board); });
      cardActions.append(rename, duplicate, remove);
      card.append(type, title, time, cardActions);
      card.addEventListener("click", () => actions.open(board));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          actions.open(board);
        }
      });
      grid.append(card);
    });
    boardsSection.append(grid);
  }

  // Guia de Uso Inteligente (Recolhível ou aberto se não houver quadros)
  const guide = element("details", { className: "home-guide-accordion" });
  if (!boards.length) guide.open = true;

  const guideSummary = element("summary", { className: "home-guide-summary" });
  guideSummary.innerHTML = `<span>💡 <strong>Modo de usar & Dicas rápidas</strong> (Imagens, atalhos, links e navegação)</span> <span class="accordion-arrow">▾</span>`;
  
  const tipsGrid = element("div", { className: "home-guide__grid" });
  const tips = [
    {
      icon: "🖼️",
      title: "Colar imagens (Ctrl + V)",
      text: "Copie qualquer print ou imagem e aperte Ctrl+V no Quadro Livre para criar um post-it instantâneo, ou cole dentro de um post-it existente. As imagens são comprimidas automaticamente para manter o app leve."
    },
    {
      icon: "🔗",
      title: "Links automáticos & clicáveis",
      text: "Digite ou cole links (https:// ou www.) no título ou na descrição de qualquer post-it. Eles se transformam em tags destacadas que abrem em nova aba sem arrastar o post-it."
    },
    {
      icon: "📋",
      title: "Copiar para Teams e WhatsApp",
      text: "Clique no botão Copiar (⎘) de qualquer post-it para copiar a imagem e o texto. Cole direto no app do Microsoft Teams, WhatsApp Web, Discord ou Paint."
    },
    {
      icon: "🖱️",
      title: "Navegação e zoom no Quadro Livre",
      text: "Segure a Barra de Espaço + arraste com o mouse (ou use o botão direito) para mover a tela. Use Ctrl + Roda do Mouse para dar zoom."
    },
    {
      icon: "📐",
      title: "Redimensionamento livre",
      text: "Puxe o canto inferior direito de qualquer post-it para redimensioná-lo. Imagens e textos se adaptam fluidamente ao novo formato."
    },
    {
      icon: "💾",
      title: "Privacidade e backups JSON",
      text: "Seus dados nunca saem da sua máquina. Use os botões Exportar e Importar no topo da página para criar e restaurar backups completos a qualquer hora."
    }
  ];

  tips.forEach((tip) => {
    const card = element("div", { className: "home-guide__card" });
    const icon = element("span", { className: "home-guide__icon", textContent: tip.icon });
    const h3 = element("h3", { textContent: tip.title });
    const p = element("p", { textContent: tip.text });
    card.append(icon, h3, p);
    tipsGrid.append(card);
  });

  guide.append(guideSummary, tipsGrid);

  // Footer da Home
  const footer = element("footer", { className: "dashboard__footer" });
  footer.append(
    element("p", { textContent: "Hingur organiza • Armazenamento 100% local e privado no seu computador." })
  );

  page.append(header, hero, boardsSection, guide, footer);
  root.append(page);
}

export function renderBoardPlaceholder(root, board, onBack) {
  root.replaceChildren();
  const page = element("section", { className: "board-placeholder" });
  const back = button("← Todos os quadros");
  back.addEventListener("click", onBack);
  const card = element("div", { className: "board-placeholder__card" });
  card.append(
    element("h1", { textContent: board.name }),
    element("p", { textContent: `O editor ${board.type === "kanban" ? "Kanban" : "de Quadro Livre"} será entregue na próxima etapa.` })
  );
  page.append(back, card);
  root.append(page);
}
