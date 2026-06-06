using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.Models;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("lecturers")]
        public async Task<ActionResult<IEnumerable<User>>> GetLecturers()
        {
            var lecturers = await _context.Users
                .Where(u => u.Role == "Lecturer")
                .ToListAsync();

            return Ok(lecturers);
        }
    }
}