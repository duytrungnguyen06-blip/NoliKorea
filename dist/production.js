/**
 * Korean Learning App (v3) — Advanced Production & Dialogue Engine
 * Features:
 * 1. 💬 Mô phỏng Chat hội thoại thực tế (Dialogue Roleplay / KakaoTalk style)
 * 2. 🔍 Đối chiếu câu thông minh & Phân tích từ khóa (Smart Diff & Keyword Match)
 * 3. 🧩 Thử thách viết câu có điều kiện ngữ pháp (Constrained Sentence Production)
 * 4. ⚡ Tự động sinh tình huống từ kho từ vựng bài học khi thiếu dữ liệu nhập tay
 */

(function () {
    'use strict';

    // ─── Helpers ─────────────────────────────────────────────────────
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

    function levenshtein(s1, s2) {
        if (s1.length < s2.length) return levenshtein(s2, s1);
        if (s2.length === 0) return s1.length;
        let prev = [];
        for (let j = 0; j <= s2.length; j++) prev[j] = j;
        for (let i = 0; i < s1.length; i++) {
            let curr = [i + 1];
            for (let j = 0; j < s2.length; j++) {
                const cost = s1[i] === s2[j] ? 0 : 1;
                curr[j + 1] = Math.min(curr[j] + 1, prev[j + 1] + 1, prev[j] + cost);
            }
            prev = curr;
        }
        return prev[s2.length];
    }

    function similarityRatio(s1, s2) {
        const c1 = cleanStr(s1);
        const c2 = cleanStr(s2);
        if (!c1 && !c2) return 100;
        if (!c1 || !c2) return 0;
        if (c1 === c2) return 100;
        const dist = levenshtein(c1, c2);
        const maxLen = Math.max(c1.length, c2.length);
        return Math.max(0, Math.round((1 - dist / maxLen) * 100));
    }

    // ─── Korean Particle & Spacing Guard (Trục 3) ──────────────────
    function hasHangulBatchim(char) {
        if (!char) return false;
        const code = char.charCodeAt(0) - 0xAC00;
        if (code < 0 || code > 11171) return false;
        return (code % 28) !== 0;
    }

    function checkKoreanGuard(userText, sample) {
        const tips = [];
        if (!userText) return tips;

        // 1. Topic particles: 은 (has batchim) vs 는 (no batchim)
        const topicMatches = userText.match(/([가-힣])(은|는)(?=\s|$|[.,?!~])/g);
        if (topicMatches) {
            topicMatches.forEach(m => {
                const prevChar = m[0];
                const particle = m[1];
                const batchim = hasHangulBatchim(prevChar);
                if (particle === '는' && batchim) {
                    tips.push({
                        type: 'particle',
                        badge: 'Trợ từ chủ đề 은/는',
                        msg: `Chữ "<b>${prevChar}</b>" có patchim, nên đi với <b>은</b> thay vì <b>는</b> (viết đúng: "<b>${prevChar}은</b>").`
                    });
                } else if (particle === '은' && !batchim) {
                    tips.push({
                        type: 'particle',
                        badge: 'Trợ từ chủ đề 은/는',
                        msg: `Chữ "<b>${prevChar}</b>" không có patchim, nên đi với <b>는</b> thay vì <b>은</b> (viết đúng: "<b>${prevChar}는</b>").`
                    });
                }
            });
        }

        // 2. Subject particles: 이 (has batchim) vs 가 (no batchim)
        const subjMatches = userText.match(/([가-힣])(이|가)(?=\s|$|[.,?!~])/g);
        if (subjMatches) {
            subjMatches.forEach(m => {
                const prevChar = m[0];
                const particle = m[1];
                const batchim = hasHangulBatchim(prevChar);
                if (particle === '가' && batchim) {
                    tips.push({
                        type: 'particle',
                        badge: 'Trợ từ chủ ngữ 이/가',
                        msg: `Chữ "<b>${prevChar}</b>" có patchim, nên đi với <b>이</b> thay vì <b>가</b> (viết đúng: "<b>${prevChar}이</b>").`
                    });
                } else if (particle === '이' && !batchim && prevChar !== '그' && prevChar !== '어') {
                    tips.push({
                        type: 'particle',
                        badge: 'Trợ từ chủ ngữ 이/가',
                        msg: `Chữ "<b>${prevChar}</b>" không có patchim, nên đi với <b>가</b> thay vì <b>이</b> (viết đúng: "<b>${prevChar}가</b>").`
                    });
                }
            });
        }

        // 3. Object particles: 을 (has batchim) vs 를 (no batchim)
        const objMatches = userText.match(/([가-힣])(을|를)(?=\s|$|[.,?!~])/g);
        if (objMatches) {
            objMatches.forEach(m => {
                const prevChar = m[0];
                const particle = m[1];
                const batchim = hasHangulBatchim(prevChar);
                if (particle === '를' && batchim) {
                    tips.push({
                        type: 'particle',
                        badge: 'Trợ từ tân ngữ 을/를',
                        msg: `Chữ "<b>${prevChar}</b>" có patchim, nên đi với <b>을</b> thay vì <b>를</b> (viết đúng: "<b>${prevChar}을</b>").`
                    });
                } else if (particle === '을' && !batchim) {
                    tips.push({
                        type: 'particle',
                        badge: 'Trợ từ tân ngữ 을/를',
                        msg: `Chữ "<b>${prevChar}</b>" không có patchim, nên đi với <b>를</b> thay vì <b>을</b> (viết đúng: "<b>${prevChar}를</b>").`
                    });
                }
            });
        }

        // 3.5. Conjunction particles: 과 (has batchim) vs 와 (no batchim)
        const gwaWaMatches = userText.match(/([가-힣])(과|와)(?=\s|$|[.,?!~])/g);
        if (gwaWaMatches) {
            gwaWaMatches.forEach(m => {
                const prevChar = m[0];
                const particle = m[1];
                const batchim = hasHangulBatchim(prevChar);
                if (particle === '와' && batchim) {
                    tips.push({
                        type: 'particle',
                        badge: 'Trợ từ nối 과/와',
                        msg: `Chữ "<b>${prevChar}</b>" có patchim, nên đi với <b>과</b> thay vì <b>와</b> (viết đúng: "<b>${prevChar}과</b>").`
                    });
                } else if (particle === '과' && !batchim) {
                    tips.push({
                        type: 'particle',
                        badge: 'Trợ từ nối 과/와',
                        msg: `Chữ "<b>${prevChar}</b>" không có patchim, nên đi với <b>와</b> thay vì <b>과</b> (viết đúng: "<b>${prevChar}와</b>").`
                    });
                }
            });
        }

        // 4. Copula endings: 이에요 (has batchim) vs 예요 (no batchim)
        const copulaMatches = userText.match(/([가-힣])(이에요|예요)(?=\s|$|[.,?!~])/g);
        if (copulaMatches) {
            copulaMatches.forEach(m => {
                const prevChar = m[0];
                const ending = m.slice(1);
                const batchim = hasHangulBatchim(prevChar);
                if (ending === '예요' && batchim) {
                    tips.push({
                        type: 'particle',
                        badge: 'Đuôi câu 이에요/예요',
                        msg: `Chữ "<b>${prevChar}</b>" có patchim, nên đi với <b>이에요</b> thay vì <b>예요</b> (viết đúng: "<b>${prevChar}이에요</b>").`
                    });
                }
            });
        }

        // 5. Spacing Guard: space before particles
        const spaceBeforePart = userText.match(/([가-힣]+)\s+(은|는|이|가|을|를|에|에서|도|의|으로|로|하고|와|과|한테|에게|부터|까지|이에요|예요)(?=\s|$|[.,?!~])/g);
        if (spaceBeforePart) {
            spaceBeforePart.forEach(match => {
                const parts = match.split(/\s+/);
                const word = parts[0];
                const part = parts[1];
                tips.push({
                    type: 'spacing',
                    badge: 'Quy tắc dính trợ từ',
                    msg: `Trong tiếng Hàn, trợ từ gắn liền ngay sau danh từ: viết liền "<b>${word}${part}</b>" thay vì cách "<b>${word} ${part}</b>".`
                });
            });
        }

        // 6. Spacing Guard: glued chunks that should be separated (based on sample)
        if (sample) {
            const sampleWords = sample.split(/\s+/).map(w => cleanStr(w)).filter(w => w.length >= 2);
            for (let i = 0; i < sampleWords.length - 1; i++) {
                const w1 = sampleWords[i];
                const w2 = sampleWords[i + 1];
                const combined = w1 + w2;
                const separated = `${w1} ${w2}`;
                if (userText.includes(combined) && !userText.includes(separated)) {
                    tips.push({
                        type: 'spacing',
                        badge: 'Khoảng cách chữ (띄어쓰기)',
                        msg: `Nên viết cách hai từ độc lập: "<b>${separated}</b>" thay vì viết dính "<b>${combined}</b>".`
                    });
                }
            }
        }

        // Deduplicate tips
        const uniqueTips = [];
        const seen = new Set();
        tips.forEach(t => {
            if (!seen.has(t.msg)) {
                seen.add(t.msg);
                uniqueTips.push(t);
            }
        });

        return uniqueTips;
    }

    // ─── Production Engine Class ─────────────────────────────────────
    class ProductionEngine {
        constructor() {
            this.exercises = [];
            this.currentFilter = 'all'; // 'all' | 'dialogue' | 'scenario'
            this.lesson = null;
            this.db = null;
        }

        buildExercises(lesson, db) {
            this.lesson = lesson;
            this.db = db;
            const exList = [];
            const items = (lesson.items || []).filter(it => it.korean && it.vi);

            // ─── 1. Custom Situations (from lesson.situations) ───
            if (lesson.situations) {
                lesson.situations.split('\n').filter(Boolean).forEach((line, idx) => {
                    const parts = line.split('|');
                    const prompt = (parts[0] || '').trim();
                    const sample = (parts[1] || '').trim();
                    if (!prompt && !sample) return;

                    // Extract key words from sample (words >= 2 chars)
                    const sampleWords = sample.split(/\s+/).filter(w => w.length >= 2);
                    const keywords = sampleWords.slice(0, 3);

                    exList.push({
                        id: `sit_custom_${idx}`,
                        type: 'scenario',
                        typeName: '🎯 Tình huống',
                        title: prompt,
                        sample: sample,
                        keywords: keywords,
                        userAnswer: '',
                        evaluation: null
                    });
                });
            }

            // ─── 2. Dialogue / Chat Roleplay (💬 Mô phỏng Chat) ───
            // Auto-create dialogue based on lesson context
            const dialogues = this.generateDialogues(items, lesson.title);
            dialogues.forEach((d, idx) => {
                exList.push({
                    id: `chat_${idx}`,
                    type: 'dialogue',
                    typeName: '💬 Hội thoại Chat',
                    partnerName: d.partnerName || '민수 (Min-soo)',
                    partnerAvatar: d.partnerAvatar || '🇰🇷',
                    partnerMsg: d.partnerMsg,
                    partnerTrans: d.partnerTrans,
                    mission: d.mission,
                    keywords: d.keywords || [],
                    sample: d.sample,
                    userAnswer: '',
                    evaluation: null
                });
            });

            // ─── 3. Auto-generated Scenarios (⚡ Tự động sinh nếu thiếu) ───
            if (exList.length < 3 && items.length > 0) {
                const autoScenarios = this.generateAutoScenarios(items, lesson.title);
                autoScenarios.forEach((sc, idx) => {
                    exList.push({
                        id: `sit_auto_${idx}`,
                        type: 'scenario',
                        typeName: '⚡ Tình huống thực hành',
                        title: sc.title,
                        sample: sc.sample,
                        keywords: sc.keywords,
                        userAnswer: '',
                        evaluation: null
                    });
                });
            }

            this.exercises = exList;
            return this.exercises;
        }

        generateDialogues(items, lessonTitle) {
            const list = [];
            const korAll = items.map(it => it.korean).join(' ');

            // Check if Lesson has greetings / nationality / introduction
            const hasCountry = items.some(it => it.korean.includes('사람') || it.korean.includes('한국') || it.korean.includes('베트남'));
            const hasJob = items.some(it => it.korean.includes('학생') || it.korean.includes('선생님') || it.korean.includes('회사원') || it.korean.includes('의사'));

            if (hasCountry) {
                list.push({
                    partnerName: '민수 (Min-soo)',
                    partnerAvatar: '🇰🇷',
                    partnerMsg: '안녕하세요? 저는 한국 사람이에요. 어느 나라 사람이에요?',
                    partnerTrans: 'Xin chào? Tôi là người Hàn Quốc. Bạn là người nước nào?',
                    mission: 'Chào Minsu và giới thiệu bạn là người Việt Nam bằng câu lịch sự.',
                    keywords: ['안녕하세요', '베트남 사람'],
                    sample: '안녕하세요? 저는 베트남 사람이에요.'
                });
            }

            if (hasJob) {
                list.push({
                    partnerName: '지우 (Ji-woo)',
                    partnerAvatar: '🙋‍♀️',
                    partnerMsg: '만나서 반가워요! 혹시 학생이에요?',
                    partnerTrans: 'Rất vui được gặp bạn! Bạn có phải là học sinh/sinh viên không?',
                    mission: 'Xác nhận bạn là học sinh/sinh viên (hoặc giới thiệu nghề nghiệp của bạn).',
                    keywords: ['학생', '이에요'],
                    sample: '네, 저는 학생이에요. 만나서 반가워요.'
                });
            }

            // Fallback dialogue from first two sentences of items if still empty
            if (list.length === 0 && items.length >= 2) {
                const it1 = items[0];
                const it2 = items[1];
                list.push({
                    partnerName: '유진 (Yu-jin)',
                    partnerAvatar: '👋',
                    partnerMsg: it1.korean,
                    partnerTrans: it1.vi,
                    mission: `Trả lời bằng một câu tiếng Hàn phù hợp (Gợi ý dùng: "${it2.vi}").`,
                    keywords: it2.korean.split(/\s+/).slice(0, 2),
                    sample: it2.korean
                });
            }

            return list;
        }

        generateAutoScenarios(items, lessonTitle) {
            const scenarios = [];
            // Multi-word phrases are prime for scenarios
            const multiWord = items.filter(it => it.korean.split(/\s+/).length >= 2);

            multiWord.slice(0, 3).forEach(it => {
                scenarios.push({
                    title: `Hãy diễn đạt câu sau sang tiếng Hàn trong giao tiếp hàng ngày: "${it.vi}"`,
                    sample: it.korean,
                    keywords: it.korean.split(/\s+/).filter(w => w.length >= 2)
                });
            });

            return scenarios;
        }

        setFilter(filter) {
            this.currentFilter = filter;
            this.render();
        }

        // ─── Evaluation Engine ───────────────────────────────────────
        evaluateSentence(exId) {
            const ex = this.exercises.find(e => e.id === exId);
            if (!ex) return;

            const inputEl = document.getElementById(`prod_input_${exId}`);
            if (!inputEl) return;

            const userText = inputEl.value.trim();
            if (!userText) {
                alert('Vui lòng nhập câu tiếng Hàn của bạn trước khi kiểm tra!');
                inputEl.focus();
                return;
            }

            ex.userAnswer = userText;

            // 1. Calculate accuracy against sample
            const supportedVariant = KLALearning.variants(ex.sample).some(v=>KLALearning.normalize(v)===KLALearning.normalize(userText));
            const accuracy = Math.max(...KLALearning.variants(ex.sample).map(v=>similarityRatio(userText,v)));

            // 2. Check keywords matched
            const matchedKw = (ex.keywords || []).filter(kw => userText.includes(kw));
            const missingKw = (ex.keywords || []).filter(kw => !userText.includes(kw));

            // 3. Highlight matched tokens in sample
            const sampleWords = ex.sample.split(/\s+/);
            const userWordsClean = userText.split(/\s+/).map(cleanStr).filter(Boolean);

            const highlightedSample = sampleWords.map(w => {
                const wClean = cleanStr(w);
                const isMatched = userWordsClean.some(uw => uw.includes(wClean) || wClean.includes(uw));
                return isMatched
                    ? `<span class="prod-token matched">${esc(w)}</span>`
                    : `<span class="prod-token missing">${esc(w)}</span>`;
            }).join(' ');

            // 4. Korean Particle & Spacing Guard check
            const guardTips = checkKoreanGuard(userText, ex.sample);

            // 5. Determine feedback level
            let levelClass = 'good';
            let title = 'Đối chiếu câu mẫu';
            let comment = 'Câu có một số thành phần giống mẫu. Công cụ hiện chưa xác nhận được ý nghĩa của cách diễn đạt khác.';

            if (accuracy >= 85 || (matchedKw.length === ex.keywords.length && ex.keywords.length > 0)) {
                levelClass = 'excellent';
                title = 'Gần với câu mẫu';
                comment = guardTips.length > 0
                    ? 'Câu gần mẫu; hãy xem gợi ý về trợ từ và khoảng cách bên dưới.'
                    : 'Câu gần giống mẫu. Độ tương đồng không thay thế đánh giá ngữ pháp và ý nghĩa.';
            } else if (accuracy < 50 && matchedKw.length === 0) {
                levelClass = 'retry';
                title = 'Khác cách diễn đạt trong mẫu';
                comment = 'Câu khác mẫu có thể vẫn đúng. Hãy đối chiếu ngữ cảnh; công cụ không kết luận câu sai chỉ từ độ tương đồng.';
            }

            if(supportedVariant){title="Khớp cách diễn đạt được hỗ trợ";comment="Câu khớp mẫu hoặc dạng rút gọn tương đương được hỗ trợ.";}
            ex.evaluation = {
                accuracy,
                matchedKw,
                missingKw,
                guardTips,
                highlightedSample,
                levelClass,
                title,
                comment
            };

            if (window.KoreanSound) {
                if (accuracy >= 80) window.KoreanSound.playCorrect();
                else if (accuracy < 50) window.KoreanSound.playIncorrect();
            }

            if (guardTips.length > 0 && window.recordMistake) {
                const tipReason = guardTips.length > 0 ? guardTips[0].badge : 'Sản sinh câu chưa chuẩn';
                window.recordMistake({
                    korean: ex.sample,
                    vi: ex.title || ex.mission || '',
                    reason: 'Gợi ý kiểm tra: '+tipReason,
                    lessonTitle: this.lesson?.title,
                    lessonId: this.lesson?.id
                });
            }

            this.renderEvaluationUI(ex);
        }

        renderEvaluationUI(ex) {
            const evalBox = document.getElementById(`eval_box_${ex.id}`);
            if (!evalBox || !ex.evaluation) return;

            const ev = ex.evaluation;
            const sampleSafe = esc(ex.sample);

            evalBox.classList.remove('hidden');
            evalBox.innerHTML = `
                <div class="prod-eval-card ${['good','excellent','retry'].includes(ev.levelClass)?ev.levelClass:'good'}">
                    <div class="prod-eval-header">
                        <div class="prod-eval-score">
                            <span class="prod-eval-badge">${esc(ev.title)}</span>
                            <span class="prod-eval-pct">Độ tương đồng: <b>${Number(ev.accuracy)||0}%</b></span>
                        </div>
                        <div class="prod-eval-actions">
                            <button type="button" class="study-action-btn" data-speak="${sampleSafe}" title="Nghe câu mẫu">🔊</button>
                            <button type="button" class="study-action-btn" data-practice="${sampleSafe}" data-feedback="evalVoice_${ex.id}" title="Luyện nói câu mẫu">🎙️</button>
                        </div>
                    </div>
                    <div class="prod-eval-comment">${esc(ev.comment)}</div>
                    
                    ${ex.keywords && ex.keywords.length > 0 ? `
                    <div class="prod-kw-row">
                        <span class="prod-kw-label">Từ khóa quan trọng:</span>
                        ${ex.keywords.map(kw => {
                            const found = ev.matchedKw.includes(kw);
                            return `<span class="prod-kw-pill ${found ? 'found' : 'missing'}">${found ? '✅' : '⚠️'} ${esc(kw)}</span>`;
                        }).join('')}
                    </div>` : ''}

                    ${ev.guardTips && ev.guardTips.length > 0 ? `
                    <div class="prod-guard-box">
                        <div class="prod-guard-title">🛡️ Soi lỗi Trợ từ & Cách chữ (띄어쓰기):</div>
                        <div class="prod-guard-list">
                            ${ev.guardTips.map(g => `
                                <div class="prod-guard-item ${g.type==='error'?'error':'warning'}">
                                    <span class="prod-guard-badge">${esc(g.badge)}</span>
                                    <span class="prod-guard-msg">${esc(g.msg)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>` : ''}

                    <div class="prod-sample-compare">
                        <div class="prod-compare-label">Câu mẫu chuẩn:</div>
                        <div class="prod-compare-text">${esc(ex.sample)}</div>
                    </div>
                    <div class="speech-feedback" id="evalVoice_${ex.id}"></div>
                </div>
            `;
        }

        // ─── Render Main Production View ──────────────────────────────
        render(containerId = 'productionExercises') {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (!this.exercises || this.exercises.length === 0) {
                container.innerHTML = `
                    <div class="padded-panel-71 empty-state">
                        <div class="empty-icon">✍️</div>
                        <h3>Chưa có tình huống thực hành</h3>
                        <p>Hãy thêm từ vựng hoặc tình huống vào bài học để bắt đầu!</p>
                    </div>
                `;
                return;
            }

            const filtered = this.exercises.filter(ex => {
                if (this.currentFilter === 'all') return true;
                return ex.type === this.currentFilter;
            });

            const counts = {
                all: this.exercises.length,
                dialogue: this.exercises.filter(e => e.type === 'dialogue').length,
                scenario: this.exercises.filter(e => e.type === 'scenario').length
            };

            let html = `
                <!-- Production Toolbar & Filter Bar -->
                <div class="prod-header-bar">
                    <div class="prod-filter-tabs">
                        <button type="button" class="prod-filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" onclick="KoreanProduction.setFilter('all')">
                            🌟 Tất cả (${counts.all})
                        </button>
                        ${counts.dialogue ? `
                        <button type="button" class="prod-filter-btn ${this.currentFilter === 'dialogue' ? 'active' : ''}" onclick="KoreanProduction.setFilter('dialogue')">
                            💬 Hội thoại Chat (${counts.dialogue})
                        </button>` : ''}
                        ${counts.scenario ? `
                        <button type="button" class="prod-filter-btn ${this.currentFilter === 'scenario' ? 'active' : ''}" onclick="KoreanProduction.setFilter('scenario')">
                            🎯 Tình huống giao tiếp (${counts.scenario})
                        </button>` : ''}
                    </div>
                    <div class="prod-header-actions">
                        <button type="button" class="vk-quick-btn" onclick="if(window.KoreanKeyboard) window.KoreanKeyboard.open()" title="Mở bàn phím tiếng Hàn">
                            ⌨️ Bàn phím Hàn
                        </button>
                    </div>
                </div>

                <div class="prod-cards-list">
            `;

            filtered.forEach((ex, idx) => {
                const sampleSafe = esc(ex.sample);

                // ─── Format A: Dialogue / Chat Roleplay ───
                if (ex.type === 'dialogue') {
                    const partnerSafe = esc(ex.partnerMsg);
                    html += `
                        <div class="prod-card chat-card" id="card_${ex.id}">
                            <div class="prod-card-top">
                                <span class="prod-type-badge dialogue">${esc(ex.typeName)}</span>
                                <span class="prod-card-num">Tình huống ${idx + 1}/${filtered.length}</span>
                            </div>

                            <!-- Partner Chat Bubble -->
                            <div class="chat-thread">
                                <div class="chat-message partner">
                                    <div class="chat-avatar">${esc(ex.partnerAvatar)}</div>
                                    <div class="chat-bubble">
                                        <div class="chat-sender">${esc(ex.partnerName)}</div>
                                        <div class="chat-text">${esc(ex.partnerMsg)}</div>
                                        ${ex.partnerTrans ? `<div class="chat-trans hidden" id="chatTrans_${ex.id}">🇻🇳 ${esc(ex.partnerTrans)}</div>` : ''}
                                        <div class="chat-msg-actions">
                                            <button type="button" class="study-action-btn sm" data-speak="${partnerSafe}" title="Nghe tin nhắn">🔊</button>
                                            ${ex.partnerTrans ? `<button type="button" class="chat-hint-btn" onclick="document.getElementById('chatTrans_${ex.id}').classList.toggle('hidden')">Dịch nghĩa</button>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Mission / Task Prompt -->
                            <div class="prod-mission-box">
                                <span class="mission-icon">📌</span>
                                <div><b>Nhiệm vụ của bạn:</b> ${esc(ex.mission)}</div>
                            </div>

                            ${ex.keywords && ex.keywords.length > 0 ? `
                            <div class="prod-kw-hints">
                                <span>Gợi ý từ vựng/cấu trúc:</span>
                                ${ex.keywords.map(kw => `<span class="kw-hint-tag">${esc(kw)}</span>`).join('')}
                            </div>` : ''}

                            <!-- User Response Area -->
                            <div class="prod-input-area">
                                <textarea class="production-input" id="prod_input_${ex.id}" rows="2" placeholder="Nhập câu trả lời bằng tiếng Hàn..."></textarea>
                                <div class="prod-action-row">
                                    <button type="button" class="btn btn-secondary speech-dictate-btn" onclick="KoreanVoice.dictateToInput('prod_input_${ex.id}', this)" title="Bấm để nói tiếng Hàn vào micro">
                                        🎙️ Nói để nhập
                                    </button>
                                    <button type="button" class="btn btn-primary" onclick="KoreanProduction.evaluateSentence('${ex.id}')">
                                        ✨ Chấm câu & Đối chiếu
                                    </button>
                                </div>
                            </div>

                            <!-- Smart Evaluation Box -->
                            <div class="prod-eval-zone hidden" id="eval_box_${ex.id}"></div>
                        </div>
                    `;
                }

                // ─── Format B: Contextual Scenario ───
                else {
                    html += `
                        <div class="prod-card scenario-card" id="card_${ex.id}">
                            <div class="prod-card-top">
                                <span class="prod-type-badge scenario">${esc(ex.typeName)}</span>
                                <span class="prod-card-num">Tình huống ${idx + 1}/${filtered.length}</span>
                            </div>

                            <div class="scenario-prompt-box">
                                <div class="scenario-icon">📌</div>
                                <div class="scenario-prompt-text">${esc(ex.title)}</div>
                            </div>

                            ${ex.keywords && ex.keywords.length > 0 ? `
                            <div class="prod-kw-hints">
                                <span>Gợi ý cấu trúc:</span>
                                ${ex.keywords.map(kw => `<span class="kw-hint-tag">${esc(kw)}</span>`).join('')}
                            </div>` : ''}

                            <!-- User Response Area -->
                            <div class="prod-input-area">
                                <textarea class="production-input" id="prod_input_${ex.id}" rows="2" placeholder="Viết câu trả lời bằng tiếng Hàn..."></textarea>
                                <div class="prod-action-row">
                                    <button type="button" class="btn btn-secondary speech-dictate-btn" onclick="KoreanVoice.dictateToInput('prod_input_${ex.id}', this)" title="Bấm để nói tiếng Hàn vào micro">
                                        🎙️ Nói để nhập
                                    </button>
                                    <button type="button" class="btn btn-primary" onclick="KoreanProduction.evaluateSentence('${ex.id}')">
                                        ✨ Chấm câu & Đối chiếu
                                    </button>
                                </div>
                            </div>

                            <!-- Smart Evaluation Box -->
                            <div class="prod-eval-zone hidden" id="eval_box_${ex.id}"></div>
                        </div>
                    `;
                }
            });

            html += `</div>`;
            container.innerHTML = html;
        }
    }

    // ─── Global Instance ─────────────────────────────────────────────
    window.KoreanProduction = new ProductionEngine();

})();
