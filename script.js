const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const addTextButton = document.getElementById("addTextButton");
const increaseFontButton = document.getElementById("increaseSizeButton");
const decreaseFontButton = document.getElementById("decreaseSizeButton");
const fontSizeLabel = document.getElementById("fontSizeLabel");
const fontFamilySelect = document.getElementById("fontFamilySelect");
const undoButton = document.getElementById("undoButton");
const redoButton = document.getElementById("redoButton");
const boldButton = document.getElementById("boldFont");
const italicButton = document.getElementById("italicFont");
const underlineButton = document.getElementById("underlineFont");
const centerButton = document.getElementById("centerFont");

let textArray = [];

let canvasHistoryArray = [];

let redoHistoryArray = [];

let selectedTextIndex = -1;

let fontSize = 18;

let isDragging = false;

let fontFamily = "Arial";

const textInput = document.createElement("input");
textInput.setAttribute("type", "text");
textInput.setAttribute("id", "textInput");
textInput.style.position = "absolute";
textInput.style.display = "none";
textInput.style.border = "1px solid #ddd";
textInput.style.padding = "5px 10px";
textInput.style.borderRadius = "5px";
textInput.style.fontSize = "16px";
textInput.style.zIndex = "10";
document.body.appendChild(textInput);

addTextButton.addEventListener("click", addTextToCanvas);

window.addEventListener("load", loadFromLocalStorage);

canvas.addEventListener("mousedown", (e) => {
  const { offsetX, offsetY } = e;
  selectedTextIndex = textArray.findIndex(
    (text) =>
      offsetX >= text.x &&
      offsetX <= text.x + ctx.measureText(text.text).width &&
      offsetY >= text.y - text.fontSize &&
      offsetY <= text.y
  );
  if (selectedTextIndex >= 0) {
    isDragging = true;
    saveState();
    redrawCanvas();
    updateButtonState();
    updateFontLableState();
    updateFontFamilyState();
    canvas.style.cursor = "move";
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging && selectedTextIndex >= 0) {
    const { offsetX, offsetY } = e;
    let newX = offsetX;
    let newY = offsetY;

    const textWidth = ctx.measureText(textArray[selectedTextIndex].text).width;
    const textHeight = parseInt(ctx.font);
    if (newX < 0) newX = 0;
    if (newX + textWidth > canvas.width) {
      newX = canvas.width - textWidth;
    }
    if (newY < textHeight) newY = textHeight;
    if (newY > canvas.height) newY = canvas.height;
    textArray[selectedTextIndex].x = newX;
    textArray[selectedTextIndex].y = newY;
    redrawCanvas();
  }
});

canvas.addEventListener("mouseup", stopDragging);

canvas.addEventListener("mouseleave", stopDragging);

redoButton.addEventListener("click", () => {
  if (redoHistoryArray.length > 0) {
    const redoState = redoHistoryArray.pop();
    canvasHistoryArray.push(redoState);
    textArray = redoState;
    redrawCanvas();
    updateButtonState();
  }
});

undoButton.addEventListener("click", () => {
  if (canvasHistoryArray.length > 0) {
    redoHistoryArray.push(canvasHistoryArray.pop());
    if (canvasHistoryArray.length > 0) {
      textArray = canvasHistoryArray[canvasHistoryArray.length - 1];
    } else {
      textArray = [];
    }
    redrawCanvas();
    saveToLocalStorage();
    updateButtonState();
  }
});

fontFamilySelect.addEventListener("change", (e) => {
  if (selectedTextIndex >= 0) {
    fontFamily = e.target.value;
    updateFontProperties();
    saveToLocalStorage();
  }
});

increaseFontButton.addEventListener("click", () => {
  if (selectedTextIndex >= 0) {
    fontSize += 1;
    if (fontSize > 100) fontSize = 100;
    updateFontSize();
    saveToLocalStorage();
  }
});

decreaseFontButton.addEventListener("click", () => {
  if (selectedTextIndex >= 0) {
    fontSize -= 1;
    if (fontSize < 10) fontSize = 10;
    updateFontSize();
    saveToLocalStorage();
  }
});

boldButton.addEventListener("click", () => {
  if (selectedTextIndex >= 0) {
    textArray[selectedTextIndex].isBold = !textArray[selectedTextIndex].isBold;
    saveState();
    redrawCanvas();
    saveToLocalStorage();
    updateButtonState();
  }
});

