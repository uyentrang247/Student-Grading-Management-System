using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiem.API.Models;
using QuanLyDiem.API.Services;

namespace QuanLyDiem.API.Controllers
{
    [Authorize(Roles = "Admin,Lecturer")]
    [ApiController]
    [Route("api/[controller]")] // Định tuyến gốc: api/enrollments
    public class EnrollmentsController : ControllerBase
    {
        private readonly EnrollmentService _enrollmentService;

        public EnrollmentsController(EnrollmentService enrollmentService)
        {
            _enrollmentService = enrollmentService;
        }

        // GET: api/enrollments?semesterId=1
        [HttpGet]
        public async Task<IActionResult> GetClasses([FromQuery] int? semesterId)
        {
            if (User.IsInRole("Admin"))
            {
                var allDbClasses = await _enrollmentService.GetAllClassesAsync(semesterId);
                return Ok(allDbClasses); 
            }

            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int lecturerId))
            {
                return Challenge();
            }
            var lecturerClasses = await _enrollmentService.GetLecturerClassesAsync(lecturerId, semesterId);
            return Ok(lecturerClasses); 
        }

        // GET: api/enrollments/semesters
        [HttpGet("semesters")]
        public async Task<IActionResult> GetSemesters()
        {
            var semesters = await _enrollmentService.GetAllSemestersAsync();
            return Ok(semesters);
        }

        // GET: api/enrollments/5/students
        [HttpGet("{id:int}/students")]
        public async Task<IActionResult> GetDetails(int id)
        {
            var courseClass = await _enrollmentService.GetClassDetailsAsync(id);
            if (courseClass == null)
                return NotFound(new { message = "Không tìm thấy thông tin lớp học phần này." });

            // Bước 2: Lấy danh sách toàn bộ sinh viên đã đăng ký vào lớp học phần này
            var students = await _enrollmentService.GetClassStudentsAsync(id);

            var result = new
            {
                CourseClassId = courseClass.Id,
                ClassName = courseClass.ClassCode,
                SubjectName = courseClass.SubjectName,
                Students = students 
            };

            return Ok(result);
        }

        // POST: api/enrollments/add-student?courseClassId=5&studentCode=4651050001
        [HttpPost("add-student")]
        public async Task<IActionResult> AddStudentManual([FromQuery] int courseClassId, [FromQuery] string studentCode)
        {
            if (string.IsNullOrWhiteSpace(studentCode))
                return BadRequest(new { message = "Vui lòng nhập mã sinh viên hợp lệ." });

            // Gọi nghiệp vụ kiểm tra sinh viên có tồn tại không và tiến hành thêm vào lớp
            var result = await _enrollmentService.AddStudentManualAsync(courseClassId, studentCode);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Message });

            return Ok(new {isSuccess = true, message = result.Message });
        }

        // POST: api/enrollments/import-excel
        [HttpPost("import-excel")]
        public async Task<IActionResult> ImportExcel([FromForm] int courseClassId, IFormFile excelFile)
        {
            // Chạy logic Import sử dụng Memory Cache Dictionary tối ưu tốc độ đọc file
            var result = await _enrollmentService.ImportExcelAsync(courseClassId, excelFile);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Message });

            // Trả về kết quả Import (bao gồm thông báo thành công và danh sách mảng lỗi Errors chi tiết nếu có)
            return Ok(result);
        }


        // DELETE: api/enrollments/remove-student?courseClassId=5&studentId=12
        [HttpDelete("remove-student")]
        public async Task<IActionResult> RemoveStudent([FromQuery] int courseClassId, [FromQuery] int studentId)
        {
            // Thực hiện xóa bản ghi đăng ký (Enrollment) của sinh viên trong lớp học phần này
            var result = await _enrollmentService.RemoveStudentAsync(courseClassId, studentId);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Message });

            return Ok(new { isSuccess = true, message = result.Message });
        }
    }
}