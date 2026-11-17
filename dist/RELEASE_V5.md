# NoliKorea V5

- Đổi tên ứng dụng và PWA thành NoliKorea.
- Thu gọn Cài đặt; công cụ phục hồi và biên tập nằm trong phần mở rộng. Ghi chú chuyển sang Tiến độ.
- Sửa mất đáp án thay thế khi sửa bài, nhấn kiểm tra hai lần, phát TTS nối tiếp và tạo ghép câu từ chú thích số/từ.
- Chỉ ghi hoàn thành bài sau khi có trả lời bài luyện; thống kê phiên ngắn tách điểm lần đầu và luyện lại.
- 224 mục có mã ổn định; lịch ôn theo mã để giữ lịch sử khi sửa nghĩa. Chuyển các bản cũ khi đọc/nhập dữ liệu.
- Giáo trình nguồn trong data/curriculum.json; build tự sinh hai bản dùng trong ứng dụng.
- Cấu hình GitHub Pages và GitHub Releases sẵn trong bản full. Pages không mang các tệp chia nhỏ ZIP.
- Giữ 89 MP3. Không thêm tải audio offline.

Chưa hoàn tất kiểm tra iOS/Android thực, micro, API thật và đối chiếu audio/transcript bằng nghe. Đây là các bước nghiệm thu còn lại trước khi coi bản học liệu đã chốt lâu dài. Các kiểm thử tự động không thay thế các bước này.

## 5.0.1

Sửa mic đóng vai gọi sai API; dừng thu khi đóng, đổi lượt hoặc nghe mẫu. Lỗi quyền mic/mạng được hiển thị rõ và lời nhận dạng cũ không cập nhật lượt mới. Lượt máy chờ đọc xong; bỏ điểm giả cho lượt máy/bỏ qua. Hộp CD và trình phát nổi chỉ ở Input; sang Recall/Production tạm dừng CD. Kiểm thử mô phỏng nhận diện giọng nói và DOM; chưa thu mic trực tiếp trên thiết bị thật.
