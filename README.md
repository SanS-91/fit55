# FIT55 — Personal Body Journey

Bản web app cá nhân dùng được trên desktop và mobile, không cần build, chỉ cần mở `index.html`.

## Modules
- Lịch tập Lower/Upper vào thứ 2, 3, 5, 6 lúc 19:30, gồm set/reps/tạ và nhật ký từng set
- Theo dõi cân nặng, vòng eo, ngang rốn, mông, đùi, tay, mỡ, cơ xương và biểu đồ
- Nhật ký năng lượng và protein
- Lộ trình 63.3 kg → 55 kg, milestones
- Thư viện 20 bài tập: nhóm cơ chính/phụ, kỹ thuật, lỗi thường gặp, bài thay thế, quy tắc tăng tạ
- Lịch ăn/training/rest, macro và giờ sinh hoạt có thể chỉnh
- Kế hoạch 28 tuần cùng checklist theo từng buổi, theo dõi hồi phục và đau cơ
- Xuất/nhập nhật ký JSON

## Cách dùng trên GitHub Pages
1. Tạo / upload `index.html` ở gốc branch `main`.
2. Vào **Settings → Pages → Build and deployment**.
3. Chọn **Deploy from a branch**, `main`, `/ (root)`, Save.
4. Chờ GitHub Pages triển khai. Link thường ở dạng `https://SanS-91.github.io/fit55/`.

## Lưu ý dữ liệu
App lưu trên `localStorage` tại máy/trình duyệt đang dùng. Chưa hỗ trợ đồng bộ nhiều máy. Nên xuất bản sao lưu JSON thường xuyên. Chỉ số ban đầu 63.3kg / fat 20.2kg / SMM 23.5kg là InBody ngày 16/10/2026. Số đo vòng cũ không được giả định là số đo hiện tại. Lộ trình 28 tuần chỉ mang tính tham khảo, không phải cam kết giảm cân hay chẩn đoán y tế.

## Kiến trúc
Single-file HTML/CSS/JS, không cần backend hay dependency ngoài. Được thiết kế cho GitHub Pages.