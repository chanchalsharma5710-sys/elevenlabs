document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const clearBtn = document.getElementById('clear-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const voiceSelect = document.getElementById('voice-select');
    const modelSelect = document.getElementById('model-select');
    const stabilitySlider = document.getElementById('stability');
    const similaritySlider = document.getElementById('similarity');
    const styleSlider = document.getElementById('style');
    const speakerBoostToggle = document.getElementById('speaker-boost');
    const stabilityVal = document.getElementById('stability-val');
    const similarityVal = document.getElementById('similarity-val');
    const styleVal = document.getElementById('style-val');
    const generateBtn = document.getElementById('generate-btn');
    const generateLoading = document.getElementById('generate-loading');
    const generateError = document.getElementById('generate-error');
    const voiceError = document.getElementById('voice-error');
    const resultPanel = document.getElementById('result-panel');
    const audioPlayer = document.getElementById('audio-player');
    const downloadBtn = document.getElementById('download-btn');
    const toast = document.getElementById('toast');

    // --- State ---
    let voices = [];
    const MAX_CHARS = 5000; // General safe limit for ElevenLabs

    const sampleTexts = [
        "Welcome to VoiceCraft AI. This is a demonstration of how our advanced text-to-speech technology can transform your written words into incredibly lifelike human speech.",
        "The quick brown fox jumps over the lazy dog. But did you know that this sentence uses every letter in the English alphabet?",
        "Space, the final frontier. These are the voyages of the starship Enterprise. Its continuing mission: to explore strange new worlds, to seek out new life and new civilizations, to boldly go where no one has gone before."
    ];

    // --- Utility Functions ---
    const showToast = (message, type = 'success') => {
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        toast.classList.remove('hidden');
        
        // Trigger reflow
        void toast.offsetWidth;
        
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';

        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
    };

    const updateCounters = () => {
        const text = textInput.value;
        const chars = text.length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        
        charCount.textContent = `${chars} characters${chars > MAX_CHARS ? ` (Limit: ${MAX_CHARS})` : ''}`;
        charCount.style.color = chars > MAX_CHARS ? 'var(--error)' : 'var(--text-secondary)';
        wordCount.textContent = `${words} words`;
    };

    // --- API Interactions ---
    const fetchVoices = async () => {
        try {
            const response = await fetch('/api/voices');
            if (!response.ok) {
                throw new Error('Failed to load voices');
            }
            const data = await response.json();
            voices = data.voices || [];
            
            voiceSelect.innerHTML = '';
            if (voices.length === 0) {
                voiceSelect.innerHTML = '<option value="" disabled>No voices available</option>';
                return;
            }

            voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.voice_id;
                // Include some metadata if available
                const labels = voice.labels || {};
                let desc = voice.name;
                if (labels.accent || labels.description) {
                    desc += ` (${labels.accent || ''} ${labels.description || ''})`.trim();
                }
                option.textContent = desc;
                voiceSelect.appendChild(option);
            });
            
            voiceError.classList.add('hidden');
        } catch (error) {
            console.error('Error fetching voices:', error);
            voiceSelect.innerHTML = '<option value="" disabled>Error loading voices</option>';
            voiceError.textContent = 'Could not load voices. Please check your API key.';
            voiceError.classList.remove('hidden');
        }
    };

    const generateAudio = async () => {
        const text = textInput.value.trim();
        const voiceId = voiceSelect.value;
        const modelId = modelSelect.value;
        
        if (!text) {
            showToast('Please enter some text to narrate.', 'error');
            return;
        }
        
        if (!voiceId) {
            showToast('Please select a voice.', 'error');
            return;
        }

        if (text.length > MAX_CHARS) {
            showToast(`Text is too long. Please keep it under ${MAX_CHARS} characters.`, 'error');
            return;
        }

        // UI State: Loading
        generateBtn.classList.add('hidden');
        generateLoading.classList.remove('hidden');
        generateError.classList.add('hidden');
        resultPanel.classList.add('hidden');

        try {
            const payload = {
                text,
                voice_id: voiceId,
                model_id: modelId,
                stability: parseFloat(stabilitySlider.value),
                similarity_boost: parseFloat(similaritySlider.value),
                style: parseFloat(styleSlider.value),
                use_speaker_boost: speakerBoostToggle.checked
            };

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate narration.');
            }

            // Handle audio binary response
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            audioPlayer.src = url;
            downloadBtn.href = url;
            
            resultPanel.classList.remove('hidden');
            showToast('Narration generated successfully!');
            
            // Scroll to result slightly delayed for smooth UI
            setTimeout(() => {
                resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);

        } catch (error) {
            console.error('Generation error:', error);
            generateError.textContent = error.message;
            generateError.classList.remove('hidden');
            showToast('Failed to generate narration.', 'error');
        } finally {
            // Restore UI
            generateBtn.classList.remove('hidden');
            generateLoading.classList.add('hidden');
        }
    };

    // --- Event Listeners ---
    textInput.addEventListener('input', updateCounters);
    
    clearBtn.addEventListener('click', () => {
        if (textInput.value && confirm('Are you sure you want to clear your text?')) {
            textInput.value = '';
            updateCounters();
        }
    });

    sampleBtn.addEventListener('click', () => {
        const randomSample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        textInput.value = randomSample;
        updateCounters();
        showToast('Sample text loaded');
    });

    // Sync sliders with values
    stabilitySlider.addEventListener('input', (e) => { stabilityVal.textContent = parseFloat(e.target.value).toFixed(2); });
    similaritySlider.addEventListener('input', (e) => { similarityVal.textContent = parseFloat(e.target.value).toFixed(2); });
    styleSlider.addEventListener('input', (e) => { styleVal.textContent = parseFloat(e.target.value).toFixed(2); });

    generateBtn.addEventListener('click', generateAudio);

    // Initialize
    fetchVoices();
});
