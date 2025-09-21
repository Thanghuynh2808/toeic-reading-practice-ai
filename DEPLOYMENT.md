# Hướng dẫn triển khai TOEIC Reading Practice AI

## 🚀 Triển khai lên Vercel (Khuyên dùng)

### Bước 1: Tạo tài khoản Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. Đăng ký tài khoản miễn phí (có thể dùng GitHub)

### Bước 2: Upload dự án
1. Tạo repository GitHub mới và push code lên
2. Hoặc kéo thả folder dự án trực tiếp vào Vercel

### Bước 3: Cấu hình Environment Variables
Trong Vercel dashboard, thêm các biến môi trường:
- `GEMINI_API_KEY`: API key Google Gemini của bạn
- `UNSPLASH_ACCESS_KEY`: API key Unsplash (tùy chọn)

### Bước 4: Deploy
- Vercel sẽ tự động build và deploy
- Bạn sẽ có link public để truy cập từ mọi nơi

## 🌐 Triển khai lên Netlify

### Bước 1: Tạo tài khoản Netlify
1. Truy cập [netlify.com](https://netlify.com)
2. Đăng ký tài khoản miễn phí

### Bước 2: Deploy từ folder
1. Kéo thả folder `dist` sau khi build vào Netlify
2. Hoặc connect với GitHub repository

### Bước 3: Cấu hình Environment Variables
Trong Netlify dashboard > Site settings > Environment variables:
- `GEMINI_API_KEY`: API key Google Gemini của bạn
- `UNSPLASH_ACCESS_KEY`: API key Unsplash (tùy chọn)

## 📱 Truy cập từ iPad
Sau khi deploy thành công, bạn sẽ có URL công khai như:
- `https://your-app.vercel.app`
- `https://your-app.netlify.app`

Bạn có thể:
- Mở trực tiếp trên Safari iPad
- Thêm vào Home Screen để dùng như app native
- Chia sẻ link với bạn bè (nếu muốn)

## 🔐 Bảo mật dữ liệu cá nhân
- Dữ liệu học tập được lưu local trong browser
- API keys được bảo vệ qua environment variables
- Không ai khác có thể truy cập dữ liệu học tập của bạn

## 🛠 Commands hữu ích
```bash
# Build production
npm run build

# Preview local
npm run preview

# Development
npm run dev
```