using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.Enrollment; // Nạp thư mục DTOs bạn đã tạo
using QuanLyDiem.API.DTOs.Student;    // Nạp DTOs StudentResponseDTO để trả về danh sách sinh viên phẳng
using QuanLyDiem.API.Models;

namespace QuanLyDiem.API.Services
{
    public class EnrollmentService
    {
        private readonly AppDbContext _context;

        public EnrollmentService(AppDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách lớp học phần của Giảng viên
        public async Task<List<CourseClassDisplayDto>> GetLecturerClassesAsync(int lecturerId, int? semesterId = null)
        {
            var query = _context.CourseClasses
                .Where(c => c.LecturerId == lecturerId)
                .AsQueryable();

            if (semesterId.HasValue)
                query = query.Where(c => c.SemesterId == semesterId.Value);

            return await query.Select(c => new CourseClassDisplayDto
            {
                Id = c.CourseClassId,
                ClassCode = c.ClassCode,
                SubjectId = c.SubjectId,
                SemesterId = c.SemesterId,
                LecturerId = c.LecturerId,
                SubjectName = c.Subject != null ? c.Subject.SubjectName : string.Empty,
                Credits = c.Subject != null ? c.Subject.Credits : 0,
                Semester = c.Semester != null ? c.Semester.Term : string.Empty,
                AcademicYear = c.Semester != null ? c.Semester.AcademicYear : string.Empty
            }).ToListAsync();
        }

        // 2. Lấy danh sách học kỳ cho Dropdown bộ lọc
        public async Task<List<Semester>> GetAllSemestersAsync()
        {
            return await _context.Semesters
                .OrderByDescending(s => s.AcademicYear)
                .ThenBy(s => s.Term)
                .ToListAsync();
        }

        // 3. Lấy toàn bộ danh sách lớp học phần hệ thống (Cho Admin )
        public async Task<List<CourseClassDisplayDto>> GetAllClassesAsync(int? semesterId = null)
        {
            var query = _context.CourseClasses.AsQueryable();

            if (semesterId.HasValue)
                query = query.Where(c => c.SemesterId == semesterId.Value);

            return await query.Select(c => new CourseClassDisplayDto
            {
                Id = c.CourseClassId,
                ClassCode = c.ClassCode,
                SubjectId = c.SubjectId,
                SemesterId = c.SemesterId,
                LecturerId = c.LecturerId,
                SubjectName = c.Subject != null ? c.Subject.SubjectName : string.Empty,
                Credits = c.Subject != null ? c.Subject.Credits : 0,
                Semester = c.Semester != null ? c.Semester.Term : string.Empty,
                AcademicYear = c.Semester != null ? c.Semester.AcademicYear : string.Empty
            }).ToListAsync();
        }

        // 4. Chi tiết lớp học phần 
        public async Task<CourseClassDisplayDto?> GetClassDetailsAsync(int classId)
        {
            return await _context.CourseClasses
                .Where(c => c.CourseClassId == classId)
                .Select(c => new CourseClassDisplayDto
                {
                    Id = c.CourseClassId,
                    ClassCode = c.ClassCode,
                    SubjectId = c.SubjectId,
                    SemesterId = c.SemesterId,
                    LecturerId = c.LecturerId,
                    SubjectName = c.Subject != null ? c.Subject.SubjectName : string.Empty,
                    Credits = c.Subject != null ? c.Subject.Credits : 0,
                    Semester = c.Semester != null ? c.Semester.Term : string.Empty,
                    AcademicYear = c.Semester != null ? c.Semester.AcademicYear : string.Empty
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<StudentResponseDTO>> GetClassStudentsAsync(int classId)
        {
            return await _context.Enrollments
                .Where(e => e.CourseClassId == classId)
                .OrderBy(e => e.Student.StudentCode)
                .Select(e => new StudentResponseDTO
                {
                    StudentId = e.StudentId,
                    StudentCode = e.Student.StudentCode,
                    LastName = e.Student.LastName,   
                    FirstName = e.Student.FirstName,
                    Gender = e.Student.Gender,
                    DateOfBirth = e.Student.DateOfBirth, 
                    HomeroomClassName = e.Student.HomeroomClass != null ? e.Student.HomeroomClass.ClassName : string.Empty
                })
                .ToListAsync();
        }

        // =========================================================================
        // GIỮ NGUYÊN NGHIỆP VỤ XỬ LÝ (ADD THỦ CÔNG, IMPORT EXCEL CACHE, REMOVE) 100%
        // =========================================================================
        public async Task<ServiceResult> AddStudentManualAsync(int courseClassId, string studentCode)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.StudentCode == studentCode);
            if (student == null)
                return new ServiceResult { IsSuccess = false, Message = "Không tìm thấy sinh viên với mã vừa nhập." };

            var currentClass = await _context.CourseClasses
                .FirstOrDefaultAsync(c => c.CourseClassId == courseClassId);
            if (currentClass == null)
                return new ServiceResult { IsSuccess = false, Message = "Lớp học phần không tồn tại trên hệ thống." };

            bool isAlreadyInSubjectThisSemester = await _context.Enrollments
                .AnyAsync(e => e.StudentId == student.StudentId
                            && e.CourseClass.SubjectId == currentClass.SubjectId
                            && e.CourseClass.SemesterId == currentClass.SemesterId);

            if (isAlreadyInSubjectThisSemester)
                return new ServiceResult { IsSuccess = false, Message = "Sinh viên này đã đăng ký môn học này trong học kỳ hiện tại." };

            _context.Enrollments.Add(new Enrollment
            {
                CourseClassId = courseClassId,
                StudentId = student.StudentId
            });
            await _context.SaveChangesAsync();

            return new ServiceResult { IsSuccess = true, Message = "Thêm sinh viên vào lớp thành công!" };
        }

        public async Task<ExcelImportResult> ImportExcelAsync(int courseClassId, IFormFile excelFile)
        {
            if (excelFile == null || excelFile.Length == 0)
                return new ExcelImportResult { IsSuccess = false, Message = "Vui lòng chọn file Excel hợp lệ." };

            var currentClass = await _context.CourseClasses
                .FirstOrDefaultAsync(c => c.CourseClassId == courseClassId);
            if (currentClass == null)
                return new ExcelImportResult { IsSuccess = false, Message = "Lớp học phần không tồn tại trên hệ thống." };

            OfficeOpenXml.ExcelPackage.License.SetNonCommercialPersonal("Eirian");

            var enrolledStudentIds = (await _context.Enrollments
                .Where(e => e.CourseClass.SubjectId == currentClass.SubjectId
                         && e.CourseClass.SemesterId == currentClass.SemesterId)
                .Select(e => e.StudentId)
                .ToListAsync())
                .ToHashSet();

            var allStudents = (await _context.Students.ToListAsync())
                .ToDictionary(s => s.StudentCode, s => s);

            int countAdded = 0;
            var errorMessages = new List<string>();
            var toAdd = new List<Enrollment>();

            using var stream = new MemoryStream();
            await excelFile.CopyToAsync(stream);

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets[0];
            int rowCount = worksheet.Dimension?.Rows ?? 0;

            for (int row = 2; row <= rowCount; row++)
            {
                var studentCodeObj = worksheet.Cells[row, 1].Value;
                if (studentCodeObj == null) continue;

                string studentCode = studentCodeObj.ToString()!.Trim();

                if (!allStudents.TryGetValue(studentCode, out var student))
                {
                    errorMessages.Add($"Dòng {row}: Mã SV '{studentCode}' không tồn tại trong hệ thống.");
                    continue;
                }

                if (enrolledStudentIds.Contains(student.StudentId))
                {
                    errorMessages.Add($"Dòng {row}: Sinh viên '{studentCode}' đã đăng ký môn này trong học kỳ hiện tại.");
                    continue;
                }

                if (toAdd.Any(e => e.StudentId == student.StudentId))
                {
                    errorMessages.Add($"Dòng {row}: Mã SV '{studentCode}' bị trùng trong file Excel.");
                    continue;
                }

                toAdd.Add(new Enrollment
                {
                    CourseClassId = courseClassId,
                    StudentId = student.StudentId
                });
                countAdded++;
            }

            if (toAdd.Count > 0)
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    _context.Enrollments.AddRange(toAdd);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new ExcelImportResult { IsSuccess = false, Message = $"Lỗi khi lưu dữ liệu: {ex.Message}" };
                }
            }

            return new ExcelImportResult
            {
                IsSuccess = true,
                Message = $"Đã thêm thành công {countAdded} sinh viên.",
                Errors = errorMessages
            };
        }

        public async Task<ServiceResult> RemoveStudentAsync(int courseClassId, int studentId)
        {
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseClassId == courseClassId && e.StudentId == studentId);

            if (enrollment == null)
                return new ServiceResult { IsSuccess = false, Message = "Không tìm thấy thông tin đăng ký lớp của sinh viên này." };

            if (enrollment.ProcessScore.HasValue || enrollment.FinalScore.HasValue)
                return new ServiceResult { IsSuccess = false, Message = "Không thể xóa: sinh viên này đã được nhập điểm. Vui lòng xóa điểm trước." };

            _context.Enrollments.Remove(enrollment);
            await _context.SaveChangesAsync();
            return new ServiceResult { IsSuccess = true, Message = "Đã xóa sinh viên khỏi lớp học phần thành công." };
        }
    }
}