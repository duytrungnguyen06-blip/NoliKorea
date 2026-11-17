/**
 * Korean Learning App (v3) — Virtual Keyboard (두벌식 2-Beolsik)
 * Feature: Korean Virtual Keyboard with Syllable Composition & Physical QWERTY Mapping
 */

(function () {
    'use strict';

    // ─── Hangul Unicode Tables ──────────────────────────────────────
    const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    const JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
    const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

    // Compound Vowels (중성 조합)
    const COMPOUND_VOWELS = {
        'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ',
        'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
        'ㅡㅣ': 'ㅢ'
    };

    // Compound Finals (종성 조합)
    const COMPOUND_FINALS = {
        'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ',
        'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ',
        'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ',
        'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ'
    };

    // Decompositions
    const DECOMPOSE_FINALS = {};
    for (const [pair, compound] of Object.entries(COMPOUND_FINALS)) {
        DECOMPOSE_FINALS[compound] = [pair[0], pair[1]];
    }

    const DECOMPOSE_VOWELS = {};
    for (const [pair, compound] of Object.entries(COMPOUND_VOWELS)) {
        DECOMPOSE_VOWELS[compound] = [pair[0], pair[1]];
    }

    // Physical QWERTY -> Hangul Jamo Mapping (두벌식)
    const QWERTY_HANGUL = {
        'q': 'ㅂ', 'Q': 'ㅃ',
        'w': 'ㅈ', 'W': 'ㅉ',
        'e': 'ㄷ', 'E': 'ㄸ',
        'r': 'ㄱ', 'R': 'ㄲ',
        't': 'ㅅ', 'T': 'ㅆ',
        'y': 'ㅛ', 'Y': 'ㅛ',
        'u': 'ㅕ', 'U': 'ㅕ',
        'i': 'ㅑ', 'I': 'ㅑ',
        'o': 'ㅐ', 'O': 'ㅒ',
        'p': 'ㅔ', 'P': 'ㅖ',
        'a': 'ㅁ', 'A': 'ㅁ',
        's': 'ㄴ', 'S': 'ㄴ',
        'd': 'ㅇ', 'D': 'ㅇ',
        'f': 'ㄹ', 'F': 'ㄹ',
        'g': 'ㅎ', 'G': 'ㅎ',
        'h': 'ㅗ', 'H': 'ㅗ',
        'j': 'ㅓ', 'J': 'ㅓ',
        'k': 'ㅏ', 'K': 'ㅏ',
        'l': 'ㅣ', 'L': 'ㅣ',
        'z': 'ㅋ', 'Z': 'ㅋ',
        'x': 'ㅌ', 'X': 'ㅌ',
        'c': 'ㅊ', 'C': 'ㅊ',
        'v': 'ㅍ', 'V': 'ㅍ',
        'b': 'ㅠ', 'B': 'ㅠ',
        'n': 'ㅜ', 'N': 'ㅜ',
        'm': 'ㅡ', 'M': 'ㅡ'
    };

    // ─── Syllable Decomposition Helper ──────────────────────────────
    function decomposeChar(ch) {
        if (!ch) return null;
        const code = ch.charCodeAt(0) - 0xAC00;
        if (code >= 0 && code <= 11171) {
            const jong = code % 28;
            const jung = Math.floor(code / 28) % 21;
            const cho = Math.floor(code / (28 * 21));
            return {
                cho: CHOSUNG[cho],
                jung: JUNGSUNG[jung],
                jong: JONGSUNG[jong] || ''
            };
        }
        return null;
    }

    function makeChar(choIdx, jungIdx, jongIdx = 0) {
        if (choIdx < 0 || jungIdx < 0) return '';
        return String.fromCharCode(0xAC00 + (choIdx * 21 + jungIdx) * 28 + jongIdx);
    }

    // ─── Hangul Composer State Machine ──────────────────────────────
    class HangulComposer {
        constructor() {
            this.reset();
        }

        reset() {
            this.cho = -1;
            this.jung = -1;
            this.jong = 0;
            this.standalone = '';
        }

        isActive() {
            return this.cho !== -1 || this.jung !== -1 || !!this.standalone;
        }

        currentChar() {
            if (this.cho !== -1 && this.jung !== -1) {
                return makeChar(this.cho, this.jung, this.jong);
            }
            if (this.cho !== -1) return CHOSUNG[this.cho];
            if (this.jung !== -1) return JUNGSUNG[this.jung];
            if (this.standalone) return this.standalone;
            return '';
        }

        /**
         * Returns an action description:
         * { type: 'update'|'commit_and_start', replaceLength: number, char: string, prevChar?: string }
         */
        typeJamo(jamo) {
            const isCho = CHOSUNG.includes(jamo);
            const isJung = JUNGSUNG.includes(jamo);

            // Case A: Consonant typed
            if (isCho) {
                // If currently empty
                if (this.cho === -1 && this.jung === -1 && !this.standalone) {
                    this.cho = CHOSUNG.indexOf(jamo);
                    return { type: 'update', char: this.currentChar(), isNew: true };
                }

                // If only standalone vowel/consonant
                if (this.standalone) {
                    const commitChar = this.standalone;
                    this.reset();
                    this.cho = CHOSUNG.indexOf(jamo);
                    return { type: 'commit_and_start', prevChar: commitChar, char: this.currentChar() };
                }

                // If only chosung currently
                if (this.cho !== -1 && this.jung === -1) {
                    const commitChar = CHOSUNG[this.cho];
                    this.reset();
                    this.cho = CHOSUNG.indexOf(jamo);
                    return { type: 'commit_and_start', prevChar: commitChar, char: this.currentChar() };
                }

                // If cho + jung, no jong yet
                if (this.cho !== -1 && this.jung !== -1 && this.jong === 0) {
                    if (JONGSUNG.includes(jamo)) {
                        this.jong = JONGSUNG.indexOf(jamo);
                        return { type: 'update', char: this.currentChar() };
                    } else {
                        // Cannot be final consonant (e.g. ㅃ, ㄸ, ㅉ)
                        const commitChar = this.currentChar();
                        this.reset();
                        this.cho = CHOSUNG.indexOf(jamo);
                        return { type: 'commit_and_start', prevChar: commitChar, char: this.currentChar() };
                    }
                }

                // If cho + jung + jong (try to combine into compound final)
                if (this.cho !== -1 && this.jung !== -1 && this.jong !== 0) {
                    const curJongChar = JONGSUNG[this.jong];
                    const pair = curJongChar + jamo;
                    if (COMPOUND_FINALS[pair]) {
                        this.jong = JONGSUNG.indexOf(COMPOUND_FINALS[pair]);
                        return { type: 'update', char: this.currentChar() };
                    } else {
                        const commitChar = this.currentChar();
                        this.reset();
                        this.cho = CHOSUNG.indexOf(jamo);
                        return { type: 'commit_and_start', prevChar: commitChar, char: this.currentChar() };
                    }
                }
            }

            // Case B: Vowel typed
            if (isJung) {
                // If currently empty
                if (this.cho === -1 && this.jung === -1 && !this.standalone) {
                    this.jung = JUNGSUNG.indexOf(jamo);
                    return { type: 'update', char: this.currentChar(), isNew: true };
                }

                // If only standalone vowel, try compound
                if (this.cho === -1 && this.jung !== -1) {
                    const curJungChar = JUNGSUNG[this.jung];
                    const pair = curJungChar + jamo;
                    if (COMPOUND_VOWELS[pair]) {
                        this.jung = JUNGSUNG.indexOf(COMPOUND_VOWELS[pair]);
                        return { type: 'update', char: this.currentChar() };
                    } else {
                        const commitChar = curJungChar;
                        this.reset();
                        this.jung = JUNGSUNG.indexOf(jamo);
                        return { type: 'commit_and_start', prevChar: commitChar, char: this.currentChar() };
                    }
                }

                // If only cho
                if (this.cho !== -1 && this.jung === -1) {
                    this.jung = JUNGSUNG.indexOf(jamo);
                    return { type: 'update', char: this.currentChar() };
                }

                // If cho + jung and no jong yet, try compound vowel
                if (this.cho !== -1 && this.jung !== -1 && this.jong === 0) {
                    const curJungChar = JUNGSUNG[this.jung];
                    const pair = curJungChar + jamo;
                    if (COMPOUND_VOWELS[pair]) {
                        this.jung = JUNGSUNG.indexOf(COMPOUND_VOWELS[pair]);
                        return { type: 'update', char: this.currentChar() };
                    } else {
                        const commitChar = this.currentChar();
                        this.reset();
                        this.jung = JUNGSUNG.indexOf(jamo);
                        return { type: 'commit_and_start', prevChar: commitChar, char: this.currentChar() };
                    }
                }

                // If cho + jung + jong, and another vowel arrives -> SYLLABLE SPLIT!
                if (this.cho !== -1 && this.jung !== -1 && this.jong !== 0) {
                    const curJongChar = JONGSUNG[this.jong];
                    if (DECOMPOSE_FINALS[curJongChar]) {
                        const [first, second] = DECOMPOSE_FINALS[curJongChar];
                        this.jong = JONGSUNG.indexOf(first);
                        const prevChar = this.currentChar();

                        this.reset();
                        this.cho = CHOSUNG.indexOf(second);
                        this.jung = JUNGSUNG.indexOf(jamo);
                        return { type: 'commit_and_start', prevChar: prevChar, char: this.currentChar() };
                    } else {
                        this.jong = 0;
                        const prevChar = this.currentChar();

                        this.reset();
                        this.cho = CHOSUNG.indexOf(curJongChar);
                        this.jung = JUNGSUNG.indexOf(jamo);
                        return { type: 'commit_and_start', prevChar: prevChar, char: this.currentChar() };
                    }
                }
            }

            // Non-jamo fallback
            const commitChar = this.currentChar();
            this.reset();
            return { type: 'commit_and_start', prevChar: commitChar, char: jamo };
        }

        /**
         * Decomposes the current composing state by one step.
         * Returns true if there is still something composing, false if emptied.
         */
        backspace() {
            if (this.jong !== 0) {
                const curJongChar = JONGSUNG[this.jong];
                if (DECOMPOSE_FINALS[curJongChar]) {
                    this.jong = JONGSUNG.indexOf(DECOMPOSE_FINALS[curJongChar][0]);
                } else {
                    this.jong = 0;
                }
                return true;
            }

            if (this.jung !== -1) {
                const curJungChar = JUNGSUNG[this.jung];
                if (DECOMPOSE_VOWELS[curJungChar]) {
                    this.jung = JUNGSUNG.indexOf(DECOMPOSE_VOWELS[curJungChar][0]);
                } else {
                    this.jung = -1;
                }
                return this.cho !== -1;
            }

            if (this.cho !== -1) {
                this.cho = -1;
                return false;
            }

            if (this.standalone) {
                this.standalone = '';
                return false;
            }

            return false;
        }
    }

    // ─── Virtual Keyboard Manager ───────────────────────────────────
    class VirtualKeyboardManager {
        constructor() {
            this.composer = new HangulComposer();
            this.activeTarget = null;
            this.isShift = false;
            this.isCaps = false;
            this.composingTarget = null;
            this.compStartIndex = -1;
            this.compLength = 0;

            this.initDOM();
            this.initListeners();
        }

        // ─── DOM Creation ───────────────────────────────────────────
        initDOM() {
            if (document.getElementById('koreanVirtualKeyboard')) return;

            // Floating Toggle Button (FAB)
            const fab = document.createElement('button');
            fab.id = 'vkFabBtn';
            fab.className = 'vk-fab';
            fab.setAttribute('title', 'Bật/Tắt bàn phím tiếng Hàn (Ctrl+K)');
            fab.innerHTML = `
                <span class="vk-fab-icon">⌨️</span>
                <span class="vk-fab-text">한글</span>
            `;
            document.body.appendChild(fab);

            // Virtual Keyboard Panel
            const panel = document.createElement('div');
            panel.id = 'koreanVirtualKeyboard';
            panel.className = 'virtual-keyboard hidden';
            panel.innerHTML = `
                <div class="vk-header">
                    <div class="vk-title">
                        <span class="vk-badge">한글</span>
                        <span class="vk-title-text">Bàn phím tiếng Hàn · 두벌식</span>
                    </div>
                    <div class="vk-preview-wrap">
                        <span class="vk-preview-label">Đang gõ:</span>
                        <span class="vk-preview-char" id="vkPreviewChar">—</span>
                    </div>
                    <div class="vk-controls">
                        <button type="button" class="vk-btn-icon" id="vkCloseBtn" title="Đóng bàn phím (Esc)">✕</button>
                    </div>
                </div>
                <div class="vk-body" id="vkKeyRows">
                    <!-- Rows generated dynamically -->
                </div>
                <div class="vk-footer">
                    <div class="vk-tips">
                        <span>💡 <b>Mẹo:</b> Nhấn <b>Ctrl+K</b> để bật/tắt nhanh bàn phím ảo · Nhấp chuột vào các phím để gõ</span>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);

            this.renderKeys();
        }

        renderKeys() {
            const rowsContainer = document.getElementById('vkKeyRows');
            if (!rowsContainer) return;

            // Standard Korean 2-Beolsik Layout Definition
            const layout = [
                // Row 1: Numbers
                [
                    { normal: '1', shift: '!', en: '1' },
                    { normal: '2', shift: '@', en: '2' },
                    { normal: '3', shift: '#', en: '3' },
                    { normal: '4', shift: '$', en: '4' },
                    { normal: '5', shift: '%', en: '5' },
                    { normal: '6', shift: '^', en: '6' },
                    { normal: '7', shift: '&', en: '7' },
                    { normal: '8', shift: '*', en: '8' },
                    { normal: '9', shift: '(', en: '9' },
                    { normal: '0', shift: ')', en: '0' },
                    { normal: '-', shift: '_', en: '-' },
                    { normal: '=', shift: '+', en: '=' },
                    { action: 'backspace', label: '⌫', width: '1.4', class: 'vk-key-action' }
                ],
                // Row 2: QWERTY Row
                [
                    { normal: 'ㅂ', shift: 'ㅃ', en: 'Q', type: 'consonant' },
                    { normal: 'ㅈ', shift: 'ㅉ', en: 'W', type: 'consonant' },
                    { normal: 'ㄷ', shift: 'ㄸ', en: 'E', type: 'consonant' },
                    { normal: 'ㄱ', shift: 'ㄲ', en: 'R', type: 'consonant' },
                    { normal: 'ㅅ', shift: 'ㅆ', en: 'T', type: 'consonant' },
                    { normal: 'ㅛ', shift: 'ㅛ', en: 'Y', type: 'vowel' },
                    { normal: 'ㅕ', shift: 'ㅕ', en: 'U', type: 'vowel' },
                    { normal: 'ㅑ', shift: 'ㅑ', en: 'I', type: 'vowel' },
                    { normal: 'ㅐ', shift: 'ㅒ', en: 'O', type: 'vowel' },
                    { normal: 'ㅔ', shift: 'ㅖ', en: 'P', type: 'vowel' },
                    { normal: '[', shift: '{', en: '[' },
                    { normal: ']', shift: '}', en: ']' }
                ],
                // Row 3: ASDF Row
                [
                    { action: 'caps', label: 'Caps', width: '1.25', class: 'vk-key-action', id: 'vkCapsKey' },
                    { normal: 'ㅁ', shift: 'ㅁ', en: 'A', type: 'consonant' },
                    { normal: 'ㄴ', shift: 'ㄴ', en: 'S', type: 'consonant' },
                    { normal: 'ㅇ', shift: 'ㅇ', en: 'D', type: 'consonant' },
                    { normal: 'ㄹ', shift: 'ㄹ', en: 'F', type: 'consonant' },
                    { normal: 'ㅎ', shift: 'ㅎ', en: 'G', type: 'consonant' },
                    { normal: 'ㅗ', shift: 'ㅗ', en: 'H', type: 'vowel' },
                    { normal: 'ㅓ', shift: 'ㅓ', en: 'J', type: 'vowel' },
                    { normal: 'ㅏ', shift: 'ㅏ', en: 'K', type: 'vowel' },
                    { normal: 'ㅣ', shift: 'ㅣ', en: 'L', type: 'vowel' },
                    { normal: ';', shift: ':', en: ';' },
                    { action: 'enter', label: '↵ Enter', width: '1.45', class: 'vk-key-primary' }
                ],
                // Row 4: ZXCV Row
                [
                    { action: 'shift', label: '⇧ Shift', width: '1.5', class: 'vk-key-action', id: 'vkShiftKey' },
                    { normal: 'ㅋ', shift: 'ㅋ', en: 'Z', type: 'consonant' },
                    { normal: 'ㅌ', shift: 'ㅌ', en: 'X', type: 'consonant' },
                    { normal: 'ㅍ', shift: 'ㅍ', en: 'C', type: 'consonant' },
                    { normal: 'ㅊ', shift: 'ㅊ', en: 'V', type: 'consonant' },
                    { normal: 'ㅠ', shift: 'ㅠ', en: 'B', type: 'vowel' },
                    { normal: 'ㅜ', shift: 'ㅜ', en: 'N', type: 'vowel' },
                    { normal: 'ㅡ', shift: 'ㅡ', en: 'M', type: 'vowel' },
                    { normal: ',', shift: '<', en: ',' },
                    { normal: '.', shift: '>', en: '.' },
                    { normal: '?', shift: '!', en: '?' }
                ],
                // Row 5: Action Row
                [
                    { action: 'clear', label: '🗑️ Xóa ô', width: '1.2', class: 'vk-key-danger' },
                    { action: 'space', label: '␣ Dấu cách (Space)', width: '3.6', class: 'vk-key-space' },
                    { action: 'commit', label: 'Xong âm', width: '1.1', class: 'vk-key-action' },
                    { action: 'close', label: '✕ Thu gọn', width: '1.1', class: 'vk-key-action' }
                ]
            ];

            let html = '';
            layout.forEach(row => {
                html += '<div class="vk-row">';
                row.forEach(k => {
                    const widthStyle = k.width ? `style="flex-grow:${k.width}"` : '';
                    const idAttr = k.id ? `id="${k.id}"` : '';
                    const cls = ['vk-key', k.class || '', k.type ? `vk-key-${k.type}` : ''].filter(Boolean).join(' ');

                    if (k.action) {
                        html += `
                            <button type="button" class="${cls}" data-action="${k.action}" ${widthStyle} ${idAttr}>
                                <span>${k.label}</span>
                            </button>
                        `;
                    } else {
                        const hasAlt = k.shift && k.shift !== k.normal;
                        html += `
                            <button type="button" class="${cls}" data-normal="${k.normal}" data-shift="${k.shift || k.normal}" ${widthStyle}>
                                ${k.en ? `<span class="vk-key-en">${k.en}</span>` : ''}
                                ${hasAlt ? `<span class="vk-key-alt">${k.shift}</span>` : ''}
                                <span class="vk-key-main">${this.isShift ? (k.shift || k.normal) : k.normal}</span>
                            </button>
                        `;
                    }
                });
                html += '</div>';
            });

            rowsContainer.innerHTML = html;
            this.bindKeyEvents();
        }

        updateKeyLabels() {
            const shiftActive = this.isShift || this.isCaps;
            document.querySelectorAll('.vk-key[data-normal]').forEach(btn => {
                const mainSpan = btn.querySelector('.vk-key-main');
                if (mainSpan) {
                    mainSpan.textContent = shiftActive ? btn.dataset.shift : btn.dataset.normal;
                }
            });

            const shiftBtn = document.getElementById('vkShiftKey');
            if (shiftBtn) shiftBtn.classList.toggle('active', this.isShift);

            const capsBtn = document.getElementById('vkCapsKey');
            if (capsBtn) capsBtn.classList.toggle('active', this.isCaps);
        }

        // ─── Event Listeners ─────────────────────────────────────────
        initListeners() {
            // FAB Toggle
            const fab = document.getElementById('vkFabBtn');
            if (fab) fab.onclick = () => this.toggle();

            // Close Button
            const closeBtn = document.getElementById('vkCloseBtn');
            if (closeBtn) closeBtn.onclick = () => this.close();

            // Track Focused Input/Textarea globally
            document.addEventListener('focusin', (e) => {
                if (this.isEligibleInput(e.target)) {
                    if (this.activeTarget !== e.target) {
                        this.commitComposition();
                        this.activeTarget = e.target;
                    }
                }
            });

            // If user clicks anywhere inside the target, commit composition to reset index
            document.addEventListener('click', (e) => {
                if (this.isEligibleInput(e.target) && e.target === this.activeTarget) {
                    this.commitComposition();
                }
            });

            // Global Keydown (Shortcuts & Hardware Keyboard Interception)
            document.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
        }

        bindKeyEvents() {
            document.querySelectorAll('.vk-key').forEach(btn => {
                // Use mousedown with preventDefault so active input does not blur!
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    btn.classList.add('pressed');

                    if (btn.dataset.action) {
                        this.handleAction(btn.dataset.action);
                    } else {
                        const shiftActive = this.isShift || this.isCaps;
                        const char = shiftActive ? btn.dataset.shift : btn.dataset.normal;
                        this.handleCharInput(char);

                        // Auto un-shift unless Caps is on
                        if (this.isShift && !this.isCaps) {
                            this.isShift = false;
                            this.updateKeyLabels();
                        }
                    }
                });

                btn.addEventListener('mouseup', () => btn.classList.remove('pressed'));
                btn.addEventListener('mouseleave', () => btn.classList.remove('pressed'));
            });
        }

        isEligibleInput(el) {
            if (!el) return false;
            const tag = el.tagName ? el.tagName.toLowerCase() : '';
            if (tag === 'textarea') return true;
            if (tag === 'input') {
                const type = (el.type || 'text').toLowerCase();
                return type === 'text' || type === 'search' || type === '';
            }
            return false;
        }

        getTarget() {
            if (this.activeTarget && document.body.contains(this.activeTarget)) {
                return this.activeTarget;
            }

            // Smart fallback: Study Modal active input
            const studyModal = document.getElementById('studyModal');
            if (studyModal && studyModal.classList.contains('active')) {
                const recallTab = document.getElementById('recallTab');
                if (recallTab && recallTab.classList.contains('active')) {
                    const blank = recallTab.querySelector('.blank-input');
                    if (blank) {
                        this.activeTarget = blank;
                        blank.focus();
                        return blank;
                    }
                }
                const prodTab = document.getElementById('productionTab');
                if (prodTab && prodTab.classList.contains('active')) {
                    const prod = prodTab.querySelector('.production-input');
                    if (prod) {
                        this.activeTarget = prod;
                        prod.focus();
                        return prod;
                    }
                }
            }

            // Fallback: Lesson Modal
            const lessonModal = document.getElementById('lessonModal');
            if (lessonModal && lessonModal.classList.contains('active')) {
                const input = lessonModal.querySelector('input[type="text"]:focus, textarea:focus') ||
                              lessonModal.querySelector('input[type="text"], textarea');
                if (input) {
                    this.activeTarget = input;
                    input.focus();
                    return input;
                }
            }

            return null;
        }

        // ─── Input & Composition Operations ─────────────────────────
        handleCharInput(char) {
            const target = this.getTarget();
            if (!target) return;

            // Ensure target is focused
            if (document.activeElement !== target) target.focus();

            const isHangulJamo = CHOSUNG.includes(char) || JUNGSUNG.includes(char);

            if (!isHangulJamo) {
                // Directly insert non-Hangul char (numbers, symbols)
                this.commitComposition();
                this.insertRawAtCursor(target, char);
                this.updatePreview();
                return;
            }

            // Hangul Composition
            if (this.composingTarget !== target || this.compStartIndex === -1) {
                this.commitComposition();
                this.composingTarget = target;
                this.compStartIndex = target.selectionStart ?? target.value.length;
                this.compLength = 0;
            }

            const step = this.composer.typeJamo(char);

            if (step.type === 'update') {
                const val = target.value;
                const before = val.slice(0, this.compStartIndex);
                const after = val.slice(this.compStartIndex + this.compLength);
                target.value = before + step.char + after;
                this.compLength = step.char.length;
                const newPos = this.compStartIndex + this.compLength;
                target.setSelectionRange(newPos, newPos);
            } else if (step.type === 'commit_and_start') {
                const val = target.value;
                const before = val.slice(0, this.compStartIndex);
                const after = val.slice(this.compStartIndex + this.compLength);

                const prevStr = step.prevChar || '';
                const newStr = step.char || '';

                target.value = before + prevStr + newStr + after;

                this.compStartIndex = this.compStartIndex + prevStr.length;
                this.compLength = newStr.length;

                const newPos = this.compStartIndex + this.compLength;
                target.setSelectionRange(newPos, newPos);
            }

            this.triggerChangeEvents(target);
            this.updatePreview();
        }

        handleBackspace() {
            const target = this.getTarget();
            if (!target) return;

            if (document.activeElement !== target) target.focus();

            // If composing, let composer decompose
            if (this.composingTarget === target && this.compStartIndex !== -1 && this.composer.isActive()) {
                const hasMore = this.composer.backspace();
                const val = target.value;
                const before = val.slice(0, this.compStartIndex);
                const after = val.slice(this.compStartIndex + this.compLength);

                if (hasMore) {
                    const char = this.composer.currentChar();
                    target.value = before + char + after;
                    this.compLength = char.length;
                    const pos = this.compStartIndex + this.compLength;
                    target.setSelectionRange(pos, pos);
                } else {
                    target.value = before + after;
                    this.compLength = 0;
                    target.setSelectionRange(this.compStartIndex, this.compStartIndex);
                    this.commitComposition();
                }

                this.triggerChangeEvents(target);
                this.updatePreview();
                return;
            }

            // Normal Backspace
            const start = target.selectionStart ?? target.value.length;
            const end = target.selectionEnd ?? target.value.length;

            if (start !== end) {
                // Delete selected range
                const val = target.value;
                target.value = val.slice(0, start) + val.slice(end);
                target.setSelectionRange(start, start);
                this.commitComposition();
            } else if (start > 0) {
                // Try reverse decomposition on previous Hangul character
                const val = target.value;
                const prevChar = val[start - 1];
                const decomp = decomposeChar(prevChar);

                if (decomp) {
                    // Start composing in place of that character!
                    this.composingTarget = target;
                    this.compStartIndex = start - 1;
                    this.compLength = 1;
                    this.composer.reset();
                    this.composer.cho = CHOSUNG.indexOf(decomp.cho);
                    this.composer.jung = JUNGSUNG.indexOf(decomp.jung);
                    this.composer.jong = decomp.jong ? JONGSUNG.indexOf(decomp.jong) : 0;

                    this.handleBackspace();
                    return;
                } else {
                    target.value = val.slice(0, start - 1) + val.slice(start);
                    target.setSelectionRange(start - 1, start - 1);
                    this.commitComposition();
                }
            }

            this.triggerChangeEvents(target);
            this.updatePreview();
        }

        handleSpace() {
            const target = this.getTarget();
            if (!target) return;
            this.commitComposition();
            this.insertRawAtCursor(target, ' ');
            this.updatePreview();
        }

        handleEnter() {
            const target = this.getTarget();
            if (!target) return;
            this.commitComposition();

            if (target.tagName.toLowerCase() === 'textarea') {
                this.insertRawAtCursor(target, '\n');
            } else {
                // Single line input: trigger Enter / submit or check answer if in Recall
                target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
                const checkBtn = target.closest('.recall-item')?.querySelector('button');
                if (checkBtn) checkBtn.click();
            }
            this.updatePreview();
        }

        handleClear() {
            const target = this.getTarget();
            if (!target) return;
            this.commitComposition();
            target.value = '';
            target.setSelectionRange(0, 0);
            this.triggerChangeEvents(target);
            this.updatePreview();
        }

        handleAction(action) {
            switch (action) {
                case 'shift':
                    this.isShift = !this.isShift;
                    this.updateKeyLabels();
                    break;
                case 'caps':
                    this.isCaps = !this.isCaps;
                    this.updateKeyLabels();
                    break;
                case 'backspace':
                    this.handleBackspace();
                    break;
                case 'space':
                    this.handleSpace();
                    break;
                case 'enter':
                    this.handleEnter();
                    break;
                case 'clear':
                    this.handleClear();
                    break;
                case 'commit':
                    this.commitComposition();
                    this.updatePreview();
                    break;
                case 'close':
                    this.close();
                    break;
            }
        }

        commitComposition() {
            this.composer.reset();
            this.composingTarget = null;
            this.compStartIndex = -1;
            this.compLength = 0;
            this.updatePreview();
        }

        insertRawAtCursor(target, str) {
            const start = target.selectionStart ?? target.value.length;
            const end = target.selectionEnd ?? target.value.length;
            const val = target.value;
            target.value = val.slice(0, start) + str + val.slice(end);
            const pos = start + str.length;
            target.setSelectionRange(pos, pos);
            this.triggerChangeEvents(target);
        }

        triggerChangeEvents(target) {
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
        }

        updatePreview() {
            const el = document.getElementById('vkPreviewChar');
            if (!el) return;
            const char = this.composer.currentChar();
            el.textContent = char || '—';
            el.classList.toggle('has-char', !!char);
        }

        // ─── Keyboard Shortcuts ────────────────────────────────────
        handleGlobalKeyDown(e) {
            // Toggle shortcut: Ctrl+K or Alt+K
            if ((e.ctrlKey || e.altKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                this.toggle();
                return;
            }

            // Escape key closes virtual keyboard
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
                return;
            }

            // Commit any composing syllable if user types on physical keyboard
            if (this.isOpen() && this.composer.isActive() && !e.ctrlKey && !e.altKey && !e.metaKey) {
                this.commitComposition();
            }
        }

        // ─── Visibility Controls ─────────────────────────────────────
        isOpen() {
            const panel = document.getElementById('koreanVirtualKeyboard');
            return panel && !panel.classList.contains('hidden');
        }

        open() {
            const panel = document.getElementById('koreanVirtualKeyboard');
            const fab = document.getElementById('vkFabBtn');
            if (panel) {
                panel.classList.remove('hidden');
                panel.classList.add('visible');
            }
            if (fab) fab.classList.add('active');

            // Set focus to target if available
            const target = this.getTarget();
            if (target) target.focus();

            this.updatePreview();
        }

        close() {
            const panel = document.getElementById('koreanVirtualKeyboard');
            const fab = document.getElementById('vkFabBtn');
            this.commitComposition();
            if (panel) {
                panel.classList.add('hidden');
                panel.classList.remove('visible');
            }
            if (fab) fab.classList.remove('active');
        }

        toggle() {
            if (this.isOpen()) {
                this.close();
            } else {
                this.open();
            }
        }
    }

    // ─── Global Instance Initialization ──────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        window.KoreanKeyboard = new VirtualKeyboardManager();
    });

})();
