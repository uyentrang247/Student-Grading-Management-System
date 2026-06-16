using System.ComponentModel.DataAnnotations;

namespace QuanLyDiem.API.DTOs.Lecturer
{
    public class CreateLecturerDto
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Họ tên không được để trống")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn Khoa")]
        public int FacultyId { get; set; }
    }
}