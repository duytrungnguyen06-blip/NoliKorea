/**
 * Korean Learning App (v3) — Sentence Anatomy Engine (Mirinae Style)
 * Decomposes Korean sentences into grammatical capsules:
 * - 🔵 Stems / Nouns / Root words
 * - 🟣 Particles (조사: 은/는, 이/가, 을/를, 에/에서, etc.)
 * - 🟢 Copulas / Endings (종결어미: 이에요/예요, 입니다/입니까, etc.)
 * - 🟡 Common idiomatic expressions
 */

(function () {
    'use strict';

    const PARTICLES = [
        { hangul: '에서', meaning: 'Ở / Tại (hành động)', role: 'particle' },
        { hangul: '으로', meaning: 'Bằng / Hướng về', role: 'particle' },
        { hangul: '한테', meaning: 'Đối với / Cho', role: 'particle' },
        { hangul: '에게', meaning: 'Đối với / Cho', role: 'particle' },
        { hangul: '부터', meaning: 'Từ (thời gian)', role: 'particle' },
        { hangul: '까지', meaning: 'Đến (thời gian/địa điểm)', role: 'particle' },
        { hangul: '하고', meaning: 'Và / Cùng với', role: 'particle' },
        { hangul: '은', meaning: 'Trợ từ chủ đề', role: 'particle' },
        { hangul: '는', meaning: 'Trợ từ chủ đề', role: 'particle' },
        { hangul: '이', meaning: 'Trợ từ chủ ngữ', role: 'particle' },
        { hangul: '가', meaning: 'Trợ từ chủ ngữ', role: 'particle' },
        { hangul: '을', meaning: 'Trợ từ tân ngữ', role: 'particle' },
        { hangul: '를', meaning: 'Trợ từ tân ngữ', role: 'particle' },
        { hangul: '에', meaning: 'Ở / Lúc / Đến', role: 'particle' },
        { hangul: '도', meaning: 'Cũng', role: 'particle' },
        { hangul: '의', meaning: 'Của', role: 'particle' },
        { hangul: '로', meaning: 'Bằng / Hướng về', role: 'particle' },
        { hangul: '와', meaning: 'Và / Với', role: 'particle' },
        { hangul: '과', meaning: 'Và / Với', role: 'particle' },
        { hangul: '랑', meaning: 'Cùng với', role: 'particle' },
        { hangul: '이랑', meaning: 'Cùng với', role: 'particle' }
    ];

    const ENDINGS = [
        { hangul: '을까요', meaning: '...nhé? / ...nhỉ? (rủ rê, đề xuất)', role: 'ending' },
        { hangul: 'ㄹ까요', meaning: '...nhé? / ...nhỉ? (rủ rê, đề xuất)', role: 'ending' },
        { hangul: '네요', meaning: '...quá nhỉ! (đuôi cảm thán)', role: 'ending' },
        { hangul: '지만', meaning: 'Nhưng (liên từ tương phản)', role: 'ending' },
        { hangul: '습니다', meaning: 'Đuôi trần thuật trang trọng', role: 'ending' },
        { hangul: '습니까', meaning: 'Đuôi nghi vấn trang trọng', role: 'ending' },
        { hangul: '으러', meaning: 'Để (chỉ mục đích chuyển động)', role: 'ending' },
        { hangul: '러', meaning: 'Để (chỉ mục đích chuyển động)', role: 'ending' },
        { hangul: '주세요', meaning: 'Làm ơn cho tôi...', role: 'expr' },
        { hangul: '얼마예요', meaning: 'Bao nhiêu tiền?', role: 'expr' },
        { hangul: '어때요', meaning: 'Như thế nào?', role: 'expr' },
        { hangul: '어떻습니까', meaning: 'Như thế nào ạ? (trang trọng)', role: 'expr' },
        { hangul: '아니에요', meaning: 'Không phải là', role: 'ending' },
        { hangul: '아닙니다', meaning: 'Không phải là (trang trọng)', role: 'ending' },
        { hangul: '이에요', meaning: 'Là (đuôi lịch sự)', role: 'ending' },
        { hangul: '예요', meaning: 'Là (đuôi lịch sự)', role: 'ending' },
        { hangul: '입니다', meaning: 'Là (đuôi trang trọng)', role: 'ending' },
        { hangul: '입니까', meaning: 'Có phải là...? (trang trọng)', role: 'ending' },
        { hangul: '있어요', meaning: 'Có / Ở', role: 'ending' },
        { hangul: '없어요', meaning: 'Không có / Không ở', role: 'ending' },
        { hangul: '안녕하세요', meaning: 'Xin chào', role: 'expr' },
        { hangul: '감사합니다', meaning: 'Cảm ơn', role: 'expr' },
        { hangul: '고맙습니다', meaning: 'Cảm ơn', role: 'expr' },
        { hangul: '죄송합니다', meaning: 'Xin lỗi', role: 'expr' },
        { hangul: '미안해요', meaning: 'Xin lỗi', role: 'expr' },
        { hangul: '하세요', meaning: 'Hãy / Chúc', role: 'ending' },
        { hangul: '합니다', meaning: 'Làm (trang trọng)', role: 'ending' },
        { hangul: '반가워요', meaning: 'Rất vui', role: 'ending' },
        { hangul: '만나서', meaning: 'Gặp gỡ nên', role: 'stem' },
        { hangul: '겠어요', meaning: 'Sẽ / Chắc là', role: 'ending' },
        { hangul: '었어요', meaning: 'Đã (quá khứ)', role: 'ending' },
        { hangul: '았어요', meaning: 'Đã (quá khứ)', role: 'ending' },
        { hangul: '어요', meaning: 'Đuôi câu thân mật lịch sự', role: 'ending' },
        { hangul: '아요', meaning: 'Đuôi câu thân mật lịch sự', role: 'ending' },
        { hangul: '세요', meaning: 'Hãy / Kính ngữ', role: 'ending' }
    ];

    const STEMS = {
        '저': { meaning: 'Tôi / Em', role: 'stem' },
        '나': { meaning: 'Tôi / Mình', role: 'stem' },
        '제': { meaning: 'Của tôi', role: 'stem' },
        '내': { meaning: 'Của mình', role: 'stem' },
        '너': { meaning: 'Cậu / Mày', role: 'stem' },
        '한국': { meaning: 'Hàn Quốc', role: 'stem' },
        '베트남': { meaning: 'Việt Nam', role: 'stem' },
        '사람': { meaning: 'Người', role: 'stem' },
        '학생': { meaning: 'Học sinh / Sinh viên', role: 'stem' },
        '선생님': { meaning: 'Thầy / Cô giáo', role: 'stem' },
        '회사원': { meaning: 'Nhân viên công ty', role: 'stem' },
        '의사': { meaning: 'Bác sĩ', role: 'stem' },
        '이름': { meaning: 'Tên', role: 'stem' },
        '친구': { meaning: 'Bạn bè', role: 'stem' },
        '나라': { meaning: 'Đất nước', role: 'stem' },
        '어느': { meaning: 'Nào', role: 'stem' },
        '무슨': { meaning: 'Gì / Nào', role: 'stem' },
        '누구': { meaning: 'Ai', role: 'stem' },
        '어디': { meaning: 'Đâu / Ở đâu', role: 'stem' },
        '언제': { meaning: 'Khi nào', role: 'stem' },
        '책': { meaning: 'Sách', role: 'stem' },
        '사과': { meaning: 'Táo', role: 'stem' },
        '물': { meaning: 'Nước', role: 'stem' },
        '밥': { meaning: 'Cơm / Bữa ăn', role: 'stem' },
        '학교': { meaning: 'Trường học', role: 'stem' },
        '집': { meaning: 'Nhà', role: 'stem' },
        '공부': { meaning: 'Học tập', role: 'stem' },
        '일': { meaning: 'Công việc', role: 'stem' },
        '한국어': { meaning: 'Tiếng Hàn', role: 'stem' },
        '안녕': { meaning: 'Bình an / Chào', role: 'stem' },
        '있': { meaning: 'Có / Ở', role: 'stem' },
        '없': { meaning: 'Không có', role: 'stem' },
        '잘': { meaning: 'Tốt / Giỏi', role: 'stem' },
        '네': { meaning: 'Vâng / Dạ', role: 'expr' },
        '아니요': { meaning: 'Không', role: 'expr' },
        '이거': { meaning: 'Cái này', role: 'stem' },
        '그거': { meaning: 'Cái đó', role: 'stem' },
        '저거': { meaning: 'Cái kia', role: 'stem' },
        '무엇': { meaning: 'Cái gì', role: 'stem' },
        '뭐': { meaning: 'Cái gì', role: 'stem' },
        '날씨': { meaning: 'Thời tiết', role: 'stem' },
        '봄': { meaning: 'Mùa xuân', role: 'stem' },
        '여름': { meaning: 'Mùa hè', role: 'stem' },
        '가을': { meaning: 'Mùa thu', role: 'stem' },
        '겨울': { meaning: 'Mùa đông', role: 'stem' },
        '비': { meaning: 'Cơn mưa', role: 'stem' },
        '눈': { meaning: 'Tuyết', role: 'stem' },
        '영화': { meaning: 'Phim ảnh', role: 'stem' },
        '음악': { meaning: 'Âm nhạc', role: 'stem' },
        '자전거': { meaning: 'Xe đạp', role: 'stem' },
        '한강': { meaning: 'Sông Hán', role: 'stem' },
        '공원': { meaning: 'Công viên', role: 'stem' },
        '주말': { meaning: 'Cuối tuần', role: 'stem' },
        '오늘': { meaning: 'Hôm nay', role: 'stem' },
        '내일': { meaning: 'Ngày mai', role: 'stem' },
        '어제': { meaning: 'Hôm qua', role: 'stem' }
    };

    function esc(s) {
        return (s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    class AnatomyEngine {
        analyzeToken(rawToken, extraDict = {}) {
            const token = rawToken.replace(/[\s.,?!~·:;'"()\[\]{}]+/g, '').trim();
            if (!token) return [];

            // 1. Extra lesson dictionary lookup
            if (extraDict[token]) {
                return [{ hangul: token, meaning: extraDict[token], role: 'stem' }];
            }

            // 2. Exact match in predefined stems
            if (STEMS[token]) {
                return [{ hangul: token, meaning: STEMS[token].meaning, role: STEMS[token].role }];
            }

            // 3. Check full endings or expressions
            for (const ending of ENDINGS) {
                if (token === ending.hangul) {
                    return [{ hangul: token, meaning: ending.meaning, role: ending.role }];
                }
                if (token.endsWith(ending.hangul) && token.length > ending.hangul.length) {
                    const stem = token.slice(0, token.length - ending.hangul.length);
                    const stemInfo = extraDict[stem]
                        ? { meaning: extraDict[stem], role: 'stem' }
                        : (STEMS[stem] || { meaning: stem, role: 'stem' });
                    return [
                        { hangul: stem, meaning: stemInfo.meaning, role: stemInfo.role },
                        { hangul: ending.hangul, meaning: ending.meaning, role: ending.role }
                    ];
                }
            }

            // 4. Check particles
            for (const p of PARTICLES) {
                if (token.endsWith(p.hangul) && token.length > p.hangul.length) {
                    const stem = token.slice(0, token.length - p.hangul.length);
                    const stemInfo = extraDict[stem]
                        ? { meaning: extraDict[stem], role: 'stem' }
                        : (STEMS[stem] || { meaning: stem, role: 'stem' });
                    return [
                        { hangul: stem, meaning: stemInfo.meaning, role: stemInfo.role },
                        { hangul: p.hangul, meaning: p.meaning, role: p.role }
                    ];
                }
            }

            // Fallback: single capsule
            return [{ hangul: token, meaning: '', role: 'stem' }];
        }

        breakdown(sentence, extraDict = {}) {
            if (!sentence) return [];
            const tokens = sentence.split(/\s+/).filter(Boolean);
            const results = [];
            tokens.forEach(t => {
                const parts = this.analyzeToken(t, extraDict);
                results.push(...parts);
            });
            return results;
        }

        renderHtml(sentence, extraDict = {}, isMini = false) {
            const parts = this.breakdown(sentence, extraDict);
            if (!parts || parts.length === 0) return '';

            let html = `<div class="sentence-anatomy ${isMini ? 'mini' : ''}">`;
            parts.forEach(p => {
                const roleLabel = p.role === 'particle'
                    ? 'Trợ từ'
                    : (p.role === 'ending' ? 'Đuôi câu' : (p.role === 'expr' ? 'Khẩu ngữ' : ''));
                html += `
                    <span class="anatomy-pill ${p.role}" title="${esc(p.meaning || roleLabel)}">
                        <span class="ana-hangul">${esc(p.hangul)}</span>
                        ${p.meaning ? `<span class="ana-gloss">${esc(p.meaning)}</span>` : (roleLabel ? `<span class="ana-role-badge">${esc(roleLabel)}</span>` : '')}
                    </span>
                `;
            });
            html += `</div>`;
            return html;
        }
    }

    window.KoreanAnatomy = new AnatomyEngine();
})();
