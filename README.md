# FIT55 · Personal Body Journey

Ứng dụng theo dõi hình thể và lịch tập cá nhân, hướng tới mục tiêu từ **63,3 kg → 55 kg** theo tiến độ linh hoạt.

## Giao diện mới — Fit30-inspired (10/2026)

- Giao diện responsive phong cách wellness: **hồng đào / lavender / mint**, typography Playfair Display + DM Sans, thẻ thông tin và điều hướng riêng trên desktop/mobile.
- Hero *My Body Journey* với vòng hiển thị tiến độ, tổng quan cân nặng, hành trình, buổi tập tiếp theo.
- Quick links đến buổi tập, dinh dưỡng và số đo; menu di động và cửa sổ **Xem thêm**.
- Trong từng bài tập có thêm nhãn **nhóm cơ chính và phụ**.
- Lộ trình **28 tuần** với thanh chọn 5 giai đoạn; thông tin điều chỉnh theo khả năng hồi phục.
- Các biểu mẫu và nội dung đã có tiếp tục hoạt động: nhật ký set/reps/kg, theo dõi cân/số đo/InBody, ăn uống, khung giờ sinh hoạt, theo dõi DOMS.

## Truy cập

GitHub Pages (sau khi bật deployment từ \`main\` → \`/ (root)\`):

https://sans-91.github.io/fit55/

Ngoài ra có thể tải repository và mở \`index.html\` trong trình duyệt. Giao diện mới sử dụng hai file tương đối:
- \`fit55-premium.css\` — thiết kế giao diện và responsive.
- \`fit55-premium.js\` — điều hướng mới, dashboard, hiển thị nhóm cơ và lộ trình.

## Lịch tập nền

| Ngày | 19:30 | Cardio sau tập |
|---|---|---|
| Thứ 2 | Lower A – Mông & đùi sau | 10–20 phút, dốc nhẹ |
| Thứ 3 | Upper A – Lưng & vai sau | Hướng tới 20–30 phút |
| Thứ 5 | Lower B – Chân & mông | 10–20 phút tùy hồi phục |
| Thứ 6 | Upper B – Lưng & ngực | Hướng tới 20–30 phút |

Mỗi buổi tập tạ khoảng 45 phút. Thời lượng đi bộ và mức dốc tùy khả năng hồi phục; không cần cố tập nặng khi cơ đau rõ.

## Mục tiêu và dữ liệu

- Mốc InBody gốc: **16/10/2026** — 63,3 kg, 20,2 kg mỡ, SMM 23,5 kg.
- Lộ trình dài hạn, kiểm tra lại tính phù hợp của mốc 55 kg dựa trên sức khỏe, sức tập và số đo thực tế.
- Nhật ký lưu vào **localStorage trên thiết bị**. Không có tài khoản hoặc đồng bộ đám mây.
- Vào **Dữ liệu & sao lưu → Xuất JSON** để sao lưu thường xuyên. File JSON gồm lịch sử tập, số đo, ăn uống, thiết lập giờ giấc và phục hồi.
- Không lưu ảnh nhạy cảm hoặc thông tin cá nhân lên repository công khai.

## Giới hạn & lưu ý

- Mức calo và macro là mức thử ban đầu, cần hiệu chỉnh theo dữ liệu theo dõi; không phải chỉ định dinh dưỡng/y tế.
- Không thể giảm mỡ riêng từng vùng. Theo dõi cả vòng eo, cân trung bình, sức mạnh và hồi phục.
- Giao diện mới làm mới trải nghiệm, **không thay đổi cấu trúc dữ liệu đang được lưu**; vẫn nên xuất sao lưu trước khi thay đổi trình duyệt, thiết bị hoặc xóa cache.
- Các thư viện hình/video hướng dẫn mở rộng và phân tích tự động chuyên sâu sẽ tiếp tục phát triển.
