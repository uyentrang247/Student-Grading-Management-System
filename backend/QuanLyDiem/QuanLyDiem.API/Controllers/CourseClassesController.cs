using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.Models;
using Microsoft.AspNetCore.Authorization;


namespace QuanLyDiem.API.Controllers
{
    [Authorize(Roles = "Admin")] 
    [Route("api/[controller]")]
    [ApiController]
    public class CourseClassesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CourseClassesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseClass>>> GetCourseClasses()
        {
            return await _context.CourseClasses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Include(c => c.Lecturer)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CourseClass>> GetCourseClass(int id)
        {
            var courseClass = await _context.CourseClasses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Include(c => c.Lecturer)
                .FirstOrDefaultAsync(c => c.CourseClassId == id);

            if (courseClass == null)
            {
                return NotFound();
            }

            return courseClass;
        }

        [HttpPost]
        public async Task<ActionResult<CourseClass>> CreateCourseClass(CourseClass courseClass)
        {
            var isCodeExists = await _context.CourseClasses
                .AnyAsync(c => c.ClassCode == courseClass.ClassCode);

            if (isCodeExists)
            {
                return BadRequest("Mã lớp học phần đã tồn tại");
            }

            var subjectExists = await _context.Subjects
                .AnyAsync(s => s.SubjectId == courseClass.SubjectId);

            if (!subjectExists)
            {
                return BadRequest("Môn học không tồn tại");
            }

            var semesterExists = await _context.Semesters
                .AnyAsync(s => s.SemesterId == courseClass.SemesterId);

            if (!semesterExists)
            {
                return BadRequest("Học kỳ không tồn tại");
            }

            if (courseClass.LecturerId != null)
            {
                var lecturerExists = await _context.Users
                    .AnyAsync(u => u.UserId == courseClass.LecturerId);

                if (!lecturerExists)
                {
                    return BadRequest("Giảng viên không tồn tại");
                }
            }

            _context.CourseClasses.Add(courseClass);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCourseClass),
                new { id = courseClass.CourseClassId },
                courseClass
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourseClass(int id, CourseClass courseClass)
        {
            if (id != courseClass.CourseClassId)
            {
                return BadRequest("Id không khớp");
            }

            var currentCourseClass = await _context.CourseClasses
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CourseClassId == id);

            if (currentCourseClass == null)
            {
                return NotFound();
            }

            bool isSubjectChanged = currentCourseClass.SubjectId != courseClass.SubjectId;

            if (isSubjectChanged)
            {
                bool hasScoreData = await _context.Enrollments
                    .AnyAsync(e =>
                        e.CourseClassId == id &&
                        (e.ProcessScore != null || e.FinalScore != null)
                    );

                if (hasScoreData)
                {
                    return BadRequest("Không cho phép đổi môn học vì lớp đã phát sinh dữ liệu điểm");
                }
            }

            var isCodeExists = await _context.CourseClasses
                .AnyAsync(c =>
                    c.ClassCode == courseClass.ClassCode &&
                    c.CourseClassId != id
                );

            if (isCodeExists)
            {
                return BadRequest("Mã lớp học phần đã tồn tại");
            }

            var subjectExists = await _context.Subjects
                .AnyAsync(s => s.SubjectId == courseClass.SubjectId);

            if (!subjectExists)
            {
                return BadRequest("Môn học không tồn tại");
            }

            var semesterExists = await _context.Semesters
                .AnyAsync(s => s.SemesterId == courseClass.SemesterId);

            if (!semesterExists)
            {
                return BadRequest("Học kỳ không tồn tại");
            }

            if (courseClass.LecturerId != null)
            {
                var lecturerExists = await _context.Users
                    .AnyAsync(u => u.UserId == courseClass.LecturerId);

                if (!lecturerExists)
                {
                    return BadRequest("Giảng viên không tồn tại");
                }
            }

            _context.Entry(courseClass).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourseClass(int id)
        {
            var courseClass = await _context.CourseClasses
                .Include(c => c.Enrollments)
                .FirstOrDefaultAsync(c => c.CourseClassId == id);

            if (courseClass == null)
            {
                return NotFound();
            }

            if (courseClass.Enrollments != null && courseClass.Enrollments.Any())
            {
                return BadRequest("Không thể xóa lớp học phần đã có sinh viên đăng ký");
            }

            _context.CourseClasses.Remove(courseClass);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}