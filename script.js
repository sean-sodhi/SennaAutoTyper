window.addEventListener('load', () => {
    // Select elements
    const splashScreen = document.getElementById('splash-screen');
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownNumber = document.getElementById('countdown-number');

    // Remove Splash Screen after animation
    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 3000); // Total time of splash screen animation

    // Expand Textarea Functionality
    const expandButton = document.getElementById('expand-textarea');
    const textarea = document.getElementById('text-input');
    let isExpanded = false;

    expandButton.addEventListener('click', () => {
        if (!isExpanded) {
            textarea.style.height = '129px';
            expandButton.innerHTML = '<i class="fas fa-compress"></i>';
            isExpanded = true;
            // Adjust window height
            document.body.style.height = '550px';
        } else {
            textarea.style.height = '40px';
            expandButton.innerHTML = '<i class="fas fa-expand"></i>';
            isExpanded = false;
            // Adjust window height
            document.body.style.height = '550px';
        }
    });

    // Prevent horizontal resizing
    textarea.style.resize = 'vertical';
    textarea.style.maxWidth = '100%';

    // File Upload Handling
    const fileUpload = document.getElementById('file-upload');
    const pdfWarning = document.getElementById('pdf-warning');

    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.pdf')) {
            pdfWarning.classList.remove('hidden');
        } else {
            pdfWarning.classList.add('hidden');
        }
        // Implement parsing logic here to set the text to type
        // For example, read the file and set its content to the textarea
    });

    // Start Typing Button Functionality
    const startButton = document.getElementById('start-button');
    let targetTabId = null; // Store the target tab ID

    startButton.addEventListener('click', () => {
        if (!targetTabId) {
            alert('Please connect to a tab first.');
            return;
        }

        // Get the values from the inputs
        const typingTimeInput = document.getElementById('typing-time').value;
        const typingAccuracyInput = document.getElementById('typing-accuracy').value;
        const typingSpeedVariabilityInput = document.getElementById('typing-speed-variability').value;
        const pauseDurationInput = document.getElementById('pause-duration').value;
        const pausesNumberInput = document.getElementById('pauses-number').value;
        const pauseVariabilityInput = document.getElementById('pause-variability').value;
        const textInput = document.getElementById('text-input').value;

        // Validate inputs
        if (!textInput) {
            alert('Please enter the text to type.');
            return;
        }

        // Validate Typing Time Input (hh:mm)
        const timeParts = typingTimeInput.split(':');
        if (timeParts.length !== 2) {
            alert('Please enter Typing Time in hh:mm format.');
            return;
        }
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0 || minutes > 59) {
            alert('Please enter a valid Typing Time.');
            return;
        }

        // Validate Typing Accuracy (%)
        const typingAccuracy = parseFloat(typingAccuracyInput);
        if (isNaN(typingAccuracy) || typingAccuracy < 0 || typingAccuracy > 100) {
            alert('Please enter a valid Typing Accuracy between 0 and 100.');
            return;
        }

        // Validate Typing Speed Variability (%)
        const typingSpeedVariability = parseFloat(typingSpeedVariabilityInput);
        if (isNaN(typingSpeedVariability) || typingSpeedVariability < 0 || typingSpeedVariability > 100) {
            alert('Please enter a valid Typing Speed Variability between 0 and 100.');
            return;
        }

        // Validate Pause Duration Input (mm:ss)
        const pauseTimeParts = pauseDurationInput.split(':');
        if (pauseTimeParts.length !== 2) {
            alert('Please enter Pause Duration in mm:ss format.');
            return;
        }
        const pauseMinutes = parseInt(pauseTimeParts[0]);
        const pauseSeconds = parseInt(pauseTimeParts[1]);
        if (isNaN(pauseMinutes) || isNaN(pauseSeconds) || pauseMinutes < 0 || pauseSeconds < 0 || pauseSeconds > 59) {
            alert('Please enter a valid Pause Duration.');
            return;
        }

        // Validate Number of Pauses
        const pausesNumber = parseInt(pausesNumberInput);
        if (isNaN(pausesNumber) || pausesNumber < 0) {
            alert('Please enter a valid Number of Pauses.');
            return;
        }

        // Validate Pause Variability
        const pauseVariability = parseInt(pauseVariabilityInput);
        if (isNaN(pauseVariability) || pauseVariability < 0) {
            alert('Please enter a valid Pause Variability (positive number).');
            return;
        }

        // Show the countdown overlay
        countdownOverlay.classList.add('active');

        let countdown = 3;
        countdownNumber.textContent = countdown;

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown >= 1) {
                countdownNumber.textContent = countdown;

                // Add pulse animation
                countdownNumber.classList.remove('animate');
                void countdownNumber.offsetWidth; // Trigger reflow
                countdownNumber.classList.add('animate');
            } else {
                clearInterval(countdownInterval);
                // Hide the countdown overlay
                countdownOverlay.classList.remove('active');
                // Start the typing simulation
                // Send a message to the background script
                chrome.runtime.sendMessage({
                    action: 'startTyping',
                    data: {
                        typingTime: typingTimeInput,
                        typingAccuracy: typingAccuracyInput,
                        typingSpeedVariability: typingSpeedVariabilityInput,
                        pauseDuration: pauseDurationInput,
                        pausesNumber: pausesNumberInput,
                        pauseVariability: pauseVariabilityInput,
                        text: textInput
                    },
                    tabId: targetTabId
                });
            }
        }, 1000);
    });

    // Connect Buttons Functionality
    const connectGoogleDocsButton = document.getElementById('connect-google-docs');
    const connectAnotherTabButton = document.getElementById('connect-another-tab');
    const status = document.getElementById('status');

    connectGoogleDocsButton.addEventListener('click', () => {
        chrome.tabs.query({ url: "https://docs.google.com/*" }, (tabs) => {
            if (tabs.length >= 1) {
                targetTabId = tabs[0].id; // Select the first Google Docs tab
                status.textContent = "Connected to Google Docs!";
                connectGoogleDocsButton.classList.add('connected');
                connectAnotherTabButton.classList.remove('connected');
            } else {
                status.textContent = "No Google Docs tab found. Open a Google Doc and try again.";
            }
        });
    });

    connectAnotherTabButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                targetTabId = tabs[0].id;
                status.textContent = "Connected to another tab.";
                connectAnotherTabButton.classList.add('connected');
                connectGoogleDocsButton.classList.remove('connected');
            } else {
                status.textContent = "No tabs available to connect.";
            }
        });
    });
});
