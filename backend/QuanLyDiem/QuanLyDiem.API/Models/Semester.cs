namespace QuanLyDiem.API.Models
{
    public class Semester
    {
        public int SemesterId { get; set; }

        public string Term { get; set; } = string.Empty;

        public string AcademicYear { get; set; } = string.Empty;

        public List<CourseClass>? CourseClasses { get; set; }
    }
}