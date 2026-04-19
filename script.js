// ========================================
// COUNTDOWN TIMER (DINÓMETRO)
// ========================================

// Target date: May 24, 2026 at 4:00 PM (16:00)
// Using explicit date components to avoid timezone issues
const targetDate = new Date(2026, 4, 24, 16, 0, 0, 0).getTime(); // Month is 0-indexed, so 4 = May

console.log('Target Date:', new Date(targetDate));
console.log('Current Date:', new Date());

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    console.log('Distance in ms:', distance);

    // Calculate time units
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Update DOM elements
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

    // If countdown is finished
    if (distance < 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    });
} else {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}


// ========================================
// AUDIO PLAYER
// ========================================

let audioPlayer;
let isPlaying = false;
let progressInterval;

function updatePlayIcon() {
    const playIcon = document.getElementById('playIcon');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    
    if (isPlaying) {
        if (playIcon) playIcon.textContent = 'pause_circle';
        if (musicToggleBtn) musicToggleBtn.classList.add('playing');
    } else {
        if (playIcon) playIcon.textContent = 'play_circle';
        if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

function updateAudioProgress() {
    if (!audioPlayer) return;

    const currentTime = audioPlayer.currentTime;
    const duration = audioPlayer.duration || 0;
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    const progressBar = document.getElementById('progressBar');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');

    if (progressBar) progressBar.value = progressPercent;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
    if (durationEl) durationEl.textContent = formatTime(duration);
}

function startProgressUpdate() {
    stopProgressUpdate();
    progressInterval = setInterval(updateAudioProgress, 500);
}

function stopProgressUpdate() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function togglePlayPause() {
    if (!audioPlayer) {
        console.error('Audio element not found');
        return;
    }

    const musicPlayerContainer = document.getElementById('musicPlayerContainer');

    if (audioPlayer.paused || audioPlayer.ended) {
        audioPlayer.play().catch(error => {
            console.error('Error al reproducir el audio:', error);
            alert('No se pudo reproducir la música. Asegúrate de permitir sonido en el navegador.');
        });
        if (musicPlayerContainer) {
            musicPlayerContainer.style.display = 'block';
        }
    } else {
        audioPlayer.pause();
    }
}

function initializeAudioEvents() {
    audioPlayer = document.getElementById('audioPlayer');
    if (!audioPlayer) {
        console.error('Audio element not found');
        return;
    }

    audioPlayer.volume = 0.5;
    audioPlayer.preload = 'auto';

    audioPlayer.addEventListener('loadedmetadata', updateAudioProgress);
    audioPlayer.addEventListener('timeupdate', updateAudioProgress);

    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updatePlayIcon();
        startProgressUpdate();
    });

    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayIcon();
        stopProgressUpdate();
    });

    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayIcon();
        stopProgressUpdate();
    });

    // Wait for audio to be ready and then autoplay
    audioPlayer.addEventListener('canplay', () => {
        audioPlayer.play().catch(error => {
            console.log('Autoplay blocked by browser:', error);
            isPlaying = false;
            updatePlayIcon();
        });
    });
}

// Initialize event listeners when DOM is ready
function initializeEventListeners() {
    console.log('Initializing event listeners');
    initializeAudioEvents();

    const playPauseBtn = document.getElementById('playPauseBtn');
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const progressBar = document.getElementById('progressBar');
    const volumeBar = document.getElementById('volumeBar');

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
        console.log('Play/Pause button listener attached');
    }
    
    if (musicToggleBtn) {
        musicToggleBtn.addEventListener('click', togglePlayPause);
        console.log('Music toggle button listener attached');
    }

    if (progressBar) {
        progressBar.addEventListener('input', function(e) {
            if (audioPlayer && audioPlayer.duration) {
                try {
                    const seekTo = (e.target.value / 100) * audioPlayer.duration;
                    audioPlayer.currentTime = seekTo;
                    updateAudioProgress();
                } catch (error) {
                    console.error('Error seeking:', error);
                }
            }
        });
        console.log('Progress bar listener attached');
    }

    if (volumeBar) {
        volumeBar.addEventListener('input', function(e) {
            if (audioPlayer) {
                audioPlayer.volume = e.target.value / 100;
            }
        });
        console.log('Volume bar listener attached');
    }

    // Stop music when leaving the page
    window.addEventListener('beforeunload', () => {
        if (audioPlayer) {
            audioPlayer.pause();
        }
    });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
} else {
    initializeEventListeners();
}
