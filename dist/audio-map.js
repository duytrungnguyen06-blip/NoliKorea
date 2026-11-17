/**
 * Korean Learning App (v3) — Official Audio Map & Verbatim Dialogues for SNU Korean 1A
 * 
 * Maps lessons to verified studio CD audio tracks (Tracks 01–89) and supplies verbatim
 * dialogue transcripts matching the CD audio word-for-word.
 */

const AUDIO_MAP = {
    "l_snu1a_01": {
        "title": "Bài 1: Giới thiệu bản thân và Chào hỏi (소개)",
        "tracks": [
            {
                "id": "spk1",
                "type": "speaking",
                "label": "💬 Hội thoại 1",
                "desc": "Lần đầu làm quen tại Guest House (Na-na & Michael)",
                "track": 12,
                "file": "audio/snu1a/track_12.mp3"
            },
            {
                "id": "spk2",
                "type": "speaking",
                "label": "💬 Hội thoại 2",
                "desc": "Giới thiệu trước tập thể đồng nghiệp (Michael & Kelly)",
                "track": 15,
                "file": "audio/snu1a/track_15.mp3"
            },
            {
                "id": "lis1",
                "type": "listening",
                "label": "🎧 Luyện nghe 1",
                "desc": "Phỏng vấn quốc tịch 4 nhân vật (Yujin, Michael, Nana, Akira)",
                "track": 16,
                "file": "audio/snu1a/track_16.mp3"
            },
            {
                "id": "lis2",
                "type": "listening",
                "label": "🎧 Luyện nghe 2",
                "desc": "Trao đổi danh thiếp làm quen (Nicole Jones & Kim Junseok)",
                "track": 17,
                "file": "audio/snu1a/track_17.mp3"
            }
        ]
    },
    "b1a_l2": {
        "title": "Bài 2: Chỉ định từ và Đồ vật xung quanh (이거는 뭐예요?)",
        "tracks": [
            {
                "id": "spk1",
                "type": "speaking",
                "label": "💬 Hội thoại 1",
                "desc": "Hỏi tên đồ vật ở tiệm văn phòng phẩm (Stephen & Chủ tiệm)",
                "track": 22,
                "file": "audio/snu1a/track_22.mp3"
            },
            {
                "id": "spk2",
                "type": "speaking",
                "label": "💬 Hội thoại 2",
                "desc": "Mua báo chí và tạp chí tại sạp báo (Julien & Chủ sạp)",
                "track": 25,
                "file": "audio/snu1a/track_25.mp3"
            },
            {
                "id": "lis1",
                "type": "listening",
                "label": "🎧 Luyện nghe 1",
                "desc": "Xác định các đồ vật trong lớp học (mũ, bàn, ghế, máy tính)",
                "track": 26,
                "file": "audio/snu1a/track_26.mp3"
            },
            {
                "id": "lis2",
                "type": "listening",
                "label": "🎧 Luyện nghe 2",
                "desc": "Hỏi mua từ điển điện tử và tạp chí",
                "track": 27,
                "file": "audio/snu1a/track_27.mp3"
            }
        ]
    },
    "b1a_l3": {
        "title": "Bài 3: Hoạt động thường nhật và Sinh hoạt (한국어를 공부해요)",
        "tracks": [
            {
                "id": "spk1",
                "type": "speaking",
                "label": "💬 Hội thoại 1",
                "desc": "Trò chuyện qua điện thoại về việc đang làm (Mariko & Stephen)",
                "track": 32,
                "file": "audio/snu1a/track_32.mp3"
            },
            {
                "id": "spk2",
                "type": "speaking",
                "label": "💬 Hội thoại 2",
                "desc": "Hỏi thăm địa điểm học tập (Stephen & Akira)",
                "track": 35,
                "file": "audio/snu1a/track_35.mp3"
            },
            {
                "id": "lis1",
                "type": "listening",
                "label": "🎧 Luyện nghe 1",
                "desc": "Hoạt động thường ngày của 4 bạn bè (Stephen, Nana, Akira, Yujin)",
                "track": 36,
                "file": "audio/snu1a/track_36.mp3"
            },
            {
                "id": "lis2",
                "type": "listening",
                "label": "🎧 Luyện nghe 2",
                "desc": "Hoạt động cuối tuần và làm thêm dạy tiếng Pháp (Julien & Mariko)",
                "track": 37,
                "file": "audio/snu1a/track_37.mp3"
            }
        ]
    },
    "b1a_l4": {
        "title": "Bài 4: Vị trí và Nơi chốn (어디에 있어요?)",
        "tracks": [
            {
                "id": "spk1",
                "type": "speaking",
                "label": "💬 Hội thoại 1",
                "desc": "Khám phá khu phố cổ Insadong (Yujin & Jungwoo)",
                "track": 42,
                "file": "audio/snu1a/track_42.mp3"
            },
            {
                "id": "spk2",
                "type": "speaking",
                "label": "💬 Hội thoại 2",
                "desc": "Hỏi vị trí và đích đến sân bay, bưu điện (Julien & Stephen)",
                "track": 45,
                "file": "audio/snu1a/track_45.mp3"
            },
            {
                "id": "lis1",
                "type": "listening",
                "label": "🎧 Luyện nghe 1",
                "desc": "Kế hoạch đón bạn gái & địa điểm đại sứ quán (Akira & Nana)",
                "track": 46,
                "file": "audio/snu1a/track_46.mp3"
            },
            {
                "id": "lis2",
                "type": "listening",
                "label": "🎧 Luyện nghe 2",
                "desc": "Tìm kiếm đồ đạc thất lạc trong phòng (Chồng & Vợ)",
                "track": 47,
                "file": "audio/snu1a/track_47.mp3"
            }
        ]
    },
    "b1a_l5": {
        "title": "Bài 5: Hoạt động cuối tuần và Thời gian biểu (주말)",
        "tracks": [
            {
                "id": "spk1",
                "type": "speaking",
                "label": "💬 Hội thoại 1",
                "desc": "Hỏi về lịch hẹn ngày 9/5 và thứ trong tuần (Minsoo & Akira)",
                "track": 52,
                "file": "audio/snu1a/track_52.mp3"
            },
            {
                "id": "spk2",
                "type": "speaking",
                "label": "💬 Hội thoại 2",
                "desc": "Kể lại việc đã làm vào cuối tuần tại COEX Mall (Julien & Mariko)",
                "track": 55,
                "file": "audio/snu1a/track_55.mp3"
            },
            {
                "id": "lis1",
                "type": "listening",
                "label": "🎧 Luyện nghe 1",
                "desc": "6 đoạn hỏi đáp nhanh ngày tháng, sinh nhật, lịch bay",
                "track": 56,
                "file": "audio/snu1a/track_56.mp3"
            },
            {
                "id": "lis2",
                "type": "listening",
                "label": "🎧 Luyện nghe 2",
                "desc": "Trao đổi về ôn thi tiếng Hàn và kỳ nghỉ Nhật Bản (Jiyeon & Mariko)",
                "track": 57,
                "file": "audio/snu1a/track_57.mp3"
            }
        ]
    },
    "b1a_l6": {
        "title": "Bài 6: Ngôn ngữ thương mại cơ bản & Mua sắm (쇼핑)",
        "tracks": [
            {
                "id": "spk1",
                "type": "speaking",
                "label": "💬 Hội thoại 1",
                "desc": "Gọi món cơm trộn bibimbap & canh sườn (Nhân viên & Steven & Yujin)",
                "track": 62,
                "file": "audio/snu1a/track_62.mp3"
            },
            {
                "id": "spk2",
                "type": "speaking",
                "label": "💬 Hội thoại 2",
                "desc": "Hỏi giá và mua táo, cam tại tiệm hoa quả (Mariko & Bác chủ tiệm)",
                "track": 65,
                "file": "audio/snu1a/track_65.mp3"
            },
            {
                "id": "lis1",
                "type": "listening",
                "label": "🎧 Luyện nghe 1",
                "desc": "Hỏi giá thức uống bánh ngọt tại tiệm cà phê (4 tình huống)",
                "track": 66,
                "file": "audio/snu1a/track_66.mp3"
            },
            {
                "id": "lis2",
                "type": "listening",
                "label": "🎧 Luyện nghe 2",
                "desc": "Chọn món ăn cơm trộn tại nhà ăn sinh viên (Julien & Kelly)",
                "track": 67,
                "file": "audio/snu1a/track_67.mp3"
            }
        ]
    },
    "b1a_l7": {
        "title": "Bài 7: Quan sát và Miêu tả thời tiết (날씨)",
        "tracks": [
            {
                "id": "spk1",
                "type": "speaking",
                "label": "💬 Hội thoại 1",
                "desc": "Gọi điện hỏi thời tiết giữa Tokyo và Seoul (Akira & Minsoo)",
                "track": 72,
                "file": "audio/snu1a/track_72.mp3"
            },
            {
                "id": "spk2",
                "type": "speaking",
                "label": "💬 Hội thoại 2",
                "desc": "Thuyết trình trang trọng về mùa đông tại Paris (Julien)",
                "track": 75,
                "file": "audio/snu1a/track_75.mp3"
            },
            {
                "id": "lis1",
                "type": "listening",
                "label": "🎧 Luyện nghe 1",
                "desc": "Bản tin thời tiết 4 nước: Hàn, Trung, Mỹ, Pháp",
                "track": 76,
                "file": "audio/snu1a/track_76.mp3"
            },
            {
                "id": "lis2",
                "type": "listening",
                "label": "🎧 Luyện nghe 2",
                "desc": "Kể về chuyến đi du lịch biển Busan ăn hải sản (Nana & Bạn)",
                "track": 77,
                "file": "audio/snu1a/track_77.mp3"
            }
        ]
    },
    "b1a_l8": {
        "title": "Bài 8: Rủ rê, Hẹn hò và Hoạt động giải trí (영화 볼까요?)",
        "tracks": [
            {
                "id": "spk1",
                "type": "speaking",
                "label": "💬 Hội thoại 1",
                "desc": "Rủ bạn đi đạp xe ở sông Hán (Jungwoo & Kelly)",
                "track": 82,
                "file": "audio/snu1a/track_82.mp3"
            },
            {
                "id": "spk2",
                "type": "speaking",
                "label": "💬 Hội thoại 2",
                "desc": "Trải nghiệm đạp xe đón gió tại công viên sông Hán (Jungwoo & Kelly)",
                "track": 85,
                "file": "audio/snu1a/track_85.mp3"
            },
            {
                "id": "lis1",
                "type": "listening",
                "label": "🎧 Luyện nghe 1",
                "desc": "4 tình huống rủ rê giải trí: tennis, trượt băng, đá bóng, đi dạo",
                "track": 86,
                "file": "audio/snu1a/track_86.mp3"
            },
            {
                "id": "lis2",
                "type": "listening",
                "label": "🎧 Luyện nghe 2",
                "desc": "Hẹn hò đi hát karaoke vào Chủ Nhật (Julien & Kelly)",
                "track": 87,
                "file": "audio/snu1a/track_87.mp3"
            }
        ]
    }
};

