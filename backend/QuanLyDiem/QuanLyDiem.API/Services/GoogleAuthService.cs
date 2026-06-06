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
            // Xác thực token Google
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { "679144999056-4ap178auubdlvdj2a11a6kdrovoljueh.apps.googleusercontent.com" }
            };

            GoogleJsonWebSignature.Payload? payload;
            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            }
            catch
            {
                return null;
            }

            if (payload == null) return null;

            var email = payload.Email;
            var fullName = payload.Name;
            var googleId = payload.Subject;

            // Tìm user theo email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                // Tạo tài khoản mới nếu chưa tồn tại
                user = new User
                {
                    Username = email.Split('@')[0],
                    Email = email,
                    FullName = fullName ?? email,
                    Password = "", // Google login không cần password
                    FacultyId = 1, // Mặc định khoa CNTT
                    Role = "Lecturer" // Mặc định là giảng viên, Admin sẽ phân quyền sau
                };

                // Kiểm tra username không trùng
                var baseUsername = user.Username;
                var counter = 1;
                while (await _context.Users.AnyAsync(u => u.Username == user.Username))
                {
                    user.Username = $"{baseUsername}{counter}";
                    counter++;
                }

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            var token = _jwtHelper.GenerateToken(user);

            return new
            {
                token,
                userId = user.UserId,
                role = user.Role,
                fullName = user.FullName
            };
        }
    }
}