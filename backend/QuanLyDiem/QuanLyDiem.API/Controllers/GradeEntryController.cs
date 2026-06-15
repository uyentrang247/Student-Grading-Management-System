using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.GradeEntry;
using System.Security.Claims;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GradeEntryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GradeEntryController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Lecturer")]
        [HttpGet("my-course-classes")]
        public async Task<ActionResult<IEnumerable<CourseClassForGradeDto>>> GetMyCourseClasses()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (userIdClaim == null) return Unauthorized();
            
            var userId = int.Parse(userIdClaim);
            
            // Kiểm tra user có role Lecturer không
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != "Lecturer") 
                return Forbid();
            
            var courseClasses = await _context.CourseClasses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Include(c => c.Lecturer)
                .Where(c => c.LecturerId == userId)
                .Select(c => new CourseClassForGradeDto
                {
                    CourseClassId = c.CourseClassId,
                    ClassCode = c.ClassCode,
                    SubjectName = c.Subject != null ? c.Subject.SubjectName : "",
                    LecturerName = c.Lecturer != null ? c.Lecturer.FullName : "",
                    Semester = c.Semester != null ? c.Semester.Term : "",
                    AcademicYear = c.Semester != null ? c.Semester.AcademicYear : ""
                })
                .ToListAsync();

            return Ok(courseClasses);
        }

        // GET: api/GradeEntry/class/1/students
        [HttpGet("class/{courseClassId}/students")]
        public async Task<ActionResult<IEnumerable<StudentGradeResponseDto>>> GetStudentsByClass(int courseClassId)
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.Student)
                    .ThenInclude(s => s!.HomeroomClass)
                .Include(e => e.CourseClass)
                .Where(e => e.CourseClassId == courseClassId)
                .Select(e => new StudentGradeResponseDto
                {
                    EnrollmentId = e.EnrollmentId,
                    StudentId = e.StudentId,
                    StudentCode = e.Student != null ? e.Student.StudentCode : "",
                    FullName = e.Student != null ? e.Student.LastName + " " + e.Student.FirstName : "",
                    HomeroomClass = e.Student != null && e.Student.HomeroomClass != null
                        ? e.Student.HomeroomClass.ClassName : "",
                    CourseClassId = e.CourseClassId,
                    ClassCode = e.CourseClass != null ? e.CourseClass.ClassCode : "",
                    ProcessScore = e.ProcessScore,
                    FinalScore = e.FinalScore
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        // PUT: api/GradeEntry/save-bulk
        [HttpPut("save-bulk")]
        public async Task<IActionResult> SaveGradesBulk([FromBody] List<GradeEntryDto> grades)
        {
            if (grades == null || !grades.Any())
            {
                return BadRequest(new { message = "Không có dữ liệu điểm để lưu" });
            }

            foreach (var grade in grades)
            {
                if (grade.ProcessScore.HasValue && (grade.ProcessScore < 0 || grade.ProcessScore > 10))
                {
                    return BadRequest(new { message = "Điểm quá trình phải từ 0-10" });
                }
                if (grade.FinalScore.HasValue && (grade.FinalScore < 0 || grade.FinalScore > 10))
                {
                    return BadRequest(new { message = "Điểm cuối kỳ phải từ 0-10" });
                }

                var enrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.EnrollmentId == grade.EnrollmentId);

                if (enrollment != null)
                {
                    enrollment.ProcessScore = grade.ProcessScore;
                    enrollment.FinalScore = grade.FinalScore;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Lưu điểm thành công" });
        }

        // GET: api/GradeEntry/class/1/fail-students
        [HttpGet("class/{courseClassId}/fail-students")]
        public async Task<ActionResult<IEnumerable<FailStudentDto>>> GetFailStudents(int courseClassId)
        {
            var courseClass = await _context.CourseClasses
                .Include(c => c.Subject)
                .FirstOrDefaultAsync(c => c.CourseClassId == courseClassId);

            if (courseClass == null)
            {
                return NotFound();
            }

            var processWeight = courseClass.Subject?.ProcessWeight ?? 0.4;
            var finalWeight = courseClass.Subject?.FinalWeight ?? 0.6;

            var enrollments = await _context.Enrollments
                .Include(e => e.Student)
                .Where(e => e.CourseClassId == courseClassId)
                .Select(e => new
                {
                    e.EnrollmentId,
                    e.StudentId,
                    StudentCode = e.Student != null ? e.Student.StudentCode : "",
                    FullName = e.Student != null ? e.Student.LastName + " " + e.Student.FirstName : "",
                    e.ProcessScore,
                    e.FinalScore,
                    AverageScore = e.ProcessScore.HasValue && e.FinalScore.HasValue
                        ? Math.Round(e.ProcessScore.Value * processWeight + e.FinalScore.Value * finalWeight, 1)
                        : (double?)null
                })
                .ToListAsync();

            var result = enrollments
                .Where(s => s.AverageScore.HasValue && s.AverageScore < 4.0)
                .Select(s => new FailStudentDto
                {
                    EnrollmentId = s.EnrollmentId,
                    StudentId = s.StudentId,
                    StudentCode = s.StudentCode,
                    FullName = s.FullName,
                    ProcessScore = s.ProcessScore,
                    FinalScore = s.FinalScore,
                    AverageScore = s.AverageScore
                })
                .ToList();

            return Ok(result);
        }

        // GET: api/GradeEntry/class/1/transcript
        [HttpGet("class/{courseClassId}/transcript")]
        public async Task<ActionResult<TranscriptResponseDto>> GetTranscript(int courseClassId)
        {
            var courseClass = await _context.CourseClasses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Include(c => c.Lecturer)
                .FirstOrDefaultAsync(c => c.CourseClassId == courseClassId);

            if (courseClass == null)
            {
                return NotFound();
            }

            var processWeight = courseClass.Subject?.ProcessWeight ?? 0.4;
            var finalWeight = courseClass.Subject?.FinalWeight ?? 0.6;

            var enrollments = await _context.Enrollments
                .Include(e => e.Student)
                .Where(e => e.CourseClassId == courseClassId)
                .Select(e => new
                {
                    e.EnrollmentId,
                    e.StudentId,
                    StudentCode = e.Student != null ? e.Student.StudentCode : "",
                    FullName = e.Student != null ? e.Student.LastName + " " + e.Student.FirstName : "",
                    e.ProcessScore,
                    e.FinalScore,
                    AverageScore = e.ProcessScore.HasValue && e.FinalScore.HasValue
                        ? Math.Round(e.ProcessScore.Value * processWeight + e.FinalScore.Value * finalWeight, 1)
                        : (double?)null
                })
                .ToListAsync();

            string GetGradeLetter(double? score)
            {
                if (!score.HasValue) return "Chưa có";
                if (score >= 9.0) return "A+";
                if (score >= 8.0) return "A";
                if (score >= 7.0) return "B+";
                if (score >= 6.0) return "B";
                if (score >= 5.0) return "C";
                if (score >= 4.0) return "D";
                return "F";
            }

            double? GetGradeScale4(double? score)
            {
                if (!score.HasValue) return null;
                if (score >= 9.0) return 4.0;
                if (score >= 8.0) return 3.5;
                if (score >= 7.0) return 3.0;
                if (score >= 6.0) return 2.5;
                if (score >= 5.0) return 2.0;
                if (score >= 4.0) return 1.5;
                return 0.0;
            }

            var response = new TranscriptResponseDto
            {
                CourseClass = new CourseClassInfoDto
                {
                    CourseClassId = courseClass.CourseClassId,
                    ClassCode = courseClass.ClassCode,
                    SubjectName = courseClass.Subject?.SubjectName ?? "",
                    SubjectCode = courseClass.Subject?.SubjectCode ?? "",
                    Credits = courseClass.Subject?.Credits ?? 0,
                    Semester = courseClass.Semester?.Term ?? "",
                    AcademicYear = courseClass.Semester?.AcademicYear ?? "",
                    LecturerName = courseClass.Lecturer?.FullName ?? ""
                },
                Students = enrollments.Select(s => new StudentTranscriptDto
                {
                    EnrollmentId = s.EnrollmentId,
                    StudentId = s.StudentId,
                    StudentCode = s.StudentCode,
                    FullName = s.FullName,
                    ProcessScore = s.ProcessScore,
                    FinalScore = s.FinalScore,
                    AverageScore = s.AverageScore,
                    GradeLetter = GetGradeLetter(s.AverageScore),
                    GradeScale4 = GetGradeScale4(s.AverageScore)
                }).ToList()
            };

            return Ok(response);
        }
    }
}