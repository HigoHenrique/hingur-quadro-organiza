const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s]+/gi;

export function refreshLinks(host, content) {
  host.replaceChildren();
  if (!content) {
    host.hidden = true;
    return;
  }
  const rawUrls = content.match(URL_PATTERN) ?? [];
  const urls = [...new Set(rawUrls.map((url) => url.replace(/[),.!?:;'"]+$/, "")))].filter(Boolean);

  urls.forEach((url) => {
    const link = document.createElement("a");
    link.className = "content-link";
    link.href = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = url;
    link.title = `Abrir ${url}`;
    link.addEventListener("pointerdown", (event) => event.stopPropagation());
    link.addEventListener("click", (event) => event.stopPropagation());
    host.append(link);
  });

  host.hidden = !urls.length;
}

export function enableIndentation(textarea) {
  textarea.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    textarea.value = `${value.slice(0, start)}\t${value.slice(end)}`;
    textarea.selectionStart = textarea.selectionEnd = start + 1;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
