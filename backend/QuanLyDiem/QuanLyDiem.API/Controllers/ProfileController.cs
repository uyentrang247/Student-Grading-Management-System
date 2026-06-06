using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.Profile;
using System.Security.Claims;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProfileController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (userIdClaim == null) return Unauthorized(new { message = "Không xác định được người dùng" });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users
                .Include(u => u.Faculty)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            // Nếu là Admin, không trả FacultyName
            var isAdmin = user.Role == "Admin";

            return Ok(new
            {
                user.UserId,
                user.Username,
                user.FullName,
                user.Email,
                FacultyId = isAdmin ? 0 : user.FacultyId,
                FacultyName = isAdmin ? null : (user.Faculty?.FacultyName ?? ""),
                user.Role
            });
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))) });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (userIdClaim == null) return Unauthorized(new { message = "Không xác định được người dùng" });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            // Kiểm tra email trùng với người khác
            var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.UserId != userId);
            if (emailExists)
                return BadRequest(new { message = "Email đã được sử dụng bởi tài khoản khác" });

            user.FullName = dto.FullName;
            user.Email = dto.Email;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thông tin thành công" });
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))) });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (userIdClaim == null) return Unauthorized(new { message = "Không xác định được người dùng" });

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng" });

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password))
                return BadRequest(new { message = "Mật khẩu cũ không đúng" });

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công" });
        }
    }
}