export class Router {
  constructor(onChange) { this.onChange = onChange; }
  start() { window.addEventListener("hashchange", () => this.onChange(this.current())); this.onChange(this.current()); }
  current() { const [, section, id] = location.hash.split("/"); return { section: section || "dashboard", id: id || null }; }
  go(path) { location.hash = path; }
}
