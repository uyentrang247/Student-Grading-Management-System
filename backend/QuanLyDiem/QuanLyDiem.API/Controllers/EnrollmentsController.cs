using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiem.API.Models;
using QuanLyDiem.API.Services;

namespace QuanLyDiem.API.Controllers
{
    // BẢO MẬT: Chỉ cho phép tài khoản có Role là "Admin" hoặc "Lecturer" đã đăng nhập mới được truy cập
    [Authorize(Roles = "Admin,Lecturer")]
    [ApiController]
    [Route("api/[controller]")] // Định tuyến gốc: api/enrollments
    public class EnrollmentsController : ControllerBase
    {
        private readonly EnrollmentService _enrollmentService;

        // Inject Service quản lý đào tạo/lớp học vào Controller
        public EnrollmentsController(EnrollmentService enrollmentService)
        {
            _enrollmentService = enrollmentService;
        }

        // ==========================================
        // 1. LẤY DANH SÁCH LỚP HỌC PHẦN (CÓ BỘ LỌC HỌC KỲ)
        // ==========================================
        // GET: api/enrollments?semesterId=1
        [HttpGet]
        public async Task<IActionResult> GetClasses([FromQuery] int? semesterId)
        {
            // LUỒNG 1: Nếu là Admin -> Lấy toàn bộ lớp học phần trong hệ thống
            if (User.IsInRole("Admin"))
            {
                var allDbClasses = await _enrollmentService.GetAllClassesAsync(semesterId);
                return Ok(allDbClasses); // Trả về danh sách DTO phẳng cho Admin
            }

            // LUỒNG 2: Nếu là Giảng viên -> Tự động bóc tách UserId từ JWT Token để bảo mật thông tin
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int lecturerId))
            {
                // Trả về 401 Unauthorized nếu Token lỗi hoặc không chứa thông tin giảng viên
                return Challenge();
            }

            // Gọi Service lấy đúng các lớp mà giảng viên này được phân công dạy
            var lecturerClasses = await _enrollmentService.GetLecturerClassesAsync(lecturerId, semesterId);
            return Ok(lecturerClasses); // Trả về danh sách DTO phẳng cho Giảng viên
        }

        // ==========================================
        // 2. LẤY DANH SÁCH HỌC KỲ (DÙNG CHO DROPDOWN BỘ LỌC)
        // ==========================================
        // GET: api/enrollments/semesters
        [HttpGet("semesters")]
        public async Task<IActionResult> GetSemesters()
        {
            var semesters = await _enrollmentService.GetAllSemestersAsync();
            return Ok(semesters);
        }

        // ==========================================
        // 3. XEM CHI TIẾT LỚP VÀ DANH SÁCH SINH VIÊN (MÀN HÌNH 2)
        // ==========================================
        // GET: api/enrollments/5/students
        [HttpGet("{id:int}/students")]
        public async Task<IActionResult> GetDetails(int id)
        {
            // Bước 1: Lấy thông tin chung của lớp học phần từ Service
            var courseClass = await _enrollmentService.GetClassDetailsAsync(id);
            if (courseClass == null)
                return NotFound(new { message = "Không tìm thấy thông tin lớp học phần này." });

            // Bước 2: Lấy danh sách toàn bộ sinh viên đã đăng ký vào lớp học phần này
            var students = await _enrollmentService.GetClassStudentsAsync(id);

            // Bước 3: Đóng gói phẳng bằng cách bóc tách an toàn từ Entity liên kết gốc sang Json phẳng.
            // Sửa triệt để các lỗi gọi sai trường (.Id thành .CourseClassId) và map trường thủ công giúp Angular nhận là dùng ngay.
            var result = new
            {
                CourseClassId = courseClass.Id,
                ClassName = courseClass.ClassCode,
                SubjectName = courseClass.SubjectName,
                Students = students 
            };

            return Ok(result);
        }

        // ==========================================
        // 4. THÊM THỦ CÔNG SINH VIÊN VÀO LỚP BẰNG MÃ SINH VIÊN (MÃ SỐ)
        // ==========================================
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

        // ==========================================
        // 5. IMPORT SINH VIÊN HÀNG LOẠT TỪ FILE EXCEL (GIỮ NGUYÊN 100% CƠ CHẾ CACHE)
        // ==========================================
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

        // ==========================================
        // 6. XÓA SINH VIÊN KHỎI LỚP HỌC PHẦN (RESTFUL DELETE)
        // ==========================================
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