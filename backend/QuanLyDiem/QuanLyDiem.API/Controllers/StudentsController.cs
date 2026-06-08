using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiem.API.DTOs.Student;
using QuanLyDiem.API.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

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

        // GET: api/Students?homeroomClassId=1&searchTerm=abc&pageNumber=1&pageSize=10
        [HttpGet]
        public async Task<IActionResult> GetStudents(
            [FromQuery] int? homeroomClassId,
            [FromQuery] string? searchTerm,
            [FromQuery] int pageNumber = 1,  // Mặc định là trang 1 nếu Angular không truyền
            [FromQuery] int pageSize = 10)  // Mặc định lấy 10 dòng dữ liệu
        {
            // Nhận về Tuple (Data, TotalRecords) từ Service
            var (data, totalRecords) = await _studentService.GetStudentsAsync(homeroomClassId, searchTerm, pageNumber, pageSize);
            
            // Đóng gói lại thành cấu trúc Object chuẩn hóa cho Angular Paginator dễ bóc tách
            return Ok(new
            {
                totalRecords = totalRecords,
                data = data
            });
        }

        // GET: api/Students/classes
        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses()
        {
            var classes = await _studentService.GetClassesLookupAsync();
            return Ok(classes);
        }

        // GET: api/Students/5
        [HttpGet("{id}")]
        public async Task<ActionResult<StudentResponseDTO>> GetStudent(int id)
        {
            var student = await _studentService.GetStudentByIdAsync(id);
            if (student == null) 
            {
                return NotFound(new { message = "Không tìm thấy sinh viên!" });
            }

            return Ok(student);
        }

        // POST: api/Students
        [HttpPost]
        public async Task<ActionResult> CreateStudent([FromBody] StudentCreateUpdateDTO dto)
        {
            // Kiểm tra tính hợp lệ của Model (Validation)
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _studentService.CreateStudentAsync(dto);
            if (!result)
            {
                // Trả về BadRequest kèm thông báo nếu trùng mã sinh viên
                return BadRequest(new { message = "Mã sinh viên đã tồn tại trong hệ thống!" });
            }

            return Ok(new { message = "Thêm sinh viên thành công!" });
        }

        // PUT: api/Students/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] StudentCreateUpdateDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _studentService.UpdateStudentAsync(id, dto);
            if (!result)
            {
                // Trả về lỗi chi tiết vì có 2 trường hợp: 
                // 1. Không tìm thấy ID sinh viên. 2. Trùng mã sinh viên với người khác.
                return BadRequest(new { message = "Cập nhật thất bại! Không tìm thấy sinh viên hoặc mã sinh viên mới bị trùng." });
            }

            return Ok(new { message = "Cập nhật thông tin thành công!" });
        }

        // DELETE: api/Students/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            var result = await _studentService.DeleteStudentAsync(id);
            if (!result) 
            {
                return NotFound(new { message = "Không tìm thấy sinh viên để xóa!" });
            }

            return Ok(new { message = "Xóa sinh viên thành công!" });
        }
    }
}