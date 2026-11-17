/**
 * Korean Learning App (v3) — Voice & Audio Engine
 * Feature 1: Text-to-Speech (TTS) — Phát âm giọng chuẩn Hàn Quốc
 * Feature 5: Speech-to-Text (STT) — Luyện nói, nhận diện giọng nói & chấm điểm phát âm
 */

(function () {
    'use strict';

    // ─── Helper: String Normalization & Similarity ───────────────────
    function cleanKoreanText(str) {
        if (!str) return '';
        return str
            .replace(/___/g, '')
            .replace(/[\s.,?!~·:;'"()\[\]{}]+/g, ' ')
            .trim();
    }

    function levenshteinDistance(s1, s2) {
        if (s1.length < s2.length) return levenshteinDistance(s2, s1);
        if (s2.length === 0) return s1.length;

        let prev = [];
        for (let j = 0; j <= s2.length; j++) prev[j] = j;

        for (let i = 0; i < s1.length; i++) {
            let curr = [i + 1];
            for (let j = 0; j < s2.length; j++) {
                const cost = s1[i] === s2[j] ? 0 : 1;
                curr[j + 1] = min3(curr[j] + 1, prev[j + 1] + 1, prev[j] + cost);
            }
            prev = curr;
        }
        return prev[s2.length];
    }

    function min3(a, b, c) {
        return a < b ? (a < c ? a : c) : (b < c ? b : c);
    }

    function calculateAccuracy(target, spoken) {
        const t = cleanKoreanText(target);
        const s = cleanKoreanText(spoken);
        if (!t && !s) return 100;
        if (!t || !s) return 0;
        if (t === s) return 100;

        const dist = levenshteinDistance(t, s);
        const maxLen = Math.max(t.length, s.length);
        const ratio = Math.max(0, 1 - dist / maxLen);
        return Math.round(ratio * 100);
    }

    // ─── TTS: Text-to-Speech Engine ──────────────────────────────────
    class KoreanTTS {
        constructor() {
            this.synth = window.speechSynthesis || null;
            this.cachedVoice = null;
            this.rate = parseFloat(localStorage.getItem('kla_tts_rate') || '0.9');
            this.isPlayingAll = false;
            this.initVoice();
        }

        initVoice() {
            if (!this.synth) return;
            const selectVoice = () => {
                const voices = this.synth.getVoices();
                // Prefer native Korean voice
                this.cachedVoice = voices.find(v => v.lang === 'ko-KR' || v.lang.startsWith('ko')) || null;
            };
            selectVoice();
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = selectVoice;
            }
        }

        isSupported() {
            return !!this.synth;
        }

        setRate(rate) {
            this.rate = rate;
            localStorage.setItem('kla_tts_rate', String(rate));
        }

        getRate() {
            return this.rate;
        }

        stop() {
            if (this.synth) {
                this.synth.cancel();
            }
            this.isPlayingAll = false;
        }

        speak(text, options = {}) {
            if (!this.synth) {
                alert('Trình duyệt của bạn không hỗ trợ tính năng đọc phát âm (Web Speech Synthesis).');
                return;
            }

            if (!options.sequence) this.stop();

            const clean = cleanKoreanText(text);
            if (!clean) return;

            const utterance = new SpeechSynthesisUtterance(clean);
            utterance.lang = 'ko-KR';
            utterance.rate = options.rate || this.rate;
            utterance.pitch = options.pitch || 1.0;

            if (this.cachedVoice) {
                utterance.voice = this.cachedVoice;
            }

            if (options.onStart) utterance.onstart = options.onStart;
            if (options.onEnd) utterance.onend = options.onEnd;
            if (options.onError) utterance.onerror = options.onError;

            this.synth.speak(utterance);
        }

        /**
         * Sequential playback of an array of strings with pause between each.
         */
        playSequential(items, onProgress, onDone) {
            if (!items || items.length === 0) return;
            this.isPlayingAll = true;
            let index = 0;

            const next = () => {
                if (!this.isPlayingAll || index >= items.length) {
                    this.isPlayingAll = false;
                    if (onDone) onDone();
                    return;
                }

                const currentItem = items[index];
                if (onProgress) onProgress(index, currentItem);

                this.speak(currentItem, {
                    sequence: true,
                    onEnd: () => {
                        index++;
                        if (this.isPlayingAll) {
                            setTimeout(next, 900); // 900ms pause between sentences
                        }
                    },
                    onError: () => {
                        index++;
                        if (this.isPlayingAll) setTimeout(next, 500);
                    }
                });
            };

            next();
        }
    }

    // ─── STT: Speech-to-Text & Pronunciation Practice Engine ─────────
    class KoreanSTT {
        constructor() {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition || null;
            this.recognitionClass = SpeechRec;
            this.sharedInstance = null;
            this.permissionPreGranted = false;
            this.isBusy = false;
        }

        isSupported() {
            return !!this.recognitionClass;
        }

        async requestMicPermissionOnce() {
            if (this.permissionPreGranted) return true;
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(t => t.stop());
                    this.permissionPreGranted = true;
                    return true;
                } catch (e) {
                    console.warn('Microphone permission check:', e);
                    return false;
                }
            }
            return false;
        }

        getOrCreateInstance() {
            if (!this.sharedInstance && this.recognitionClass) {
                const rec = new this.recognitionClass();
                rec.lang = 'ko-KR';
                rec.continuous = false;
                rec.interimResults = false;
                rec.maxAlternatives = 1;
                this.sharedInstance = rec;
            }
            return this.sharedInstance;
        }

        stop() {
            this.generation = (this.generation || 0) + 1;
            const rec = this.sharedInstance;
            this.sharedInstance = null;
            this.isBusy = false;
            if (rec) {
                rec.onstart = rec.onresult = rec.onerror = rec.onend = null;
                try { rec.abort(); } catch {}
            }
        }

        async startRecognition({ onStart, onResult, onError, onEnd }) {
            this.stop();
            if (!this.isSupported()) {
                onError?.('Thiết bị/trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Safari có hỗ trợ.', 'unsupported');
                onEnd?.();
                return null;
            }
            // Start directly from the user's tap. SpeechRecognition manages its own
            // permission request; a separate getUserMedia prompt can lose activation.
            const generation = this.generation;
            const rec = this.getOrCreateInstance();
            const active = () => generation === this.generation;
            let delivered = false;
            this.isBusy = true;
            rec.onstart = () => { if(active()) onStart?.(); };
            rec.onresult = event => {
                if(!active() || delivered) return;
                const text = event.results?.[0]?.[0]?.transcript?.trim();
                if(text){delivered=true;onResult?.(text);}
            };
            rec.onerror = event => {
                if(!active())return;
                this.isBusy=false;
                const messages = {
                    'not-allowed':'Chưa được cấp quyền mic. Mở quyền của trang web trong trình duyệt, cho phép Micro rồi thử lại.',
                    'service-not-allowed':'Trình duyệt đang chặn dịch vụ nhận diện giọng nói.',
                    'no-speech':'Chưa nhận thấy lời nói. Hãy bấm mic và thử lại.',
                    'audio-capture':'Không truy cập được mic. Kiểm tra mic hoặc đóng ứng dụng khác đang sử dụng mic.',
                    'network':'Không kết nối được dịch vụ nhận diện giọng nói. Kiểm tra mạng rồi thử lại.',
                    'aborted':'Đã dừng nhận diện giọng nói.'
                };
                onError?.(messages[event.error] || 'Không khởi động được nhận diện giọng nói. Hãy thử lại.',event.error);
            };
            rec.onend = () => {
                if(!active())return;
                this.isBusy=false;this.sharedInstance=null;
                this.generation++;
                onEnd?.();
            };
            try { rec.start();return rec; }
            catch(err){this.stop();onError?.('Không mở được mic: '+err.message,'start-failed');onEnd?.();return null;}
        }

        /**
         * Practice speaking a specific Korean target text (Shadowing Practice).
         * Displays real-time accuracy scoring badge below the trigger button.
         */
        practiceSentence(targetText, btnElement, feedbackContainerId) {
            if (!btnElement) return;

            const feedbackEl = feedbackContainerId
                ? document.getElementById(feedbackContainerId)
                : btnElement.closest('.study-item')?.querySelector('.speech-feedback') ||
                  btnElement.parentElement.querySelector('.speech-feedback');

            // If already recording with this button, clicking stops it
            if (btnElement.classList.contains('recording')) {
                this.stop();
                btnElement.classList.remove('recording');
                if (feedbackEl) feedbackEl.innerHTML = '';
                return;
            }

            // Update UI to recording state
            btnElement.classList.add('recording');
            btnElement.title = 'Đang thu âm... Nhấn để dừng';

            if (feedbackEl) {
                feedbackEl.classList.remove('hidden');
                feedbackEl.innerHTML = `
                    <div class="speech-recording-indicator">
                        <span class="speech-pulse-dot"></span>
                        <span>Đang lắng nghe tiếng Hàn... Hãy nói to rõ!</span>
                    </div>
                `;
            }

            this.startRecognition({
                onResult: (spokenText) => {
                    const accuracy = calculateAccuracy(targetText, spokenText);
                    let badgeClass = 'excellent';
                    let badgeIcon = '🎉';
                    let badgeMsg = 'Xuất sắc!';

                    if (accuracy >= 85) {
                        badgeClass = 'excellent';
                        badgeIcon = '🌟';
                        badgeMsg = 'Xuất sắc!';
                    } else if (accuracy >= 65) {
                        badgeClass = 'good';
                        badgeIcon = '👍';
                        badgeMsg = 'Khá chuẩn!';
                    } else {
                        badgeClass = 'retry';
                        badgeIcon = '🔄';
                        badgeMsg = 'Cố gắng lên!';
                    }

                    if (feedbackEl) {
                        feedbackEl.innerHTML = `
                            <div class="speech-result-pill ${badgeClass}">
                                <div class="speech-result-main">
                                    <span class="speech-badge-score">${badgeIcon} ${accuracy}%</span>
                                    <span class="speech-badge-title">Độ khớp lời máy nhận dạng</span>
                                </div>
                                <div class="speech-transcript">
                                    <small>Máy nghe: <b>"${escHtml(spokenText)}"</b></small>
                                </div>
                            </div>
                        `;
                    }
                },
                onError: (errorMsg, errorCode) => {
                    if (feedbackEl) {
                        feedbackEl.innerHTML = `
                            <div class="speech-result-pill error">
                                <span>⚠️ ${errorMsg}</span>
                            </div>
                        `;
                    }
                },
                onEnd: () => {
                    btnElement.classList.remove('recording');
                    btnElement.title = 'Luyện phát âm câu này';
                }
            });
        }

        /**
         * Dictate Korean speech directly into an input or textarea element.
         */
        dictateToInput(inputId, btnElement) {
            const input = typeof inputId === 'string' ? document.getElementById(inputId) : inputId;
            if (!input || !btnElement) return;

            if (btnElement.classList.contains('recording')) {
                this.stop();
                btnElement.classList.remove('recording');
                return;
            }

            btnElement.classList.add('recording');
            const originalText = btnElement.innerHTML;
            btnElement.innerHTML = `<span class="speech-pulse-dot"></span> Đang nghe...`;

            this.startRecognition({
                onResult: (spokenText) => {
                    if (!spokenText) return;

                    // Append or insert at cursor
                    const start = input.selectionStart ?? input.value.length;
                    const end = input.selectionEnd ?? input.value.length;
                    const val = input.value;

                    // Add space if needed
                    const prefix = (start > 0 && val[start - 1] !== ' ' && val[start - 1] !== '\n') ? ' ' : '';
                    const insertStr = prefix + spokenText;

                    input.value = val.slice(0, start) + insertStr + val.slice(end);
                    const newPos = start + insertStr.length;
                    input.setSelectionRange(newPos, newPos);

                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                    input.focus();
                },
                onError: (errorMsg) => {
                    alert(`🎙️ ${errorMsg}`);
                },
                onEnd: () => {
                    btnElement.classList.remove('recording');
                    btnElement.innerHTML = originalText;
                }
            });
        }
    }

    function escHtml(str) {
        return (str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ─── SoundFX: Web Audio API Haptic Audio Feedback ───────────────
    class SoundFX {
        constructor() {
            this.ctx = null;
            this.enabled = localStorage.getItem('kla_sound_enabled') !== 'false';
        }

        initCtx() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        playCorrect() {
            if (!this.enabled) return;
            try {
                this.initCtx();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;

                // Soft bell chime (C5 -> G5)
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            } catch (e) { /* ignore */ }
        }

        playIncorrect() {
            if (!this.enabled) return;
            try {
                this.initCtx();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;

                // Soft low boop
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(164.81, now + 0.18);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
            } catch (e) { /* ignore */ }
        }

        playFanfare() {
            if (!this.enabled) return;
            try {
                this.initCtx();
                if (!this.ctx) return;
                const now = this.ctx.currentTime;
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const t = now + idx * 0.09;
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t);

                    gain.gain.setValueAtTime(0.001, t);
                    gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.25);
                });
            } catch (e) { /* ignore */ }
        }

        toggle() {
            this.enabled = !this.enabled;
            localStorage.setItem('kla_sound_enabled', String(this.enabled));
            return this.enabled;
        }
    }

    // ─── Native Audio CD Player Engine (Official SNU 1A CD Tracks) ────
    class KoreanNativeAudio {
        constructor() {
            this.audio = new Audio();
            this.currentTrack = null;
            this.isPlaying = false;
            this.listeners = [];
            this.speed = parseFloat(localStorage.getItem('kla_audio_speed') || '1.0');
            this.audio.playbackRate = this.speed;

            this.audio.addEventListener('play', () => {
                this.isPlaying = true;
                this.notify('play');
            });
            this.audio.addEventListener('pause', () => {
                this.isPlaying = false;
                this.notify('pause');
            });
            this.audio.addEventListener('ended', () => {
                this.isPlaying = false;
                this.notify('ended');
            });
            this.audio.addEventListener('timeupdate', () => {
                this.notify('timeupdate');
            });
            this.audio.addEventListener('loadedmetadata', () => {
                this.notify('loadedmetadata');
            });
            this.audio.addEventListener('error', (e) => {
                console.warn('Native audio error:', e);
                this.isPlaying = false;
                this.notify('error');
            });
        }

        playTrack(trackNumberOrFile) {
            let src = '';
            if (typeof trackNumberOrFile === 'number') {
                const numStr = String(trackNumberOrFile).padStart(2, '0');
                src = `audio/snu1a/track_${numStr}.mp3`;
            } else if (typeof trackNumberOrFile === 'string') {
                src = trackNumberOrFile.startsWith('audio/') ? trackNumberOrFile : `audio/snu1a/${trackNumberOrFile}`;
            }

            // Stop TTS if speaking
            if (window.KoreanVoice && window.KoreanVoice.tts) {
                window.KoreanVoice.tts.stop();
            }

            if (this.currentTrack === src && !this.audio.paused) {
                this.pause();
                return;
            }

            if (this.currentTrack !== src) {
                this.currentTrack = src;
                this.audio.src = src;
            }

            this.audio.playbackRate = this.speed;
            this.audio.play().catch(e => {
                console.warn('Audio play prevented or file not found:', e);
            });
        }

        pause() {
            this.audio.pause();
        }

        resume() {
            if (this.audio.src) {
                this.audio.play().catch(() => {});
            }
        }

        stop() {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
            this.notify('stop');
        }

        seek(seconds) {
            if (this.audio.duration) {
                this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, seconds));
            }
        }

        skip(secondsDelta) {
            if (this.audio.duration) {
                this.seek(this.audio.currentTime + secondsDelta);
            }
        }

        setSpeed(rate) {
            this.speed = rate;
            this.audio.playbackRate = rate;
            localStorage.setItem('kla_audio_speed', String(rate));
            this.notify('speedchange');
        }

        getSpeed() {
            return this.speed;
        }

        getCurrentTime() {
            return this.audio.currentTime || 0;
        }

        getDuration() {
            return this.audio.duration || 0;
        }

        getCurrentTrack() {
            return this.currentTrack;
        }

        onChange(callback) {
            this.listeners.push(callback);
        }

        notify(eventType) {
            this.listeners.forEach(cb => {
                try { cb(eventType, this); } catch (e) { /* ignore */ }
            });
        }
    }

    const nativeAudioInstance = new KoreanNativeAudio();

    window.KoreanSound = new SoundFX();

    // ─── Exported Global Instance ────────────────────────────────────
    window.KoreanVoice = {
        tts: new KoreanTTS(),
        stt: new KoreanSTT(),
        nativeAudio: nativeAudioInstance,

        // Native CD Audio methods
        playTrack: function (track) {
            this.nativeAudio.playTrack(track);
        },
        pauseTrack: function () {
            this.nativeAudio.pause();
        },
        stopTrack: function () {
            this.nativeAudio.stop();
        },
        skipTrack: function (delta) {
            this.nativeAudio.skip(delta);
        },
        setAudioSpeed: function (speed) {
            this.nativeAudio.setSpeed(speed);
        },

        // Convenience methods
        speak: function (text, options) {
            this.nativeAudio.stop();
            this.tts.speak(text, options);
        },
        stop: function () {
            this.tts.stop();
            this.stt.stop();
            this.nativeAudio.stop();
        },
        setRate: function (rate) {
            this.tts.setRate(rate);
        },
        getRate: function () {
            return this.tts.getRate();
        },
        playSequential: function (items, onProgress, onDone) {
            this.nativeAudio.stop();
            this.tts.playSequential(items, onProgress, onDone);
        },
        practiceSentence: function (targetText, btnElement, feedbackContainerId) {
            this.stt.practiceSentence(targetText, btnElement, feedbackContainerId);
        },
        dictateToInput: function (inputId, btnElement) {
            this.stt.dictateToInput(inputId, btnElement);
        },
        calculateAccuracy: calculateAccuracy
    };

})();
