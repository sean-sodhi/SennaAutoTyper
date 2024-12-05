window.addEventListener("load", () => {
    const startButton = document.getElementById("start-button");
    const connectGoogleDocsButton = document.getElementById("connect-google-docs");
    const connectAnotherTabButton = document.getElementById("connect-another-tab");
    const status = document.getElementById("status");

    let targetTabId = null;

    // Connect to Google Docs
    connectGoogleDocsButton.addEventListener("click", () => {
        chrome.tabs.query({ url: "https://docs.google.com/*" }, (tabs) => {
            if (tabs.length >= 1) {
                targetTabId = tabs[0].id;
                status.textContent = "Connected to Google Docs!";
                connectGoogleDocsButton.classList.add("connected");
                connectAnotherTabButton.classList.remove("connected");
            } else {
                status.textContent = "No Google Docs tab found. Open a Google Doc and try again.";
            }
        });
    });

    // Connect to Another Tab
    connectAnotherTabButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                targetTabId = tabs[0].id;
                status.textContent = "Connected to another tab.";
                connectAnotherTabButton.classList.add("connected");
                connectGoogleDocsButton.classList.remove("connected");
            } else {
                status.textContent = "No tabs available to connect.";
            }
        });
    });

    // Start Typing
    startButton.addEventListener("click", () => {
        if (!targetTabId) {
            alert("Please connect to a tab first.");
            return;
        }

        // Gather input values
        const data = {
            text: document.getElementById("text-input").value,
            typingTime: document.getElementById("typing-time").value,
            typingAccuracy: parseInt(document.getElementById("typing-accuracy").value, 10),
            typingSpeedVariability: parseInt(document.getElementById("typing-speed-variability").value, 10),
            pauseDuration: document.getElementById("pause-duration").value,
            pausesNumber: parseInt(document.getElementById("pauses-number").value, 10),
            pauseVariability: parseInt(document.getElementById("pause-variability").value, 10),
        };

        // Validate inputs
        if (!data.text || !data.typingTime || !data.pauseDuration) {
            alert("Please fill in all required fields.");
            return;
        }

        // Send data to background script
        chrome.runtime.sendMessage(
            {
                action: "startTyping",
                data,
                tabId: targetTabId,
            },
            (response) => {
                if (response.success) {
                    console.log("Typing started successfully.");
                } else {
                    console.error("Error starting typing:", response.error);
                }
            }
        );
    });
});
