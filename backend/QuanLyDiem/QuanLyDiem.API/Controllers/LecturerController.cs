using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.Lecturer;
using QuanLyDiem.API.Services;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerController : ControllerBase
    {
        private readonly LecturerService _lecturerService;
        private readonly AppDbContext _context;

        public LecturerController(LecturerService lecturerService, AppDbContext context)
        {
            _lecturerService = lecturerService;
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateLecturerDto model)
        {
            try
            {
                string resultMessage = await _lecturerService.CreateLecturerAsync(model);
                return Ok(new { message = resultMessage });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var lecturers = await _context.Users
                .Where(u => u.Role == "Lecturer")
                .Include(u => u.Faculty)
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.FullName,
                    u.Email,
                    u.FacultyId,
                    FacultyName = u.Faculty != null ? u.Faculty.FacultyName : ""
                })
                .ToListAsync();

            return Ok(lecturers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var lecturer = await _context.Users
                .Where(u => u.UserId == id && u.Role == "Lecturer")
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.FullName,
                    u.Email,
                    u.FacultyId
                })
                .FirstOrDefaultAsync();

            if (lecturer == null) return NotFound("Không tìm thấy giảng viên.");

            return Ok(lecturer);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLecturer(int id, [FromBody] UpdateLecturerDto dto)
        {
            // 1. Kiểm tra ràng buộc [Required] và [EmailAddress] trong DTO
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Trả về thông báo lỗi chi tiết cho Angular
            }

            var lecturer = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id && u.Role == "Lecturer");

            if (lecturer == null) return NotFound("Không tìm thấy giảng viên.");

            // 2. Kiểm tra trùng email
            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == dto.Email && u.UserId != id);

            if (emailExists) return BadRequest(new { message = "Email đã được sử dụng bởi người khác." });

            // 3. Cập nhật thông tin
            lecturer.FullName = dto.FullName;
            lecturer.Email = dto.Email;
            lecturer.FacultyId = dto.FacultyId ?? lecturer.FacultyId;

            _context.Users.Update(lecturer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thông tin giảng viên thành công." });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLecturer(int id)
        {
            var lecturer = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id && u.Role == "Lecturer");

            if (lecturer == null) return NotFound("Không tìm thấy giảng viên.");

            // 4. Kiểm tra xem giảng viên có đang dạy lớp nào không
            var isTeaching = await _context.Users
                .AnyAsync(u => u.UserId == id && u.CourseClasses != null && u.CourseClasses.Any());

            if (isTeaching) return BadRequest(new { message = "Không thể xóa giảng viên đang phụ trách lớp học phần." });

            _context.Users.Remove(lecturer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa tài khoản giảng viên thành công." });
        }
    }
}