const LESSON_DIALOGUES = {
    "l_snu1a_01": [
        {
            "id": "spk1",
            "title": "Lần đầu làm quen tại nhà khách",
            "shortTitle": "💬 Hội thoại 1",
            "sub": "Na-na và Michael tình cờ gặp nhau tại sảnh Guest House.",
            "context": "Na-na và Michael tình cờ gặp nhau tại sảnh Guest House.",
            "track": 12,
            "file": "audio/snu1a/track_12.mp3",
            "lines": [
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-a",
                    "korean": "안녕하세요? 저는 나나예요.",
                    "vi": "Xin chào? Tôi là Nana."
                },
                {
                    "speaker": "마이클 (Michael)",
                    "avatar": "🇬🇧",
                    "role": "speaker-b",
                    "korean": "안녕하세요? 저는 마이클이에요.",
                    "vi": "Xin chào? Tôi là Michael."
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-a",
                    "korean": "만나서 반가워요, 마이클 씨.",
                    "vi": "Rất vui được gặp anh, Michael."
                },
                {
                    "speaker": "마이클 (Michael)",
                    "avatar": "🇬🇧",
                    "role": "speaker-b",
                    "korean": "반가워요. 나나 씨는 어느 나라 사람이에요?",
                    "vi": "Rất vui được gặp bạn. Nana là người nước nào?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-a",
                    "korean": "저는 중국 사람이에요.",
                    "vi": "Tôi là người Trung Quốc."
                }
            ]
        },
        {
            "id": "spk2",
            "title": "Giới thiệu trước tập thể",
            "shortTitle": "💬 Hội thoại 2",
            "sub": "Buổi gặp gỡ trang trọng giữa các đồng nghiệp mới.",
            "context": "Buổi gặp gỡ trang trọng giữa các đồng nghiệp mới.",
            "track": 15,
            "file": "audio/snu1a/track_15.mp3",
            "lines": [
                {
                    "speaker": "마이클 (Michael)",
                    "avatar": "🇬🇧",
                    "role": "speaker-a",
                    "korean": "여러분, 만나서 반갑습니다. 저는 마이클입니다.",
                    "vi": "Chào mọi người, rất hân hạnh được gặp các bạn. Tôi là Michael."
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "🇺🇸",
                    "role": "speaker-b",
                    "korean": "안녕하세요? 마이클 씨는 미국 사람입니까?",
                    "vi": "Xin chào? Anh Michael có phải là người Mỹ không?"
                },
                {
                    "speaker": "마이클 (Michael)",
                    "avatar": "🇬🇧",
                    "role": "speaker-a",
                    "korean": "아니요, 저는 미국 사람이 아닙니다. 영국 사람입니다.",
                    "vi": "Không, tôi không phải là người Mỹ. Tôi là người Anh."
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "🇺🇸",
                    "role": "speaker-b",
                    "korean": "아, 네. 직업은 무엇입니까?",
                    "vi": "À, vâng. Nghề nghiệp của anh là gì ạ?"
                },
                {
                    "speaker": "마이클 (Michael)",
                    "avatar": "🇬🇧",
                    "role": "speaker-a",
                    "korean": "기자입니다.",
                    "vi": "Tôi là phóng viên."
                }
            ]
        },
        {
            "id": "lis1",
            "title": "Phỏng vấn quốc tịch 4 nhân vật",
            "shortTitle": "🎧 Luyện nghe 1",
            "sub": "Các đoạn đối thoại hỏi đáp nhanh về quốc tịch của 4 bạn du học sinh.",
            "context": "Các đoạn đối thoại hỏi đáp nhanh về quốc tịch của 4 bạn du học sinh.",
            "track": 16,
            "file": "audio/snu1a/track_16.mp3",
            "lines": [
                {
                    "speaker": "남 (Hỏi 1)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "유진 씨, 미국 사람이에요?",
                    "vi": "Yujin, bạn là người Mỹ phải không?"
                },
                {
                    "speaker": "유진 (Yujin)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "네, 미국 사람이에요.",
                    "vi": "Vâng, tôi là người Mỹ."
                },
                {
                    "speaker": "여 (Hỏi 2)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "마이클 씨는 미국 사람입니까?",
                    "vi": "Michael, anh có phải người Mỹ không?"
                },
                {
                    "speaker": "마이클 (Michael)",
                    "avatar": "🇬🇧",
                    "role": "speaker-a",
                    "korean": "아니요, 영국 사람입니다.",
                    "vi": "Không, tôi là người Anh."
                },
                {
                    "speaker": "남 (Hỏi 3)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "나나 씨, 어느 나라 사람이에요?",
                    "vi": "Nana, bạn là người nước nào?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-b",
                    "korean": "저는 중국 사람이에요.",
                    "vi": "Tôi là người Trung Quốc."
                },
                {
                    "speaker": "여 (Hỏi 4)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아키라 씨는 일본 사람입니까?",
                    "vi": "Akira, bạn là người Nhật Bản phải không?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "네, 일본 사람입니다.",
                    "vi": "Vâng, tôi là người Nhật Bản."
                }
            ]
        },
        {
            "id": "lis2",
            "title": "Trao đổi danh thiếp",
            "shortTitle": "🎧 Luyện nghe 2",
            "sub": "Cuộc gặp làm quen và trao đổi danh thiếp giữa cô giáo Nicole Jones và anh Kim Junseok.",
            "context": "Cuộc gặp làm quen và trao đổi danh thiếp giữa cô giáo Nicole Jones và anh Kim Junseok.",
            "track": 17,
            "file": "audio/snu1a/track_17.mp3",
            "lines": [
                {
                    "speaker": "니콜 (Nicole)",
                    "avatar": "🇨🇦",
                    "role": "speaker-a",
                    "korean": "안녕하세요? 김준석 씨?",
                    "vi": "Xin chào? Anh là Kim Junseok phải không?"
                },
                {
                    "speaker": "김민수 (Minsoo)",
                    "avatar": "🇰🇷",
                    "role": "speaker-b",
                    "korean": "아니요, 저는 김준석이 아닙니다. 저는 김민수입니다.",
                    "vi": "Không, tôi không phải Kim Junseok. Tôi là Kim Minsoo."
                },
                {
                    "speaker": "니콜 (Nicole)",
                    "avatar": "🇨🇦",
                    "role": "speaker-a",
                    "korean": "안녕하세요? 김준석 씨입니까?",
                    "vi": "Xin chào? Anh có phải là Kim Junseok không ạ?"
                },
                {
                    "speaker": "김준석 (Junseok)",
                    "avatar": "🇰🇷",
                    "role": "speaker-b",
                    "korean": "네, 김준석입니다.",
                    "vi": "Vâng, tôi là Kim Junseok."
                },
                {
                    "speaker": "니콜 (Nicole)",
                    "avatar": "🇨🇦",
                    "role": "speaker-a",
                    "korean": "저는 니콜 존스입니다. 만나서 반갑습니다.",
                    "vi": "Tôi là Nicole Jones. Rất hân hạnh được gặp anh."
                },
                {
                    "speaker": "김준석 (Junseok)",
                    "avatar": "🇰🇷",
                    "role": "speaker-b",
                    "korean": "네, 반갑습니다.",
                    "vi": "Vâng, rất vui được gặp cô."
                },
                {
                    "speaker": "니콜 (Nicole)",
                    "avatar": "🇨🇦",
                    "role": "speaker-a",
                    "korean": "제 명함입니다.",
                    "vi": "Đây là danh thiếp của tôi."
                },
                {
                    "speaker": "김준석 (Junseok)",
                    "avatar": "🇰🇷",
                    "role": "speaker-b",
                    "korean": "아, 네. 아, 선생님입니까?",
                    "vi": "À, vâng. À, cô là giáo viên ạ?"
                },
                {
                    "speaker": "니콜 (Nicole)",
                    "avatar": "🇨🇦",
                    "role": "speaker-a",
                    "korean": "네, 영어 선생님입니다.",
                    "vi": "Vâng, tôi là giáo viên tiếng Anh."
                },
                {
                    "speaker": "김준석 (Junseok)",
                    "avatar": "🇰🇷",
                    "role": "speaker-b",
                    "korean": "니콜 씨는 미국 사람입니까?",
                    "vi": "Cô Nicole là người Mỹ phải không?"
                },
                {
                    "speaker": "니콜 (Nicole)",
                    "avatar": "🇨🇦",
                    "role": "speaker-a",
                    "korean": "아니요, 미국 사람이 아닙니다. 캐나다 사람입니다.",
                    "vi": "Không, tôi không phải người Mỹ. Tôi là người Canada."
                }
            ]
        }
    ],
    "b1a_l2": [
        {
            "id": "spk1",
            "title": "Hỏi đồ vật trong tiệm văn phòng phẩm",
            "shortTitle": "💬 Hội thoại 1",
            "sub": "Stephen bước vào tiệm văn phòng phẩm BEST Office để tìm mua từ điển và hỏi tên đồ dùng học tập.",
            "context": "Stephen bước vào tiệm văn phòng phẩm BEST Office để tìm mua từ điển và hỏi tên đồ dùng học tập.",
            "track": 22,
            "file": "audio/snu1a/track_22.mp3",
            "lines": [
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "전자사전 있어요?",
                    "vi": "Ở đây có từ điển điện tử không ạ?"
                },
                {
                    "speaker": "아주머니 (Chủ tiệm)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아니요, 없어요.",
                    "vi": "Không có cháu ơi."
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "이거는 한국어로 뭐예요?",
                    "vi": "Cái này trong tiếng Hàn gọi là gì ạ?"
                },
                {
                    "speaker": "아주머니 (Chủ tiệm)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "자예요.",
                    "vi": "Là cây thước kẻ đấy."
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "저거는 연필이에요?",
                    "vi": "Cái kia có phải là bút chì không ạ?"
                },
                {
                    "speaker": "아주머니 (Chủ tiệm)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아니요, 볼펜이에요.",
                    "vi": "Không, là bút bi đấy."
                }
            ]
        },
        {
            "id": "spk2",
            "title": "Mua báo chí tại quầy sạp",
            "shortTitle": "💬 Hội thoại 2",
            "sub": "Julien ghé vào một sạp báo vỉa hè (Kiosk) trên đường phố Seoul để mua tờ báo tiếng Hàn.",
            "context": "Julien ghé vào một sạp báo vỉa hè (Kiosk) trên đường phố Seoul để mua tờ báo tiếng Hàn.",
            "track": 25,
            "file": "audio/snu1a/track_25.mp3",
            "lines": [
                {
                    "speaker": "아주머니 (Chủ sạp)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "어서 오세요.",
                    "vi": "Xin chào, mời vào."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-b",
                    "korean": "신문 있어요?",
                    "vi": "Ở đây có báo không ạ?"
                },
                {
                    "speaker": "아주머니 (Chủ sạp)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "네, 있어요. 한국신문하고 나라신문이 있어요.",
                    "vi": "Có chứ. Có báo Hàn Quốc và báo Nara."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-b",
                    "korean": "한국신문 주세요.",
                    "vi": "Cho cháu tờ báo Hàn Quốc nhé."
                },
                {
                    "speaker": "아주머니 (Chủ sạp)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "여기 있어요.",
                    "vi": "Của cháu đây."
                }
            ]
        },
        {
            "id": "lis1",
            "title": "Xác định đồ vật trong lớp học",
            "shortTitle": "🎧 Luyện nghe 1",
            "sub": "4 đoạn đối thoại ngắn xác định tên gọi các đồ vật xung quanh.",
            "context": "4 đoạn đối thoại ngắn xác định tên gọi các đồ vật xung quanh.",
            "track": 26,
            "file": "audio/snu1a/track_26.mp3",
            "lines": [
                {
                    "speaker": "남 (Hỏi 1)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "이거는 모자예요?",
                    "vi": "Cái này là cái mũ à?"
                },
                {
                    "speaker": "여 (Đáp 1)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "네, 그거는 모자예요.",
                    "vi": "Vâng, cái đó là cái mũ."
                },
                {
                    "speaker": "여 (Hỏi 2)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "저거는 한국어로 뭐예요?",
                    "vi": "Cái kia tiếng Hàn là gì thế?"
                },
                {
                    "speaker": "남 (Đáp 2)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "책상이에요.",
                    "vi": "Là cái bàn học."
                },
                {
                    "speaker": "여 (Hỏi 3)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "이거는 한국어로 뭐예요?",
                    "vi": "Cái này tiếng Hàn là gì ạ?"
                },
                {
                    "speaker": "남 (Đáp 3)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "이거는 의자예요.",
                    "vi": "Cái này là cái ghế."
                },
                {
                    "speaker": "남 (Hỏi 4)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "저거는 텔레비전이에요?",
                    "vi": "Cái kia là tivi phải không?"
                },
                {
                    "speaker": "여 (Đáp 4)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아니요, 저거는 텔레비전이 아니에요. 컴퓨터예요.",
                    "vi": "Không, cái kia không phải tivi. Là máy tính."
                }
            ]
        },
        {
            "id": "lis2",
            "title": "Mua từ điển và tạp chí",
            "shortTitle": "🎧 Luyện nghe 2",
            "sub": "Khách hàng ghé tiệm tìm mua từ điển tiếng Hàn và hỏi về tạp chí.",
            "context": "Khách hàng ghé tiệm tìm mua từ điển tiếng Hàn và hỏi về tạp chí.",
            "track": 27,
            "file": "audio/snu1a/track_27.mp3",
            "lines": [
                {
                    "speaker": "아주머니 (Chủ tiệm)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "어서 오세요.",
                    "vi": "Xin chào, mời quý khách."
                },
                {
                    "speaker": "손님 (Khách)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "한국어 사전 있어요?",
                    "vi": "Ở đây có từ điển tiếng Hàn không ạ?"
                },
                {
                    "speaker": "아주머니 (Chủ tiệm)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "네, 있어요.",
                    "vi": "Vâng, có chứ ạ."
                },
                {
                    "speaker": "손님 (Khách)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "전자사전이에요?",
                    "vi": "Là từ điển điện tử phải không?"
                },
                {
                    "speaker": "아주머니 (Chủ tiệm)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "네, 전자사전이에요.",
                    "vi": "Vâng, là từ điển điện tử ạ."
                },
                {
                    "speaker": "손님 (Khách)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "그럼 그거 주세요.",
                    "vi": "Thế thì cho tôi lấy cái đó nhé."
                },
                {
                    "speaker": "아주머니 (Chủ tiệm)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "여기 있어요.",
                    "vi": "Của anh đây ạ."
                },
                {
                    "speaker": "손님 (Khách)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "음, 잡지 있어요?",
                    "vi": "Ừm, có tạp chí không cô?"
                },
                {
                    "speaker": "아주머니 (Chủ tiệm)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "네, 한국 잡지하고 미국 잡지가 있어요.",
                    "vi": "Có ạ, có tạp chí Hàn Quốc và tạp chí Mỹ."
                },
                {
                    "speaker": "손님 (Khách)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "일본 잡지는 없어요?",
                    "vi": "Tạp chí Nhật thì không có ạ?"
                },
                {
                    "speaker": "아주머니 (Chủ tiệm)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "네, 없어요.",
                    "vi": "Vâng, không có rồi ạ."
                }
            ]
        }
    ],
    "b1a_l3": [
        {
            "id": "spk1",
            "title": "Trò chuyện qua điện thoại về hoạt động trong ngày",
            "shortTitle": "💬 Hội thoại 1",
            "sub": "Mariko và Stephen gọi điện hỏi thăm các hoạt động trong ngày của nhau.",
            "context": "Mariko và Stephen gọi điện hỏi thăm các hoạt động trong ngày của nhau.",
            "track": 32,
            "file": "audio/snu1a/track_32.mp3",
            "lines": [
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "스티븐 씨, 지금 뭐 해요?",
                    "vi": "Stephen ơi, bây giờ bạn đang làm gì đấy?"
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "공부해요. 마리코 씨는 뭐 해요?",
                    "vi": "Mình đang học bài. Mariko đang làm gì đấy?"
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "저는 책을 읽어요.",
                    "vi": "Mình đang đọc sách."
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "한국어 책을 읽어요?",
                    "vi": "Bạn đọc sách tiếng Hàn à?"
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "아니요, 일본어 책을 읽어요.",
                    "vi": "Không, mình đọc sách tiếng Nhật."
                }
            ]
        },
        {
            "id": "spk2",
            "title": "Hỏi thăm địa điểm học tập",
            "shortTitle": "💬 Hội thoại 2",
            "sub": "Stephen gặp Akira và hỏi thăm nơi anh ấy thường tự học bài.",
            "context": "Stephen gặp Akira và hỏi thăm nơi anh ấy thường tự học bài.",
            "track": 35,
            "file": "audio/snu1a/track_35.mp3",
            "lines": [
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "아키라 씨, 지금 뭐 해요?",
                    "vi": "Akira ơi, bây giờ bạn đang làm gì đấy?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "공부해요.",
                    "vi": "Mình đang học bài."
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "도서관에서 공부해요?",
                    "vi": "Bạn học ở thư viện à?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "아니요, 도서관에서 공부 안 해요.",
                    "vi": "Không, mình không học ở thư viện."
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "그럼 어디에서 공부해요?",
                    "vi": "Thế thì bạn học ở đâu?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "집에서 공부해요.",
                    "vi": "Mình học ở nhà."
                }
            ]
        },
        {
            "id": "lis1",
            "title": "Hoạt động thường nhật của bạn bè",
            "shortTitle": "🎧 Luyện nghe 1",
            "sub": "Hỏi thăm hoạt động thường ngày của Stephen, Nana, Akira và Yujin.",
            "context": "Hỏi thăm hoạt động thường ngày của Stephen, Nana, Akira và Yujin.",
            "track": 36,
            "file": "audio/snu1a/track_36.mp3",
            "lines": [
                {
                    "speaker": "여 (Hỏi 1)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "스티븐 씨, 지금 뭐 해요?",
                    "vi": "Stephen ơi, bây giờ bạn đang làm gì đấy?"
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "책을 읽어요.",
                    "vi": "Mình đang đọc sách."
                },
                {
                    "speaker": "남 (Hỏi 2)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "나나 씨, 오늘 뭐 해요?",
                    "vi": "Nana ơi, hôm nay bạn làm gì?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-b",
                    "korean": "친구를 만나요.",
                    "vi": "Mình đi gặp bạn."
                },
                {
                    "speaker": "여 (Hỏi 3)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아키라 씨, 지금 일 해요?",
                    "vi": "Akira ơi, bây giờ bạn đang làm việc à?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "아니요, 일 안 해요. 운동해요.",
                    "vi": "Không, mình không làm việc. Mình đang tập thể dục."
                },
                {
                    "speaker": "남 (Hỏi 4)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "유진 씨, 집에서 뭐 해요?",
                    "vi": "Yujin ơi, ở nhà bạn làm gì thế?"
                },
                {
                    "speaker": "유진 (Yujin)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "텔레비전을 봐요.",
                    "vi": "Mình xem tivi."
                }
            ]
        },
        {
            "id": "lis2",
            "title": "Hoạt động cuối tuần và làm thêm",
            "shortTitle": "🎧 Luyện nghe 2",
            "sub": "Julien và Mariko trò chuyện về việc đi làm thêm dạy tiếng Pháp và đọc sách.",
            "context": "Julien và Mariko trò chuyện về việc đi làm thêm dạy tiếng Pháp và đọc sách.",
            "track": 37,
            "file": "audio/snu1a/track_37.mp3",
            "lines": [
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "마리코 씨, 지금 뭐 해요?",
                    "vi": "Mariko ơi, bây giờ bạn đang làm gì đấy?"
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "커피숍에서 커피를 마셔요.",
                    "vi": "Mình đang uống cà phê ở quán cà phê."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "지금 친구를 만나요?",
                    "vi": "Bây giờ bạn gặp bạn bè à?"
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "아니요, 친구를 안 만나요. 책을 읽어요. 줄리앙 씨는 지금 뭐 해요?",
                    "vi": "Không, mình không gặp bạn. Mình đang đọc sách. Còn Julien bây giờ đang làm gì?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "식당에서 밥을 먹어요.",
                    "vi": "Mình đang ăn cơm ở quán ăn."
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "그리고 오늘 뭐 해요?",
                    "vi": "Thế hôm nay bạn làm gì nữa?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "아르바이트해요. 프랑스어를 가르쳐요.",
                    "vi": "Mình đi làm thêm. Mình dạy tiếng Pháp."
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "어디에서 가르쳐요?",
                    "vi": "Bạn dạy ở đâu thế?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "학생 집에서 가르쳐요.",
                    "vi": "Mình dạy tại nhà học sinh."
                }
            ]
        }
    ],
    "b1a_l4": [
        {
            "id": "spk1",
            "title": "Khám phá khu phố Insa-dong",
            "shortTitle": "💬 Hội thoại 1",
            "sub": "Yujin và Jungwoo đang đi dạo và cùng tìm hiểu về khu phố truyền thống Insadong.",
            "context": "Yujin và Jungwoo đang đi dạo và cùng tìm hiểu về khu phố truyền thống Insadong.",
            "track": 42,
            "file": "audio/snu1a/track_42.mp3",
            "lines": [
                {
                    "speaker": "유진 (Yujin)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "여기가 인사동이에요?",
                    "vi": "Đây có phải là Insadong không?"
                },
                {
                    "speaker": "정우 (Jungwoo)",
                    "avatar": "👨",
                    "role": "speaker-b",
                    "korean": "네, 인사동이에요.",
                    "vi": "Đúng rồi, đây là Insadong đấy."
                },
                {
                    "speaker": "유진 (Yujin)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "인사동에서 뭐 해요?",
                    "vi": "Ở Insadong người ta thường làm gì thế?"
                },
                {
                    "speaker": "정우 (Jungwoo)",
                    "avatar": "👨",
                    "role": "speaker-b",
                    "korean": "차를 마셔요. 인사동에는 찻집이 있어요.",
                    "vi": "Mọi người thường uống trà. Ở Insadong có rất nhiều quán trà truyền thống."
                }
            ]
        },
        {
            "id": "spk2",
            "title": "Hỏi đường và phương hướng",
            "shortTitle": "💬 Hội thoại 2",
            "sub": "Julien và Steven gặp nhau ở sảnh và hỏi về lịch trình di chuyển của nhau.",
            "context": "Julien và Steven gặp nhau ở sảnh và hỏi về lịch trình di chuyển của nhau.",
            "track": 45,
            "file": "audio/snu1a/track_45.mp3",
            "lines": [
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "스티븐 씨, 어디에 가요?",
                    "vi": "Steven à, bạn đang đi đâu đấy?"
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "공항에 가요. 친구가 한국에 와요. 줄리앙 씨는 어디에 가요?",
                    "vi": "Mình đi sân bay. Bạn mình sắp đến Hàn Quốc. Còn Julien đi đâu thế?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "우체국에 가요.",
                    "vi": "Mình đi bưu điện."
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "우체국이 어디에 있어요?",
                    "vi": "Bưu điện ở đâu vậy?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "한국은행 알아요? 한국은행 앞에 있어요.",
                    "vi": "Bạn có biết Ngân hàng Hàn Quốc không? Bưu điện nằm ngay phía trước ngân hàng đấy."
                }
            ]
        },
        {
            "id": "lis1",
            "title": "Kế hoạch di chuyển & Địa điểm đại sứ quán",
            "shortTitle": "🎧 Luyện nghe 1",
            "sub": "Akira đi đón bạn gái ở sân bay và Nana hỏi đường đến Đại sứ quán Trung Quốc.",
            "context": "Akira đi đón bạn gái ở sân bay và Nana hỏi đường đến Đại sứ quán Trung Quốc.",
            "track": 46,
            "file": "audio/snu1a/track_46.mp3",
            "lines": [
                {
                    "speaker": "여 (Bạn học)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아키라 씨, 오늘 뭐 해요?",
                    "vi": "Akira ơi, hôm nay bạn làm gì thế?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "공항에 가요. 여자 친구가 한국에 와요.",
                    "vi": "Mình đi sân bay. Bạn gái mình sắp đến Hàn Quốc."
                },
                {
                    "speaker": "여 (Bạn học)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "여자 친구는 어디에 있어요?",
                    "vi": "Bạn gái bạn đang ở đâu?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "일본에 있어요. 은행에서 일해요.",
                    "vi": "Cô ấy ở Nhật. Làm việc ở ngân hàng."
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "나나 씨는 오늘 뭐 해요?",
                    "vi": "Còn Nana hôm nay làm gì?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-b",
                    "korean": "저는 중국 대사관에 가요.",
                    "vi": "Mình đi Đại sứ quán Trung Quốc."
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "중국 대사관이 어디에 있어요?",
                    "vi": "Đại sứ quán Trung Quốc ở đâu vậy?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-b",
                    "korean": "중앙우체국 알아요? 중앙우체국 뒤에 있어요.",
                    "vi": "Bạn có biết Bưu điện trung tâm không? Nằm ngay phía sau bưu điện đấy."
                }
            ]
        },
        {
            "id": "lis2",
            "title": "Tìm kiếm đồ vật trong phòng",
            "shortTitle": "🎧 Luyện nghe 2",
            "sub": "Cuộc đối thoại tìm đồ thất lạc trong phòng: ô, điện thoại, mắt kính và bia.",
            "context": "Cuộc đối thoại tìm đồ thất lạc trong phòng: ô, điện thoại, mắt kính và bia.",
            "track": 47,
            "file": "audio/snu1a/track_47.mp3",
            "lines": [
                {
                    "speaker": "남편 (Chồng)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "여보! 우산이 어디에 있어요?",
                    "vi": "Em ơi! Cây dù ở đâu thế?"
                },
                {
                    "speaker": "아내 (Vợ)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "창문 아래에 있어요.",
                    "vi": "Ở ngay dưới cửa sổ ấy anh."
                },
                {
                    "speaker": "남편 (Chồng)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "휴대폰은 어디에 있어요?",
                    "vi": "Điện thoại di động ở đâu vậy em?"
                },
                {
                    "speaker": "아내 (Vợ)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "가방 안에 있어요.",
                    "vi": "Ở trong túi xách ấy anh."
                },
                {
                    "speaker": "남편 (Chồng)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "음, 가방 안에 없어요.",
                    "vi": "Ừm, trong túi xách không có."
                },
                {
                    "speaker": "아내 (Vợ)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아! 책상 위에 있어요.",
                    "vi": "À! Nó nằm ở trên bàn làm việc kìa."
                },
                {
                    "speaker": "남편 (Chồng)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "안경은 어디에 있어요?",
                    "vi": "Mắt kính ở đâu vậy em?"
                },
                {
                    "speaker": "아내 (Vợ)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "휴대폰 옆에 없어요?",
                    "vi": "Không có ở cạnh điện thoại à?"
                },
                {
                    "speaker": "남편 (Chồng)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "없어요.",
                    "vi": "Không có."
                },
                {
                    "speaker": "아내 (Vợ)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아! 텔레비전 위에 있어요.",
                    "vi": "À! Nó ở ngay trên tivi ấy."
                },
                {
                    "speaker": "남편 (Chồng)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "고마워요. 냉장고 안에 맥주가 있어요?",
                    "vi": "Cảm ơn em. Trong tủ lạnh có bia không em?"
                },
                {
                    "speaker": "아내 (Vợ)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아니요, 없어요.",
                    "vi": "Không, không có đâu anh."
                }
            ]
        }
    ],
    "b1a_l5": [
        {
            "id": "spk1",
            "title": "Hỏi về lịch hẹn & Thứ trong tuần",
            "shortTitle": "💬 Hội thoại 1",
            "sub": "Minsoo rủ Akira tham gia buổi tiệc vào cuối tuần.",
            "context": "Minsoo rủ Akira tham gia buổi tiệc vào cuối tuần.",
            "track": 52,
            "file": "audio/snu1a/track_52.mp3",
            "lines": [
                {
                    "speaker": "민수 (Minsoo)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "5월 9일에 시간이 있어요?",
                    "vi": "Ngày 9 tháng 5 bạn có thời gian rảnh không?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "9일이 무슨 요일이에요?",
                    "vi": "Ngày mùng 9 là thứ mấy vậy?"
                },
                {
                    "speaker": "민수 (Minsoo)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "금요일이에요. 금요일에 파티가 있어요.",
                    "vi": "Là thứ Sáu. Vào thứ Sáu có một bữa tiệc."
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "아, 미안해요. 금요일에는 약속이 있어요. 친구하고 같이 영화를 봐요.",
                    "vi": "Ôi, xin lỗi bạn nhé. Thứ Sáu mình có hẹn mất rồi. Mình đi xem phim cùng với bạn."
                }
            ]
        },
        {
            "id": "spk2",
            "title": "Kể về hoạt động cuối tuần",
            "shortTitle": "💬 Hội thoại 2",
            "sub": "Julien và Mariko hỏi thăm nhau về kỳ nghỉ cuối tuần vừa qua.",
            "context": "Julien và Mariko hỏi thăm nhau về kỳ nghỉ cuối tuần vừa qua.",
            "track": 55,
            "file": "audio/snu1a/track_55.mp3",
            "lines": [
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "주말에 뭐 했어요?",
                    "vi": "Cuối tuần bạn đã làm gì thế?"
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "코엑스몰에 갔어요.",
                    "vi": "Mình đã đến trung tâm thương mại COEX Mall."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "거기에서 뭐 했어요?",
                    "vi": "Bạn đã làm gì ở đó?"
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "친구하고 같이 영화를 보고 쇼핑했어요. 줄리앙 씨는 뭐 했어요?",
                    "vi": "Mình đã cùng bạn xem phim rồi đi mua sắm. Thế còn Julien đã làm gì?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "저는 집에서 쉬었어요.",
                    "vi": "Mình đã ở nhà nghỉ ngơi."
                }
            ]
        },
        {
            "id": "lis1",
            "title": "Hỏi đáp ngày tháng & Sự kiện",
            "shortTitle": "🎧 Luyện nghe 1",
            "sub": "6 đoạn đối thoại hỏi đáp về ngày sinh nhật, lịch trình bay và mốc thời gian.",
            "context": "6 đoạn đối thoại hỏi đáp về ngày sinh nhật, lịch trình bay và mốc thời gian.",
            "track": 56,
            "file": "audio/snu1a/track_56.mp3",
            "lines": [
                {
                    "speaker": "여 (Hỏi 1)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "오늘이 며칠이에요?",
                    "vi": "Hôm nay là ngày mấy thế?"
                },
                {
                    "speaker": "남 (Đáp 1)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "유월 팔 일이에요.",
                    "vi": "Ngày mùng 8 tháng 6."
                },
                {
                    "speaker": "남 (Hỏi 2)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "오늘이 며칠이에요?",
                    "vi": "Hôm nay là ngày bao nhiêu?"
                },
                {
                    "speaker": "여 (Đáp 2)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "구월 오 일이에요.",
                    "vi": "Ngày mùng 5 tháng 9."
                },
                {
                    "speaker": "여 (Hỏi 3)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "생일이 며칠이에요?",
                    "vi": "Sinh nhật bạn là ngày mấy?"
                },
                {
                    "speaker": "남 (Đáp 3)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "칠월 십육 일이에요.",
                    "vi": "Ngày 16 tháng 7."
                },
                {
                    "speaker": "남 (Hỏi 4)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "나나 씨, 생일이 언제예요?",
                    "vi": "Nana ơi, sinh nhật bạn khi nào thế?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-b",
                    "korean": "시월 이십삼 일이에요.",
                    "vi": "Ngày 23 tháng 10."
                },
                {
                    "speaker": "여 (Hỏi 5)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아키라 씨, 언제 일본에 가요?",
                    "vi": "Akira ơi, khi nào bạn về Nhật Bản?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "이월 이십칠 일에 가요.",
                    "vi": "Ngày 27 tháng 2 mình đi."
                },
                {
                    "speaker": "여 (Hỏi 6)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "줄리앙 씨, 언제 한국에 왔어요?",
                    "vi": "Julien ơi, bạn đến Hàn Quốc khi nào?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "십이월 삼십일 일에 왔어요.",
                    "vi": "Ngày 31 tháng 12 mình đến."
                }
            ]
        },
        {
            "id": "lis2",
            "title": "Trao đổi về kế hoạch thi cử & Kỳ nghỉ",
            "shortTitle": "🎧 Luyện nghe 2",
            "sub": "Jiyeon và Mariko trao đổi về việc ôn thi tiếng Hàn và kế hoạch du lịch Nhật Bản.",
            "context": "Jiyeon và Mariko trao đổi về việc ôn thi tiếng Hàn và kế hoạch du lịch Nhật Bản.",
            "track": 57,
            "file": "audio/snu1a/track_57.mp3",
            "lines": [
                {
                    "speaker": "지연 (Jiyeon)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "마리코 씨, 주말에 뭐 했어요?",
                    "vi": "Mariko ơi, cuối tuần bạn đã làm gì thế?"
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "집에 있었어요. 지연 씨는 뭐 했어요?",
                    "vi": "Mình ở nhà thôi. Còn Jiyeon đã làm gì?"
                },
                {
                    "speaker": "지연 (Jiyeon)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "친구 집에 갔어요. 친구하고 한국어를 공부했어요.",
                    "vi": "Mình đến nhà bạn. Mình cùng bạn học tiếng Hàn."
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "시험이 있어요?",
                    "vi": "Sắp có kỳ thi à bạn?"
                },
                {
                    "speaker": "지연 (Jiyeon)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "네, 수요일에 시험이 있어요.",
                    "vi": "Ừ, thứ Tư có bài kiểm tra."
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "시험이 끝나고 뭐 해요?",
                    "vi": "Thi xong rồi thì bạn làm gì?"
                },
                {
                    "speaker": "지연 (Jiyeon)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "친구하고 같이 일본에 가요.",
                    "vi": "Mình cùng bạn đi du lịch Nhật Bản."
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-b",
                    "korean": "아, 네. 한국에 언제 와요?",
                    "vi": "À, thế à. Khi nào bạn về lại Hàn Quốc?"
                },
                {
                    "speaker": "지연 (Jiyeon)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "삼십 일에 와요.",
                    "vi": "Ngày 30 mình về."
                }
            ]
        }
    ],
    "b1a_l6": [
        {
            "id": "spk1",
            "title": "Gọi món tại quán ăn",
            "shortTitle": "💬 Hội thoại 1",
            "sub": "Steven và Yujin vào nhà hàng Hàn Quốc ăn trưa cùng nhau.",
            "context": "Steven và Yujin vào nhà hàng Hàn Quốc ăn trưa cùng nhau.",
            "track": 62,
            "file": "audio/snu1a/track_62.mp3",
            "lines": [
                {
                    "speaker": "종업원 (Nhân viên)",
                    "avatar": "🧑‍🍳",
                    "role": "speaker-a",
                    "korean": "어서 오세요. 여기 앉으세요.",
                    "vi": "Xin chào quý khách! Mời quý khách ngồi đây ạ."
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "메뉴 좀 주세요.",
                    "vi": "Làm ơn cho chúng tôi xin thực đơn với ạ."
                },
                {
                    "speaker": "종업원 (Nhân viên)",
                    "avatar": "🧑‍🍳",
                    "role": "speaker-a",
                    "korean": "네, 여기 있어요.",
                    "vi": "Vâng, thực đơn đây ạ."
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "유진 씨는 뭐 좋아해요?",
                    "vi": "Yujin thích ăn món gì?"
                },
                {
                    "speaker": "유진 (Yujin)",
                    "avatar": "👩",
                    "role": "speaker-a",
                    "korean": "저는 비빔밥을 좋아해요.",
                    "vi": "Mình thích ăn cơm trộn."
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-b",
                    "korean": "그럼, 비빔밥 한 그릇하고 갈비탕 한 그릇 주세요.",
                    "vi": "Vậy thì cho một bát cơm trộn và một bát canh sườn bò nhé."
                },
                {
                    "speaker": "종업원 (Nhân viên)",
                    "avatar": "🧑‍🍳",
                    "role": "speaker-a",
                    "korean": "네, 잠깐만 기다리세요.",
                    "vi": "Vâng, xin quý khách vui lòng đợi một lát ạ."
                }
            ]
        },
        {
            "id": "spk2",
            "title": "Hỏi giá và mua trái cây ở tiệm hoa quả",
            "shortTitle": "💬 Hội thoại 2",
            "sub": "Mariko mua hoa quả tươi tại cửa hàng ven đường.",
            "context": "Mariko mua hoa quả tươi tại cửa hàng ven đường.",
            "track": 65,
            "file": "audio/snu1a/track_65.mp3",
            "lines": [
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "아저씨, 이 사과 얼마예요?",
                    "vi": "Chú ơi, táo này bao nhiêu tiền ạ?"
                },
                {
                    "speaker": "아저씨 (Chủ tiệm)",
                    "avatar": "👨",
                    "role": "speaker-b",
                    "korean": "세 개에 이천 원이에요.",
                    "vi": "2.000 won 3 quả."
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "뭐가 맛있어요?",
                    "vi": "Loại nào ngon ạ?"
                },
                {
                    "speaker": "아저씨 (Chủ tiệm)",
                    "avatar": "👨",
                    "role": "speaker-b",
                    "korean": "모두 맛있어요.",
                    "vi": "Loại nào cũng ngon hết cháu à."
                },
                {
                    "speaker": "마리코 (Mariko)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "그럼 오렌지 여섯 개 주세요. 사과도 세 개 주세요.",
                    "vi": "Vậy cho cháu 6 quả cam nhé. Cho cháu cả 3 quả táo nữa ạ."
                },
                {
                    "speaker": "아저씨 (Chủ tiệm)",
                    "avatar": "👨",
                    "role": "speaker-b",
                    "korean": "네, 여기 있어요. 또 오세요.",
                    "vi": "Ừ, đồ của cháu đây. Lần sau lại ghé nhé!"
                }
            ]
        },
        {
            "id": "lis1",
            "title": "Hỏi giá thức uống & Bánh ngọt tại tiệm cà phê",
            "shortTitle": "🎧 Luyện nghe 1",
            "sub": "4 tình huống gọi bánh kem (5.400w), sandwich (2.700w), cà phê đá (3.800w) và espresso (3.200w).",
            "context": "4 tình huống gọi bánh kem (5.400w), sandwich (2.700w), cà phê đá (3.800w) và espresso (3.200w).",
            "track": 66,
            "file": "audio/snu1a/track_66.mp3",
            "lines": [
                {
                    "speaker": "손님 (Nam 1)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "이 케이크는 하나에 얼마예요?",
                    "vi": "Cái bánh kem này một cái giá bao nhiêu ạ?"
                },
                {
                    "speaker": "직원 (Nữ 1)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "오천사백 원입니다.",
                    "vi": "Năm nghìn bốn trăm won ạ (5.400 won)."
                },
                {
                    "speaker": "손님 (Nữ 2)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "여기요. 샌드위치 있어요?",
                    "vi": "Chị ơi, ở đây có sandwich không ạ?"
                },
                {
                    "speaker": "직원 (Nam 2)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "네, 있어요. 이천칠백 원입니다.",
                    "vi": "Có ạ, hai nghìn bảy trăm won (2.700 won)."
                },
                {
                    "speaker": "손님 (Nữ 3)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아이스커피 주세요. 얼마예요?",
                    "vi": "Cho em cà phê đá nhé. Giá bao nhiêu ạ?"
                },
                {
                    "speaker": "직원 (Nam 3)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "삼천팔백 원입니다.",
                    "vi": "Ba nghìn tám trăm won ạ (3.800 won)."
                },
                {
                    "speaker": "손님 (Nữ 3)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "사천팔백 원요?",
                    "vi": "Bốn nghìn tám trăm won ạ?"
                },
                {
                    "speaker": "직원 (Nam 3)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "아니요, 삼천팔백 원요.",
                    "vi": "Không ạ, ba nghìn tám trăm won (3.800 won)."
                },
                {
                    "speaker": "손님 (Nam 4)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "여기요! 에스프레소 있어요?",
                    "vi": "Ở đây có cà phê espresso không ạ?"
                },
                {
                    "speaker": "직원 (Nữ 4)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "네, 있어요. 한 잔에 삼천이백 원입니다.",
                    "vi": "Có ạ, một ly giá ba nghìn hai trăm won (3.200 won)."
                },
                {
                    "speaker": "손님 (Nam 4)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "맛있어요?",
                    "vi": "Uống ngon không ạ?"
                },
                {
                    "speaker": "직원 (Nữ 4)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "네, 정말 맛있어요.",
                    "vi": "Vâng, ngon lắm ạ."
                }
            ]
        },
        {
            "id": "lis2",
            "title": "Chọn món ăn tại nhà ăn sinh viên",
            "shortTitle": "🎧 Luyện nghe 2",
            "sub": "Julien và Kelly chọn món ăn trưa: Cơm trộn bibimbap (2.500 won) và thịt chiên tonkatsu.",
            "context": "Julien và Kelly chọn món ăn trưa: Cơm trộn bibimbap (2.500 won) và thịt chiên tonkatsu.",
            "track": 67,
            "file": "audio/snu1a/track_67.mp3",
            "lines": [
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "켈리 씨, 지금 도서관에 가요?",
                    "vi": "Kelly ơi, bây giờ bạn đi thư viện à?"
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "아니요, 학생 식당에 가요. 줄리앙 씨는 점심 먹었어요?",
                    "vi": "Không, mình đi nhà ăn sinh viên. Julien ăn trưa chưa?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "네, 학생 식당에서 먹었어요.",
                    "vi": "Ừ, mình vừa ăn ở nhà ăn sinh viên rồi."
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "오늘 메뉴가 뭐예요?",
                    "vi": "Hôm nay thực đơn có món gì thế bạn?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "A메뉴는 비빔밥이고 B메뉴는 돈가스예요.",
                    "vi": "Menu A là cơm trộn bibimbap, menu B là thịt heo chiên xù tonkatsu."
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "줄리앙 씨는 뭘 먹었어요?",
                    "vi": "Julien đã ăn món gì thế?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "저는 한국 음식을 좋아해요. 그래서 비빔밥을 먹었어요.",
                    "vi": "Mình thích đồ ăn Hàn Quốc nên đã ăn cơm trộn."
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "비빔밥이 얼마예요?",
                    "vi": "Cơm trộn giá bao nhiêu vậy?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "이천오백 원이에요. 비빔밥이 싸고 맛있어요.",
                    "vi": "Hai nghìn năm trăm won (2.500 won) thôi. Cơm trộn vừa rẻ vừa ngon lắm."
                }
            ]
        }
    ],
    "b1a_l7": [
        {
            "id": "spk1",
            "title": "Gọi điện hỏi thăm thời tiết giữa hai thành phố",
            "shortTitle": "💬 Hội thoại 1",
            "sub": "Akira (ở Tokyo) gọi điện cho Minsoo (ở Seoul) hỏi về tình hình thời tiết.",
            "context": "Akira (ở Tokyo) gọi điện cho Minsoo (ở Seoul) hỏi về tình hình thời tiết.",
            "track": 72,
            "file": "audio/snu1a/track_72.mp3",
            "lines": [
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "서울은 오늘 날씨가 어때요?",
                    "vi": "Seoul hôm nay thời tiết thế nào?"
                },
                {
                    "speaker": "민수 (Minsoo)",
                    "avatar": "👨",
                    "role": "speaker-b",
                    "korean": "더워요. 도쿄도 더워요?",
                    "vi": "Nóng lắm. Tokyo cũng nóng à?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "아니요. 어제는 더웠지만 오늘은 안 더워요.",
                    "vi": "Không. Hôm qua thì nóng nhưng hôm nay không nóng."
                },
                {
                    "speaker": "민수 (Minsoo)",
                    "avatar": "👨",
                    "role": "speaker-b",
                    "korean": "아, 그래요? 서울에 언제 와요?",
                    "vi": "À, vậy sao? Khi nào bạn đến Seoul?"
                },
                {
                    "speaker": "아키라 (Akira)",
                    "avatar": "🇯🇵",
                    "role": "speaker-a",
                    "korean": "토요일에 가요.",
                    "vi": "Thứ Bảy mình đi."
                },
                {
                    "speaker": "민수 (Minsoo)",
                    "avatar": "👨",
                    "role": "speaker-b",
                    "korean": "그럼 조심해서 오세요.",
                    "vi": "Vậy thì đi đường cẩn thận nhé."
                }
            ]
        },
        {
            "id": "spk2",
            "title": "Thuyết trình giới thiệu quê hương Paris",
            "shortTitle": "💬 Hội thoại 2",
            "sub": "Julien thuyết trình trước lớp tiếng Hàn bằng phong cách trang trọng -습니다/ㅂ니다.",
            "context": "Julien thuyết trình trước lớp tiếng Hàn bằng phong cách trang trọng -습니다/ㅂ니다.",
            "track": 75,
            "file": "audio/snu1a/track_75.mp3",
            "lines": [
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "제 고향은 파리입니다.",
                    "vi": "Quê hương của tôi là Paris."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "파리는 지금 겨울입니다.",
                    "vi": "Paris hiện tại đang là mùa đông."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "파리는 겨울에 눈이 오고 춥습니다.",
                    "vi": "Paris vào mùa đông tuyết rơi và lạnh giá."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "사람들은 스키장에 갑니다.",
                    "vi": "Mọi người đi đến các khu trượt tuyết."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "여러분 고향은 날씨가 어떻습니까?",
                    "vi": "Thời tiết ở quê hương các bạn như thế nào ạ?"
                }
            ]
        },
        {
            "id": "lis1",
            "title": "Bản tin dự báo thời tiết các quốc gia",
            "shortTitle": "🎧 Luyện nghe 1",
            "sub": "Hỏi thăm thời tiết: Hàn Quốc (nóng), Trung Quốc (âm u lạnh), Mỹ (mưa), Pháp (quang ấm).",
            "context": "Hỏi thăm thời tiết: Hàn Quốc (nóng), Trung Quốc (âm u lạnh), Mỹ (mưa), Pháp (quang ấm).",
            "track": 76,
            "file": "audio/snu1a/track_76.mp3",
            "lines": [
                {
                    "speaker": "남 (Hỏi 1)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "오늘은 날씨가 어떻습니까?",
                    "vi": "Hôm nay thời tiết thế nào ạ?"
                },
                {
                    "speaker": "여 (Đáp 1)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "덥습니다.",
                    "vi": "Trời nóng ạ."
                },
                {
                    "speaker": "여 (Hỏi 2)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "중국은 오늘 날씨가 어때요?",
                    "vi": "Thời tiết hôm nay ở Trung Quốc thế nào?"
                },
                {
                    "speaker": "남 (Đáp 2)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "흐리고 추워요.",
                    "vi": "Trời âm u và lạnh."
                },
                {
                    "speaker": "여 (Hỏi 3)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "미국은 날씨가 어떻습니까?",
                    "vi": "Thời tiết ở Mỹ thế nào ạ?"
                },
                {
                    "speaker": "남 (Đáp 3)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "비가 옵니다.",
                    "vi": "Trời đang có mưa."
                },
                {
                    "speaker": "여 (Hỏi 4)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "프랑스에도 비가 와요?",
                    "vi": "Ở Pháp cũng mưa à?"
                },
                {
                    "speaker": "남 (Đáp 4)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "아니요, 안 와요. 맑고 따뜻해요.",
                    "vi": "Không, không mưa. Trời quang đãng và ấm áp."
                }
            ]
        },
        {
            "id": "lis2",
            "title": "Kể về chuyến đi du lịch biển Busan",
            "shortTitle": "🎧 Luyện nghe 2",
            "sub": "Nana kể về chuyến đi chơi Busan: dạo chợ, ngắm biển và ăn cá hải sản tươi ngon giá rẻ.",
            "context": "Nana kể về chuyến đi chơi Busan: dạo chợ, ngắm biển và ăn cá hải sản tươi ngon giá rẻ.",
            "track": 77,
            "file": "audio/snu1a/track_77.mp3",
            "lines": [
                {
                    "speaker": "남 (Bạn học)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "나나 씨, 주말에 뭐 했어요?",
                    "vi": "Nana ơi, cuối tuần bạn đã làm gì vậy?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-b",
                    "korean": "친구하고 같이 부산에 갔어요.",
                    "vi": "Mình đã đi Busan cùng với bạn."
                },
                {
                    "speaker": "남 (Bạn học)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "부산에서 뭐 했어요?",
                    "vi": "Ở Busan các bạn đã làm gì?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-b",
                    "korean": "토요일에는 부산 시장을 구경하고, 일요일에는 바다에 갔어요. 아주 재미있었어요.",
                    "vi": "Thứ Bảy thì mình đi dạo chợ Busan, Chủ Nhật thì đi biển. Rất là vui."
                },
                {
                    "speaker": "남 (Bạn học)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "음식은 어땠어요?",
                    "vi": "Đồ ăn ở đó thế nào?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-b",
                    "korean": "생선이 싸고 아주 맛있었어요.",
                    "vi": "Cá hải sản rẻ và rất là ngon."
                },
                {
                    "speaker": "남 (Bạn học)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "그래요? 날씨는 좋았어요?",
                    "vi": "Vậy à? Thời tiết có đẹp không?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-b",
                    "korean": "토요일에는 조금 더웠지만 일요일에는 날씨가 아주 좋았어요.",
                    "vi": "Thứ Bảy tuy có hơi nóng một chút nhưng Chủ Nhật thời tiết cực kỳ đẹp."
                }
            ]
        }
    ],
    "b1a_l8": [
        {
            "id": "spk1",
            "title": "Rủ bạn đi đạp xe ở sông Hán",
            "shortTitle": "💬 Hội thoại 1",
            "sub": "Jungwoo trò chuyện cùng Kelly sau giờ học về cuộc sống sinh hoạt cuối tuần.",
            "context": "Jungwoo trò chuyện cùng Kelly sau giờ học về cuộc sống sinh hoạt cuối tuần.",
            "track": 82,
            "file": "audio/snu1a/track_82.mp3",
            "lines": [
                {
                    "speaker": "정우 (Jungwoo)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "켈리 씨, 한국 생활이 어때요?",
                    "vi": "Kelly ơi, cuộc sống ở Hàn Quốc của bạn thế nào?"
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "한국어 공부는 재미있지만 주말에는 조금 심심해요.",
                    "vi": "Việc học tiếng Hàn thú vị nhưng cuối tuần thì hơi buồn chán."
                },
                {
                    "speaker": "정우 (Jungwoo)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "그래요? 그럼 주말에 같이 자전거 탈까요?",
                    "vi": "Vậy sao? Thế thì cuối tuần chúng mình cùng đi xe đạp nhé?"
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "좋아요. 어디에서 탈까요?",
                    "vi": "Hay quá. Mình sẽ đạp xe ở đâu đây?"
                },
                {
                    "speaker": "정우 (Jungwoo)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "한강에서 타요.",
                    "vi": "Mình đạp xe ở sông Hán đi."
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "네. 그런데 한강에 어떻게 가요?",
                    "vi": "Vâng. Nhưng mà đến sông Hán bằng cách nào vậy?"
                },
                {
                    "speaker": "정우 (Jungwoo)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "가까워요. 걸어서 가요.",
                    "vi": "Gần lắm. Chúng mình đi bộ đến nhé."
                }
            ]
        },
        {
            "id": "spk2",
            "title": "Trải nghiệm đón gió mát ở công viên sông Hán",
            "shortTitle": "💬 Hội thoại 2",
            "sub": "Jungwoo và Kelly đã đến Công viên sông Hán và cùng nhau đạp đôi đón gió lộng ven sông.",
            "context": "Jungwoo và Kelly đã đến Công viên sông Hán và cùng nhau đạp đôi đón gió lộng ven sông.",
            "track": 85,
            "file": "audio/snu1a/track_85.mp3",
            "lines": [
                {
                    "speaker": "정우 (Jungwoo)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "여기가 한강공원이에요.",
                    "vi": "Đây là công viên sông Hán."
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "와, 정말 시원하네요. 정우 씨는 이 공원에 자주 와요?",
                    "vi": "Oa, mát mẻ thực sự đấy nhỉ! Jungwoo có thường đến công viên này không?"
                },
                {
                    "speaker": "정우 (Jungwoo)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "네, 자주 와요. 우리 자전거 탈까요?",
                    "vi": "Ừ, mình hay đến lắm. Chúng mình cùng đạp xe nhé?"
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "그래요.",
                    "vi": "Đồng ý thôi."
                },
                {
                    "speaker": "정우 (Jungwoo)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "켈리 씨, 재미있어요?",
                    "vi": "Kelly ơi, có vui không?"
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "네, 아주 재미있네요.",
                    "vi": "Vâng, vui và thú vị cực kỳ luôn ấy."
                },
                {
                    "speaker": "정우 (Jungwoo)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "그럼 우리 다음에 또 올까요?",
                    "vi": "Thế thì lần sau chúng mình lại cùng đến đây nữa nhé?"
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "좋아요.",
                    "vi": "Tuyệt vời, nhất trí luôn."
                }
            ]
        },
        {
            "id": "lis1",
            "title": "4 tình huống rủ rê thể thao giải trí",
            "shortTitle": "🎧 Luyện nghe 1",
            "sub": "4 tình huống rủ rê: đánh tennis, trượt băng, đá bóng (từ chối lịch sự) và cùng đi dạo.",
            "context": "4 tình huống rủ rê: đánh tennis, trượt băng, đá bóng (từ chối lịch sự) và cùng đi dạo.",
            "track": 86,
            "file": "audio/snu1a/track_86.mp3",
            "lines": [
                {
                    "speaker": "여 (Rủ 1)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "스티븐 씨, 오후에 테니스 칠까요?",
                    "vi": "Stephen ơi, chiều nay mình đánh tennis nhé?"
                },
                {
                    "speaker": "스티븐 (Stephen)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "네, 좋아요.",
                    "vi": "Vâng, được đấy."
                },
                {
                    "speaker": "남 (Rủ 2)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "나나 씨, 주말에 같이 스케이트 탈까요?",
                    "vi": "Nana ơi, cuối tuần cùng đi trượt băng nhé?"
                },
                {
                    "speaker": "나나 (Nana)",
                    "avatar": "🇨🇳",
                    "role": "speaker-b",
                    "korean": "네. 언제 만날까요?",
                    "vi": "Vâng. Chúng mình sẽ gặp nhau khi nào?"
                },
                {
                    "speaker": "남1 (Rủ 3)",
                    "avatar": "👨",
                    "role": "speaker-a",
                    "korean": "민수 씨, 토요일에 같이 축구 할까요?",
                    "vi": "Minsoo ơi, thứ Bảy này mình cùng đá bóng nhé?"
                },
                {
                    "speaker": "민수 (Minsoo)",
                    "avatar": "👨",
                    "role": "speaker-b",
                    "korean": "미안해요. 이번 토요일에는 등산을 가요. 다음에 해요.",
                    "vi": "Xin lỗi bạn nhé. Thứ Bảy này mình đi leo núi rồi. Để lần sau chúng mình đá bóng nhé."
                },
                {
                    "speaker": "남 (Rủ 4)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "유진 씨, 지금 시간 있어요? 같이 게임 할까요?",
                    "vi": "Yujin ơi, bây giờ bạn có thời gian không? Cùng chơi game nhé?"
                },
                {
                    "speaker": "유진 (Yujin)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "미안하지만 저는 게임을 안 좋아해요.",
                    "vi": "Xin lỗi bạn nhưng mình không thích chơi game cho lắm."
                },
                {
                    "speaker": "남 (Rủ 4)",
                    "avatar": "👱‍♂️",
                    "role": "speaker-a",
                    "korean": "그럼 산책할까요?",
                    "vi": "Thế thì chúng mình cùng đi dạo nhé?"
                },
                {
                    "speaker": "유진 (Yujin)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "네, 그래요.",
                    "vi": "Vâng, thế thì được đấy."
                }
            ]
        },
        {
            "id": "lis2",
            "title": "Trò chuyện âm nhạc và hẹn đi karaoke",
            "shortTitle": "🎧 Luyện nghe 2",
            "sub": "Julien và Kelly trò chuyện về sở thích nghe nhạc và hẹn đi hát karaoke vào Chủ Nhật.",
            "context": "Julien và Kelly trò chuyện về sở thích nghe nhạc và hẹn đi hát karaoke vào Chủ Nhật.",
            "track": 87,
            "file": "audio/snu1a/track_87.mp3",
            "lines": [
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "이 음악 정말 좋네요.",
                    "vi": "Bản nhạc này hay thực sự đấy nhỉ!"
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "네, 그래요. 줄리앙 씨, 음악 좋아해요?",
                    "vi": "Vâng, đúng vậy. Julien ơi, bạn thích âm nhạc à?"
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "그럼요. 저는 매일 음악을 들어요. 그리고 주말에는 기타도 치고 노래방에도 가요.",
                    "vi": "Đương nhiên rồi. Ngày nào mình cũng nghe nhạc cả. Và vào cuối tuần thì mình vừa đánh đàn ghi-ta vừa đi hát karaoke nữa."
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "저도 노래방을 좋아해요.",
                    "vi": "Mình cũng thích đi hát karaoke lắm."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "켈리 씨, 그럼 이번 주말에 같이 노래방 갈까요?",
                    "vi": "Kelly ơi, thế thì cuối tuần này chúng mình cùng đi hát karaoke nhé?"
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "네, 좋아요.",
                    "vi": "Vâng, hay quá."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "토요일에 갈까요, 일요일에 갈까요?",
                    "vi": "Chúng mình đi vào thứ Bảy hay là Chủ Nhật đây?"
                },
                {
                    "speaker": "켈리 (Kelly)",
                    "avatar": "👩",
                    "role": "speaker-b",
                    "korean": "토요일에는 정우 씨하고 한강공원에 가요.",
                    "vi": "Thứ Bảy thì mình đi công viên sông Hán với Jungwoo rồi."
                },
                {
                    "speaker": "줄리앙 (Julien)",
                    "avatar": "🇫🇷",
                    "role": "speaker-a",
                    "korean": "그래요? 그럼 일요일에 만나요.",
                    "vi": "Vậy à? Thế thì Chủ Nhật chúng mình gặp nhau nhé."
                }
            ]
        }
    ]
};

// Expose on window for browser access
if (typeof window !== 'undefined') {
    window.AUDIO_MAP = AUDIO_MAP;
    window.LESSON_DIALOGUES = LESSON_DIALOGUES;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AUDIO_MAP, LESSON_DIALOGUES };
}
