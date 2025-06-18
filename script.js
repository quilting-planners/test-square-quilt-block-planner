document.addEventListener("DOMContentLoaded", function () {
  const useRadios = document.querySelectorAll('input[name="use"]');
  const bedSizeGroup = document.getElementById("bed-size-group");
  const overhangGroup = document.getElementById("overhang-group");
  const throwSizeGroup = document.getElementById("throw-size-group");

  useRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      const useValue = document.querySelector('input[name="use"]:checked').value;

      if (useValue === "Throw for couch") {
        bedSizeGroup.style.display = "none";
        overhangGroup.style.display = "none";
        throwSizeGroup.style.display = "block";
      } else {
        bedSizeGroup.style.display = "block";
        overhangGroup.style.display = "block";
        throwSizeGroup.style.display = "none";
      }

      document.getElementById("output").innerHTML = "";
    });
  });

  document.getElementById("generate-button").addEventListener("click", generatePlan);

document.querySelectorAll(".step-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const change = parseFloat(btn.dataset.change);
    const min = parseFloat(input.min || 0);
    let current = parseFloat(input.value) || 0;
    let newValue = Math.max(current + change, min);

    // Round to nearest 0.5
    newValue = Math.round(newValue * 2) / 2;
    input.value = newValue.toFixed(1);

    updateStepButtons(input);
  });
});

function updateStepButtons(input) {
  const min = parseFloat(input.min || 0);
  const current = parseFloat(input.value) || 0;
  const minusButton = document.querySelector(`.step-button[data-target="${input.id}"][data-change="-0.5"]`);
  if (minusButton) {
    minusButton.disabled = current <= min;
  }
}

// Run on page load
document.querySelectorAll('input[type="number"]').forEach((input) => updateStepButtons(input));



});

