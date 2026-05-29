namespace QuanLyDiem.API.Models
{
    public class Student
    {
        public int StudentId { get; set; }

        public string StudentCode { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string Gender { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public int HomeroomClassId { get; set; }

        public string Email { get; set; } = string.Empty;

        public HomeroomClass? HomeroomClass { get; set; }

        public List<Enrollment>? Enrollments { get; set; }
    }
}