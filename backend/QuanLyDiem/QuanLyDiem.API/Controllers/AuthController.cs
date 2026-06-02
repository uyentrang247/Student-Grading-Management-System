using Microsoft.AspNetCore.Mvc;
using QuanLyDiem.API.DTOs.Auth;
using QuanLyDiem.API.Services;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
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

       [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
    {
        var result = await _authService.ForgotPasswordAsync(model);
        if (result == null) return NotFound(new { message = "Email không tồn tại!" });
        return Ok(new { message = "Thành công", data = result });
    }
    }
}