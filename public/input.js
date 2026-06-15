
document.getElementById("dataForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Helper to turn comma-separated string into an array
  const toArray = (id) => {
    const val = document.getElementById(id).value.trim();
    if (!val) return [""];
    return val.split(",").map((item) => item.trim());
  };

  const formData = {
    man: document.querySelector('input[name="gender"]:checked')?.value === "true",
    id: document.getElementById("id").value.trim(),
    name1: document.getElementById("name1").value.trim(),
    nameE1: document.getElementById("nameE1").value.trim(),
    nameM1: document.getElementById("nameM1").value.trim(),
    name2: document.getElementById("name2").value.trim(),
    nameE2: document.getElementById("nameE2").value.trim(),
    nameM2: document.getElementById("nameM2").value.trim(),
    ver: toArray("ver"),
    title: toArray("title"),
    adres: toArray("address"),
    info: toArray("info"),
    
  };

  // Display generated JSON
  const id = document.getElementById("id").value;
  const name = '"' + id + '"';
  const jsonOutput = JSON.stringify(formData, null, 2);
  const outputDiv = document.getElementById("jsonOutput") || createOutputDiv();
  outputDiv.textContent = name + ":" + jsonOutput;
  
  // Copy to clipboard
  navigator.clipboard.writeText(jsonOutput).then(() => {
    alert("JSON copied to clipboard! Add this to ppls.json on GitHub.");
  }).catch(() => {
    alert("JSON generated below - copy it manually:");
  });
});

function createOutputDiv() {
  const div = document.createElement("div");
  div.id = "jsonOutput";
  div.style.cssText = "background:#f5f5f5;padding:15px;margin:10px 0;border-radius:5px;white-space:pre-wrap;font-family:monospace;max-height:300px;overflow:auto;";
  document.getElementById("dataForm").appendChild(div);
  return div;
}
