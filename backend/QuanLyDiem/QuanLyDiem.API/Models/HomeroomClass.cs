namespace QuanLyDiem.API.Models
{
    public class HomeroomClass
    {
        public int HomeroomClassId { get; set; }

        public string ClassName { get; set; } = string.Empty;

        public int FacultyId { get; set; }

        public Faculty? Faculty { get; set; }

        public List<Student>? Students { get; set; }
    }
}