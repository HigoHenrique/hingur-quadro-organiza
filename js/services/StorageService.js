import { createEmptyDocument, validateDocument } from "../utils/validators.js";

const STORAGE_KEY = "sticky-board:data";

export class StorageService {
  constructor() { this.lastError = null; }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyDocument();
      const document = JSON.parse(raw);
      if (!validateDocument(document)) throw new TypeError("Dados locais inválidos.");
      return document;
    } catch (error) {
      this.lastError = error;
      console.warn("Não foi possível carregar os dados do Hingur organiza.", error);
      return createEmptyDocument();
    }
  }

  save(document) {
    if (!validateDocument(document)) throw new TypeError("Tentativa de salvar dados inválidos.");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(document));
    } catch (error) {
      const message = "Não foi possível salvar localmente. Exporte um backup assim que possível.";
      const saveError = new Error(message, { cause: error });
      window.dispatchEvent(new CustomEvent("sticky-board:storage-error", { detail: message }));
      throw saveError;
    }
  }
}
