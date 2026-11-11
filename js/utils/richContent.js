const URL_PATTERN = /https?:\/\/[^\s]+/g;

export function refreshLinks(host, content) {
  host.replaceChildren();
  const urls = [...new Set((content.match(URL_PATTERN) ?? []).map((url) => url.replace(/[),.!?]+$/, "")))];
  urls.forEach((url) => { const link = document.createElement("a"); link.className = "content-link"; link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = url; host.append(link); });
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
