using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.Models;

namespace QuanLyDiem.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SemestersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SemestersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Semester>>> GetSemesters()
        {
            return await _context.Semesters.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Semester>> GetSemester(int id)
        {
            var semester = await _context.Semesters.FindAsync(id);

            if (semester == null)
            {
                return NotFound();
            }

            return semester;
        }

        [HttpPost]
        public async Task<ActionResult<Semester>> CreateSemester(Semester semester)
        {
            var isExists = await _context.Semesters
                .AnyAsync(s =>
                    s.Term == semester.Term &&
                    s.AcademicYear == semester.AcademicYear
                );

            if (isExists)
            {
                return BadRequest("Học kỳ đã tồn tại");
            }

            _context.Semesters.Add(semester);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetSemester),
                new { id = semester.SemesterId },
                semester
            );
        }
    }
}