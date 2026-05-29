namespace QuanLyDiem.API.Models
{
    public class Subject
    {
        public int SubjectId { get; set; }

        public string SubjectCode { get; set; } = string.Empty;

        public string SubjectName { get; set; } = string.Empty;

        public int Credits { get; set; }

        public double ProcessWeight { get; set; }

        public double FinalWeight { get; set; }

        public List<CourseClass>? CourseClasses { get; set; }
    }
}