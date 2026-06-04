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
                // Gọi Service và lấy thông báo kết quả (thành công hoặc lỗi mail)
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
                    u.Username,
                    u.FullName,
                    u.Email,
                    u.FacultyId,
                    FacultyName = u.Faculty != null ? u.Faculty.FacultyName : ""
                })
                .ToListAsync();

            return Ok(lecturers);
        }
    }
}