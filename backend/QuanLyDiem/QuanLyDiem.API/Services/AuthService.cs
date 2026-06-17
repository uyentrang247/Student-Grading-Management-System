using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.Auth;
using QuanLyDiem.API.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace QuanLyDiem.API.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher _passwordHasher;
        private readonly JwtHelper _jwtHelper;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;

        public AuthService(
            AppDbContext context,
            PasswordHasher passwordHasher,
            JwtHelper jwtHelper,
            IMemoryCache cache,
            IEmailService emailService)
        {
            _context = context;
            _passwordHasher = passwordHasher;
            _jwtHelper = jwtHelper;
            _cache = cache;
            _emailService = emailService;
        }

        public async Task<object?> LoginAsync(LoginDto model)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == model.UsernameOrEmail || u.Email == model.UsernameOrEmail);

            if (user == null) return null;

            if (!_passwordHasher.VerifyPassword(model.Password, user.Password))
            {
                return null;
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

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null) return false;

            var otp = new Random().Next(100000, 999999).ToString();
            //luu vao cache voi thoi gian 5 phut
            _cache.Set($"OTP_{model.Email}", otp, TimeSpan.FromMinutes(5));

            try
            {
                string emailBody = $"<h3>Yêu cầu đặt lại mật khẩu</h3><p>Mã OTP của bạn là: <b style='color:#172b4d; font-size:20px;'>{otp}</b></p><p>Mã này có hiệu lực trong vòng 5 phút.</p>";
                await _emailService.SendEmailAsync(model.Email, "Mã OTP Đặt Lại Mật Khẩu", emailBody);
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto model)
        {
            if (!_cache.TryGetValue($"OTP_{model.Email}", out string? savedOtp) || savedOtp != model.Otp)
            {
                return false;
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null) return false;

            user.Password = _passwordHasher.HashPassword(model.NewPassword);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            _cache.Remove($"OTP_{model.Email}");

            return true;
        }
    }
}