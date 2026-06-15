using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiem.API.Services;

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

        // Xuất bảng điểm Excel
        [Authorize(Roles = "Admin,Lecturer")]
        [HttpGet("export-grade-excel/{courseClassId}")]
        public async Task<IActionResult> ExportGradeExcel(int courseClassId)
        {
            var file = await _reportService.ExportGradeReportExcelAsync(courseClassId);
            return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"BangDiem_{courseClassId}.xlsx");
        }

        // Xuất danh sách học lại Excel
        [Authorize(Roles = "Admin,Lecturer")]
        [HttpGet("export-fail-excel/{courseClassId}")]
        public async Task<IActionResult> ExportFailExcel(int courseClassId)
        {
            var file = await _reportService.ExportFailStudentsExcelAsync(courseClassId);
            return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"DanhSachHocLai_{courseClassId}.xlsx");
        }
    }
}