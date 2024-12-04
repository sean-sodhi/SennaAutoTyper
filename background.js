chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startTyping') {
        const data = request.data;
        const tabId = request.tabId;

        if (!tabId) {
            console.error('No tab ID provided.');
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['contentScript.js']
        }, () => {
            chrome.tabs.sendMessage(tabId, { action: 'simulateTyping', data: data });
        });
    }
});


// Function to simulate typing in the content script context
function simulateTyping(data) {
    const { typingTime, typingAccuracy, typingSpeedVariability, pauseDuration, pausesNumber, pauseVariability, text } = data;

    // Parse time inputs
    const [typingHours, typingMinutes] = typingTime.split(':').map(Number);
    const totalTypingTimeInSeconds = (typingHours * 3600) + (typingMinutes * 60);

    // Parse pause duration
    const [pauseMinutes, pauseSeconds] = pauseDuration.split(':').map(Number);
    const totalPauseDurationInSeconds = (pauseMinutes * 60) + pauseSeconds;

    const typingAccuracyPercentage = parseFloat(typingAccuracy);
    const typingSpeedVariabilityPercentage = parseFloat(typingSpeedVariability);

    let index = 0;
    const totalLength = text.length;
    const baseTypingInterval = (totalTypingTimeInSeconds * 1000) / totalLength;

    const inputArea = document.activeElement;

    if (!inputArea || !(inputArea.tagName === 'INPUT' || inputArea.tagName === 'TEXTAREA' || inputArea.isContentEditable)) {
        alert('Please focus on an input field or editable area.');
        return;
    }

    function getRandomTypingInterval() {
        const variability = baseTypingInterval * (typingSpeedVariabilityPercentage / 100);
        return baseTypingInterval + (Math.random() * variability * 2 - variability);
    }

    function typeCharacter() {
        if (index < totalLength) {
            // Simulate typing accuracy
            if (Math.random() * 100 < typingAccuracyPercentage) {
                // Correct character
                insertText(text[index]);
            } else {
                // Simulate a typo
                const typoChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
                insertText(typoChar);

                // Correct the typo after a short delay
                setTimeout(() => {
                    deleteText();
                    insertText(text[index]);
                }, getRandomTypingInterval());
            }
            index++;

            // Simulate pauses
            if (pausesNumber > 0 && Math.random() < pausesNumber / totalLength) {
                const variability = parseInt(pauseVariability) * 60000; // Convert minutes to milliseconds
                const basePause = totalPauseDurationInSeconds * 1000;
                const pauseTime = basePause + (Math.random() * variability * 2 - variability);
                setTimeout(typeCharacter, pauseTime);
            } else {
                setTimeout(typeCharacter, getRandomTypingInterval());
            }
        }
    }

    function insertText(char) {
        if (inputArea.isContentEditable) {
            document.execCommand('insertText', false, char);
        } else {
            inputArea.value += char;
            inputArea.dispatchEvent(new Event('input'));
        }
    }

    function deleteText() {
        if (inputArea.isContentEditable) {
            document.execCommand('delete', false, null);
        } else {
            inputArea.value = inputArea.value.slice(0, -1);
            inputArea.dispatchEvent(new Event('input'));
        }
    }

    typeCharacter();
}
