///*** PLC ***//

 document.getElementById("dataFormPlc").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Helper to turn comma-separated string into an array
  const toArray = (id) => {
    const val = document.getElementById(id).value.trim();
    if (!val) return [""];
    return val.split(",").map((item) => item.trim());
  };

  const formDataPlc = {
    
    id: document.getElementById("id").value.trim(),
    name1: document.getElementById("name1").value.trim(),
    nameE1: document.getElementById("nameE1").value.trim(),
    nameM1: document.getElementById("nameM1").value.trim(),
    name2: document.getElementById("name2").value.trim(),
    nameE2: document.getElementById("nameE2").value.trim(),
    nameM2: document.getElementById("nameM2").value.trim(),
    ver: toArray("ver"),
    gMap: document.getElementById("gMap").value.trim(),
    info: toArray("info"),
    
  };

  // Display generated JSON
  const id = document.getElementById("id").value;
  const name = '"' + id + '"';
  const jsonOutPlc = JSON.stringify(formDataPlc, null, 2);
  const outPlcDiv = document.getElementById("jsonOutPlc") || createOutPlcDiv();
  outPlcDiv.textContent = name + ":" + jsonOutPlc;
  
  // Copy to clipboard
  navigator.clipboard.writeText(jsonOutPlc).then(() => {
    alert("JSON copied to clipboard! Add this to ppls.json on GitHub.");
  }).catch(() => {
    alert("JSON generated below - copy it manually:");
  });
});

function createOutPlcDiv() {
  const div = document.createElement("div");
  div.id = "jsonOutPlc";
  div.style.cssText = "background:#f5f5f5;padding:15px;margin:10px 0;border-radius:5px;white-space:pre-wrap;font-family:monospace;max-height:300px;overflow:auto;";
  document.getElementById("dataFormPlc").appendChild(div);
  return div;
}