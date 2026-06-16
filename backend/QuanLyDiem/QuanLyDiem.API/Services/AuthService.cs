using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.Auth;
using QuanLyDiem.API.Helpers;
using Microsoft.EntityFrameworkCore;

namespace QuanLyDiem.API.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher _passwordHasher;
        private readonly JwtHelper _jwtHelper;

        public AuthService(AppDbContext context, PasswordHasher passwordHasher, JwtHelper jwtHelper)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtHelper = jwtHelper;
        }

        public async Task<object?> LoginAsync(LoginDto model)
        {
            // Tìm user theo Username hoặc Email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == model.UsernameOrEmail || u.Email == model.UsernameOrEmail);

            if (user == null) return null;

            // Kiểm tra mật khẩu
            if (!_passwordHasher.VerifyPassword(model.Password, user.Password))
            {
                return null;
            }

            // Tạo token từ JwtHelper
            var token = _jwtHelper.GenerateToken(user);

            // Trả về object chứa đầy đủ token, role và fullName cho Angular
            return new 
            { 
                token, 
                role = user.Role, 
                fullName = user.FullName 
            };
        }
        public async Task<string?> ForgotPasswordAsync(ForgotPasswordDto model)
{
    var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
    if (user == null) return null;

    string tempPassword = "Qnu" + new Random().Next(100000, 999999).ToString() + "@";
    user.Password = _passwordHasher.HashPassword(tempPassword);
    
    _context.Users.Update(user);
    await _context.SaveChangesAsync();

    return tempPassword;
}
    }
}