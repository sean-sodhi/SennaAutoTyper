// popup.js
window.addEventListener("load", () => {
  console.log("Popup script loaded.");
  const startButton = document.getElementById("start-button");
  const connectGoogleDocsButton = document.getElementById("connect-google-docs");
  const status = document.getElementById("status");
  let targetTabId = null;

  // Connect to Google Docs
  connectGoogleDocsButton.addEventListener("click", () => {
    chrome.tabs.query({ url: "https://docs.google.com/document/*" }, (tabs) => {
      if (tabs.length > 0) {
        targetTabId = tabs[0].id;
        status.textContent = "Connected to Google Docs!";
        console.log("Connected to tabId:", targetTabId);
      } else {
        status.textContent = "No Google Docs tab found.";
        console.error("No Google Docs tab found.");
      }
    });
  });

  // Start typing
  startButton.addEventListener("click", () => {
    if (!targetTabId) {
      alert("Please connect to a Google Docs tab first.");
      return;
    }

    // Collect all required data
    const text = document.getElementById("text-input").value.trim();
    const typingTime = document.getElementById("typing-time").value.trim();
    const typingAccuracy = parseInt(document.getElementById("typing-accuracy").value, 10);
    const typingSpeedVariability = parseInt(document.getElementById("typing-speed-variability").value, 10);
    const pauseDuration = document.getElementById("pause-duration").value.trim();
    const pausesNumber = parseInt(document.getElementById("pauses-number").value, 10);
    const pauseVariability = parseInt(document.getElementById("pause-variability").value, 10);

    // Basic validation
    if (!text || !typingTime || isNaN(typingAccuracy) || isNaN(typingSpeedVariability) ||
        !pauseDuration || isNaN(pausesNumber) || isNaN(pauseVariability)) {
        alert("Please fill in all fields correctly.");
        console.error("Validation failed: All fields are required and must be correctly formatted.");
        return;
    }

    const data = {
        text,
        typingTime,
        typingAccuracy,
        typingSpeedVariability,
        pauseDuration,
        pausesNumber,
        pauseVariability
    };

    chrome.runtime.sendMessage(
      { action: "startTyping", targetTabId, data },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError.message);
          alert("Error: " + chrome.runtime.lastError.message);
        } else if (response.success) {
          console.log("Typing started successfully.");
          alert("Typing simulation started successfully.");
        } else {
          console.error("Error starting typing:", response.error);
          alert("Error: " + response.error);
        }
      }
    );
  });
});
