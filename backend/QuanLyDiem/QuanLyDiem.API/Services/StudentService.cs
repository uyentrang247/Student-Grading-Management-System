using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Models;
using QuanLyDiem.API.DTOs.Student;
using QuanLyDiem.API.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyDiem.API.Services
{
    public class StudentService
    {
        private readonly AppDbContext _context;

        public StudentService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách sinh viên kết hợp lọc, tìm kiếm và phân trang cho Angular Datatable/Paginator
        /// </summary>
        public async Task<(IEnumerable<StudentResponseDTO> Data, int TotalRecords)> GetStudentsAsync(
            int? homeroomClassId, string? searchTerm, int pageNumber, int pageSize)
        {
            var query = _context.Students.Include(s => s.HomeroomClass).AsQueryable();

            if (homeroomClassId.HasValue && homeroomClassId.Value > 0)
            {
                query = query.Where(s => s.HomeroomClassId == homeroomClassId.Value);
            }

            // 2. Tìm kiếm theo từ khóa
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var keyword = searchTerm.ToLower().Trim();
                query = query.Where(s => s.StudentCode.ToLower().Contains(keyword)
                                      || s.FirstName.ToLower().Contains(keyword)
                                      || s.LastName.ToLower().Contains(keyword)
                                      || (s.LastName.ToLower() + " " + s.FirstName.ToLower()).Contains(keyword));
            }

            int totalRecords = await query.CountAsync();
            var data = await query
                .OrderBy(s => s.StudentCode)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new StudentResponseDTO
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
                })
                .ToListAsync();

            return (data, totalRecords);
        }

        public async Task<List<ClassLookupDTO>> GetClassesLookupAsync()
        {
            return await _context.HomeroomClasses
                .Select(c => new ClassLookupDTO
                {
                    HomeroomClassId = c.HomeroomClassId,
                    ClassName = c.ClassName
                })
                .ToListAsync();
        }


        public async Task<StudentResponseDTO?> GetStudentByIdAsync(int id)
        {
            // Thay vì FindAsync, dùng FirstOrDefaultAsync kèm Include để nạp dữ liệu quan hệ
            return await _context.Students
                .Include(s => s.HomeroomClass)
                .Where(s => s.StudentId == id)
                .Select(s => new StudentResponseDTO
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
                })
                .FirstOrDefaultAsync();
        }


        public async Task<bool> CreateStudentAsync(StudentCreateUpdateDTO dto)
        {
            //  Kiểm tra trùng mã sinh viên
            var exists = await _context.Students.AnyAsync(s => s.StudentCode == dto.StudentCode);
            if (exists)
            {
                return false; 
            }

            var student = new Student
            {
                StudentCode = dto.StudentCode,
                LastName = dto.LastName,
                FirstName = dto.FirstName,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                HomeroomClassId = dto.HomeroomClassId ?? 0, // Đảm bảo an toàn null
                Email = dto.Email
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> UpdateStudentAsync(int id, StudentCreateUpdateDTO dto)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return false;

            // Khôi phục logic: Kiểm tra trùng mã sinh viên với người khác
            var codeExists = await _context.Students
                .AnyAsync(s => s.StudentCode == dto.StudentCode && s.StudentId != id);
            if (codeExists)
            {
                return false; 
            }

            // Gán dữ liệu mới
            student.StudentCode = dto.StudentCode;
            student.LastName = dto.LastName;
            student.FirstName = dto.FirstName;
            student.Gender = dto.Gender;
            student.DateOfBirth = dto.DateOfBirth;
            student.HomeroomClassId = dto.HomeroomClassId ?? student.HomeroomClassId;
            student.Email = dto.Email;

            await _context.SaveChangesAsync();
            return true;
        }


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