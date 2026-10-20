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
      const ref = Array.isArray(entry.ref) && entry.ref.length
        ? `<strong onclick="oV(${JSON.stringify(entry.ref).replace(/"/g, "&quot;")})">📕</strong>`
        : "";
      
      return `<div class="verse-row">
            <span class="number">${entry.nn}</span>
            ${entry.d}
            ${ref}
         </div>`;
    })
    .join("");

  if (!html) {
    console.warn("dChapter: no content found for chapter:", path);
    return;
  }

  target.innerHTML = html;
}

async function oV(r) {
  if (!Array.isArray(r)) {
    console.warn("oV: expected an array of verse ids, got:", r);
    return;
  }
  
  const data = window.bbl ?? await window.bblReady;
  if (!Array.isArray(data)) {
    console.warn("oV: chapter data is not an array");
    return;
  }
  if (window.verReady) await window.verReady;

  const versesById = new Map();
  const collectVerses = (items) => {
    for (const item of items) {
      if (Array.isArray(item)) {
        collectVerses(item);
      } else if (item && typeof item === "object" &&
          typeof item.id === "string" && typeof item.d === "string") {
        versesById.set(item.id, item);
      }
    }
  };
  collectVerses(data);

  const verses = r.map((id) => {
    if (typeof id !== "string") return null;
    return versesById.get(id) ??
      (typeof getVerseByPath === "function" ? getVerseByPath(id) : null);
  }).filter((verse) => verse && typeof verse === "object");

  if (verses.length === 0) {
    console.warn("oV: no verses found for ids:", r);
    return;
  }

  versN(verses);
}
function versN(t) {
  const display = document.createElement("div");
  display.classList.add("person");
  display.id = "pdisplay";
  document.body.appendChild(display);
  
  const tq = t
    ? t
        .map(
          (item) =>
            `<li ><h3>${item.n}</h3>
      <h4 class="vdetails">${item.d}</h4>
     </li>`,
        )
        .join("")
    : "";

  display.innerHTML = `
    <div onclick="de()" class="x">X</div> 
    ${tq}
    <button class="xbtn" onclick="de()">Close</button>
    `;
}
async function selectedvers(r){
  if (!Array.isArray(r)) {
    console.warn("selectedvers: expected an array of verse ids, got:", r);
    return "";
  }

  const data = window.bbl ?? await window.bblReady;
  if (!Array.isArray(data)) {
    console.warn("selectedvers: chapter data is not an array");
    return "";
  }
  if (window.verReady) await window.verReady;

  const versesById = new Map();
  const collectVerses = (items) => {
    for (const item of items) {
      if (Array.isArray(item)) {
        collectVerses(item);
      } else if (item && typeof item === "object" &&
          typeof item.id === "string" && typeof item.d === "string") {
        versesById.set(item.id, item);
      }
    }
  };
  collectVerses(data);

  const verses = r.map((id) => {
    if (typeof id !== "string") return null;
    return versesById.get(id) ??
      (typeof getVerseByPath === "function" ? getVerseByPath(id) : null);
  }).filter((verse) => verse && typeof verse === "object");
    //console.log(verses)

  if (verses.length === 0) {
    console.warn("selectedvers: no verses found for ids:", r);
    return "";
  }
  return versP(verses);
  
}
async function oP(p) {
  const ppls = await (window.pplsReady ?? Promise.resolve(window.ppls));
  const person = typeof p === "string"
    ? Array.isArray(ppls) ? ppls.find((item) => item.id === p) : ppls?.[p]
    : p;

  if (!person || typeof person !== "object") {
    console.error(`Person with key "${p}" not found in window.ppls`);
    return;
  }
  const k = Array.isArray(person.vers) && person.vers.length
    ? await selectedvers(person.vers)
    : "";

  const display = document.createElement("div");
  display.classList.add("person");
  display.id = "pdisplay";
  document.body.appendChild(display);
  const def1 = person.nameM1 ? person.name1 + " ማለት " + person.nameM1 : "";
  const def2 = person.nameM2 ? person.name2 + " ማለት " + person.nameM2 : "";
  const naam2 =
    person.name2 && String(person.name2).trim() !== ""
      ? `ካልኣይ ስም  ${person.name2}  (${person.nameE2})`
      : "";
  const info = person.info ? person.info.map((item) => `<li>${item}</li>`).join("") : "";
  const adres = person.adres
    ? person.adres.map((item) => `<li>${item}</li>`).join("")
    : "";
  const title = person.title
    ? person.title.map((item) => `<li>${item}</li>`).join("")
    : "";

  display.innerHTML = `
  <div onclick="de()" class="x">X</div>
  
  <h2> ስም ${person.name1} (${person.nameE1}) </h2>
  <h4>${def1}</h4>
  <h3> ${naam2} </h3>  
  <h4>${def2} </h4> 
  <div class= "pdetails">  
  <h4>ስራሕ</h4>
  <ul>${title}</ul> 
  <h4>አድራሻ</h4>
  <ul>${adres}</ul>  
  <h4>ሓበሬታ</h4>
  <ul>${info}</ul>
  <ul>${k}</ul>
  </div>
  <button class="xbtn" onclick="de()">Close</button>
  `;
}
async function oPlc(p) {
  const plc = await (window.plcReady ?? Promise.resolve(window.plc));
  
  const place = typeof p === "string"
    ? Array.isArray(plc) ? plc.find((item) => item.id === p) : plc?.[p]
    : p;

  if (!place || typeof place !== "object") {
    console.error(`place with key "${p}" not found in window.plc`);
    return;
  }
  const k = Array.isArray(place.vers) && place.vers.length
    ? await selectedvers(place.vers)
    : "";

  const display = document.createElement("div");
  display.classList.add("plc");
  display.id = "pdisplay";
  document.body.appendChild(display);

  const def1 = place.nameM1 ? place.name1 + " ማለት " + place.nameM1 : "";
  const def2 =
    place && place.name2 && String(place.name2).trim() !== ""
      ? `ካልኣይ ስም  ${place.name2}  (${place.nameE2})<br>
      <h4>${place.name2 ? " ማለት " + place.nameM2 : ""}</h4>`
      : "";
  const gMap = place.gMap ? `<a href="${place.gMap}" target="_blank"><img src="${place.gMap}" alt="Map" width="200px" height="100px"></a>` : "";
  const info = place.info ? place.info.map((item) => `<li>${item}</li>`).join("") : "";
  display.innerHTML = `
  <div onclick="de()" class="x">X</div> 
  <h2> ${place.name1} (${place.nameE1}) </h2>  
  <h4>${def1}</h4>
  <h3>${def2} </h3>
  <div class= "pdetails">    
  <div class="map-container">${gMap}</div>
  <ul>${info}</ul>
  <ul>${k}</ul>
  </div>
  <button class="xbtn" onclick="de()">Close</button>
  `;
}