italicButton.addEventListener("click", () => {
  if (selectedTextIndex >= 0) {
    textArray[selectedTextIndex].isItalic =
      !textArray[selectedTextIndex].isItalic;
    saveState();
    redrawCanvas();
    saveToLocalStorage();
    updateButtonState();
  }
});

underlineButton.addEventListener("click", () => {
  if (selectedTextIndex >= 0) {
    textArray[selectedTextIndex].isUnderline =
      !textArray[selectedTextIndex].isUnderline;
    saveState();
    redrawCanvas();
    saveToLocalStorage();
    updateButtonState();
  }
});

centerButton.addEventListener("click", () => {
  if (selectedTextIndex >= 0) {
    textArray[selectedTextIndex].x = canvas.width / 2 - 50;
    textArray[selectedTextIndex].y = canvas.height / 2;
    redrawCanvas();
    saveToLocalStorage();
  }
});

function updateFontProperties() {
  if (selectedTextIndex >= 0) {
    textArray[selectedTextIndex].fontSize = fontSize;
    textArray[selectedTextIndex].fontFamily = fontFamily;
    redrawCanvas();
    saveToLocalStorage();
  }
}

function updateFontSize() {
  if (selectedTextIndex >= 0) {
    textArray[selectedTextIndex].fontSize = fontSize;
    fontSizeLabel.textContent = fontSize;
    redrawCanvas();
    saveToLocalStorage();
  }
}

function saveState() {
  canvasHistoryArray.push(parseStringify(textArray));
  redoHistoryArray = [];
  localStorage.setItem("canvas-state", textArray);
}

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  textArray.forEach((text) => {
    const textWidth = ctx.measureText(text.text).width;
    ctx.font = `${text.isItalic ? "italic" : ""} ${text.fontSize}px ${
      text.isBold ? "bold" : ""
    } ${text.fontFamily}`;
    ctx.fillText(text.text, text.x, text.y);
    if (text.isUnderline) {
      ctx.fillRect(text.x, text.y + 2, textWidth, 1);
    } else {
      ctx.fillRect(text.x, text.y, textWidth, 0);
    }
  });
}

function parseStringify(texts) {
  return JSON.parse(JSON.stringify(texts));
}

function addTextToCanvas() {
  const centerX = canvas.offsetLeft + canvas.width / 2 - 100;
  const centerY = canvas.offsetTop + canvas.height / 2 - 20;
  textInput.style.left = `${centerX}px`;
  textInput.style.top = `${centerY}px`;
  textInput.style.display = "block";
  textInput.focus();

  textInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      const text = textInput.value;
      textArray.push({
        text: text,
        x: canvas.width / 2,
        y: canvas.height / 2,
        fontSize: fontSize,
        fontFamily: fontFamily,
        isItalic: false,
        isBold: false,
        isUnderline: false,
      });
      saveState();
      saveToLocalStorage();
      redrawCanvas();
      textInput.style.display = "none";
      textInput.value = "";
    }
  });
}

function updateButtonState() {
  const selectedText = textArray[selectedTextIndex];
  selectedText.isBold
    ? (boldButton.style.fontWeight = "bold")
    : (boldButton.style.fontWeight = "normal");
  selectedText.isItalic
    ? (italicButton.style.color = "black")
    : (italicButton.style.color = "gray");
  selectedText.isUnderline
    ? (underlineButton.style.textDecoration = "underline")
    : (underlineButton.style.textDecoration = "none");
}

function stopDragging() {
  isDragging = false;
  canvas.style.cursor = "default";
}

function updateFontLableState() {
  fontSizeLabel.textContent = textArray[selectedTextIndex].fontSize;
  fontSize = textArray[selectedTextIndex].fontSize;
}

function updateFontFamilyState() {
  fontFamilySelect.value = textArray[selectedTextIndex].fontFamily;
  fontFamily = textArray[selectedTextIndex].fontFamily;
}

function saveToLocalStorage() {
  const state = {
    textArray: textArray,
  };
  localStorage.setItem("canvasState", JSON.stringify(state));
  console.log("Canvas state saved.");
}

function loadFromLocalStorage() {
  const savedState = localStorage.getItem("canvasState");
  if (savedState) {
    const state = JSON.parse(savedState);
    textArray = state.textArray || [];
    if (textArray.length !== 0) {
      selectedTextIndex = 0;
      updateFontLableState();
      updateFontFamilyState();
      updateButtonState();
      redrawCanvas();
    }
    console.log("Canvas state loaded.");
  }
}
