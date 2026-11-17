# NoliKorea · V5

Học tiếng Hàn Seoul 1A: 8 bài, 224 mục, 89 tệp audio hiện hữu. Phiên ngắn, đọc/nghe, Recall, tự viết và lịch ôn. Dữ liệu lưu trên thiết bị; Gemini là lựa chọn riêng.

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

Workflow Pages loại các tệp ZIP chia nhỏ khỏi thư mục triển khai. Đẩy tag `v5.0.0` để workflow Release tạo ZIP đầy đủ ở GitHub Releases. Bản ZIP đầy đủ được cung cấp qua GitHub Releases.

## Dữ liệu và nâng cấp

Khóa lưu trữ cũ được giữ để tự chuyển dữ liệu V3/V4. Mỗi mục có ID; bản nhập cũ được gán ID và lịch ôn được nối lại nếu xác định đúng mục. Mục không khớp vẫn được giữ trong dữ liệu thay vì xóa. Sao lưu gồm tiến độ, nội dung tùy chỉnh, ghi chú và tùy chọn học, không gồm API key.

Cài đặt thông thường gồm giao diện, âm thanh, sao lưu. Khôi phục/đặt lại và công cụ sửa giáo trình nằm trong phần mở rộng. Các bài chưa có nội dung được ẩn khi học.

## Giới hạn xác minh

Đã kiểm thử Node/jsdom, dữ liệu, bài luyện, migration, lưu/khôi phục, AI giả lập và vòng đời service worker. Chưa kiểm thử thực tế iPhone/Android/Home Screen, micro và API key thật trong môi trường này. Chưa nghe đối chiếu 32 track tham chiếu với transcript; không tuyên bố học liệu đã được thẩm định ngôn ngữ hoàn toàn.

Không thêm tải audio offline. Giữ cơ chế phát/cache audio hiện hữu. Nội dung tham khảo gốc được giữ riêng.
