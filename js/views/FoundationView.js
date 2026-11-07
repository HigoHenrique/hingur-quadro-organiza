export function renderFoundation(root) {
  root.replaceChildren();
  const section = document.createElement("section");
  section.className = "foundation";
  section.innerHTML = `
    <div class="foundation__card">
      <div class="foundation__mark" aria-hidden="true">S</div>
      <p class="foundation__eyebrow">Sticky Board</p>
      <h1>Organize ideias no seu ritmo.</h1>
      <p class="foundation__copy">A estrutura local, segura e pronta para receber seus quadros está configurada.</p>
      <p class="foundation__status">Dados locais preparados</p>
    </div>`;
  root.append(section);
}
