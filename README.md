# NoliKorea · V5

Học tiếng Hàn Seoul 1A: 8 bài, 224 mục, 89 tệp audio hiện hữu. Phiên ngắn, đọc/nghe, Recall, tự viết và lịch ôn. Dữ liệu lưu trên thiết bị; Gemini là lựa chọn riêng.

## Bản 5.0.5

Noli, linh vật Shiba, thay avatar Bạn học AI trong thanh đầu trang, giáo trình, chat và gọi thoại. Thu gọn nhãn, lời chào và khung giới thiệu; giải thích câu trong chat có thể mở khi cần. Giữ phạm vi luyện theo sách, mic và thời gian chờ AI.

## Bản 5.0.4

Bỏ 26 chú thích chữ Hán khỏi từ vựng và làm sạch chú thích trong bản lưu cũ, bài luyện, sổ lỗi và dữ liệu nhập. Giữ ghi chú phát âm, ID mục học, tiến độ và lịch ôn.

## Bản 5.0.3

Thu gọn lối tắt bài học và phiên ngắn thành hai nút trên cùng một hàng, kể cả trên điện thoại. Bỏ khối giới thiệu và thống kê lớn đầu trang để giáo trình là nội dung chính. Giữ nguyên luồng tiếp tục học và phiên ngắn.

## Bản 5.0.2

Tối ưu các luồng hiện có, không thêm chức năng hay thay đổi giáo trình:

- Giữ bản nháp Recall/Production khi đổi bộ lọc, đổi bài và mở lại phiên; phục hồi phản hồi của câu đã chấm.
- Dừng mic và TTS đúng lúc khi đổi màn; hủy callback, lịch phát và lời chào từ phiên AI đã đóng. Nút mic trở về trạng thái ban đầu khi dừng.
- Lưu kết quả ôn lỗi ngay khi trả lời; hủy tìm kiếm đang chờ khi xóa hoặc đóng kết quả.
- Chỉ xử lý các phần giao diện vừa thay đổi; giảm kiểm tra và chuyển đổi dữ liệu lặp khi lưu, giữ kiểm tra hợp lệ và chống ghi đè giữa các tab.
- Giữ thời gian chờ phản hồi AI 30 giây và hộp nghe CD chỉ trong Input.

## Chạy và sửa

Ứng dụng nằm trong `dist/`. Chạy `python -m http.server 8000 --directory dist`, mở http://localhost:8000.

Để phát triển: Node 22+, `npm ci`, `npm run build`, `npm test`.
`data/curriculum.json` là nguồn giáo trình duy nhất; không sửa trực tiếp hai bản curriculum được sinh trong dist. Giữ ID mục học khi sửa chữ/nghĩa để giữ lịch ôn.

## GitHub Pages

1. Tạo repository và đưa **toàn bộ dự án**, gồm `.github`, `data`, `scripts`, `tests`, `dist`, package*.json lên nhánh `main`. Không đưa node_modules, API key hoặc bản sao lưu cá nhân lên repository.
2. Settings → Pages → Source: **GitHub Actions**.
3. Workflow Pages kiểm thử, build và xuất ứng dụng. URL do Actions trả về thường là `https://USERNAME.github.io/REPOSITORY/`.
4. Safari → Chia sẻ → Thêm vào Màn hình chính. Android Chrome → ⋮ → Cài đặt ứng dụng.
5. Xuất dữ liệu ở địa chỉ cũ rồi nhập ở địa chỉ mới. Không có đồng bộ giữa thiết bị/địa chỉ.

Workflow Pages loại các tệp ZIP chia nhỏ khỏi thư mục triển khai. Đẩy tag dạng `v5.0.2` để workflow Release tạo ZIP đầy đủ ở GitHub Releases. Bản ZIP đầy đủ được cung cấp qua GitHub Releases.

## Dữ liệu và nâng cấp

Khóa lưu trữ cũ được giữ để tự chuyển dữ liệu V3/V4. Mỗi mục có ID; bản nhập cũ được gán ID và lịch ôn được nối lại nếu xác định đúng mục. Mục không khớp vẫn được giữ trong dữ liệu thay vì xóa. Sao lưu gồm tiến độ, nội dung tùy chỉnh, ghi chú và tùy chọn học, không gồm API key.

Cài đặt thông thường gồm giao diện, âm thanh, sao lưu. Khôi phục/đặt lại và công cụ sửa giáo trình nằm trong phần mở rộng. Các bài chưa có nội dung được ẩn khi học.

## Giới hạn xác minh

Đã kiểm thử Node/jsdom, dữ liệu, bài luyện, migration, lưu/khôi phục, AI giả lập và vòng đời service worker. Chưa kiểm thử thực tế iPhone/Android/Home Screen, micro và API key thật trong môi trường này. Chưa nghe đối chiếu 32 track tham chiếu với transcript; không tuyên bố học liệu đã được thẩm định ngôn ngữ hoàn toàn.

Không thêm tải audio offline. Giữ cơ chế phát/cache audio hiện hữu. Nội dung tham khảo gốc được giữ riêng.
