chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startTyping") {
      const { data, tabId } = message;
  
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: startTypingSimulation,
          args: [data],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error("Error injecting script:", chrome.runtime.lastError.message);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse({ success: true });
          }
        }
      );
  
      return true; // Keep the message channel open for sendResponse
    }
  });
  
  function startTypingSimulation(config) {
    const {
      text,
      typingTime,
      typingAccuracy,
      typingSpeedVariability,
      pauseDuration,
      pausesNumber,
      pauseVariability,
    } = config;
  
    const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
    if (!iframe) {
      console.error("Cannot find Google Docs editor iframe.");
      return;
    }
  
    const editorDoc = iframe.contentDocument || iframe.contentWindow.document;
    const editor = editorDoc.querySelector('[contenteditable="true"]');
    if (!editor) {
      console.error("No editable area found inside the iframe.");
      return;
    }
  
    editor.focus();

    const parseTime = (timeStr) => {
        const [minutes, seconds] = timeStr.split(":").map(Number);
        return minutes * 60000 + seconds * 1000;
    };

    const typingDelay = parseTime(typingTime) / text.length;
    const pauseDelay = parseTime(pauseDuration);

    let index = 0;
    let pausesInserted = 0;

    const getRandomDelay = (base, variability) => base + (Math.random() * variability * 2 - variability);

    function typeNextCharacter() {
        if (index >= text.length) {
            console.log("Typing completed.");
            return;
        }

        if (pausesInserted < pausesNumber && Math.random() < 0.1) {
            pausesInserted++;
            console.log(`Pausing for ${pauseDelay} ms.`);
            setTimeout(typeNextCharacter, getRandomDelay(pauseDelay, pauseVariability));
            return;
        }

        const char = text[index++];
        editor.dispatchEvent(new InputEvent("input", { data: char, bubbles: true }));

        if (Math.random() * 100 > typingAccuracy) {
            console.log(`Typo at index ${index - 1}`);
            setTimeout(() => {
                editor.dispatchEvent(new InputEvent("input", { data: char, bubbles: true }));
            }, 200);
        }

        setTimeout(typeNextCharacter, getRandomDelay(typingDelay, typingSpeedVariability));
    }

    typeNextCharacter();
}
