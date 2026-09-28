// Woman   &#128105; Man  &#128104; locatie 📍 book  &#128213;
//  896 8361 7469     803837

window.ppls = null;
(async function load() {
  try {
    const res = await fetch("../data/ppls.json");
    if (!res.ok) throw new Error(res.status);
    window.ppls = await res.json();
    console.log("ppls loaded", window.ppls);
  } catch (err) {
    console.error("Failed to load ppls.json", err);
    window.ppls = {};
  }
})();
window.ver = null;
(async function load() {
  try {
    const res = await fetch("../data/ver.json");
    if (!res.ok) throw new Error(res.status);
    window.ver = await res.json();
    //console.log("vers loaded", window.ver);
  } catch (err) {
    console.error("Failed to load vers.json", err);
    window.ver = {};
  }
})();
window.plc = null;
(async function load() {
  try {
    const res = await fetch("../data/plc.json");
    if (!res.ok) throw new Error(res.status);
    window.plc = await res.json();
    //console.log("vers loaded", window.word);
  } catch (err) {
    console.error("Failed to load plc.json", err);
    window.plc = {};
  }
})();
window.word = null;
(async function load() {
  try {
    const res = await fetch("../data/word.json");
    if (!res.ok) throw new Error(res.status);
    window.word = await res.json();
    //console.log("vers loaded", window.word);
  } catch (err) {
    console.error("Failed to load word.json", err);
    window.word = {};
  }
})();

