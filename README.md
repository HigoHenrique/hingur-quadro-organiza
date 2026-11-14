<div align="center">
  <img src="./assets/logo.png" alt="Hingur organiza" width="120" />
  <h1>Hingur organiza</h1>
  <p><strong>Organização visual inteligente, livre, privada e 100% local.</strong></p>
</div>

---

## 📌 Sobre o Projeto

O **Hingur organiza** é uma aplicação web focada em produtividade e organização visual. Com ele, você pode capturar ideias rapidamente, criar mapas mentais, fazer brainstorming e organizar fluxos de trabalho através de dois formatos complementares:

* **Quadro Livre:** Uma tela infinita com zoom e pan para espalhar post-its, imagens e anotações como em um mural físico (estilo Miro/FigJam).
* **Kanban:** Colunas e cartões personalizáveis com suporte a arrastar e soltar (drag & drop) para gerenciar etapas de projetos.

O grande diferencial do **Hingur organiza** é a **privacidade e a autonomia**: não exige cadastro, não possui anúncios e **não envia nenhum dado para servidores na nuvem**. Tudo roda e fica salvo exclusivamente no armazenamento local do seu navegador (`localStorage`).

---

## ✨ Funcionalidades Principais

* 🖼️ **Post-its Inteligentes com Imagens:**
  * **Ctrl + V no quadro:** Copie qualquer imagem ou printscreen e pressione `Ctrl + V` em qualquer área vazia do quadro livre para gerar um novo post-it na hora, dimensionado proporcionalmente.
  * **Colar dentro do post-it:** Anexe ou atualize fotos e diagramas em post-its já existentes.
  * **Compressão Automática no Cliente:** Imagens são compactadas em tempo real via Canvas offscreen (WebP/JPEG ~60KB - 120KB), garantindo máxima performance a 60 FPS sem esgotar o limite do navegador.
  * **Redimensionamento Fluido:** Arraste a alça do canto do post-it para ajustar largura e altura; a imagem se adapta suavemente e sem distorcer (`object-fit: contain`).
* 🔗 **Links Clicáveis Automáticos:**
  * Reconhecimento instantâneo de links (`https://`, `http://` e `www.`) no título e na descrição.
  * As URLs viram tags destacadas (`content-links`) com ícone `↗`, abrindo em nova aba com segurança sem interferir no arrasto do post-it.
* 📋 **Área de Transferência Híbrida (Cópia Avançada):**
  * O botão de cópia (`⎘`) empacota textos e imagens no formato nativo da área de transferência do sistema operacional (`image/png`).
  * Cole diretamente em outros apps desktop como **Microsoft Teams**, **WhatsApp Web**, **Discord**, **Paint**, **Word** ou em outros post-its.
* 🧭 **Navegação Livre com Zoom e Pan:**
  * Mova o quadro segurando `Espaço + Arrastar com o mouse` ou com o `Botão Direito do Mouse`.
  * Controle de zoom fluido via `Ctrl + Roda do Mouse` ou pelos botões de controle na tela (com funções *Centralizar* e *Enquadrar*).
* 🌓 **Temas Personalizados:**
  * Escolha entre múltiplos esquemas de cores no painel de temas.
* 💾 **Backups Seguros (Exportar e Importar):**
  * Exporte todos os seus quadros, post-its, textos e imagens em um único arquivo `.json` autocontido.
  * Restaure ou mescle backups em qualquer outro computador ou navegador sem perda de dados.

---

## 🚀 Modo de Usar & Atalhos

| Ação | Como Executar |
| :--- | :--- |
| **Colar imagem no quadro** | Copie a imagem e pressione <kbd>Ctrl</kbd> + <kbd>V</kbd> em área vazia do Quadro Livre |
| **Colar imagem em post-it** | Selecione o post-it e pressione <kbd>Ctrl</kbd> + <kbd>V</kbd> |
| **Remover imagem do post-it** | Passe o mouse sobre a imagem e clique no botão <kbd>×</kbd> |
| **Mover a tela (Pan)** | Segure <kbd>Espaço</kbd> e arraste com o mouse OU arraste com o **Botão Direito** |
| **Zoom in / Zoom out** | <kbd>Ctrl</kbd> + Roda do mouse OU botões <kbd>+</kbd> e <kbd>−</kbd> |
| **Criar post-it rápido** | Dê um **duplo clique** em qualquer área livre do quadro |
| **Copiar post-it** | Clique no botão <kbd>⎘</kbd> no topo do post-it (copia imagem e texto para Teams, WhatsApp, etc.) |
| **Duplicar post-it** | Clique no botão <kbd>⧉</kbd> no post-it |
| **Fechar janelas/modais** | Pressione <kbd>Esc</kbd> |

