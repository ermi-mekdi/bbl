window.bbl = null;
window.bblReady = (async function load() {
  try {
    const res = await fetch("../data/bblc.json");
    if (!res.ok) throw new Error(res.status);
    window.bbl = await res.json();
    return window.bbl;
  } catch (err) {
    console.error("Failed to load bblc.json", err);
    window.bbl = {};
    return window.bbl;
  }
})();

async function dChapter(targetId, path) {
  const target = targetId ? document.getElementById(targetId) : null;
  if (!target) {
    console.warn("dChapter: target element not found:", targetId);
    return;
  }
  if (typeof path !== "string") {
    console.warn("dChapter: path should be a book.chapter string, got:", path);
    return;
  }

  const match = /^([a-zA-Z0-9]+)\.(\d+)$/.exec(path.trim());//
  if (!match) {
    console.warn("dChapter: invalid path format:", path);
    return;
  }

  const [, book, chapter] = match;
  const data = window.bbl ?? await window.bblReady;
  if (!Array.isArray(data)) {
    console.warn("dChapter: chapter data is not an array");
    return;
  }

  const bookData = data.find(
    (group) => Array.isArray(group) && group[0]?.id === `${book}0`,
  );
  const groups = bookData?.slice(1);
  if (!Array.isArray(groups)) {
    console.warn("dChapter: book not found:", book);
    return;
  }

  const chapterId = `${book}${chapter}`;
  const chapterData = groups.find(
    (entries) => Array.isArray(entries) &&
      entries[0]?.id === chapterId && String(entries[0].c) === chapter,
  );
  let chapterEntries;

  if (chapterData) {
    chapterEntries = chapterData.slice(1);
  } else if (groups.every((entry) => !Array.isArray(entry))) {
    const chapterIndex = groups.findIndex(
      (entry) => entry?.id === chapterId && String(entry.c) === chapter,
    );
    if (chapterIndex !== -1) {
      const nextChapterIndex = groups.findIndex(
        (entry, index) => index > chapterIndex && entry?.c !== undefined,
      );
      chapterEntries = groups.slice(
        chapterIndex + 1,
        nextChapterIndex === -1 ? groups.length : nextChapterIndex,
      );
    }
  }

  if (!chapterEntries) {
    console.warn("dChapter: chapter not found:", path);
    return;
  }
  const html = chapterEntries
    .map((entry) => {
      if (typeof entry?.d !== "string") return "";
      if (entry.nn === undefined) return entry.d;
      return `<div class="verse-row"><span class="number">${entry.nn}</span> ${entry.d}</div>`;
    })
    .join("");

  if (!html) {
    console.warn("dChapter: no content found for chapter:", path);
    return;
  }

  target.innerHTML = html;
}