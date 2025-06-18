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

    const showSashing = sashing > 0;
    const showBorder = border > 0;

    const cols = blocksAcross + (showSashing ? blocksAcross - 1 : 0);
    const rows = blocksDown + (showSashing ? blocksDown - 1 : 0);
    const totalCols = cols + (showBorder ? 2 : 0);
    const totalRows = rows + (showBorder ? 2 : 0);

    let gridCols = "", gridRows = "";
    for (let c = 0; c < totalCols; c++) {
      if (showBorder && (c === 0 || c === totalCols - 1)) gridCols += "border ";
      else if (showSashing && ((c - (showBorder ? 1 : 0)) % 2 === 1)) gridCols += "sash ";
      else gridCols += "block ";
    }
    for (let r = 0; r < totalRows; r++) {
      if (showBorder && (r === 0 || r === totalRows - 1)) gridRows += "border ";
      else if (showSashing && ((r - (showBorder ? 1 : 0)) % 2 === 1)) gridRows += "sash ";
      else gridRows += "block ";
    }

    let html = `<div class="quilt-visual-wrapper"><div class="quilt-visual" style="grid-template-columns: ${gridCols}; grid-template-rows: ${gridRows};">`;

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const isBorder = showBorder && (r === 0 || r === totalRows - 1 || c === 0 || c === totalCols - 1);
        const isSashRow = showSashing && ((r - (showBorder ? 1 : 0)) % 2 === 1);
        const isSashCol = showSashing && ((c - (showBorder ? 1 : 0)) % 2 === 1);
        const isBlock = !isBorder && !(isSashRow || isSashCol);

        if (isBlock) html += `<div class="quilt-block"></div>`;
        else if (isBorder) html += `<div class="border-strip"></div>`;
        else html += `<div class="sashing"></div>`;
      }
    }

    html += `</div></div>`;
    document.getElementById("output").innerHTML = html;
  } catch (e) {
    console.error(e);
    document.getElementById("output").innerHTML = `<p>Error: ${e.message}</p>`;
  }
}
