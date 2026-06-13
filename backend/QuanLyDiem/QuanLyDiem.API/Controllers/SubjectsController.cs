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
    public class SubjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubjectsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjects()
        {
            return await _context.Subjects.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Subject>> GetSubject(int id)
        {
            var subject = await _context.Subjects.FindAsync(id);

            if (subject == null)
            {
                return NotFound();
            }

            return subject;
        }

        [HttpPost]
        public async Task<ActionResult<Subject>> CreateSubject(Subject subject)
        {
            if (Math.Abs((subject.ProcessWeight + subject.FinalWeight) - 1) > 0.0001)
            {
                return BadRequest("Tổng trọng số phải bằng 100%");
            }

            if (subject.ProcessWeight < 0.3 || subject.FinalWeight < 0.3)
            {
                return BadRequest("Mỗi trọng số phải từ 30% trở lên");
            }

            if (subject.Credits < 1 || subject.Credits > 6)
            {
                return BadRequest("Số tín chỉ phải từ 1 đến 6");
            }

            var isCodeExists = await _context.Subjects
                .AnyAsync(s => s.SubjectCode == subject.SubjectCode);

            if (isCodeExists)
            {
                return BadRequest("Mã môn học đã tồn tại");
            }

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetSubject),
                new { id = subject.SubjectId },
                subject
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubject(int id, Subject subject)
        {
            if (id != subject.SubjectId)
            {
                return BadRequest("Id không khớp");
            }

            if (Math.Abs((subject.ProcessWeight + subject.FinalWeight) - 1) > 0.0001)
            {
                return BadRequest("Tổng trọng số phải bằng 100%");
            }

            if (subject.ProcessWeight < 0.3 || subject.FinalWeight < 0.3)
            {
                return BadRequest("Mỗi trọng số phải từ 30% trở lên");
            }

            if (subject.Credits < 1 || subject.Credits > 6)
            {
                return BadRequest("Số tín chỉ phải từ 1 đến 6");
            }

            var isCodeExists = await _context.Subjects
                .AnyAsync(s =>
                    s.SubjectCode == subject.SubjectCode &&
                    s.SubjectId != id
                );

            if (isCodeExists)
            {
                return BadRequest("Mã môn học đã tồn tại");
            }

            _context.Entry(subject).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            var subject = await _context.Subjects
                .Include(s => s.CourseClasses)
                .FirstOrDefaultAsync(s => s.SubjectId == id);

            if (subject == null)
            {
                return NotFound();
            }

            if (subject.CourseClasses != null && subject.CourseClasses.Any())
            {
                return BadRequest("Không thể xóa môn học đã có lớp học phần");
            }

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}