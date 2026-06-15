using Google.Apis.Auth;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.Helpers;
using QuanLyDiem.API.Models;
using Microsoft.EntityFrameworkCore;

namespace QuanLyDiem.API.Services
{
    public class GoogleAuthService
    {
        private readonly AppDbContext _context;
        private readonly JwtHelper _jwtHelper;

        public GoogleAuthService(AppDbContext context, JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
        }

        public async Task<object?> GoogleLoginAsync(string idToken)
        {
            try
            {
                // 1. Xác thực token từ Google
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { "679144999056-4ap178auubdlvdj2a11a6kdrovoljueh.apps.googleusercontent.com" }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

                if (payload == null)
                {
                    return new { success = false, message = "Token Google không hợp lệ." };
                }

                var email = payload.Email;
                var fullName = payload.Name;

                // 2. KIỂM TRA EMAIL CÓ TRONG DATABASE KHÔNG - KHÔNG TẠO MỚI
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    // 3. NẾU KHÔNG CÓ -> BÁO LỖI, KHÔNG CHO ĐĂNG NHẬP
                    return new
                    {
                        success = false,
                        message = $"Email '{email}' chưa được cấp quyền truy cập. Vui lòng liên hệ Admin để được tạo tài khoản."
                    };
                }

                // 4. Cập nhật tên hiển thị nếu cần (chỉ cập nhật, không tạo mới)
                if (string.IsNullOrEmpty(user.FullName) && !string.IsNullOrEmpty(fullName))
                {
                    user.FullName = fullName;
                    await _context.SaveChangesAsync();
                }

                // 5. Tạo JWT token
                var token = _jwtHelper.GenerateToken(user);

                return new
                {
                    success = true,
                    token = token,
                    userId = user.UserId,
                    role = user.Role,
                    fullName = user.FullName
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    success = false,
                    message = $"Lỗi xác thực: {ex.Message}"
                };
            }
        }
    }
}