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
    const output = document.getElementById("output");
    output.innerHTML = "";

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
        output.innerHTML = "<p>Please select a throw blanket size.</p>";
        return;
      }
      [totalWidth, totalLength] = throwSizes[throwSize];
    } else {
      const bedSizeInput = document.querySelector('input[name="bed-size"]:checked');
      if (!bedSizeInput) {
        output.innerHTML = "<p>Please select a bed size.</p>";
        return;
      }
      [bedWidth, bedLength] = bedSizeInput.value.split("x").map(Number);
      const bedSizeMap = {
        "28x52": "crib", "38x75": "twin", "38x80": "twin XL",
        "54x75": "full", "60x80": "queen", "76x80": "king", "72x84": "california king",
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

    const blocksAcross = Math.round(totalWidth / (blockSize + (sashing || 0)));
    const blocksDown = Math.round(totalLength / (blockSize + (sashing || 0)));

    // Quilt Visual Calculation
    const hasSashing = sashing > 0;
    const hasBorder = border > 0;
    const sashRatio = hasSashing ? sashing / blockSize : 0;
    const borderRatio = hasBorder ? border / blockSize : 0;

    const cols = blocksAcross + (hasSashing ? blocksAcross - 1 : 0);
    const rows = blocksDown + (hasSashing ? blocksDown - 1 : 0);
    const totalCols = cols + (hasBorder ? 2 : 0);
    const totalRows = rows + (hasBorder ? 2 : 0);

    let gridCols = '', gridRows = '';
    for (let c = 0; c < totalCols; c++) {
      if (hasBorder && (c === 0 || c === totalCols - 1)) gridCols += `${borderRatio}fr `;
      else if (hasSashing && ((c - (hasBorder ? 1 : 0)) % 2 === 1)) gridCols += `${sashRatio}fr `;
      else gridCols += `1fr `;
    }
    for (let r = 0; r < totalRows; r++) {
      if (hasBorder && (r === 0 || r === totalRows - 1)) gridRows += `${borderRatio}fr `;
      else if (hasSashing && ((r - (hasBorder ? 1 : 0)) % 2 === 1)) gridRows += `${sashRatio}fr `;
      else gridRows += `1fr `;
    }

    let quiltVisual = `<div class="quilt-visual-wrapper"><div class="quilt-visual-scale"><div class="quilt-visual" style="grid-template-columns: ${gridCols}; grid-template-rows: ${gridRows};">`;

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const isBorder = hasBorder && (r === 0 || r === totalRows - 1 || c === 0 || c === totalCols - 1);
        const isSashRow = hasSashing && ((r - (hasBorder ? 1 : 0)) % 2 === 1);
        const isSashCol = hasSashing && ((c - (hasBorder ? 1 : 0)) % 2 === 1);
        const isBlock = !isBorder && !(isSashRow || isSashCol);
        if (isBlock) quiltVisual += `<div class="quilt-block"></div>`;
        else if (isBorder) quiltVisual += `<div class="border-strip"></div>`;
        else quiltVisual += `<div class="sashing"></div>`;
      }
    }

    quiltVisual += `</div></div></div>`;
    output.innerHTML = quiltVisual;
    output.style.display = "block";
  } catch (e) {
    console.error(e);
    document.getElementById("output").innerHTML = `<p>Error: ${e.message}</p>`;
  }
}