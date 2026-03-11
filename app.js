const micBtn = document.getElementById('mic-btn');
const langToggle = document.getElementById('lang-toggle');
const transcriptText = document.getElementById('transcript');
const translationText = document.getElementById('translation');
const btnText = micBtn.querySelector('.btn-text');
const labelEn = document.getElementById('label-en');
const labelFi = document.getElementById('label-fi');
const loader = document.getElementById('loader');

// Speech Recognition Setup
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
let isListening = false;
let sourceLang = 'en-US';
let targetLang = 'fi';

if ('SpeechRecognition' in window) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening');
        btnText.textContent = 'Recording...';
        transcriptText.classList.remove('placeholder');
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening');
        btnText.textContent = 'Start Listening';
    };

    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
                translateText(finalTranscript);
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        transcriptText.textContent = finalTranscript || interimTranscript;
    };

    recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        stopListening();
    };
} else {
    alert('Speech Recognition API not supported in this browser. Please use Chrome or Edge.');
}

// Translation Logic
async function translateText(text) {
    if (!text.trim()) return;

    loader.classList.remove('hidden');
    translationText.classList.remove('placeholder');

    const from = sourceLang.split('-')[0];
    const to = targetLang;

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
        const data = await response.json();
        
        if (data.responseData) {
            translationText.textContent = data.responseData.translatedText;
        } else {
            translationText.textContent = 'Translation error. Try again.';
        }
    } catch (error) {
        console.error('Translation Fetch Error:', error);
        translationText.textContent = 'Service unavailable.';
    } finally {
        loader.classList.add('hidden');
    }
}

// Toggle Management
langToggle.addEventListener('change', () => {
    if (langToggle.checked) {
        // FI -> EN
        sourceLang = 'fi-FI';
        targetLang = 'en';
        labelEn.classList.remove('active');
        labelFi.classList.add('active');
    } else {
        // EN -> FI
        sourceLang = 'en-US';
        targetLang = 'fi';
        labelEn.classList.add('active');
        labelFi.classList.remove('active');
    }
    
    recognition.lang = sourceLang;
    
    // Reset display
    transcriptText.textContent = 'Your speech will appear here...';
    transcriptText.classList.add('placeholder');
    translationText.textContent = 'Translation will appear here...';
    translationText.classList.add('placeholder');
    
    if (isListening) {
        stopListening();
        startListening();
    }
});

// Event Listeners
micBtn.addEventListener('click', () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
});

function startListening() {
    recognition.lang = sourceLang;
    recognition.start();
}

function stopListening() {
    recognition.stop();
}
