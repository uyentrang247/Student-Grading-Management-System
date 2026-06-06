using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using QuanLyDiem.API.DTOs.Auth;
using QuanLyDiem.API.Services;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly IMemoryCache _cache;
        private readonly GoogleAuthService _googleAuthService;

        public AuthController(AuthService authService, IMemoryCache cache, GoogleAuthService googleAuthService)
        {
            _authService = authService;
            _cache = cache;
            _googleAuthService = googleAuthService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var result = await _authService.LoginAsync(model);
            if (result == null)
            {
                return Unauthorized(new { message = "Tài khoản hoặc mật khẩu không chính xác!" });
            }
            return Ok(result);
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto model)
        {
            var result = await _googleAuthService.GoogleLoginAsync(model.IdToken);

            if (result == null)
            {
                return Unauthorized(new { message = "Đăng nhập Google thất bại!" });
            }

            dynamic dynamicResult = result;

            if (dynamicResult.success == false)
            {
                return Unauthorized(new { message = (string)dynamicResult.message });
            }

            return Ok(new
            {
                token = (string)dynamicResult.token,
                userId = (int)dynamicResult.userId,
                role = (string)dynamicResult.role,
                fullName = (string)dynamicResult.fullName
            });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            try
            {
                var isSuccess = await _authService.ForgotPasswordAsync(model);
                if (!isSuccess) return NotFound(new { message = "Email không tồn tại!" });

                return Ok(new { message = "Mã OTP đã được gửi đến email của bạn." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi gửi mail: {ex.Message}" });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            var isSuccess = await _authService.ResetPasswordAsync(model);
            if (!isSuccess) return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn!" });

            return Ok(new { message = "Cập nhật mật khẩu thành công!" });
        }

        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpDto model)
        {
            if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Otp))
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ!" });
            }

            var emailKey = model.Email.Trim().ToLower();
            var cachedOtpObj = _cache.Get($"OTP_{emailKey}");

            if (cachedOtpObj == null)
            {
                cachedOtpObj = _cache.Get($"OTP_{model.Email.Trim()}");
            }

            if (cachedOtpObj == null)
            {
                return BadRequest(new { message = "Mã OTP không tồn tại hoặc đã hết hạn!" });
            }

            if (cachedOtpObj.ToString() != model.Otp.Trim())
            {
                return BadRequest(new { message = "Mã OTP không chính xác!" });
            }

            return Ok(new { message = "Xác thực OTP thành công." });
        }
    }
}