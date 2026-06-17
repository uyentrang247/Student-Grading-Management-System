using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.Lecturer;
using QuanLyDiem.API.Services;
using System.Security.Claims;

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
        public async Task<IActionResult> Search([FromQuery] string name)
        {
            try
            {
                var result = await _lecturerService.SearchLecturersAsync(name);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var lecturers = await _lecturerService.GetAllLecturersAsync();
                return Ok(lecturers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var lecturer = await _lecturerService.GetLecturerByIdAsync(id);
                return Ok(lecturer);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLecturer(int id, [FromBody] UpdateLecturerDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string resultMessage = await _lecturerService.UpdateLecturerAsync(id, dto);
                return Ok(new { message = resultMessage });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLecturer(int id)
        {
            try
            {
                string resultMessage = await _lecturerService.DeleteLecturerAsync(id);
                return Ok(new { message = resultMessage });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ==================== API CHO LECTURER REPORT COMPONENT ====================
        
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

        // ==================== DASHBOARD GIẢNG VIÊN ====================
        
        [Authorize(Roles = "Lecturer")]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
                if (userIdClaim == null) return Unauthorized();
                
                var lecturerId = int.Parse(userIdClaim);
                
                // Lấy danh sách lớp của giảng viên
                var myClasses = await _context.CourseClasses
                    .Include(c => c.Subject)
                    .Include(c => c.Enrollments)
                    .Where(c => c.LecturerId == lecturerId)
                    .ToListAsync();
                
                var totalClasses = myClasses.Count;
                var totalStudents = myClasses.Sum(c => c.Enrollments != null ? c.Enrollments.Count : 0);
                var totalSubjects = myClasses.Select(c => c.SubjectId).Distinct().Count();
                
                // Thống kê tiến độ nhập điểm
                var classProgressList = myClasses.Select(classItem => 
                {
                    var enrollments = classItem.Enrollments;
                    var studentCount = enrollments != null ? enrollments.Count : 0;
                    var gradesEntered = enrollments != null ? enrollments.Count(e => e.ProcessScore.HasValue && e.FinalScore.HasValue) : 0;
                    var gradesMissing = studentCount - gradesEntered;
                    var isCompleted = gradesMissing == 0 && studentCount > 0;
                    
                    return new
                    {
                        classItem.CourseClassId,
                        classItem.ClassCode,
                        SubjectName = classItem.Subject != null ? classItem.Subject.SubjectName : "",
                        TotalStudents = studentCount,
                        GradesEntered = gradesEntered,
                        GradesMissing = gradesMissing,
                        ProgressPercent = studentCount > 0 ? Math.Round(gradesEntered * 100.0 / studentCount, 1) : 0,
                        Status = isCompleted ? "completed" : (gradesEntered > 0 ? "incomplete" : "not_started")
                    };
                }).ToList();
                
                var completedClasses = classProgressList.Count(c => (string)c.GetType().GetProperty("Status").GetValue(c) == "completed");
                var incompleteClasses = classProgressList.Count(c => (string)c.GetType().GetProperty("Status").GetValue(c) == "incomplete");
                var totalGradesEntered = classProgressList.Sum(c => (int)c.GetType().GetProperty("GradesEntered").GetValue(c));
                var totalGradesExpected = classProgressList.Sum(c => (int)c.GetType().GetProperty("TotalStudents").GetValue(c));
                
                var completedRate = totalClasses > 0 ? Math.Round(completedClasses * 100.0 / totalClasses, 1) : 0;
                var gradesCompletionRate = totalGradesExpected > 0 ? Math.Round(totalGradesEntered * 100.0 / totalGradesExpected, 1) : 0;
                
                // Thống kê khối lượng giảng dạy theo môn
                var teachingLoad = myClasses
                    .GroupBy(c => new { c.SubjectId, SubjectName = c.Subject != null ? c.Subject.SubjectName : "" })
                    .Select(g => new
                    {
                        SubjectName = g.Key.SubjectName,
                        ClassCount = g.Count(),
                        StudentCount = g.Sum(c => c.Enrollments != null ? c.Enrollments.Count : 0)
                    })
                    .OrderByDescending(x => x.ClassCount)
                    .ToList();
                
                // Cảnh báo
                var warnings = new List<object>();
                
                var incompleteClassCount = classProgressList.Count(c => 
                {
                    var status = (string)c.GetType().GetProperty("Status").GetValue(c);
                    var totalStudents = (int)c.GetType().GetProperty("TotalStudents").GetValue(c);
                    return status != "completed" && totalStudents > 0;
                });
                
                if (incompleteClassCount > 0)
                {
                    warnings.Add(new
                    {
                        Type = "incomplete_class",
                        Message = "Lớp chưa hoàn thành nhập điểm",
                        Count = incompleteClassCount
                    });
                }
                
                var missingGradesStudents = classProgressList.Sum(c => (int)c.GetType().GetProperty("GradesMissing").GetValue(c));
                if (missingGradesStudents > 0)
                {
                    warnings.Add(new
                    {
                        Type = "missing_grades",
                        Message = "Sinh viên chưa được nhập điểm",
                        Count = missingGradesStudents
                    });
                }
                
                var result = new
                {
                    overview = new
                    {
                        totalClasses,
                        totalStudents,
                        totalSubjects,
                        completedClasses,
                        incompleteClasses,
                        completedRate,
                        totalGradesEntered,
                        totalGradesExpected,
                        gradesCompletionRate
                    },
                    teachingLoad,
                    classProgress = classProgressList,
                    warnings
                };
                
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}