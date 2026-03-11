// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;
let currentLanguage = 'en-US'; // Default: English to Finnish
let targetLanguage = 'fi';

// UI Elements
const listenBtn = document.getElementById('listen-btn');
const btnText = listenBtn.querySelector('.btn-text');
const indicator = document.getElementById('listening-indicator');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const langToggle = document.getElementById('language-toggle');
const modeIndicator = document.getElementById('current-mode');

if (!SpeechRecognition) {
    alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
} else {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = currentLanguage;

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        inputText.innerText = finalTranscript || interimTranscript;

        if (finalTranscript) {
            translateText(finalTranscript);
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        stopListening();
    };

    recognition.onend = () => {
        if (isListening) recognition.start(); // Keep listening if it stops unexpectedly
    };
}

// Translation Logic
async function translateText(text) {
    if (!text.trim()) return;

    try {
        const sourceLang = currentLanguage.split('-')[0];
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLanguage}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.responseData) {
            outputText.innerText = data.responseData.translatedText;
        }
    } catch (error) {
        console.error("Translation error:", error);
        outputText.innerText = "Error fetching translation.";
    }
}

// Toggle Language
langToggle.addEventListener('change', () => {
    if (langToggle.checked) {
        // Finnish to English
        currentLanguage = 'fi-FI';
        targetLanguage = 'en';
        modeIndicator.innerText = "Finnish to English";
    } else {
        // English to Finnish
        currentLanguage = 'en-US';
        targetLanguage = 'fi';
        modeIndicator.innerText = "English to Finnish";
    }
    
    if (recognition) recognition.lang = currentLanguage;
    
    // Clear displays
    inputText.innerText = '';
    outputText.innerText = '';
});

// Start/Stop Listening
listenBtn.addEventListener('click', () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});

function startListening() {
    if (!recognition) return;
    
    inputText.innerText = '';
    outputText.innerText = '';
    recognition.start();
    isListening = true;
    
    listenBtn.classList.add('listening');
    btnText.innerText = "Stop Listening";
    indicator.classList.remove('hidden');
}

function stopListening() {
    if (!recognition) return;
    
    recognition.stop();
    isListening = false;
    
    listenBtn.classList.remove('listening');
    btnText.innerText = "Start Listening";
    indicator.classList.add('hidden');
}
