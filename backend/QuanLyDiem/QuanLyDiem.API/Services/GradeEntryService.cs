using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.GradeEntry;

namespace QuanLyDiem.API.Services
{
    public class GradeEntryService
    {
        private readonly AppDbContext _context;

        public GradeEntryService(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách sinh viên theo lớp
        public async Task<List<StudentGradeResponseDto>> GetStudentsByClass(int courseClassId)
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

            return enrollments;
        }

        // Lấy danh sách lớp của giảng viên
        public async Task<List<CourseClassForGradeDto>> GetMyCourseClasses(int lecturerId)
        {
            var courseClasses = await _context.CourseClasses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Include(c => c.Lecturer)
                .Where(c => c.LecturerId == lecturerId)
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

            return courseClasses;
        }

        // Lấy danh sách sinh viên rớt
        public async Task<List<FailStudentDto>> GetFailStudents(int courseClassId)
        {
            var courseClass = await _context.CourseClasses
                .Include(c => c.Subject)
                .FirstOrDefaultAsync(c => c.CourseClassId == courseClassId);

            var processWeight = courseClass?.Subject?.ProcessWeight ?? 0.4;
            var finalWeight = courseClass?.Subject?.FinalWeight ?? 0.6;

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

            return result;
        }
    }
}