function dP(p) {
  const ppls = window.ppls;
  const person = typeof p === "string"
    ? Array.isArray(ppls) ? ppls.find((item) => item.id === p) : ppls?.[p]
    : p;

  if (!person || typeof person !== "object") {
    console.error(`Person with key "${p}" not found in window.ppls`);
    return;
  }
  const display = document.createElement("div");
  display.classList.add("person");
  display.id = "pdisplay";
  document.body.appendChild(display);
  const k = person.vers ? vInP(person.vers) : "";
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


function dPlc(p) {
  const plc = window.plc;
  const place = typeof p === "string"
    ? Array.isArray(plc) ? plc.find((item) => item.id === p) : plc?.[p]
    : place;

  if (!place || typeof place !== "object") {
    console.error(`place with key "${p}" not found in window.plc`);
    return;
  }
  //const p = c;  
  const q = place.vers;

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
  const k = vInP(q);
  
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

function de() {
  const display = document.getElementById("pdisplay").remove();
}

function dW(w, event) {
  const q = window.word;
  const m = q[w];
  const display = document.createElement("div");
  display.classList.add("word");
  display.id = "pdisplay";
  document.body.appendChild(display);
  display.innerHTML = `  
    <h2>${m.d}</h2>    
  `;
  // Position at click
  display.style.position = "absolute";
  display.style.left = event.clientX + window.scrollX + "px";
  display.style.top = Math.max(event.clientY + window.scrollY, 10) + "px";
  setTimeout(de, 2000);
}
function getVerseByPath(path) {
  if (!window.ver) {
    console.warn("ver.json not loaded yet");
    return null;
  }
  const keys = path.split("."); // e.g., ['o', 'exo', 'c20', 'v20']
  let obj = window.ver;
  for (const key of keys) {
    if (!obj || typeof obj !== "object") return null;
    obj = obj[key];
  }
  return obj;
}


function dVc(b) {
  if (!Array.isArray(b)) {
    console.warn("dVc: b should be an array of paths, got:", b);
    return;
  }
   // Map each path in b to its verse object, filter out any nulls
  const tiq = b.map((path) => buildBookPath(path)).filter((verse) => verse);

  if (verses.length === 0) {
    console.warn("No verses found for paths:", b);
    return;
  }

  // Pass the array of verse objects to vers() for display
  num(verses);
console.log("dVc called with paths:", b);
  dV(b);
}
function num(t) {
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

function dV(b) {
  if (!Array.isArray(b)) {
    console.warn("dV: b should be an array of paths, got:", b);
    return;
  }

  // Map each path in b to its verse object, filter out any nulls
  const verses = b.map((path) => getVerseByPath(path)).filter((verse) => verse);

  if (verses.length === 0) {
    console.warn("No verses found for paths:", b);
    return;
  }

  // Pass the array of verse objects to vers() for display
  vers(verses);
  //console.log("Paths:", b);
  //console.log("Verses:", verses);
}
function vInP(b) {
  if (!Array.isArray(b)) {
    console.warn("dV: b should be an array of paths, got:", b);
    return "";
  }

  const verses = b.map((path) => getVerseByPath(path)).filter((verse) => verse);

  if (verses.length === 0) {
    console.warn("No verses found for paths:", b);
    return "";
  }

  return versP(verses);
}

function versP(t) {
  if (!Array.isArray(t)) return "";

  return t
    .map(
      (item) =>
        `<div><h4>${item.n ?? ""}</h4>
      <h4 class="vdetails">${item.d ?? ""}</h4>
     </div>`,
    )
    .join("");
}
function vers(t) {
  const display = document.createElement("div");
  display.classList.add("person");
  display.id = "pdisplay";
  document.body.appendChild(display);
  // class="vdetails"
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

function dH(m, q) {
  if (!Array.isArray(q)) {
    console.warn("dH: q should be an array of paths, got:", q);
    return;
  }

  const render = () => {
    const target = m ? document.getElementById(m) : null;
    if (!target) {
      console.warn("dH: target element not found:", m);
      return;
    }

    const tx = q
      .map((path) => getVerseByPath(path))
      .filter((verse) => verse);

    if (tx.length === 0) {
      console.warn("No verses found for paths:", q);
      return;
    }

    txHtml(target, tx);
  };

  if (!window.ver) {
    setTimeout(() => dH(m, q), 150);
    return;
  }

  render();
}

function txHtml(target, tx) {
  if (!target || !(target instanceof HTMLElement)) {
    console.warn("txHtml: target element is invalid", target);
    return;
  }

  const s1 = tx
    ? tx
        .map(
          (item) =>
            `<div class="verse-row"><span class="number">${item.nn ?? ""}</span> ${item.d ?? ""}</div>`,
        )
        .join("")
    : "";

  target.innerHTML = `
    <div class="vdetails">${s1}</div>
  `;
}

function dZ(h, s) {
  if (!Array.isArray(h) || !Array.isArray(s)) {
    console.warn("dZ: h and s should be arrays, got:", h, s);
    return;
  } 

  // Map each path in b to its verse object, filter out any nulls
  const head = h.map((path) => getVerseByPath(path)).filter((hd) => hd);
  const story = s.map((path) => getVerseByPath(path)).filter((st) => st);

  if (head.length === 0) {
    console.warn("No verses found for paths:", h);
    return;
  }
    if (story.length === 0) {
    console.warn("No verses found for paths:", s);
    return;
  }

  // Pass the array of verse objects to vers() for display
  zanta(head, story);
  //console.log("Paths:", b);
  //console.log("Verses:", verses);
}
function zanta(h, s){
  const display = document.createElement("div");
  display.classList.add("person");
  display.id = "pdisplay";
  document.body.appendChild(display);
  const z = h ? h.map((item) => `${item}`).join("") : "";
  const s1 = s ? s.map((item) => `<div><span class="number">${item.nn}</span> ${item.d}</div>`).join("") : "";
  display.innerHTML = `
    <div onclick="de()" class="x">X</div> 
    <h3> ${z} </h3>
    <h4 class="vdetails"> ${s1} </h4>
    <button class="xbtn" onclick="de()">Close</button>
    `;
}

function dayNight() {
  let mode = "";
  mode = "&#9728;" ? (mode = "&#9728;") : (mode = "&#9728;");
  let modebtn = document.getElementById("dark-mode");
  const body = document.body;
  body.classList.toggle("dark-mode");
  modebtn.innerHTML = mode;
  //console.log(mode);
}

// Chapter menu toggle
 function toggleChapterMenu() {
        const menu = document.getElementById('chapterMenu');
        menu.classList.toggle('show');
      }

//selectChapter-wrapper
      document.addEventListener('click', function(event) {
  const wrapper = document.querySelector('.selectChapter-wrapper');
  // Check if wrapper exists before calling .contains()
  if (wrapper && !wrapper.contains(event.target)) {
    const menu = document.getElementById('chapterMenu');
    if (menu) menu.classList.remove('show');
  }
});