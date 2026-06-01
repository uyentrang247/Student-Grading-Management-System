
using System.ComponentModel.DataAnnotations;

namespace QuanLyDiem.API.DTOs.Student
{
    // Dùng để nhận dữ liệu từ Angular gửi lên khi Create hoặc Edit
    public class StudentCreateUpdateDTO
    {
        [Required(ErrorMessage = "Mã sinh viên không được để trống")]
        public string StudentCode { get; set; }

        [Required(ErrorMessage = "Họ không được để trống")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Tên không được để trống")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Giới tính không được để trống")]
        public string Gender { get; set; }

        [Required(ErrorMessage = "Ngày sinh không được để trống")]
        public DateTime DateOfBirth { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn lớp sinh hoạt")]
        public int HomeroomClassId { get; set; }

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; }
    }
}
