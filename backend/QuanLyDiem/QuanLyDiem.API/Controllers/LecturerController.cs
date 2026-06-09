using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.Lecturer;
using QuanLyDiem.API.Services;
using System.Security.Claims;  // THÊM DÒNG NÀY

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerController : ControllerBase
    {
        private readonly LecturerService _lecturerService;
        private readonly AppDbContext _context;
        private readonly ILecturerClassReportService _lecturerClassReportService;

        public LecturerController(
            LecturerService lecturerService, 
            AppDbContext context,
            ILecturerClassReportService lecturerClassReportService)
        {
            _lecturerService = lecturerService;
            _context = context;
            _lecturerClassReportService = lecturerClassReportService;
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

        [HttpGet("search")]
        public async Task<IActionResult> Search(string name)
        {
            var result = await _context.Users
                .Where(u => u.Role == "Lecturer" && u.FullName.Contains(name))
                .ToListAsync();
            return Ok(result);
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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var lecturer = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id && u.Role == "Lecturer");

            if (lecturer == null) return NotFound("Không tìm thấy giảng viên.");

            var emailExists = await _context.Users
                .AnyAsync(u => u.Email == dto.Email && u.UserId != id);

            if (emailExists) return BadRequest(new { message = "Email đã được sử dụng bởi người khác." });

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

            var isTeaching = await _context.Users
                .AnyAsync(u => u.UserId == id && u.CourseClasses != null && u.CourseClasses.Any());

            if (isTeaching) return BadRequest(new { message = "Không thể xóa giảng viên đang phụ trách lớp học phần." });

            _context.Users.Remove(lecturer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa tài khoản giảng viên thành công." });
        }

        // ==================== BÁO CÁO GIẢNG VIÊN ====================
        
        [Authorize(Roles = "Lecturer")]
        [HttpGet("my-classes")]
        public async Task<IActionResult> GetMyClasses([FromQuery] int? semesterId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (userIdClaim == null) return Unauthorized();
            
            var lecturerId = int.Parse(userIdClaim);
            
            var classes = await _lecturerClassReportService.GetMyClassesAsync(lecturerId, semesterId);
            
            var result = classes.Select(c => new
            {
                c.CourseClassId,
                c.ClassCode,
                SubjectName = c.Subject?.SubjectName ?? "",
                Credits = c.Subject?.Credits ?? 0,
                Semester = c.Semester?.Term ?? "",
                AcademicYear = c.Semester?.AcademicYear ?? ""
            });
            
            return Ok(new { success = true, data = result });
        }

        [Authorize(Roles = "Lecturer")]
        [HttpGet("class/{courseClassId}/detailed-report")]
        public async Task<IActionResult> GetClassDetailedReport(int courseClassId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
                if (userIdClaim == null) return Unauthorized();
                
                var lecturerId = int.Parse(userIdClaim);
                
                var report = await _lecturerClassReportService.GetClassReportAsync(lecturerId, courseClassId);
                return Ok(new { success = true, data = report });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}