/**
 * Korean Learning App (v3) — Advanced Active Recall Engine
 * 4 Rich Exercise Variations:
 * 1. 🎯 Trắc nghiệm phản xạ 4 đáp án (Hàn-Việt & Việt-Hàn)
 * 2. 🔀 Ghép thẻ từ xáo trộn (Sentence Scramble)
 * 3. 🔤 Điền từ vào chỗ trống (Cloze test từ ví dụ)
 * 4. ✍️ Thử thách tự nhớ & gõ từ (Active Recall Typing)
 */

(function () {
    'use strict';

    // ─── Utility Helpers ─────────────────────────────────────────────
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function cleanStr(s) {
        return (s || '')
            .replace(/___/g, '')
            .replace(/[\s.,?!~·:;'"()\[\]{}]+/g, ' ')
            .trim();
    }

    function esc(s) {
        return (s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ─── Recall Engine Class ─────────────────────────────────────────
    class RecallEngine {
        constructor() {
            this.exercises = [];
            this.currentFilter = 'all'; // 'all' | 'choice' | 'scramble' | 'cloze' | 'typing'
            this.lesson = null;
            this.db = null;
            this.stats = { correct: 0, total: 0 };
        }

        /**
         * Generates diverse exercises combining all items and custom examples.
         */
        buildExercises(lesson, db) {
            this.lesson = lesson;
            this.db = db;
            this.stats = { correct: 0, total: 0 };
            const exList = [];

            const items = (lesson.items || []).filter(it => it.korean && it.vi);
            const allItemsPool = [];

            // Collect global pool of distractor words from all stages & books
            if (db && db.stages) {
                db.stages.forEach(s => {
                    s.books.forEach(b => {
                        b.lessons.forEach(l => {
                            (l.items || []).forEach(it => {
                                if (it.korean && it.vi) allItemsPool.push(it);
                            });
                        });
                    });
                });
            }

            // Pool of items for distractors (prefer lesson items, fallback to allItems)
            const distractorPool = allItemsPool.length >= 4 ? allItemsPool : items;

            // ─── 1. Multiple Choice Questions (🎯 Trắc nghiệm) ───
            items.forEach((item, idx) => {
                // 1A. Korean -> Vietnamese (even indices)
                if (idx % 2 === 0) {
                    const distractors = KLALearning.distractors(item, distractorPool, "vi", 3);
                    const options = shuffle([...distractors, item.vi]);
                    exList.push({
                        id: `choice_kv_${idx}`,
                        type: 'choice',
                        typeName: '🎯 Trắc nghiệm',
                        prompt: item.korean,
                        promptLang: 'ko',
                        subPrompt: 'Chọn nghĩa tiếng Việt chính xác:',
                        correct: item.vi,
                        koreanAudio: item.korean,
                        options: options,
                        state: 'unanswered',
                        userAnswer: null
                    });
                }
                // 1B. Vietnamese -> Korean (odd indices)
                else {
                    const distractors = KLALearning.distractors(item, distractorPool, "korean", 3);
                    const options = shuffle([...distractors, item.korean]);
                    exList.push({
                        id: `choice_vk_${idx}`,
                        type: 'choice',
                        typeName: '🎯 Trắc nghiệm',
                        prompt: item.vi,
                        promptLang: 'vi',
                        subPrompt: 'Chọn từ / mẫu câu tiếng Hàn đúng:',
                        correct: item.korean,
                        koreanAudio: item.korean,
                        options: options,
                        state: 'unanswered',
                        userAnswer: null
                    });
                }
            });

            // ─── 2. Sentence / Word Scramble (🔀 Ghép thẻ từ) ───
            // Only for items that have 2 or more words
            const multiWordItems = items.filter(it => !/[()\/]/.test(it.korean) && it.korean.trim().split(/\s+/).length >= 2);
            multiWordItems.forEach((item, idx) => {
                const words = item.korean.trim().split(/\s+/);
                // Ensure tokens are shuffled and not identical to original
                let tokens = shuffle(words);
                if (tokens.join(' ') === words.join(' ') && words.length > 2) {
                    tokens.reverse();
                }
                exList.push({
                    id: `scramble_${idx}`,
                    type: 'scramble',
                    typeName: '🔀 Ghép câu',
                    prompt: item.vi,
                    promptLang: 'vi',
                    subPrompt: 'Bấm chọn các thẻ từ để sắp xếp thành câu tiếng Hàn hoàn chỉnh:',
                    correct: item.korean.trim(),
                    koreanAudio: item.korean,
                    tokens: tokens,
                    selectedIndices: [],
                    state: 'unanswered'
                });
            });

            // ─── 3. Fill-in-the-blank (🔤 Điền từ - Smart Cloze Generator) ───
            if (lesson.examples) {
                const lines = lesson.examples.split('\n').map(l => l.trim()).filter(Boolean);
                lines.forEach((line, idx) => {
                    let sentence = line;
                    let targetWord = '';
                    let hint = '';

                    if (line.includes('|')) {
                        const parts = line.split('|');
                        sentence = parts[0].trim();
                        targetWord = (parts[1] || '').trim();
                        hint = (parts[2] || targetWord).trim();
                    } else if (line.includes('___')) {
                        sentence = line;
                    } else {
                        // Smart matching: pick a key vocabulary word from lesson.items appearing in the sentence
                        const matchedItem = items
                            .filter(it => it.korean && it.korean.length >= 2 && sentence.includes(it.korean))
                            .sort((a, b) => b.korean.length - a.korean.length)[0];

                        if (matchedItem) {
                            targetWord = matchedItem.korean;
                            sentence = sentence.replace(targetWord, '[ ___ ]');
                            hint = matchedItem.vi || matchedItem.en || '';
                        }
                    }

                    if (sentence.includes('___') && targetWord) {
                        exList.push({
                            id: `cloze_${idx}`,
                            type: 'cloze',
                            typeName: '🔤 Điền từ',
                            prompt: sentence,
                            hint: hint,
                            subPrompt: 'Điền từ còn thiếu vào vị trí [ ___ ]:',
                            correct: targetWord,
                            koreanAudio: line.replace(/[|].*$/, ''),
                            state: 'unanswered'
                        });
                    }
                });
            }

            // ─── 4. Active Recall Typing (✍️ Gõ từ nhớ) ───
            // Pick subset of items (first 4) for typing test
            const typingCandidates = items.slice(0, 5);
            typingCandidates.forEach((item, idx) => {
                exList.push({
                    id: `typing_${idx}`,
                    type: 'typing',
                    typeName: '✍️ Gõ từ nhớ',
                    prompt: item.vi,
                    subPrompt: 'Tự nhớ và viết từ tiếng Hàn tương ứng:',
                    correct: item.korean.trim(),
                    hint: item.korean.trim()[0] + '...',
                    koreanAudio: item.korean,
                    state: 'unanswered'
                });
            });

            // Shuffle all exercises so they alternate interestingly
            this.exercises = shuffle(exList);
            return this.exercises;
        }

        getDistractors(correctValue, allPool, count = 3) {
            const uniqueOther = [...new Set(allPool)].filter(v => v && v.trim() !== correctValue.trim());
            return shuffle(uniqueOther).slice(0, count);
        }

        setFilter(filter) {
            this.currentFilter = filter;
            this.render();
        }

        resetSession() {
            if (this.lesson && this.db) {
                this.buildExercises(this.lesson, this.db);
                this.render();
            }
        }

        // ─── Answer Checkers ─────────────────────────────────────────

        checkChoice(exId, selectedOption, btnEl) {
            const ex = this.exercises.find(e => e.id === exId);
            if (!ex || ex.state !== 'unanswered') return;

            ex.userAnswer = selectedOption;
            const isCorrect = cleanStr(selectedOption) === cleanStr(ex.correct);
            ex.state = isCorrect ? 'correct' : 'wrong';

            if (isCorrect) this.stats.correct++;
            this.stats.total++;

            if (window.KoreanSound) {
                if (isCorrect) window.KoreanSound.playCorrect();
                else window.KoreanSound.playIncorrect();
            }

            if (!isCorrect && window.recordMistake) {
                window.recordMistake({
                    korean: ex.correct,
                    vi: ex.promptLang === 'vi' ? ex.prompt : ex.correct,
                    reason: 'Trắc nghiệm phản xạ',
                    lessonTitle: this.lesson?.title,
                    lessonId: this.lesson?.id
                });
            }

            // Visual update
            const parent = btnEl.closest('.recall-options');
            if (parent) {
                parent.querySelectorAll('.recall-opt-btn').forEach(btn => {
                    btn.disabled = true;
                    if (cleanStr(btn.dataset.val) === cleanStr(ex.correct)) {
                        btn.classList.add('correct');
                    } else if (btn === btnEl && !isCorrect) {
                        btn.classList.add('wrong');
                    }
                });
            }

            const feedbackEl = document.getElementById(`feedback_${exId}`);
            if (feedbackEl) {
                feedbackEl.classList.remove('hidden');
                feedbackEl.innerHTML = `
                    <div class="recall-feedback-pill ${isCorrect ? 'correct' : 'wrong'}">
                        <span>${isCorrect ? '🎉 Chính xác!' : `❌ Chưa đúng. Đáp án: <b>${esc(ex.correct)}</b>`}</span>
                        <div class="recall-feedback-actions">
                            ${ex.koreanAudio ? `<button type="button" class="study-action-btn" data-speak="${esc(ex.koreanAudio)}" title="Nghe phát âm">🔊</button>` : ''}
                            ${ex.koreanAudio ? `<button type="button" class="study-action-btn" data-practice="${esc(ex.koreanAudio)}" data-feedback="scVoice_${exId}" title="Luyện nói">🎙️</button>` : ''}
                        </div>
                    </div>
                    <div class="speech-feedback" id="scVoice_${exId}"></div>
                `;
            }

            this.updateStatsUI();
        }

        toggleScrambleToken(exId, tokenIdx) {
            const ex = this.exercises.find(e => e.id === exId);
            if (!ex || ex.state !== 'unanswered') return;

            const idxPos = ex.selectedIndices.indexOf(tokenIdx);
            if (idxPos === -1) {
                ex.selectedIndices.push(tokenIdx);
            } else {
                ex.selectedIndices.splice(idxPos, 1);
            }

            this.renderScrambleUI(ex);
        }

        renderScrambleUI(ex) {
            const container = document.getElementById(`scramble_wrap_${ex.id}`);
            if (!container) return;

            const selectedWords = ex.selectedIndices.map(i => ex.tokens[i]);
            const selectedHtml = selectedWords.map((w, pos) => `
                <button type="button" class="scramble-chip selected" onclick="KoreanRecall.toggleScrambleToken('${ex.id}', ${ex.selectedIndices[pos]})">
                    ${esc(w)} <span class="chip-remove">&times;</span>
                </button>
            `).join('');

            const availableHtml = ex.tokens.map((w, i) => {
                const isSelected = ex.selectedIndices.includes(i);
                return `
                    <button type="button" class="scramble-chip ${isSelected ? 'used' : ''}" ${isSelected ? 'disabled' : ''} onclick="KoreanRecall.toggleScrambleToken('${ex.id}', ${i})">
                        ${esc(w)}
                    </button>
                `;
            }).join('');

            container.querySelector('.scramble-target-zone').innerHTML = selectedHtml || '<span class="scramble-placeholder">Bấm vào các từ bên dưới để đưa vào đây...</span>';
            container.querySelector('.scramble-source-zone').innerHTML = availableHtml;
        }

        checkScramble(exId) {
            const ex = this.exercises.find(e => e.id === exId);
            if (!ex || ex.state !== 'unanswered') return;

            const assembled = ex.selectedIndices.map(i => ex.tokens[i]).join(' ');
            const isCorrect = cleanStr(assembled) === cleanStr(ex.correct);
            ex.state = isCorrect ? 'correct' : 'wrong';

            if (isCorrect) this.stats.correct++;
            this.stats.total++;

            if (window.KoreanSound) {
                if (isCorrect) window.KoreanSound.playCorrect();
                else window.KoreanSound.playIncorrect();
            }

            if (!isCorrect && window.recordMistake) {
                window.recordMistake({
                    korean: ex.correct,
                    vi: ex.promptLang === 'vi' ? ex.prompt : ex.correct,
                    reason: 'Trắc nghiệm phản xạ',
                    lessonTitle: this.lesson?.title,
                    lessonId: this.lesson?.id
                });
            }

            const feedbackEl = document.getElementById(`feedback_${exId}`);
            const checkBtn = document.getElementById(`checkBtn_${exId}`);
            if (checkBtn) checkBtn.disabled = true;

            if (feedbackEl) {
                feedbackEl.classList.remove('hidden');
                feedbackEl.innerHTML = `
                    <div class="recall-feedback-pill ${isCorrect ? 'correct' : 'wrong'}">
                        <span>${isCorrect ? '🎉 Hoàn toàn chính xác!' : `❌ Chưa đúng. Câu chuẩn: <b>${esc(ex.correct)}</b>`}</span>
                        <div class="recall-feedback-actions">
                            <button type="button" class="study-action-btn" data-speak="${esc(ex.correct)}" title="Nghe phát âm câu này">🔊</button>
                            <button type="button" class="study-action-btn" data-practice="${esc(ex.correct)}" data-feedback="scVoice_${exId}" title="Luyện nói">🎙️</button>
                        </div>
                    </div>
                    <div class="speech-feedback" id="scVoice_${exId}"></div>
                `;
            }

            this.updateStatsUI();
        }

        checkCloze(exId) {
            const ex = this.exercises.find(e => e.id === exId);
            if (!ex || ex.state !== 'unanswered') return;

            const input = document.getElementById(`input_${exId}`);
            if (!input) return;

            const val = input.value.trim();
            const source = this.lesson.items.find(i=>i.korean===ex.correct);
            const isCorrect = source ? KLALearning.isAnswer(val,source) : cleanStr(val) === cleanStr(ex.correct);
            ex.state = isCorrect ? 'correct' : 'wrong';

            if (isCorrect) {
                input.classList.remove('wrong');
                input.classList.add('correct');
                this.stats.correct++;
            } else {
                input.classList.remove('correct');
                input.classList.add('wrong');
            }
            this.stats.total++;

            if (window.KoreanSound) {
                if (isCorrect) window.KoreanSound.playCorrect();
                else window.KoreanSound.playIncorrect();
            }

            if (!isCorrect && window.recordMistake) {
                window.recordMistake({
                    korean: ex.correct,
                    vi: ex.promptLang === 'vi' ? ex.prompt : ex.correct,
                    reason: 'Trắc nghiệm phản xạ',
                    lessonTitle: this.lesson?.title,
                    lessonId: this.lesson?.id
                });
            }

            const feedbackEl = document.getElementById(`feedback_${exId}`);
            const checkBtn = document.getElementById(`checkBtn_${exId}`);
            if (checkBtn) checkBtn.disabled = true;

            if (feedbackEl) {
                feedbackEl.classList.remove('hidden');
                feedbackEl.innerHTML = `
                    <div class="recall-feedback-pill ${isCorrect ? 'correct' : 'wrong'}">
                        <span>${isCorrect ? '✅ Đúng rồi!' : `Đáp án: <b>${esc(ex.correct)}</b>`}</span>
                        <div class="recall-feedback-actions">
                            <button type="button" class="study-action-btn" data-speak="${esc(ex.koreanAudio || ex.correct)}" title="Nghe phát âm">🔊</button>
                            <button type="button" class="study-action-btn" data-practice="${esc(ex.correct)}" data-feedback="scVoice_${exId}" title="Luyện nói">🎙️</button>
                        </div>
                    </div>
                    <div class="speech-feedback" id="scVoice_${exId}"></div>
                `;
            }

            this.updateStatsUI();
        }

        checkTyping(exId) {
            const ex = this.exercises.find(e => e.id === exId);
            if (!ex || ex.state !== 'unanswered') return;

            const input = document.getElementById(`input_${exId}`);
            if (!input) return;

            const val = input.value.trim();
            const source = this.lesson.items.find(i=>i.korean===ex.correct);
            const isCorrect = source ? KLALearning.isAnswer(val,source) : cleanStr(val) === cleanStr(ex.correct);
            ex.state = isCorrect ? 'correct' : 'wrong';

            if (isCorrect) {
                input.classList.remove('wrong');
                input.classList.add('correct');
                this.stats.correct++;
            } else {
                input.classList.remove('correct');
                input.classList.add('wrong');
            }
            this.stats.total++;

            if (window.KoreanSound) {
                if (isCorrect) window.KoreanSound.playCorrect();
                else window.KoreanSound.playIncorrect();
            }

            if (!isCorrect && window.recordMistake) {
                window.recordMistake({
                    korean: ex.correct,
                    vi: ex.promptLang === 'vi' ? ex.prompt : ex.correct,
                    reason: 'Trắc nghiệm phản xạ',
                    lessonTitle: this.lesson?.title,
                    lessonId: this.lesson?.id
                });
            }

            const feedbackEl = document.getElementById(`feedback_${exId}`);
            const checkBtn = document.getElementById(`checkBtn_${exId}`);
            if (checkBtn) checkBtn.disabled = true;

            if (feedbackEl) {
                feedbackEl.classList.remove('hidden');
                feedbackEl.innerHTML = `
                    <div class="recall-feedback-pill ${isCorrect ? 'correct' : 'wrong'}">
                        <span>${isCorrect ? '🎉 Tuyệt vời! Bạn nhớ rất chính xác.' : `Đáp án: <b>${esc(ex.correct)}</b>`}</span>
                        <div class="recall-feedback-actions">
                            <button type="button" class="study-action-btn" data-speak="${esc(ex.correct)}" title="Nghe phát âm">🔊</button>
                            <button type="button" class="study-action-btn" data-practice="${esc(ex.correct)}" data-feedback="scVoice_${exId}" title="Luyện nói">🎙️</button>
                        </div>
                    </div>
                    <div class="speech-feedback" id="scVoice_${exId}"></div>
                `;
            }

            this.updateStatsUI();
        }

        updateStatsUI() {
            const statsEl = document.getElementById('recallScoreStats');
            if (statsEl) {
                const pct = this.stats.total ? Math.round((this.stats.correct / this.stats.total) * 100) : 0;
                statsEl.innerHTML = `
                    <span class="recall-stat-item">Đã làm: <b>${this.stats.total}/${this.exercises.length}</b></span>
                    <span class="recall-stat-item correct">Đúng: <b>${this.stats.correct}</b></span>
                    <span class="recall-stat-item pct">Độ chính xác: <b>${pct}%</b></span>
                `;
            }
        }

        // ─── Render Main Recall View ──────────────────────────────────
        render(containerId = 'recallExercises') {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (!this.exercises || this.exercises.length === 0) {
                container.innerHTML = `
                    <div class="padded-panel-71 empty-state">
                        <div class="empty-icon">📝</div>
                        <h3>Chưa có câu hỏi cho bài học này</h3>
                        <p>Hãy thêm từ vựng vào bài học để hệ thống tự động sinh các biến thể luyện tập!</p>
                    </div>
                `;
                return;
            }

            // Filter exercises
            const filtered = this.exercises.filter(ex => {
                if (this.currentFilter === 'all') return true;
                return ex.type === this.currentFilter;
            });

            // Count by type for filter badges
            const counts = {
                all: this.exercises.length,
                choice: this.exercises.filter(e => e.type === 'choice').length,
                scramble: this.exercises.filter(e => e.type === 'scramble').length,
                cloze: this.exercises.filter(e => e.type === 'cloze').length,
                typing: this.exercises.filter(e => e.type === 'typing').length
            };

            let html = `
                <!-- Recall Header: Toolbar & Variation Filter -->
                <div class="recall-header-bar">
                    <div class="recall-filter-tabs">
                        <button type="button" class="recall-filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" onclick="KoreanRecall.setFilter('all')">
                            🌟 Tất cả (${counts.all})
                        </button>
                        ${counts.choice ? `
                        <button type="button" class="recall-filter-btn ${this.currentFilter === 'choice' ? 'active' : ''}" onclick="KoreanRecall.setFilter('choice')">
                            🎯 Trắc nghiệm (${counts.choice})
                        </button>` : ''}
                        ${counts.scramble ? `
                        <button type="button" class="recall-filter-btn ${this.currentFilter === 'scramble' ? 'active' : ''}" onclick="KoreanRecall.setFilter('scramble')">
                            🔀 Ghép câu (${counts.scramble})
                        </button>` : ''}
                        ${counts.cloze ? `
                        <button type="button" class="recall-filter-btn ${this.currentFilter === 'cloze' ? 'active' : ''}" onclick="KoreanRecall.setFilter('cloze')">
                            🔤 Điền từ (${counts.cloze})
                        </button>` : ''}
                        ${counts.typing ? `
                        <button type="button" class="recall-filter-btn ${this.currentFilter === 'typing' ? 'active' : ''}" onclick="KoreanRecall.setFilter('typing')">
                            ✍️ Gõ từ nhớ (${counts.typing})
                        </button>` : ''}
                    </div>
                    <div class="recall-header-actions">
                        <button type="button" class="compact-text-72 btn btn-secondary" onclick="KoreanRecall.resetSession()" title="Xáo trộn lại và làm mới toàn bộ câu hỏi">
                            🔄 Trộn lại câu hỏi
                        </button>
                    </div>
                </div>

                <!-- Recall Live Progress & Score -->
                <div class="recall-score-bar" id="recallScoreStats"></div>

                <!-- Questions List -->
                <div class="recall-cards-list">
            `;

            filtered.forEach((ex, idx) => {
                html += `
                    <div class="recall-card" id="card_${ex.id}">
                        <div class="recall-card-header">
                            <span class="recall-type-badge ${ex.type}">${esc(ex.typeName)}</span>
                            <span class="recall-card-num">Câu ${idx + 1}/${filtered.length}</span>
                        </div>
                        <div class="recall-subprompt">${esc(ex.subPrompt)}</div>
                `;

                // ─── Format 1: Multiple Choice ───
                if (ex.type === 'choice') {
                    html += `
                        <div class="recall-prompt-box">
                            <div class="recall-prompt-text ${ex.promptLang === 'ko' ? 'korean' : ''}">${esc(ex.prompt)}</div>
                            ${ex.promptLang === 'ko' ? `<button type="button" class="study-action-btn" data-speak="${esc(ex.prompt)}" title="Nghe phát âm">🔊</button>` : ''}
                        </div>
                        <div class="recall-options">
                            ${ex.options.map(opt => `
                                <button type="button" class="recall-opt-btn ${opt === ex.userAnswer ? (ex.state === 'correct' ? 'correct' : 'wrong') : ''}" data-val="${esc(opt)}" data-choice="${ex.id}" ${ex.state !== 'unanswered' ? 'disabled' : ''}>
                                    <span class="opt-bullet"></span>
                                    <span>${esc(opt)}</span>
                                </button>
                            `).join('')}
                        </div>
                    `;
                }

                // ─── Format 2: Sentence Scramble ───
                else if (ex.type === 'scramble') {
                    const selectedWords = ex.selectedIndices.map(i => ex.tokens[i]);
                    const selectedHtml = selectedWords.map((w, pos) => `
                        <button type="button" class="scramble-chip selected" onclick="KoreanRecall.toggleScrambleToken('${ex.id}', ${ex.selectedIndices[pos]})">
                            ${esc(w)} <span class="chip-remove">&times;</span>
                        </button>
                    `).join('');

                    const availableHtml = ex.tokens.map((w, i) => {
                        const isSelected = ex.selectedIndices.includes(i);
                        return `
                            <button type="button" class="scramble-chip ${isSelected ? 'used' : ''}" ${isSelected ? 'disabled' : ''} onclick="KoreanRecall.toggleScrambleToken('${ex.id}', ${i})">
                                ${esc(w)}
                            </button>
                        `;
                    }).join('');

                    html += `
                        <div class="recall-prompt-box">
                            <div class="recall-prompt-text">${esc(ex.prompt)}</div>
                        </div>
                        <div class="scramble-container" id="scramble_wrap_${ex.id}">
                            <div class="scramble-target-zone">
                                ${selectedHtml || '<span class="scramble-placeholder">Bấm vào các từ bên dưới để đưa vào đây...</span>'}
                            </div>
                            <div class="scramble-source-zone">
                                ${availableHtml}
                            </div>
                        </div>
                        <div class="recall-action-row">
                            <button type="button" class="compact-text-73 btn btn-primary" id="checkBtn_${ex.id}" onclick="KoreanRecall.checkScramble('${ex.id}')">
                                Kiểm tra câu ghép
                            </button>
                        </div>
                    `;
                }

                // ─── Format 3: Cloze (Điền từ) ───
                else if (ex.type === 'cloze') {
                    const display = esc(ex.prompt).replace(
                        /___/,
                        `<input type="text" class="blank-input" id="input_${ex.id}" data-hint="${esc(ex.hint)}" placeholder="?">`
                    );
                    html += `
                        <div class="recall-sentence">${display}</div>
                        <div class="recall-action-row">
                            ${ex.hint ? `<span class="recall-hint">💡 Gợi ý: ${esc(ex.hint)}</span>` : ''}
                            <button type="button" class="compact-text-73 btn btn-primary" id="checkBtn_${ex.id}" onclick="KoreanRecall.checkCloze('${ex.id}')">
                                Kiểm tra
                            </button>
                        </div>
                    `;
                }

                // ─── Format 4: Active Recall Typing ───
                else if (ex.type === 'typing') {
                    html += `
                        <div class="recall-prompt-box">
                            <div class="recall-prompt-text">${esc(ex.prompt)}</div>
                        </div>
                        <div class="recall-typing-wrap">
                            <input type="text" class="compact-text-74 blank-input" id="input_${ex.id}" placeholder="Viết từ tiếng Hàn vào đây...">
                            <div class="recall-action-row">
                                <button type="button" class="compact-text-73 btn btn-primary" id="checkBtn_${ex.id}" onclick="KoreanRecall.checkTyping('${ex.id}')">
                                    Kiểm tra
                                </button>
                                ${ex.hint ? `<button type="button" class="compact-text-75 btn btn-secondary" onclick="this.nextElementSibling.style.display='inline';this.style.display='none'">💡 Xem gợi ý</button><span class="initially-hidden-76">Bắt đầu bằng: <b>${esc(ex.hint)}</b></span>` : ''}
                            </div>
                        </div>
                    `;
                }

                html += `
                        <div class="recall-feedback-zone hidden" id="feedback_${ex.id}"></div>
                    </div>
                `;
            });

            html += `</div>`;
            container.innerHTML = html;
            this.updateStatsUI();
        }
    }

    // ─── Exported Global Instance ────────────────────────────────────
    window.KoreanRecall = new RecallEngine();

})();
