// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed and background ready.");
});

// Handle messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received message:", message);

    if (message.action === "startTyping") {
        const { targetTabId, data } = message;

        // Validate the target tab ID
        if (!targetTabId) {
            console.error("No target tab ID provided.");
            sendResponse({ success: false, error: "No target tab selected" });
            return false; // Terminate the message listener
        }

        console.log(`Preparing to inject content script into tab ID: ${targetTabId}`);

        // Inject the content script if not already injected
        chrome.scripting.executeScript(
            {
                target: { tabId: targetTabId },
                files: ["contentScript.js"]
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.error("Error injecting content script:", chrome.runtime.lastError.message);
                    sendResponse({ success: false, error: chrome.runtime.lastError.message });
                    return;
                }

                console.log("Content script injected successfully.");

                // Send the typing action to the content script
                chrome.tabs.sendMessage(
                    targetTabId,
                    { action: "startTyping", data },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.error("Error sending message to content script:", chrome.runtime.lastError.message);
                            sendResponse({ success: false, error: chrome.runtime.lastError.message });
                        } else {
                            console.log("Response from content script:", response);
                            sendResponse(response || { success: true });
                        }
                    }
                );
            }
        );

        // Keep the message port alive for asynchronous response
        return true;
    }
});
