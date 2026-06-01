using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Models;
using QuanLyDiem.API.DTOs.Student;
using QuanLyDiem.API.Data;
using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;

namespace QuanLyDiem.API.Services
{
    public class StudentService
    {
        private readonly AppDbContext _context;

        // Tiêm DbContext vào Service để làm việc với SQLite
        public StudentService(AppDbContext context)
        {
            _context = context;
        }

        // Logic Lọc và Tìm kiếm sinh viên
        public async Task<IEnumerable<StudentResponseDTO>> GetStudentsAsync(int? homeroomClassId, string? searchTerm)
        {
            var query = _context.Students.AsQueryable();

            if (homeroomClassId.HasValue)
            {
                query = query.Where(s => s.HomeroomClassId == homeroomClassId.Value);
            }

            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower().Trim();
                query = query.Where(s => s.StudentCode.ToLower().Contains(searchTerm)
                                       || s.FirstName.ToLower().Contains(searchTerm)
                                         || s.LastName.ToLower().Contains(searchTerm)
                                      || (s.LastName.ToLower() + " " + s.FirstName.ToLower()).Contains(searchTerm));
            }


            return await query.Select(s => new StudentResponseDTO
                {
                    StudentId = s.StudentId,
                    StudentCode = s.StudentCode,
                    LastName = s.LastName,
                    FirstName = s.FirstName,
                    Gender = s.Gender,
                    DateOfBirth = s.DateOfBirth,
                    HomeroomClassId = s.HomeroomClassId,
                    HomeroomClassName = s.HomeroomClass != null ? s.HomeroomClass.ClassName : "",
                    Email = s.Email
                }).ToListAsync();
            }
        
        public async Task<object> GetClassesLookupAsync()
        {
            // Bốc thẳng Id và Tên lớp từ bảng HomeroomClasses ra, không cần qua DTO nào hết
            return await _context.HomeroomClasses
                .Select(c => new {
                    homeroomClassId = c.HomeroomClassId,
                    className = c.ClassName
                })
                .ToListAsync();
        }
        // Logic Lấy chi tiết 1 sinh viên
        public async Task<StudentResponseDTO?> GetStudentByIdAsync(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return null;

            return new StudentResponseDTO
            {
                StudentId = student.StudentId,
                StudentCode = student.StudentCode,
                LastName = student.LastName,
                FirstName = student.FirstName,
                Gender = student.Gender,
                DateOfBirth = student.DateOfBirth,
                HomeroomClassId = student.HomeroomClassId,
                HomeroomClassName = student.HomeroomClass != null ? student.HomeroomClass.ClassName : "",
                Email = student.Email
            };
        }

        // Logic Thêm sinh viên
        public async Task CreateStudentAsync(StudentCreateUpdateDTO dto)
        {
            var student = new Student
            {
                StudentCode = dto.StudentCode,
                LastName = dto.LastName,
                FirstName = dto.FirstName,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                HomeroomClassId = dto.HomeroomClassId,
                Email = dto.Email
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();
        }

        // Logic Cập nhật thông tin
        public async Task<bool> UpdateStudentAsync(int id, StudentCreateUpdateDTO dto)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return false;

            student.StudentCode = dto.StudentCode;
            student.LastName = dto.LastName;
            student.FirstName = dto.FirstName;
            student.Gender = dto.Gender;
            student.DateOfBirth = dto.DateOfBirth;
            student.HomeroomClassId = dto.HomeroomClassId;
            student.Email = dto.Email;

            await _context.SaveChangesAsync();
            return true;
        }

        // Logic Xóa sinh viên
        public async Task<bool> DeleteStudentAsync(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return false;

            _context.Students.Remove(student);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}