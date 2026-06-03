namespace QuanLyDiem.API.DTOs.Student
{
    // Dùng để API trả dữ liệu về cho Angular
    public class StudentResponseDTO
    {
        public int StudentId { get; set; }
        public string StudentCode { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public int HomeroomClassId { get; set; }
        public string? HomeroomClassName { get; set; }
        public string Email { get; set; }
    }
}
