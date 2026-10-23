# Miêu Giới Phiêu Lưu — S0
Prototype RPGJS v5 cho browser. Giữ bản nguồn trên nhánh độc lập của giangocquoc-art/motngum.cafe.
## Phạm vi đã triển khai
- Map thử nghiệm lấy từ starter chính thức RPGJS v5.
- Nhân vật mèo, NPC Bà Chủ Mèo, quái chuột 2D tự tạo bằng sprite pixel.
- Action Battle AI và nhiệm vụ đánh 10 chuột, nhận 120 xu mèo.
- Điều khiển bằng PC và lớp mobile của RPGJS; standalone lưu cục bộ.
## Cách chạy
```bash
npm install
npm run dev
```
Build: `npm run build`.
**S0 không phải MMORPG**. Backend multiplayer, đăng nhập, PvP và dữ liệu server phải làm ở các mốc sau.
## Nguồn và giấy phép
Game logic và sprites mèo/chuột được tạo riêng. Engine dựa trên RPGJS v5 MIT. Starter lấy từ commit `443bb0f427bac6491e90e569b179facdccc4ecdc`, tile Pipoya theo quy định giấy phép gốc. Chỉ dùng assets hợp lệ.
## Triển khai
Vercel project riêng, root directory `games/meo-gioi`. Script prepare tải starter ở commit cố định về trong build rồi áp dụng overrides. Không commit node_modules, tokens hoặc dữ liệu người chơi.
