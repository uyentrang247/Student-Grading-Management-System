using System.ComponentModel.DataAnnotations;

namespace QuanLyDiem.API.DTOs.Lecturer
{
    public class UpdateLecturerDto
    {
        // Thêm [Required] để bắt buộc phải có tên
        [Required(ErrorMessage = "Họ và tên không được để trống")]
        public string FullName { get; set; } = string.Empty;

        // Thêm [Required] và [EmailAddress] để chặn email rỗng hoặc sai định dạng
        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        public int? FacultyId { get; set; }
    }
}