---

## 🛠️ Tecnologias Utilizadas

* **HTML5 Semântico**
* **CSS3 Moderno:** Flexbox, CSS Grid, Variáveis CSS (Custom Properties) e design responsivo.
* **JavaScript Puro (Vanilla ES Modules):** Sem frameworks externos pesados, garantindo carregamento instantâneo e leveza.
* **Web APIs Nativas:**
  * `Canvas API` (compressão e redimensionamento client-side de imagens)
  * `Async Clipboard API` (`navigator.clipboard.write` com `ClipboardItem`)
  * `localStorage API` (persistência local)
  * `Blob & FileReader API` (manipulação binária)

---

## 📂 Estrutura de Arquivos

```text
projeto-quadro-organiza/
├── assets/
│   ├── fav.png              # Favicon do site
│   └── logo.png             # Logotipo do Hingur organiza
├── css/
│   ├── global.css           # Estilos globais e componentes visuais
│   ├── reset.css            # Normalização de estilos
│   └── variables.css        # Paletas de cores, temas e espaçamentos
├── js/
│   ├── app.js               # Ponto de entrada da aplicação
│   ├── core/
│   │   ├── Router.js        # Roteamento baseado em hash (#/dashboard, #/board/:id)
│   │   └── themes.js        # Paletas de cores e temas disponíveis
│   ├── models/
│   │   ├── Board.js         # Modelo de Quadro (Livre / Kanban)
│   │   ├── Column.js        # Modelo de Coluna Kanban
│   │   └── Note.js          # Modelo de Post-it / Cartão
│   ├── services/
│   │   ├── BackupService.js # Exportação e importação de backups JSON
│   │   ├── BoardService.js  # Gerenciamento de quadros
│   │   ├── ColumnService.js # Gerenciamento de colunas Kanban
│   │   ├── NoteService.js   # CRUD e ordenação de notas
│   │   ├── StorageService.js# Persistência com localStorage
│   │   └── ThemeService.js  # Aplicação e persistência de temas
│   ├── utils/
│   │   ├── image.js         # Compressão de imagens e integração de clipboard
│   │   ├── richContent.js   # Detecção de links e manipulação de texto
│   │   └── validators.js    # Validação e integridade de documentos JSON
│   └── views/
│       ├── DashboardView.js # Home: apresentação, guia de uso e lista de quadros
│       ├── FoundationView.js# View de base/inicialização
│       ├── FreeBoardView.js # Editor do Quadro Livre com post-its e canvas
│       └── KanbanBoardView.js # Editor do Quadro Kanban com drag-and-drop
├── index.html               # Documento principal
└── README.md                # Documentação do repositório
```

---

## 💻 Como Rodar o Projeto

Como o projeto é construído em JavaScript modular puro (ES Modules), basta executá-lo em qualquer servidor web estático local:

### Opção 1: Extensão Live Server (VS Code)
1. Abra a pasta do projeto no VS Code.
2. Clique com o botão direito em `index.html` e selecione **"Open with Live Server"**.

### Opção 2: Python
Execute no terminal na raiz do projeto:
```bash
python -m http.server 8000
```
Depois acesse `http://localhost:8000` no seu navegador.

### Opção 3: Node.js (npx)
```bash
npx serve .
```

---

## 🔒 Segurança e Privacidade

* **Zero Rastreamento:** Sem scripts de analytics ou telemetria.
* **Isolamento de Dados:** Todas as suas informações permanecem no navegador da sua máquina.
* **Backups Portáteis:** O usuário é o único dono dos seus dados através dos arquivos de backup JSON.
