// contentScript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);

  if (message.action === "startTyping") {
      // Validate message data
      if (!message.data) {
          console.error("No data provided in message.");
          sendResponse({ success: false, error: "No data provided" });
          return;
      }
      
      console.log("Typing data received:", message.data);

      // Check for required fields
      const requiredFields = ["text", "typingTime", "typingAccuracy", "typingSpeedVariability", "pauseDuration", "pausesNumber", "pauseVariability"];
      const missingFields = requiredFields.filter(field => !(field in message.data));
      if (missingFields.length > 0) {
          console.error(`Missing fields in message.data: ${missingFields.join(", ")}`);
          sendResponse({ success: false, error: `Missing fields: ${missingFields.join(", ")}` });
          return;
      }
      
      const { text, typingTime, typingAccuracy, typingSpeedVariability, pauseDuration, pausesNumber, pauseVariability } = message.data;

      // Find the Google Docs editor element
      const editor = getEditorElement();
      if (!editor) {
          console.error("No editable element found on the page.");
          sendResponse({ success: false, error: "No editable element found" });
          return; // Early return on failure
      }

      editor.focus();

      // Start typing simulation
      autoTypeGoogleDocs(editor, text, typingTime, typingAccuracy, typingSpeedVariability, pauseDuration, pausesNumber, pauseVariability);

      sendResponse({ success: true }); // Ensure response is sent
  }

  return true; // Keeps the message channel open for asynchronous responses
});

// Function to find the Google Docs editor element
function getEditorElement() {
  // Attempt to find the iframe dynamically
  const iframes = document.querySelectorAll('iframe');
  for (let iframe of iframes) {
      try {
          const editorDoc = iframe.contentDocument || iframe.contentWindow.document;
          const editableDiv = editorDoc.querySelector('[contenteditable="true"]');
          if (editableDiv) {
              console.log("Editor found in iframe:", iframe);
              return editableDiv;
          }
      } catch (error) {
          // Ignore cross-origin iframes
          continue;
      }
  }
  // Fallback to the main document
  const mainEditableDiv = document.querySelector('[contenteditable="true"]');
  if (mainEditableDiv) {
      console.log("Editor found in main document:", mainEditableDiv);
      return mainEditableDiv;
  }
  console.warn("Google Docs editable element not found.");
  return null;
}

// Function to simulate typing text
function autoTypeGoogleDocs(editor, text, typingTime, typingAccuracy, typingSpeedVariability, pauseDuration, pausesNumber, pauseVariability) {
  if (!editor || typeof text !== 'string') {
      console.error("Invalid editor element or text.");
      return;
  }

  let index = 0;
  const totalLength = text.length;

  // Calculate base typing interval and pause duration
  const totalTypingTimeInMs = parseTime(typingTime);
  const baseTypingInterval = totalTypingTimeInMs / totalLength;
  const basePauseDurationInMs = parseTime(pauseDuration);
  let pausesInserted = 0;

  // Pre-calculate pause indices
  const pauseIndices = new Set();
  while (pausesInserted < pausesNumber) {
      const pauseAt = Math.floor(Math.random() * totalLength);
      if (!pauseIndices.has(pauseAt)) {
          pauseIndices.add(pauseAt);
          pausesInserted++;
      }
  }

  function getRandomDelay(base, variability) {
      return base + (Math.random() * variability * 2 - variability);
  }

  function typeCharacter() {
      if (index >= totalLength) {
          console.log("Typing completed.");
          return;
      }

      // Insert pause if current index is in pauseIndices
      if (pauseIndices.has(index)) {
          const pauseTime = getRandomDelay(basePauseDurationInMs, pauseVariability);
          console.log(`Pausing for ${pauseTime} ms at index ${index}.`);
          setTimeout(typeCharacter, pauseTime);
          index++;
          return;
      }

      const char = text.charAt(index);
      let actualChar = char;

      // Simulate typing accuracy
      if (Math.random() * 100 > typingAccuracy) {
          actualChar = String.fromCharCode(97 + Math.floor(Math.random() * 26)); // Introduce a typo
          console.log(`Typo introduced at index ${index}: '${actualChar}' instead of '${char}'`);
          insertText(editor, actualChar);

          // Simulate backspace and correct character
          setTimeout(() => {
              simulateBackspace(editor);
              insertText(editor, char);
              index++;
              setTimeout(typeCharacter, getRandomDelay(baseTypingInterval, typingSpeedVariability));
          }, getRandomDelay(300, 100));
      } else {
          insertText(editor, actualChar);
          index++;
          setTimeout(typeCharacter, getRandomDelay(baseTypingInterval, typingSpeedVariability));
      }
  }

  typeCharacter();
}

// Function to insert text into the editor using Range and Selection APIs
function insertText(editor, char) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const textNode = document.createTextNode(char);
  range.insertNode(textNode);
  // Move the cursor after the inserted character
  range.setStartAfter(textNode);
  range.setEndAfter(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
}

// Function to simulate a backspace using Range and Selection APIs
function simulateBackspace(editor) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  
  if (range.startOffset === 0) return; // Nothing to delete
  
  range.setStart(range.startContainer, range.startOffset - 1);
  range.deleteContents();
  
  selection.removeAllRanges();
  selection.addRange(range);
}

// Function to parse time strings (mm:ss or ms) into milliseconds
function parseTime(timeStr) {
  if (typeof timeStr === 'number') {
      return timeStr; // Assume it's already in milliseconds
  }
  if (typeof timeStr !== 'string') {
      console.error("Invalid time type:", typeof timeStr);
      return 1000; // Default to 1 second
  }
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return (parts[0] * 60 + parts[1]) * 1000; // mm:ss to ms
  } else if (parts.length === 1 && !isNaN(parts[0])) {
      return parts[0] * 1000; // ms to ms
  } else {
      console.error("Invalid time format:", timeStr);
      return 1000; // Default to 1 second
  }
}
