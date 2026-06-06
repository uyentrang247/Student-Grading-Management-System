using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiem.API.DTOs.Report;
using QuanLyDiem.API.Services;
using System.Security.Claims;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly ReportService _reportService;

        public ReportsController(ReportService reportService)
        {
            _reportService = reportService;
        }

        // 1. Lấy danh sách lớp của giảng viên (cho dropdown)
        [Authorize(Roles = "Lecturer")]
        [HttpGet("lecturer/my-classes")]
        public async Task<IActionResult> GetMyCourseClasses()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                              ?? User.FindFirst("sub")?.Value;
            if (userIdClaim == null) return Unauthorized();

            var lecturerId = int.Parse(userIdClaim);

            var classes = await _reportService.GetLecturerCourseClassesAsync(lecturerId);
            return Ok(classes);
        }

        // 2. Báo cáo chi tiết 1 lớp (giảng viên)
        [Authorize(Roles = "Lecturer")]
        [HttpGet("lecturer/class-report/{courseClassId}")]
        public async Task<IActionResult> GetClassReport(int courseClassId)
        {
            var report = await _reportService.GetClassReportAsync(courseClassId);
            if (report == null)
            {
                return NotFound(new { message = "Không tìm thấy lớp học phần" });
            }
            return Ok(report);
        }

        // 3. Thống kê tổng hợp (Admin)
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/statistics")]
        public async Task<IActionResult> GetAdminStatistics(
            [FromQuery] int? facultyId = null,
            [FromQuery] int? semesterId = null)
        {
            var statistics = await _reportService.GetAdminStatisticsAsync(facultyId, semesterId);
            return Ok(statistics);
        }
    }
}