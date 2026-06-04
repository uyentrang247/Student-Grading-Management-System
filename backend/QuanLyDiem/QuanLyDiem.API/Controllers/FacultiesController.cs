using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiem.API.Data;
using Microsoft.EntityFrameworkCore;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/Faculties")] // Ép đúng tên mà Frontend đang gọi
[ApiController]
public class FacultyController : ControllerBase
{
    private readonly AppDbContext _context;

    public FacultyController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var faculties = await _context.Faculties.ToListAsync();
        return Ok(faculties);
    }
}
}
