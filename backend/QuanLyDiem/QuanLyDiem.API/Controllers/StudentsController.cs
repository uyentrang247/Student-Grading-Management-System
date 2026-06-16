using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiem.API.DTOs;
using QuanLyDiem.API.DTOs.Student;
using QuanLyDiem.API.Services;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly StudentService _studentService;
        public StudentsController(StudentService studentService)
        {
            _studentService = studentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentResponseDTO>>> GetStudents(
            [FromQuery] int? homeroomClassId,
            [FromQuery] string? searchTerm)
        {
            var students = await _studentService.GetStudentsAsync(homeroomClassId, searchTerm);
            return Ok(students);
        }
        // GET: api/Students/classes
        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses()
        {
            var classes = await _studentService.GetClassesLookupAsync();
            return Ok(classes);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<StudentResponseDTO>> GetStudent(int id)
        {
            var student = await _studentService.GetStudentByIdAsync(id);
            if (student == null) return NotFound("Không tìm thấy sinh viên!");

            return Ok(student);
        }

        [HttpPost]
        public async Task<ActionResult> CreateStudent(StudentCreateUpdateDTO dto)
        {
            await _studentService.CreateStudentAsync(dto);
            return Ok("Thêm sinh viên thành công!");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(int id, StudentCreateUpdateDTO dto)
        {
            var result = await _studentService.UpdateStudentAsync(id, dto);
            if (!result) return NotFound("Không tìm thấy sinh viên để cập nhật!");

            return Ok("Cập nhật thành công!");
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var result = await _studentService.DeleteStudentAsync(id);
            if (!result) return NotFound("Không tìm thấy sinh viên để xóa!");

            return Ok("Xóa sinh viên thành công!");
        }
    }
}
