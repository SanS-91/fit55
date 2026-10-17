# FIT55 · Personal Body Journey — Version 4

FIT55 là web app cá nhân hướng tới mục tiêu từ **63,3 kg → 55 kg** theo tiến độ linh hoạt, ưu tiên giảm mỡ, giữ sức mạnh và hồi phục tốt. Tập cố định **thứ 2, 3, 5, 6 lúc 19:30** (khoảng 45 phút tập tạ + cardio điều chỉnh theo buổi).

## Website

**https://sans-91.github.io/fit55/** (sau khi GitHub Pages deploy nhánh main, thư mục root).

Giao diện responsive lấy cảm hứng từ Fit30+, với 5 khu vực tích hợp:

1. **Tổng quan:** hành trình giảm cân, buổi tập kế tiếp, giờ ăn, check-in đau cơ/ngủ/năng lượng.
2. **Lộ trình & buổi tập:** chọn 1 trong 28 tuần, 4 buổi tập, số set/reps/RIR/nghỉ, thay bài theo giai đoạn, nhật ký kg/reps từng set và phân bổ set theo nhóm cơ.
3. **Thư viện kỹ thuật:** 32 động tác, nhóm cơ chính/phụ, mức độ nhấn mạnh (tương đối), hướng dẫn setup/biên độ/hít thở/lỗi thường gặp/bài thay thế/mức tạ tham khảo.
4. **Mục tiêu & số đo:** cân, mục tiêu 55 kg và các mục tiêu vòng đo nhập riêng; theo dõi eo/rốn/mông/đùi/tay/bắp chân/ngực, InBody, biểu đồ và lịch sử.
5. **Dinh dưỡng & sinh hoạt:** mục tiêu kcal/macro, lịch bữa ăn phù hợp tập 19:30, bảng thực phẩm tham khảo, nhập bữa và tổng dinh dưỡng từng ngày.

Nút sao lưu ở góc trên cho phép **xuất/nhập JSON**, hoặc mở giao diện cũ nếu cần.

## Tập theo 28 tuần có thay đổi không?

**Có nhưng không thay bài tùy tiện mỗi tuần.** Cấu trúc 4 ngày Lower A / Upper A / Lower B / Upper B được giữ để tạo thói quen. Lịch có biến thể:

| Khoảng tuần | Chương trình | Nội dung |
|---|---|---|
| W1–2 | Return | Tập lại, nhẹ, thường 2 set/bài |
| W3–6 | Foundation A | Bài nền, tăng reps trước tạ |
| W7–10 | Progress B | Một số bài thay biến thể tương đương |
| W11 | Deload | Giảm set/tạ, ưu tiên hồi phục |
| W12–14 | Consolidate B | Tăng tiến bài B |
| W15–18 | Progress C | Thay một số góc kéo/chân |
| W19 | Deload | Giảm tải |
| W20–23 | Shape C | Duy trì cơ khi giảm mỡ |
| W24 | Review | Đánh giá lại chỉ số và hồi phục |
| W25–28 | Maintain A | Quay về bài nền, đánh giá duy trì |

Giao diện hiển thị chính xác biến thể và số set của từng tuần. **Không tăng tạ tự động theo thời gian**: kiểm tra đủ reps, form chuẩn, còn ~2 RIR và không đau trước khi tăng một nấc tạ. Với assisted pull-up, kg của máy là *trợ lực* (kg càng thấp càng khó).

Đau cơ khi ấn vào nhẹ có thể gặp khi mới tập lại. Nếu đau khi vận động rõ, giảm tải; đau dữ dội, sưng, yếu bất thường hoặc nước tiểu sẫm màu cần dừng tập và đánh giá y tế.

## Nhập bộ số đo riêng tư (v4.3)

Vào **Mục tiêu & số đo → ↑ Nhập bộ số đo JSON** và chọn file có cấu trúc `FIT55_MEASUREMENT` (version 1). Ứng dụng kiểm tra dữ liệu rồi hỏi xác nhận trước khi nhập.

- Cho phép ghi các trường: cân nặng, ngực, **chân ngực**, eo, bụng ngang rốn, mông, đùi, bắp chân, bắp tay và các chỉ số InBody nếu có.
- Khi ngày đo đã tồn tại, chỉ hợp nhất những trường có trong file; **không xóa nhật ký tập, bữa ăn, chỉ số khác cùng ngày hoặc mốc InBody gốc**.
- File chứa số đo cá nhân không cần tải lên repository công khai. Chỉ chọn file tại trình duyệt thiết bị bạn đang sử dụng.
- Cân nặng được hiển thị đến hai chữ số thập phân để không làm tròn số khi nhập.

## Dữ liệu & bảo mật

- Website chạy hoàn toàn dạng tĩnh trên GitHub Pages; nhật ký cá nhân chỉ lưu trên **localStorage của thiết bị**, không upload lên repository công khai.
- **Tự nhận diện dữ liệu cũ:** dữ liệu từ fit55-v1 và fit55-profile-v2 được nhập vào bản v4 lúc mở lần đầu; log tập cũ lưu tách biệt dưới dạng archive để tránh gán sai biến thể bài. Dữ liệu cũ *không bị xóa hoặc ghi đè*.
- Dữ liệu v4 lưu ở fit55-v4, bao gồm các số đo, lịch tập, lịch sử thực phẩm, check-in và mục tiêu.
- Xuất JSON sao lưu cả dữ liệu v4 và snapshot dữ liệu cũ; nhập v4 hỗ trợ khôi phục sau xác nhận.
- Có bản đối chiếu giao diện FIT55 v2 tại legacy-v2.html. Hai file fit55-premium.css và fit55-premium.js thuộc giao diện cũ và không được load trên trang chủ v4.

## Mã nguồn chính

- index.html: v4 app shell.
- v4.css: thiết kế responsive.
- v4-data.js: thư viện bài tập / kế hoạch từng tuần / nhóm cơ / dữ liệu thực phẩm.
- v4-app.js: giao diện, biểu đồ, logic nhật ký và lưu trữ.
- v4-preview.html: bản xem trước giao diện v4.

## Các nguyên tắc cần nhớ

- 28 tuần là **kế hoạch tập**, không phải cam kết giảm đủ 8,3 kg trong 28 tuần.
- Mục tiêu cân 55 kg và số đo có thể điều chỉnh sau khi kiểm tra tại 58 kg.
- Không có bài tập nào làm giảm mỡ theo vùng; theo dõi cân trung bình, vòng eo, mức tạ và hồi phục.
- InBody dao động theo nước, chu kỳ, thời điểm đo và tập luyện gần đây; không kết luận tăng/mất cơ từ một lần đo.
- Năng lượng mặc định 1.695 kcal (110 g protein, 190 g carb, 55 g chất béo) chỉ là mức thử nghiệm, không phải chỉ định cá nhân hóa chính xác.
- Bảng kcal thực phẩm là dữ liệu tham khảo: xem trọng lượng sống/chín, dầu/sốt và khẩu phần thực tế.

### Giới hạn phiên bản này

Không có đồng bộ tài khoản hoặc hình/video động tác. Phân tích volume nhóm cơ chỉ theo nhóm cơ chính, không thay thế việc đánh giá kỹ thuật trực tiếp. App đã kiểm tra cú pháp và logic render cơ bản nhưng vẫn cần kiểm tra thủ công trên thiết bị thật, nhất là các thao tác nhập/sửa/sao lưu.
