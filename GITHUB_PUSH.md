# 🚀 Commands để push lên GitHub

## Sau khi tạo repository trên GitHub, chạy các lệnh sau:

```bash
# Thêm remote origin (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/toeic-reading-practice-ai.git

# Đổi tên branch thành main (GitHub mặc định dùng main)
git branch -M main

# Push code lên GitHub
git push -u origin main
```

## ✅ Sau khi push thành công:

1. **Truy cập repository:** `https://github.com/YOUR_USERNAME/toeic-reading-practice-ai`
2. **Deploy trực tiếp từ GitHub:**
   - Vào [vercel.com](https://vercel.com) → Import project → chọn GitHub repo
   - Hoặc [netlify.com](https://netlify.com) → New site from Git → chọn GitHub repo

## 🔧 Nếu gặp lỗi authentication:

```bash
# Cấu hình Git lần đầu
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Hoặc dùng GitHub Desktop app để dễ dàng hơn
```

## 📱 Link deploy cuối cùng sẽ có dạng:
- Vercel: `https://toeic-reading-practice-ai.vercel.app`  
- Netlify: `https://toeic-reading-practice-ai.netlify.app`