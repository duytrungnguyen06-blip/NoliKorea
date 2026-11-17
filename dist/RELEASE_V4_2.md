# Seoul Glass V4.2 — ghi chú tối ưu

- Phiên 5–10 phút: tối đa 8 mục, ưu tiên mục đến hạn và hay quên, rồi nội dung mới; tối đa 2 tình huống tự viết. Giữ bản nháp khi đóng/mở lại.
- Tách kết quả đúng lần đầu và nhớ lại sau luyện thêm. Xem đáp án không tính đúng; chỉ kết thúc phiên mới ghi nhận ngày học, không tự đánh dấu cả bài đã học.
- Phương án nhiễu ưu tiên cùng nhóm nghĩa. Hỗ trợ một số đáp án thay thế được liệt kê rõ; đối chiếu câu viết chấp nhận rút gọn 저는/전, không tự kết luận mọi câu khác mẫu là sai.
- Nút ⚑ lưu nội dung cần kiểm tra vào Cài đặt; ghi chú được đưa vào bản xuất/nhập JSON.
- Recall/Production chỉ dựng khi người dùng mở tab. Bản nháp gom lần ghi sau 1,8 giây và lưu khi đóng/ẩn trang. Bản lưu không đổi không ghi lại.
- Trình duyệt hỗ trợ Web Locks chỉ cho một tab giữ quyền ghi; các tab khác có thể xuất thay đổi hoặc nạp bản mới. Kiểm tra phiên bản dữ liệu chặn tab cũ ghi đè. Nếu không có Web Locks, kiểm tra phiên bản không bảo đảm loại trừ hai ghi đồng thời tuyệt đối.
- Giữ nguyên 89 MP3 và cơ chế phát audio; không thêm tải/quản lý audio offline.

## Nội dung

Đã rà văn bản 224 mục thuộc 8 bài có nội dung; kết quả kiểm tra cấu trúc trong `CONTENT_AUDIT_V4_2.json`. Bốn chỉnh sửa diễn giải:

| Mục | Chỉnh sửa | Nguồn đối chiếu đi kèm |
|---|---|---|
| 테니스 | Quần vợt; bỏ “khúc côn cầu lưới” | Bài 8, bảng từ vựng, dòng 15 |
| 읽다 | Phân biệt đọc nguyên mẫu [익따] và 읽어요 [일거요] | Bài 3, dòng 105, 214 |
| 사계절 | Bốn mùa; bỏ “tứ quý” | Bài 7, tiêu đề Bốn mùa, dòng 28 |
| 불고기 | Thịt bò ướp gia vị, nướng hoặc áp chảo | Bài 3 dòng 54; Bài 6 dòng 15 |

Hai nguồn curriculum được kiểm tra giống nhau. Chỉnh sửa riêng của người dùng được giữ; lịch ôn có nghĩa cũ được chuyển sang nghĩa mới khi nội dung bài dùng bản sửa mặc định. Không sửa tài liệu tham khảo gốc. Chưa nghe kiểm chứng 89 bản thu hay xác nhận transcript khớp từng chữ; kiểm tra audio ở đợt này chỉ xác nhận đường dẫn/tệp tham chiếu tồn tại.

## Đo và kiểm thử

32 kiểm thử Node.js/jsdom đã qua: luồng tám bài, nhập/xuất và khôi phục, lỗi dữ liệu/dung lượng, lịch ôn, phiên ngắn, điểm lần đầu/luyện lại, nháp, lazy render, ghi chú, Web Locks giả lập, tab cũ, chuyển nghĩa từ, AI giả lập và service worker.

Đo 3 lần bằng Node.js/jsdom trên cùng môi trường: trung vị mở bài đầu từ 314,9 ms xuống 100,6 ms; số nút DOM sau mở bài từ 3.032 xuống 1.725. Trước tạo sẵn 72 thẻ luyện; sau chưa tạo thẻ luyện khi còn ở tab đọc. Đây là đo DOM mô phỏng, không phải thời gian tải trên điện thoại. Dữ liệu thô trong `PERFORMANCE_V4_2.json`.

Chưa kiểm tra bố cục, bàn phím ảo, focus hoặc micro trên trình duyệt thật trong đợt này vì công cụ preview được hỗ trợ không khả dụng. Chưa dùng API key thật. Cần xác minh trực tiếp Chrome/Safari trên điện thoại trước khi coi kiểm thử thiết bị đã hoàn tất.