function generatePlan() {
  try {
    const use = document.querySelector('input[name="use"]:checked')?.value || "";
    let totalWidth = 0, totalLength = 0, bedWidth = 0, bedLength = 0, overhang = 0;
    let throwSize = "", bedName = "";

    if (use === "Throw for couch") {
      const tsInput = document.querySelector('input[name="throw-size"]:checked');
      throwSize = tsInput?.value;
      const throwSizes = {
        small: [50, 40],
        standard: [60, 50],
        large: [70, 60],
        oversized: [80, 70],
      };
      if (!throwSizes[throwSize]) {
        document.getElementById("output").innerHTML = "<p>Please select a throw blanket size.</p>";
        return;
      }
      [totalWidth, totalLength] = throwSizes[throwSize];
    } else {
      const bedSizeInput = document.querySelector('input[name="bed-size"]:checked');
      if (!bedSizeInput) {
        document.getElementById("output").innerHTML = "<p>Please select a bed size.</p>";
        return;
      }
      [bedWidth, bedLength] = bedSizeInput.value.split("x").map(Number);
      const bedSizeMap = {
        "28x52": "crib",
        "38x75": "twin",
        "38x80": "twin XL",
        "54x75": "full",
        "60x80": "queen",
        "76x80": "king",
        "72x84": "california king",
      };
      const bedKey = `${bedWidth}x${bedLength}`;
      bedName = bedSizeMap[bedKey] || `${bedWidth} x ${bedLength}`;
      overhang = parseFloat(document.getElementById("overhang").value) || 0;
      totalWidth = bedWidth + overhang * 2;
      totalLength = bedLength + overhang * 2;
    }

    const blockSize = parseFloat(document.getElementById("block-size").value) || 0;
    const sashing = parseFloat(document.getElementById("sashing").value) || 0;
    const border = parseFloat(document.getElementById("border").value) || 0;

    const finishedBlock = blockSize + sashing;
    const blocksAcross = Math.round(totalWidth / finishedBlock);
    const blocksDown = Math.round(totalLength / finishedBlock);
    const topWidth = blocksAcross * finishedBlock - sashing;
    const topLength = blocksDown * finishedBlock - sashing;
    const quiltWidth = topWidth + border * 2;
    const quiltLength = topLength + border * 2;

    const WOF = 42;
    
    const cutBlockSize = (blockSize + 0.5).toFixed(1);
    const totalBlocks = blocksAcross * blocksDown;
    const blocksPerStrip = Math.floor(WOF / cutBlockSize);
    const blockStripsNeeded = Math.ceil(totalBlocks / blocksPerStrip);
    const blocksYards = ((blockStripsNeeded * cutBlockSize) / 36).toFixed(2);

    const cutSashing = sashing > 0 ? (sashing + 0.5).toFixed(1) : null;
    const cutBorder = border > 0 ? (border + 0.5).toFixed(1) : null;

   

  // Sashing
let sashingStrips = null, sashingYards = null;
if (sashing > 0) {
  const sashingLenIn = (blocksAcross - 1) * quiltLength + (blocksDown - 1) * quiltWidth;
  sashingStrips = Math.ceil(sashingLenIn / WOF);
  sashingYards = ((sashingStrips * sashing) / 36).toFixed(2);
}

// Border
let borderStrips = null, borderYards = null;
if (border > 0) {
  const borderLenIn = 2 * (topWidth + topLength);
  borderStrips = Math.ceil(borderLenIn / WOF);
  borderYards = ((borderStrips * border) / 36).toFixed(2);
}

// Binding
const bindingWidth = 2.5;
const bindingLenIn = 2 * (quiltWidth + quiltLength) + 10;
const bindingStrips = Math.ceil(bindingLenIn / WOF);
const bindingYards = ((bindingStrips * bindingWidth) / 36).toFixed(2);

    const summary = `You’re making a ${
      use === "Throw for couch"
        ? `${throwSize} throw blanket`
        : `cover for a ${bedName} bed (${bedWidth}" x ${bedLength}")`
    } with ${blockSize}" blocks${
      sashing > 0 ? `, ${sashing}" sashing` : ""
    }${border > 0 ? `, a ${border}" border` : ""}${
      use !== "Throw for couch" && overhang > 0 ? ` and a ${overhang}" overhang` : ""
    }.`

    const planTitle = use === "Throw for couch"
      ? `${throwSize.charAt(0).toUpperCase() + throwSize.slice(1)} throw blanket`
      : `${bedName.charAt(0).toUpperCase() + bedName.slice(1)} bed cover`;

    let html = `<h2>${planTitle}</h2><span class="hint">${summary}</span>`;

// Quilt visual (scales to fit max 400px height)
const showSashing = sashing > 0;
const showBorder = border > 0;

const sashRatio = showSashing ? sashing / blockSize : 0;
const borderRatio = showBorder ? border / blockSize : 0;

const cols = blocksAcross + (showSashing ? blocksAcross - 1 : 0);
const rows = blocksDown + (showSashing ? blocksDown - 1 : 0);
const totalCols = cols + (showBorder ? 2 : 0);
const totalRows = rows + (showBorder ? 2 : 0);

// Size of one base block
const blockPx = 30;
const sashPx = blockPx * sashRatio;
const borderPx = blockPx * borderRatio;

// Calculate full quilt visual dimensions in px
const quiltVisualWidth =
  totalCols * blockPx +
  (showSashing ? (blocksAcross - 1 + (showBorder ? 2 : 0)) * sashPx : 0) +
  (showBorder ? 2 * borderPx : 0);
const totalHeight =
  totalRows * blockPx +
  (showSashing ? (blocksDown - 1 + (showBorder ? 2 : 0)) * sashPx : 0) +
  (showBorder ? 2 * borderPx : 0);

// Calculate scale factor to fit max height
const maxVisualHeight = 400;
const scale = Math.min(1, maxVisualHeight / totalHeight);

// Build grid templates
let gridTemplateCols = '';
let gridTemplateRows = '';

for (let c = 0; c < totalCols; c++) {
  if (showBorder && (c === 0 || c === totalCols - 1)) {
    gridTemplateCols += `${borderRatio}fr `;
  } else if (showSashing && ((c - (showBorder ? 1 : 0)) % 2 === 1)) {
    gridTemplateCols += `${sashRatio}fr `;
  } else {
    gridTemplateCols += `1fr `;
  }
}

for (let r = 0; r < totalRows; r++) {
  if (showBorder && (r === 0 || r === totalRows - 1)) {
    gridTemplateRows += `${borderRatio}fr `;
  } else if (showSashing && ((r - (showBorder ? 1 : 0)) % 2 === 1)) {
    gridTemplateRows += `${sashRatio}fr `;
  } else {
    gridTemplateRows += `1fr `;
  }
}

// Generate HTML
const aspectRatio = totalCols / totalRows;

let quiltVisual = `
  <div class="quilt-visual-wrapper">
    <div class="quilt-visual-container" style="--aspect-ratio: ${aspectRatio};">
      <div class="quilt-visual" style="
        grid-template-columns: ${gridTemplateCols};
        grid-template-rows: ${gridTemplateRows};
        width: ${quiltVisualWidth}px;
      ">`;

for (let r = 0; r < totalRows; r++) {
  for (let c = 0; c < totalCols; c++) {
    const isBorder = showBorder && (r === 0 || r === totalRows - 1 || c === 0 || c === totalCols - 1);
    const isSashingRow = showSashing && ((r - (showBorder ? 1 : 0)) % 2 === 1);
    const isSashingCol = showSashing && ((c - (showBorder ? 1 : 0)) % 2 === 1);
    const isBlock = !isBorder && !(isSashingRow || isSashingCol);

    if (isBlock) {
      quiltVisual += `<div class="quilt-cell"></div>`;
    } else {
      quiltVisual += `<div class="${isBorder ? 'border-strip' : 'sashing'}"></div>`;
    }
  }
}

quiltVisual += `</div></div></div>`;
html += quiltVisual;



    
    html += `<p><strong>Finished quilt</strong><br>${quiltWidth.toFixed(1)}" x ${quiltLength.toFixed(1)}<br>${blocksAcross} blocks across by ${blocksDown} down</p>`;
   
    html += `<p><strong>Blocks</strong><br>${blocksAcross * blocksDown} blocks cut to ${cutBlockSize}" x ${cutBlockSize} (${blocksYards} yd)</p>`;

if (cutSashing) {
  html += `<p><strong>Sashing</strong><br>${sashingStrips} strips of ${cutSashing}" x 42" fabric (${sashingYards} yd)</p>`;
}

if (cutBorder) {
  html += `<p><strong>Border</strong><br>${borderStrips} strips of ${cutBorder}" x 42" fabric (${borderYards} yd)</p>`;
}

html += `<p><strong>Binding</strong><br>${bindingStrips} strips of 2.5" x 42" fabric (${bindingYards} yd)</p>`;

  // Backing Fabric — 4" extra width and height
const backingWidth = quiltWidth + 4;
const backingLength = quiltLength + 4;

function getBackingPlan(fabricWidth) {
  let panels, totalLength;
  if (fabricWidth >= backingWidth) {
    panels = 1;
    totalLength = backingLength;
  } else {
    panels = Math.ceil(backingWidth / fabricWidth);
    totalLength = panels * backingLength;
  }
  return {
    width: fabricWidth,
    panels,
    yards: (totalLength / 36).toFixed(2),
  };
}

const standardBacking = getBackingPlan(42);
const wideBacking = getBackingPlan(108);

html += `<p><strong>Backing</strong><br>
  ${standardBacking.panels} panels of ${backingLength.toFixed(1)}" x 42" fabric (${standardBacking.yards} yd) or
  ${wideBacking.panels} panels of ${backingLength.toFixed(1)}" x 108" fabric (${wideBacking.yards} yd)</p>`;
  
  
 // Batting Recommendations (Quilter’s Dream, pre-filtered links with size filter)
const battingSizes = [
  { name: "Crib", width: 46, length: 60, sizeTag: "Crib" },
  { name: "Throw", width: 60, length: 60, sizeTag: "Throw" },
  { name: "Twin", width: 72, length: 93, sizeTag: "Twin" },
  { name: "Double", width: 96, length: 93, sizeTag: "Full" }, // Fix: Use "Full" for MSQC link
  { name: "Queen", width: 108, length: 93, sizeTag: "Queen" },
  { name: "King", width: 122, length: 120, sizeTag: "King" },
];

// Find batting sizes that cover the quilt (allowing rotation)
const available = battingSizes
  .filter(b =>
    (b.width >= quiltWidth && b.length >= quiltLength) ||
    (b.width >= quiltLength && b.length >= quiltWidth)
  )
  .sort((a, b) => (a.width * a.length) - (b.width * b.length));

const batting = available.length > 0 ? available[0] : null;

if (batting) {
  // Link to Quilter’s Dream brand collection with size filter
  const url = `https://www.missouriquiltco.com/collections/brand-quilters-dream?refinementList%5Bnamed_tags.Size%5D%5B0%5D=${encodeURIComponent(batting.sizeTag)}`;

  html += `<p><strong>Batting</strong><br>
    <a href="${url}" target="_blank">${batting.name} size Quilter's Dream batting</a></p>`;
} else {
  html += `<p><strong>Batting</strong><br>Your quilt is larger than standard batting sizes. You may need to piece batting or order a batting roll.</p>`;
}


// Estimated Cost
let fabricYards = 0;
fabricYards += parseFloat(blocksYards || 0);
fabricYards += parseFloat(sashingYards || 0);
fabricYards += parseFloat(borderYards || 0);
fabricYards += parseFloat(bindingYards || 0);
fabricYards += parseFloat(standardBacking.yards || 0);

const avgFabricCostPerYard = 11;
const estimatedFabricCost = Math.round(fabricYards * avgFabricCostPerYard);


// Estimate batting cost (approx range per size)
const battingPriceEstimate = {
  Crib: "$15",
  Throw: "$30",
  Twin: "$30",
  Double: "$35",
  Queen: "$40",
  King: "$50",
};


const battingCost = batting ? (battingPriceEstimate[batting.name] || "$25–$40") : "$30+";


html += `<p><strong>Estimated cost</strong><br>
Fabric: $${estimatedFabricCost} (${fabricYards.toFixed(2)} yd)<br>
Batting: ${battingCost}</p>`;


html += `
  <div id="copy-message" class="copy-message" style="display: none;">
    <i class="fa-solid fa-check" style="margin-right: 0.3em;"></i>Copied to clipboard
  </div>
  <div class="button-group">
    <button id="copy-plan-button" type="button" class="copy-button">
      <i class="fa-solid fa-copy" style="margin-right: 0.5em;"></i>Copy plan
    </button>
    <button id="feedback-button" type="button" class="outline-button">
      Give feedback <i class="fa-solid fa-up-right-from-square" style="margin-left: 0.5em;"></i>
    </button>
  </div>`;




    const out = document.getElementById("output");
    out.innerHTML = html;
    out.style.display = "block";
    out.scrollIntoView({ behavior: "smooth" });

  document.getElementById("copy-plan-button").addEventListener("click", () => {
  const clone = out.cloneNode(true);
  clone.querySelector("#copy-plan-button")?.remove();
  clone.querySelector("#feedback-button")?.remove();

  const lines = [];

  // Add plan title
  const title = clone.querySelector("h2");
  if (title) lines.push(title.textContent.trim());

  // Add summary (the hint)
  const hint = clone.querySelector(".hint");
  if (hint) {
    lines.push(hint.textContent.trim());
    lines.push(""); // blank line
  }

  // Process paragraphs
  clone.querySelectorAll("p").forEach((p) => {
    const strong = p.querySelector("strong");
    const strongText = strong ? strong.textContent.trim() : "";

    const rawParts = p.innerHTML.split(/<br\s*\/?>/i).map(part => {
      const temp = document.createElement("div");
      temp.innerHTML = part;
      return temp.textContent.trim();
    }).filter(Boolean);

    if (strongText && rawParts.length > 0) {
      lines.push(strongText);              // section heading
      lines.push(...rawParts.slice(1));    // section content
      lines.push("");                      // blank line
    } else {
      lines.push(...rawParts);
      lines.push("");
    }
  });

  const plainText = lines.join("\n");

  navigator.clipboard.writeText(plainText).then(() => {
    const msg = document.getElementById("copy-message");
    msg.style.display = "block";
    setTimeout(() => {
      msg.style.display = "none";
    }, 6000);
  });
});




    document.getElementById("feedback-button").addEventListener("click", () => {
      window.open("https://docs.google.com/forms/d/e/1FAIpQLScRJtzvGLaC22oTmgbU4Us7MTRIaOFjNdx3cU4_3HRNKp1hUg/viewform?usp=preview", "_blank");
    });

  } catch (e) {
    console.error(e);
    document.getElementById("output").innerHTML = `<p>Error: ${e.message}</p>`;
  }
}
