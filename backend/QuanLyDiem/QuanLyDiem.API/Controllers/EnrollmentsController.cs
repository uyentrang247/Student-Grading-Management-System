using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EnrollmentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("statistics/class/{courseClassId}")]
        public async Task<IActionResult> GetClassStatistics(int courseClassId)
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.Student)
                .Include(e => e.CourseClass)
                    .ThenInclude(c => c.Subject)
                .Include(e => e.CourseClass)
                    .ThenInclude(c => c.Lecturer)
                .Where(e => e.CourseClassId == courseClassId)
                .ToListAsync();

            if (!enrollments.Any())
                return NotFound();

            // ========== SỬA LỖI TẠI ĐÂY ==========
            // Vấn đề: ProcessScore là double?, 0.4m là decimal -> không thể nhân trực tiếp
            // Giải pháp: Chuyển đổi về cùng kiểu double
            
            // Cách 1: Dùng 0.4 (double) thay vì 0.4m (decimal)
            var scores = enrollments
                .Where(x => x.ProcessScore.HasValue && x.FinalScore.HasValue)
                .Select(x => Math.Round(
                    x.ProcessScore.Value * 0.4 + x.FinalScore.Value * 0.6, 1))
                .ToList();
            
            // Hoặc cách 2: Dùng Convert.ToDouble() nếu muốn an toàn hơn
            // var scores = enrollments
            //     .Where(x => x.ProcessScore.HasValue && x.FinalScore.HasValue)
            //     .Select(x => Math.Round(
            //         Convert.ToDouble(x.ProcessScore.Value) * 0.4 + 
            //         Convert.ToDouble(x.FinalScore.Value) * 0.6, 1))
            //     .ToList();
            // ===================================

            // Kiểm tra null an toàn cho First() (tránh lỗi CS8602)
            var firstEnrollment = enrollments.First();
            var courseClass = firstEnrollment.CourseClass;
            var subject = courseClass?.Subject;
            var lecturer = courseClass?.Lecturer;

            var dto = new
            {
                CourseClassId = courseClassId,
                ClassCode = courseClass?.ClassCode ?? "",
                SubjectName = subject?.SubjectName ?? "",
                LecturerName = lecturer?.FullName ?? "",
                TotalStudents = scores.Count,
                PassStudents = scores.Count(x => x >= 4),
                FailStudents = scores.Count(x => x < 4),
                PassRate = scores.Count > 0
                    ? Math.Round(scores.Count(x => x >= 4) * 100.0 / scores.Count, 1)
                    : 0,
                FailRate = scores.Count > 0
                    ? Math.Round(scores.Count(x => x < 4) * 100.0 / scores.Count, 1)
                    : 0,
                AverageScore = scores.Any()
                    ? Math.Round(scores.Average(), 1)
                    : 0,
                HighestScore = scores.Any()
                    ? scores.Max()
                    : 0,
                LowestScore = scores.Any()
                    ? scores.Min()
                    : 0,
                A = scores.Count(x => x >= 8.5),
                B = scores.Count(x => x >= 7 && x < 8.5),
                C = scores.Count(x => x >= 5.5 && x < 7),
                D = scores.Count(x => x >= 4 && x < 5.5),
                F = scores.Count(x => x < 4)
            };

            return Ok(dto);
        }
    }
}