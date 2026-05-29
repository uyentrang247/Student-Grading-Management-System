namespace QuanLyDiem.API.Models
{
    public class Enrollment
    {
        public int EnrollmentId { get; set; }

        public int StudentId { get; set; }

        public int CourseClassId { get; set; }

        public double? ProcessScore { get; set; }

        public double? FinalScore { get; set; }

        public Student? Student { get; set; }

        public CourseClass? CourseClass { get; set; }
    }
}