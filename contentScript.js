// Detect contenteditable areas or input fields
document.addEventListener("focus", (event) => {
  if (event.target.isContentEditable || event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT") {
      console.log("Focused on an editable area.");
  }
}, true);
