/*
wow you really found this file
i lost her, i miss her, but i cant lose myself
thats why i built this extension
to help the world
to heal me

we live two different lives
disconnected
but i hope you find this
i hope you find me
i hope you find you

when we're older id like one more chance
to make things right

but for now
i love you but i must let you go
sorry.

you know who you are

-sean sodhi
12/3/2024
*/


// ----- Configuration Variables -----

// Total typing time in hh:mm format (e.g., "00:10" for 10 minutes)
const typingTime = "00:10";

// Typing accuracy percentage (0-100)
const typingAccuracy = 90;

// Typing speed variability percentage (0-100)
const typingSpeedVariability = 20;

// Pause duration in mm:ss format (e.g., "00:05" for 5 seconds)
const pauseDuration = "00:05";

// Number of pauses during typing
const pausesNumber = 3;

// Variability in pause durations (milliseconds)
const pauseVariability = 1000;

// Text to be typed into Google Docs
const text = "Senna Auto Typer is currently under a test. This script is designed to simulate human-like typing behavior, including occasional typos and corrections. If you see this, it works as intended. Let's continue to enhance its functionality for more realistic simulations. The goal is to provide a seamless and natural typing experience that closely mimics actual user input.";

// ----- End of Configuration Variables -----

// Function to find the Google Docs editor element using updated selectors
function getEditorElement() {
  // Updated selector to match Google Docs editor
  const selector = 'div.kix-canvas-tile-content';

  const element = document.querySelector(selector);
  if (element) {
    return element;
  }
  console.warn('AutoType: Could not find the Google Docs editor area.');
  return null;
}

// Function to parse time strings (hh:mm or mm:ss) into total milliseconds
function parseTime(timeStr) {
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 2) {
    console.error(`Invalid time format: ${timeStr}. Expected format mm:ss or hh:mm.`);
    return 0;
  }
  return (parts[0] * 60 + parts[1]) * 1000; // Convert to milliseconds
}

// Function to simulate typing text with customizable parameters
function autoTypeGoogleDocs(text) {
  const editor = getEditorElement();

  if (!editor) {
    console.error('AutoType Error: Could not find the Google Docs editor area.');
    return;
  }

  // Focus the editor to ensure it receives the events
  editor.focus();

  let index = 0;
  const totalLength = text.length;

  // Calculate base typing interval based on total typing time
  const totalTypingTimeInMs = parseTime(typingTime);
  const baseTypingInterval = totalTypingTimeInMs / totalLength;

  // Calculate base pause duration
  const basePauseDurationInMs = parseTime(pauseDuration);

  // Track the number of pauses inserted
  let pausesInserted = 0;

  // Function to get a random delay based on variability
  function getRandomDelay(base, variability) {
    return base + (Math.random() * variability * 2 - variability);
  }

  // Function to handle typing each character
  function typeCharacter() {
    if (index >= totalLength) {
      console.log('AutoType: Completed typing.');
      return;
    }

    // Decide whether to insert a pause
    if (
      pausesInserted < pausesNumber &&
      Math.random() < (pausesNumber - pausesInserted) / (totalLength - index)
    ) {
      pausesInserted++;
      const pauseTime = getRandomDelay(basePauseDurationInMs, pauseVariability);
      console.log(`AutoType: Pausing for ${pauseTime} ms.`);
      setTimeout(typeCharacter, pauseTime);
      return;
    }

    const char = text.charAt(index);
    let actualChar = char;

    // Simulate typing accuracy by introducing a typo
    if (Math.random() * 100 > typingAccuracy) {
      // Introduce a typo by replacing the character with a random lowercase letter
      actualChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      console.log(
        `AutoType: Typo introduced at index ${index}: '${actualChar}' instead of '${char}'.`
      );

      // Type the wrong character
      insertText(actualChar);

      // Simulate backspacing the wrong character and typing the correct one
      setTimeout(() => {
        simulateBackspace();
        insertText(char);
        index++;
        // Schedule next character
        setTimeout(typeCharacter, getRandomDelay(baseTypingInterval, typingSpeedVariability));
      }, getRandomDelay(300, 100)); // Delay before correcting the typo
    } else {
      // Type the correct character
      insertText(actualChar);
      index++;
      // Schedule next character
      setTimeout(typeCharacter, getRandomDelay(baseTypingInterval, typingSpeedVariability));
    }
  }

  // Function to insert text into the editor
  function insertText(char) {
    document.execCommand('insertText', false, char);
  }

  // Function to simulate a backspace
  function simulateBackspace() {
    document.execCommand('delete', false, null);
  }

  // Start typing with the first character
  typeCharacter();
}

// Function to initialize AutoType when the editor is available
function initializeAutoType(text) {
  const editor = getEditorElement();
  if (editor) {
    autoTypeGoogleDocs(text);
  } else {
    // Try again after a delay if editor is not found
    setTimeout(() => initializeAutoType(text), 1000);
  }
}

// Initialize AutoType with the desired text
initializeAutoType(text);