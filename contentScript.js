// contentScript.js

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'simulateTyping') {
        const data = request.data;
        simulateTyping(data);
    }
});

// Function to simulate typing
function simulateTyping(data) {
    const {
        typingTime,
        typingAccuracy,
        typingSpeedVariability,
        pauseDuration,
        pausesNumber,
        pauseVariability,
        text
    } = data;

    // Parse typing time (hh:mm)
    const [typingHours, typingMinutes] = typingTime.split(':').map(Number);
    const totalTypingTimeInSeconds = (typingHours * 3600) + (typingMinutes * 60);

    // Parse pause duration (mm:ss)
    const [pauseMinutes, pauseSeconds] = pauseDuration.split(':').map(Number);
    const totalPauseDurationInSeconds = (pauseMinutes * 60) + pauseSeconds;

    const typingAccuracyPercentage = parseFloat(typingAccuracy);
    const typingSpeedVariabilityPercentage = parseFloat(typingSpeedVariability);

    let index = 0;
    const totalLength = text.length;
    const baseTypingInterval = (totalTypingTimeInSeconds * 1000) / totalLength;

    let inputArea = document.activeElement;

    // Check if the active element is suitable for typing
    if (!inputArea || !(inputArea.tagName === 'INPUT' || inputArea.tagName === 'TEXTAREA' || inputArea.isContentEditable)) {
        // Try to focus on the contentEditable area (useful for Google Docs)
        inputArea = document.querySelector('[contenteditable="true"]');
        if (inputArea) {
            inputArea.focus();
        } else {
            alert('Please focus on an input field or editable area.');
            return;
        }
    }

    function getRandomTypingInterval() {
        const variability = baseTypingInterval * (typingSpeedVariabilityPercentage / 100);
        return baseTypingInterval + (Math.random() * variability * 2 - variability);
    }

    function typeCharacter() {
        if (index < totalLength) {
            let char = text[index];

            // Simulate typing accuracy
            if (Math.random() * 100 >= typingAccuracyPercentage) {
                // Simulate a typo by choosing a random character
                char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
            }

            simulateKeyEvents(inputArea, char);

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

    function simulateKeyEvents(element, char) {
        const keyCode = char.charCodeAt(0);

        // Create and dispatch keydown event
        const keyDownEvent = new KeyboardEvent('keydown', {
            key: char,
            code: char,
            charCode: keyCode,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true
        });
        element.dispatchEvent(keyDownEvent);

        // Create and dispatch keypress event
        const keyPressEvent = new KeyboardEvent('keypress', {
            key: char,
            code: char,
            charCode: keyCode,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true
        });
        element.dispatchEvent(keyPressEvent);

        // Create and dispatch input event
        const textInputEvent = new InputEvent('textInput', {
            data: char,
            bubbles: true
        });
        element.dispatchEvent(textInputEvent);

        // For contentEditable elements, insert the text
        if (element.isContentEditable) {
            document.execCommand('insertText', false, char);
        } else {
            // For input or textarea elements
            const start = element.selectionStart;
            const end = element.selectionEnd;
            const value = element.value;
            element.value = value.substring(0, start) + char + value.substring(end);
            element.selectionStart = element.selectionEnd = start + 1;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Create and dispatch keyup event
        const keyUpEvent = new KeyboardEvent('keyup', {
            key: char,
            code: char,
            charCode: keyCode,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true
        });
        element.dispatchEvent(keyUpEvent);
    }

    typeCharacter();
}
