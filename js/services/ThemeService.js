import { THEMES } from "../core/themes.js";

const STORAGE_KEY = "sticky-board:theme";

export class ThemeService {
  constructor(boardService) { this.boardService = boardService; }

  load() {
    const theme = localStorage.getItem(STORAGE_KEY);
    return THEMES[theme] ? theme : "light";
  }

  apply(theme) { document.documentElement.dataset.theme = THEMES[theme] ? theme : "light"; }

  set(theme) {
    if (!THEMES[theme]) throw new TypeError("Tema inválido.");
    const current = this.load();
    if (current !== theme) {
      const source = THEMES[current].palette; const target = THEMES[theme].palette;
      this.boardService.document.boards.forEach((board) => board.notes.forEach((note) => { const index = source.indexOf(note.color); if (index !== -1) note.color = target[index]; }));
      this.boardService.storage.save(this.boardService.document);
    }
    localStorage.setItem(STORAGE_KEY, theme); this.apply(theme);
  }
}
