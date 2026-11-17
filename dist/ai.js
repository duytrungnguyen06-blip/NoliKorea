/**
 * Korean Learning App (v3) — Live AI Conversation & Sesame Phone Call Engine
 * Features:
 * 1. 🤖 Book-scoped AI Bot (Strict knowledge boundary based on book items)
 * 2. 🌐 Global Master AI Bot (Comprehensive Seoul AI Companion)
 * 3. 💬 Real-time Messenger mode (KakaoTalk / Sesame style)
 * 4. 📞 Live Phone Call Simulation (Hands-free voice loop with animated visualizer)
 * 5. ⚡ Direct Google Gemini 2.0 Flash REST API Integration with offline fallback
 */

(function () {
    'use strict';

    function esc(s) {
        return (s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function cleanKorean(s) {
        return (s || '').replace(/[\s.,?!~·:;'"()\[\]{}]+/g, '').trim();
    }

    // ─── Gemini Dynamic REST Client (Auto Model Discovery) ────────────
    class GeminiClient {
        constructor() {
            this.transport = KLARequest.create();
            this.model = localStorage.getItem('kla_gemini_active_model') || 'gemini-2.5-flash';
            this.apiVersion = localStorage.getItem('kla_gemini_api_version') || 'v1beta';
        }

        getApiKey() {
            return localStorage.getItem('kla_gemini_api_key') || '';
        }

        hasApiKey() {
            return !!this.getApiKey();
        }

        getActiveModel() {
            return localStorage.getItem('kla_gemini_active_model') || this.model || 'gemini-2.5-flash';
        }

        async getCandidateModels(key) {
            const versions = ['v1beta', 'v1'];
            let allCandidates = [];

            for (const ver of versions) {
                try {
                    const listUrl = `https://generativelanguage.googleapis.com/${ver}/models?key=${encodeURIComponent(key)}`;
                    const res = await this.transport.request(listUrl);
                    if (!res.ok) continue;

                    const data = await res.json();
                    const models = (data.models || []).filter(m =>
                        Array.isArray(m.supportedGenerationMethods) &&
                        m.supportedGenerationMethods.includes('generateContent')
                    );

                    models.forEach(m => {
                        const cleanName = m.name.replace(/^models\//, '');
                        if (!allCandidates.some(c => c.model === cleanName)) {
                            allCandidates.push({ model: cleanName, apiVersion: ver });
                        }
                    });
                } catch (e) {if(e.name==='AbortError'||e.name==='TimeoutError')throw e;}
            }

            if (allCandidates.length) return allCandidates.sort((a,b) => Number(!a.model.includes('flash')) - Number(!b.model.includes('flash')));
            // Fallback only when discovery is unavailable
            const defaults = [
                { model: 'gemini-2.5-flash', apiVersion: 'v1beta' },
                { model: 'gemini-3.5-flash', apiVersion: 'v1beta' },
                { model: 'gemini-3.0-flash', apiVersion: 'v1beta' },
                { model: 'gemini-2.0-flash', apiVersion: 'v1beta' },
                { model: 'gemini-2.0-flash-exp', apiVersion: 'v1beta' }
            ];
            defaults.forEach(d => {
                if (!allCandidates.some(c => c.model === d.model)) {
                    allCandidates.push(d);
                }
            });

            // Priority ranking: gemini-3.8-flash is #1!
            const priorityList = [
                'gemini-2.5-flash',
                'gemini-3.5-flash',
                'gemini-3.0-flash',
                'gemini-2.0-flash',
                'gemini-2.0-flash-exp',
                'gemini-2.5-flash',
                'gemini-1.5-flash',
                'gemini-1.5-flash-8b',
                'gemini-1.5-pro'
            ];

            allCandidates.sort((a, b) => {
                let idxA = priorityList.findIndex(p => a.model === p || a.model.startsWith(p));
                let idxB = priorityList.findIndex(p => b.model === p || b.model.startsWith(p));
                if (idxA === -1) idxA = 999;
                if (idxB === -1) idxB = 999;
                return idxA - idxB;
            });

            return allCandidates;
        }

        async generate({ systemPrompt, history, userMessage }) {
            const apiKey = this.getApiKey();
            if (!apiKey) {
                throw new Error('CHUA_CO_KEY');
            }

            let model = this.getActiveModel();
            let apiVer = localStorage.getItem('kla_gemini_api_version') || this.apiVersion || 'v1beta';

            const contents = [];
            KLARequest.history(history).forEach(msg => {
                contents.push({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                });
            });
            contents.push({
                role: 'user',
                parts: [{ text: userMessage }]
            });

            const payload = {
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 250
                }
            };

            let url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

            let res = await this.transport.request(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // If 404 or deprecated (400), auto-discover working model
            if (!res.ok && res.status === 404) {
                try {
                    const healedModel = await this.testKey(apiKey);
                    apiVer = localStorage.getItem('kla_gemini_api_version') || 'v1beta';
                    url = `https://generativelanguage.googleapis.com/${apiVer}/models/${healedModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
                    res = await this.transport.request(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } catch (e) { if(e.name==='AbortError'||e.name==='TimeoutError')throw e; }
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const msg = KLARequest.errorMessage(res.status);
                throw new Error(msg);
            }

            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if(!reply.trim())throw new Error('AI chưa trả lời được yêu cầu này. Hãy thử diễn đạt lại.');
            return reply.trim();
        }

        async testKey(key) {
            const candidates = await this.getCandidateModels(key);
            let workingModel = null;
            let workingVer = 'v1beta';
            let lastErr = null;

            for (const cand of candidates.slice(0,3)) {
                try {
                    const url = `https://generativelanguage.googleapis.com/${cand.apiVersion}/models/${cand.model}:generateContent?key=${encodeURIComponent(key)}`;
                    const payload = {
                        contents: [{ role: 'user', parts: [{ text: '안녕' }] }],
                        generationConfig: { maxOutputTokens: 10 }
                    };

                    const res = await this.transport.request(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (res.ok) {
                        workingModel = cand.model;
                        workingVer = cand.apiVersion;
                        break;
                    } else {
                        const errData = await res.json().catch(() => ({}));
                        lastErr = KLARequest.errorMessage(res.status);
                        if([401,403,429].includes(res.status))throw new Error(lastErr);
                        // If model is deprecated or unavailable, seamlessly try next candidate!
                        continue;
                    }
                } catch (e) {
                    if(e.name==='AbortError'||e.name==='TimeoutError'||/hạn mức|API key/.test(e.message))throw e;
                    lastErr = e.message;
                }
            }

            if (!workingModel) {
                throw new Error(lastErr || 'Không tìm thấy mô hình tương thích với API Key này');
            }

            this.model = workingModel;
            this.apiVersion = workingVer;
            localStorage.setItem('kla_gemini_active_model', workingModel);
            localStorage.setItem('kla_gemini_api_version', workingVer);
            return workingModel;
        }
    }

    // ─── Main AI Controller ───────────────────────────────────────────
    class AIEngine {
        constructor() {
            this.client = new GeminiClient();
            this.generation = 0;
            this.currentBot = null; // { type: 'global' | 'book', bookId, name, avatar, title }
            this.currentMode = 'chat'; // 'chat' | 'call'
            this.chatHistory = [];
            this.isBusy = false;

            // Phone Call Engine state
            this.callTimerInterval = null;
            this.callSeconds = 0;
            this.isCallActive = false;
            this.isCallMuted = false;
            this.isAiSpeaking = false;
        }

        // ─── Bot Persona & Knowledge Config ──────────────────────────
        getBotConfig(type, bookId = null) {
            if (type === 'book' && bookId && window.db) {
                let targetBook = null;
                let targetStage = null;
                for (const s of (window.db.stages || [])) {
                    const b = s.books.find(x => x.id === bookId);
                    if (b) { targetBook = b; targetStage = s; break; }
                }

                if (targetBook) {
                    // Collect all allowed vocabulary and phrases in this book
                    const allowedItems = [];
                    const selected=typeof ctx!=='undefined'&&ctx?.bid===bookId?ctx.lid:null;
                    const focused=selected?targetBook.lessons.find(l=>l.id===selected):[...targetBook.lessons].filter(l=>l.items?.length).sort((a,b)=>(b.lastOpenedAt||0)-(a.lastOpenedAt||0))[0];
                    const contextLessons=focused?[focused,...targetBook.lessons.filter(l=>l.id!==focused.id&&l.studied).slice(0,2)]:[];
                    contextLessons.forEach(l => {
                        (l.items || []).forEach(it => {
                            if (it.korean) allowedItems.push(`${it.korean} (${it.vi || ''})`);
                        });
                    });

                    const vocabStr = allowedItems.slice(0,60).join(', ').slice(0,7000);

                    const systemPrompt = `Bạn là 민수 (Min-soo), một người bạn Hàn Quốc thân thiện, kiên nhẫn và vui vẻ.
Bạn đang trò chuyện với người học tiếng Hàn ở trình độ cuốn sách: "${targetBook.name}", đang tập trung vào bài "${focused?.title||''}" (${targetStage ? targetStage.name : ''}).
QUY TẮC BẮT BUỘC:
1. Bạn CHỈ ĐƯỢC PHÉP sử dụng từ vựng, ngữ pháp và mẫu câu nằm trong danh sách bài học của quyển này: [ ${vocabStr} ].
2. Tuyệt đối không dùng từ vựng hay ngữ pháp cao cấp ngoài danh sách. Hãy dùng câu ngắn gọn (1-2 câu mỗi lượt).
3. Luôn dùng kính ngữ thân mật lịch sự (~아요/어요 hoặc ~이에요/예요).
4. Nếu người học dùng sai trợ từ (은/는, 이/가, 을/를) hay khoảng cách (띄어쓰기), hãy nhắc nhở thật ngắn bằng tiếng Việt trong ngoặc đơn ( ), sau đó tiếp tục cuộc trò chuyện bằng tiếng Hàn.
5. Luôn chủ động đặt câu hỏi hoặc khích lệ để người học đáp lại.`;

                    return {
                        type: 'book',
                        bookId: targetBook.id,
                        name: '민수 (Min-soo)',
                        avatar: '🇰🇷',
                        title: `Bạn học AI · ${targetBook.name}`,
                        scopeDesc: `Kiến thức giới hạn: ${targetBook.name}`,
                        systemPrompt: systemPrompt,
                        welcomeMsg: `안녕하세요! 저는 민수예요. ${targetBook.name} 공부를 같이 해요! 만나서 반가워요.`,
                        allowedVocab: allowedItems
                    };
                }
            }

            // Global Master Bot
            const systemPrompt = `Bạn là 지우 (Ji-woo), trợ lý gia sư AI tiếng Hàn thông minh của ứng dụng Học Tiếng Hàn (NoliKorea).
Bạn có thể trò chuyện tự do bằng tiếng Hàn với người học ở mọi chủ đề (đời sống, ẩm thực K-food, du lịch Seoul, văn hóa K-pop, ngữ pháp, luyện thi TOPIK).
QUY TẮC BẮT BUỘC:
1. Trả lời tự nhiên, thân thiện bằng tiếng Hàn chuẩn lịch sự (đuôi ~아요/어요 hoặc ~ㅂ니다).
2. Mỗi lượt trả lời ngắn gọn (1-3 câu) để người học dễ đọc hiểu và luyện nghe.
3. Nếu có từ vựng mới hoặc người học chưa hiểu, hãy kèm dịch nghĩa tiếng Việt trong ngoặc đơn ( ).
4. Luôn khích lệ, khen ngợi và sửa lỗi nhẹ nhàng nếu người học viết hay nói sai trợ từ hoặc ngữ pháp.`;

            return {
                type: 'global',
                bookId: null,
                name: '지우 (Ji-woo)',
                avatar: '✨',
                title: 'Bạn học AI Companion',
                scopeDesc: 'Trợ lý tiếng Hàn toàn diện · Mọi cấp độ',
                systemPrompt: systemPrompt,
                welcomeMsg: '안녕하세요! 저는 AI 서울 친구 지우예요. 오늘 어떤 이야기로 한국어 연습을 해볼까요?',
                allowedVocab: []
            };
        }

        // ─── Open Bot Interfaces ─────────────────────────────────────
        openBot(type, bookId = null, initialMode = 'chat') {
            this.cancelPending();
            this.currentBot = this.getBotConfig(type, bookId);
            this.chatHistory = [];
            this.currentMode = initialMode;

            // Update Modal Header UI
            const avatarEl = document.getElementById('aiModalAvatar');
            const titleEl = document.getElementById('aiModalTitle');
            const scopeEl = document.getElementById('aiModalScope');
            if (avatarEl) avatarEl.textContent = this.currentBot.avatar;
            if (titleEl) titleEl.textContent = this.currentBot.name;
            if (scopeEl) scopeEl.textContent = this.currentBot.title;

            // Reset chat messages
            const msgBox = document.getElementById('aiChatMessages');
            if (msgBox) {
                msgBox.innerHTML = '';
            }

            // Add Welcome Message from Bot
            this.appendMessage('model', this.currentBot.welcomeMsg);

            // Switch to initial mode
            this.switchMode(initialMode);

            // Open Modal
            const modal = document.getElementById('aiModal');
            if (modal) modal.classList.add('active');
        }

        switchMode(mode) {
            this.currentMode = mode;
            const chatView = document.getElementById('aiChatView');
            const callView = document.getElementById('aiCallView');
            const btnChat = document.getElementById('btnAiModeChat');
            const btnCall = document.getElementById('btnAiModeCall');

            if (btnChat) btnChat.classList.toggle('active', mode === 'chat');
            if (btnCall) btnCall.classList.toggle('active', mode === 'call');

            if (mode === 'chat') {
                this.stopPhoneCall();
                if (chatView) chatView.classList.add('active');
                if (callView) callView.classList.remove('active');
            } else {
                if (chatView) chatView.classList.remove('active');
                if (callView) callView.classList.add('active');
                this.startPhoneCall();
            }
        }

        cancelPending() {
            this.generation++;
            this.client.transport.cancel();
            this.isBusy=false;
            document.querySelectorAll('[id^="load_"]').forEach(e=>e.remove());
        }

        close() {
            this.cancelPending();
            this.stopPhoneCall();
            if (window.KoreanVoice) window.KoreanVoice.stop();
            const modal = document.getElementById('aiModal');
            if (modal) modal.classList.remove('active');
        }

        // ─── 💬 Messenger Engine ─────────────────────────────────────
        appendMessage(role, text) {
            this.chatHistory.push({ role, text, time: new Date().toLocaleTimeString().slice(0, 5) });

            const msgBox = document.getElementById('aiChatMessages');
            if (!msgBox) return;

            const isModel = role === 'model';
            const korSafe = esc(text);
            const anatomyHtml = (isModel && window.KoreanAnatomy) ? window.KoreanAnatomy.renderHtml(text, {}, true) : '';

            const bubbleHtml = `
                <div class="ai-msg-bubble ${isModel ? 'bot' : 'user'}">
                    <div class="ai-msg-avatar">${isModel ? this.currentBot.avatar : '👤'}</div>
                    <div class="ai-msg-body">
                        <div class="ai-msg-text">
                            <span>${esc(text)}</span>
                            ${isModel ? `<button type="button" class="study-action-btn ai-speak-btn" data-speak="${esc(text)}" title="Nghe phát âm">🔊</button>` : ''}
                        </div>
                        ${anatomyHtml}
                        <div class="ai-msg-time">${new Date().toLocaleTimeString().slice(0, 5)}</div>
                    </div>
                </div>
            `;

            msgBox.insertAdjacentHTML('beforeend', bubbleHtml);
            msgBox.scrollTop = msgBox.scrollHeight;

            this.updateSuggestions();
        }

        updateSuggestions() {
            const sugBox = document.getElementById('aiChatSuggestions');
            if (!sugBox) return;

            // Generate 3 contextual reply suggestion chips
            let suggestions = ['안녕하세요! 반가워요.', '저는 학생이에요.', '한국어를 좋아해요.'];
            if (this.currentBot.type === 'book') {
                suggestions = ['네, 맞아요.', '저는 베트남 사람이에요.', '만나서 반가워요!'];
            }

            sugBox.innerHTML = suggestions.map(s => `
                <button type="button" class="ai-sug-chip" onclick="KoreanAI.sendQuickMessage('${esc(s).replace(/'/g, "\\'")}')">
                    ${esc(s)}
                </button>
            `).join('');
        }

        async sendMessage(userText) {
            const text = (userText || '').trim().slice(0,2000);
            if (!text || this.isBusy) return;

            this.isBusy = true;
            const generation=this.generation;
            this.appendMessage('user', text);

            const inputEl = document.getElementById('aiChatInput');
            if (inputEl) inputEl.value = '';

            // Loading indicator
            const msgBox = document.getElementById('aiChatMessages');
            const loadId = `load_${Date.now()}`;
            if (msgBox) {
                msgBox.insertAdjacentHTML('beforeend', `
                    <div class="ai-msg-bubble bot" id="${loadId}">
                        <div class="ai-msg-avatar">${this.currentBot.avatar}</div>
                        <div class="ai-msg-body">
                            <div class="ai-typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                `);
                msgBox.scrollTop = msgBox.scrollHeight;
            }

            try {
                let reply = '';
                if (this.client.hasApiKey()) {
                    reply = await this.client.generate({
                        systemPrompt: this.currentBot.systemPrompt,
                        history: this.chatHistory.slice(0, -1),
                        userMessage: text
                    });
                } else {
                    // Offline fallback
                    await new Promise(r => setTimeout(r, 600));
                    reply = this.generateOfflineReply(text);
                }

                if(generation!==this.generation)return;
                const loadEl = document.getElementById(loadId);
                if (loadEl) loadEl.remove();

                this.appendMessage('model', reply);

                // Auto speak in call mode or chat mode if requested
                if (this.currentMode === 'call') {
                    this.speakInCall(reply);
                } else {
                    if (window.KoreanSound) window.KoreanSound.playCorrect();
                }
            } catch (err) {
                if(err.name==='AbortError'||generation!==this.generation)return;
                if(generation!==this.generation)return;
                const loadEl = document.getElementById(loadId);
                if (loadEl) loadEl.remove();

                let errText = 'Lỗi kết nối AI';
                if (err.message === 'CHUA_CO_KEY') {
                    errText = '💡 Bạn chưa nhập Gemini API Key trong phần Cài đặt. Đang sử dụng chế độ hội thoại mẫu offline!';
                    this.appendMessage('model', this.generateOfflineReply(text));
                } else {
                    this.appendMessage('model', err.message+' Bạn có thể gửi lại tin nhắn.');
                }
            } finally {
                if(generation===this.generation)this.isBusy = false;
            }
        }

        sendQuickMessage(text) {
            this.sendMessage(text);
        }

        generateOfflineReply(userText) {
            const clean = cleanKorean(userText);
            if (clean.includes('안녕')) {
                return '안녕하세요! 만나서 정말 반가워요. 오늘 기분이 어때요?';
            }
            if (clean.includes('사람') || clean.includes('베트남') || clean.includes('한국')) {
                return '네! 베트남은 정말 아름다운 나라예요. 저는 한국 사람이에요. 한국어 공부 재미있어요?';
            }
            if (clean.includes('학생') || clean.includes('회사원') || clean.includes('선생님')) {
                return '멋져요! 열심히 하는 모습이 보기 좋아요. 어떤 것을 더 연습하고 싶어요?';
            }
            if (clean.includes('이름')) {
                return '저는 한국어 친구예요. 당신과 이야기해서 정말 즐거워요!';
            }
            return '네, 잘 들었어요! 한국어로 자연스럽게 말하는 연습을 계속해 봐요. 아주 잘하고 있어요!';
        }

        // ─── 📞 Sesame Phone Call Simulation Engine ───────────────────
        startPhoneCall() {
            this.stopPhoneCall();
            const callGeneration = this.callGeneration;
            this.isCallActive = true;
            this.callSeconds = 0;
            this.isCallMuted = false;
            document.getElementById('aiCallMicBtn')?.classList.add('active');
            const micIcon = document.getElementById('aiCallMicIcon');
            const micLabel = document.getElementById('aiCallMicLabel');
            const callTimer = document.getElementById('aiCallTimer');
            if (micIcon) micIcon.textContent = '🎙️';
            if (micLabel) micLabel.textContent = 'Micro: Bật';
            if (callTimer) callTimer.textContent = '00:00';

            // Update Call UI elements
            const avatarEl = document.getElementById('aiCallAvatar');
            const nameEl = document.getElementById('aiCallName');
            const statusEl = document.getElementById('aiCallStatus');
            const subAiEl = document.getElementById('aiCallLastAiMsg');
            const subUserEl = document.getElementById('aiCallLastUserMsg');

            if (avatarEl) avatarEl.textContent = this.currentBot.avatar;
            if (nameEl) nameEl.textContent = this.currentBot.name;
            if (statusEl) statusEl.textContent = 'Đang kết nối cuộc gọi...';
            if (subAiEl) subAiEl.textContent = this.currentBot.welcomeMsg;
            if (subUserEl) subUserEl.textContent = '';

            // Start Call Timer
            if (this.callTimerInterval) clearInterval(this.callTimerInterval);
            this.callTimerInterval = setInterval(() => {
                this.callSeconds++;
                const mins = String(Math.floor(this.callSeconds / 60)).padStart(2, '0');
                const secs = String(this.callSeconds % 60).padStart(2, '0');
                const timerEl = document.getElementById('aiCallTimer');
                if (timerEl) timerEl.textContent = `${mins}:${secs}`;
            }, 1000);

            // Greet only within the call that scheduled it.
            this.callGreetingTimer = setTimeout(() => {
                if (this.isCallActive && callGeneration === this.callGeneration) {
                    this.speakInCall(this.currentBot.welcomeMsg);
                }
            }, 800);
        }

        speakInCall(text) {
            if (!this.isCallActive) return;
            const callGeneration = this.callGeneration;
            window.KoreanVoice?.stt?.stop();

            const statusEl = document.getElementById('aiCallStatus');
            const subAiEl = document.getElementById('aiCallLastAiMsg');
            const visualizer = document.querySelector('.ai-call-visualizer-center');

            if (statusEl) statusEl.innerHTML = '<span class="pulse-dot green"></span> 🤖 Đang nói...';
            if (subAiEl) subAiEl.textContent = text;
            if (visualizer) visualizer.classList.add('ai-speaking');

            this.isAiSpeaking = true;

            if (window.KoreanVoice) {
                window.KoreanVoice.speak(text, {
                    onEnd: () => {
                        if (callGeneration !== this.callGeneration || !this.isCallActive) return;
                        this.isAiSpeaking = false;
                        if (visualizer) visualizer.classList.remove('ai-speaking');
                        // After bot finishes speaking, automatically listen to user!
                        if (this.isCallActive && !this.isCallMuted) {
                            this.listenToUserInCall();
                        }
                    },
                    onError: () => {
                        if (callGeneration !== this.callGeneration || !this.isCallActive) return;
                        this.isAiSpeaking = false;
                        if (visualizer) visualizer.classList.remove('ai-speaking');
                        if (this.isCallActive && !this.isCallMuted) {
                            this.listenToUserInCall();
                        }
                    }
                });
            } else {
                this.isAiSpeaking = false;
                if (visualizer) visualizer.classList.remove('ai-speaking');
            }
        }

        listenToUserInCall() {
            if (!this.isCallActive || this.isAiSpeaking || this.isCallMuted) return;
            const callGeneration = this.callGeneration;

            const statusEl = document.getElementById('aiCallStatus');
            const subUserEl = document.getElementById('aiCallLastUserMsg');
            const visualizer = document.querySelector('.ai-call-visualizer-center');

            if (statusEl) statusEl.innerHTML = '<span class="pulse-dot cyan"></span> 🎙️ Đang lắng nghe bạn nói...';
            if (visualizer) visualizer.classList.add('user-speaking');

            if (!window.KoreanVoice || !window.KoreanVoice.stt) return;

            window.KoreanVoice.stt.startRecognition({
                onResult: (spokenText) => {
                    if (callGeneration !== this.callGeneration || !this.isCallActive) return;
                    if (visualizer) visualizer.classList.remove('user-speaking');

                    if (subUserEl) subUserEl.textContent = `Bạn: "${spokenText}"`;
                    if (statusEl) statusEl.innerHTML = '<span class="pulse-dot amber"></span> ⚡ Đang suy nghĩ...';

                    // Send spoken text to AI
                    this.sendMessage(spokenText);
                },
                onError: (err) => {
                    if (callGeneration !== this.callGeneration || !this.isCallActive) return;
                    if (visualizer) visualizer.classList.remove('user-speaking');
                    if (statusEl && this.isCallActive) {
                        statusEl.textContent = 'Nhấn Micro hoặc gõ tin nhắn để tiếp tục...';
                    }
                },
                onEnd: () => {
                    if (callGeneration !== this.callGeneration || !this.isCallActive) return;
                    if (visualizer) visualizer.classList.remove('user-speaking');
                }
            });
        }

        toggleCallMute() {
            this.isCallMuted = !this.isCallMuted;
            const btn = document.getElementById('aiCallMicBtn');
            const icon = document.getElementById('aiCallMicIcon');
            const label = document.getElementById('aiCallMicLabel');

            if (btn) btn.classList.toggle('active', !this.isCallMuted);
            if (icon) icon.textContent = this.isCallMuted ? '🔇' : '🎙️';
            if (label) label.textContent = this.isCallMuted ? 'Micro: Tắt' : 'Micro: Bật';

            if (this.isCallMuted) {
                if (window.KoreanVoice) window.KoreanVoice.stt.stop();
            } else {
                if (!this.isAiSpeaking) this.listenToUserInCall();
            }
        }

        stopPhoneCall() {
            this.callGeneration = (this.callGeneration || 0) + 1;
            clearTimeout(this.callGreetingTimer);
            this.callGreetingTimer = null;
            this.cancelPending();
            window.KoreanVoice?.stt?.stop();
            this.isCallActive = false;
            this.isAiSpeaking = false;
            if (this.callTimerInterval) {
                clearInterval(this.callTimerInterval);
                this.callTimerInterval = null;
            }
            if (window.KoreanVoice) {
                window.KoreanVoice.stop();
            }
            const visualizer = document.querySelector('.ai-call-visualizer-center');
            if (visualizer) visualizer.classList.remove('ai-speaking', 'user-speaking');
        }
    }

    window.KoreanAI = new AIEngine();

    // ─── Global Helper Shortcuts for HTML ────────────────────────────
    window.openGlobalAIBot = function (mode = 'chat') {
        window.KoreanAI.openBot('global', null, mode);
    };

    window.openBookAIBot = function (mode = 'chat') {
        const bid = window.nav ? window.nav.bid : null;
        window.KoreanAI.openBot('book', bid, mode);
    };

    window.switchAiMode = function (mode) {
        window.KoreanAI.switchMode(mode);
    };

    window.closeAiModal = function () {
        window.KoreanAI.close();
    };

    window.sendAiChatMessage = function () {
        const input = document.getElementById('aiChatInput');
        if (input) window.KoreanAI.sendMessage(input.value);
    };

    window.toggleAiChatMic = function () {
        if (!window.KoreanVoice || !window.KoreanVoice.stt) return;
        const btn = document.getElementById('aiChatMicBtn');
        const input = document.getElementById('aiChatInput');

        if (btn.classList.contains('recording')) {
            window.KoreanVoice.stt.stop();
            btn.classList.remove('recording');
            return;
        }

        btn.classList.add('recording');
        window.KoreanVoice.stt.startRecognition({
            onResult: (spoken) => {
                btn.classList.remove('recording');
                if (input) {
                    input.value = spoken;
                    window.KoreanAI.sendMessage(spoken);
                }
            },
            onError: () => btn.classList.remove('recording'),
            onEnd: () => btn.classList.remove('recording')
        });
    };

    window.toggleAiCallMute = function () {
        window.KoreanAI.toggleCallMute();
    };

    window.endAiCall = function () {
        window.KoreanAI.switchMode('chat');
    };

    // ─── Gemini API Key Settings Handlers ─────────────────────────────
    window.saveGeminiApiKey = function () {
        const input = document.getElementById('geminiApiKeyInput');
        const status = document.getElementById('geminiApiStatus');
        if (!input) return;

        const key = input.value.trim();
        localStorage.setItem('kla_gemini_api_key', key);

        if (status) {
            status.innerHTML = `<span class="colored-text-69">✅ Đã lưu API Key thành công!</span>`;
            setTimeout(() => { status.innerHTML = ''; }, 3000);
        }
    };

    window.testGeminiConnection = async function () {
        const input = document.getElementById('geminiApiKeyInput');
        const status = document.getElementById('geminiApiStatus');
        if (!input || !status) return;

        const key = input.value.trim() || localStorage.getItem('kla_gemini_api_key');
        if (!key) {
            status.innerHTML = `<span class="colored-text-70">⚠️ Vui lòng nhập API Key trước khi kiểm tra!</span>`;
            return;
        }

        status.innerHTML = `<span class="text-accent">⏳ Đang kiểm tra danh sách mô hình & kết nối Google Gemini...</span>`;

        try {
            const activeModel = await window.KoreanAI.client.testKey(key);
            localStorage.setItem('kla_gemini_api_key', key);
            status.innerHTML = `<span class="colored-text-47">🎉 Kết nối Google Gemini thành công! (Mô hình tối ưu: <code>${esc(activeModel)}</code>)</span>`;
        } catch (e) {
            status.innerHTML = `<span class="colored-text-48">❌ Kết nối thất bại: ${esc(e.message)}</span>`;
        }
    };

    window.toggleApiKeyVisibility = function () {
        const input = document.getElementById('geminiApiKeyInput');
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
    };

})();
