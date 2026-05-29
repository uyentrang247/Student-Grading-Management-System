namespace QuanLyDiem.API.Models
{
    public class CourseClass
    {
        public int CourseClassId { get; set; }

        public string ClassCode { get; set; } = string.Empty;

        public int SemesterId { get; set; }

        public int SubjectId { get; set; }

        public int? LecturerId { get; set; }

        public Semester? Semester { get; set; }

        public Subject? Subject { get; set; }

        public User? Lecturer { get; set; }

        public List<Enrollment>? Enrollments { get; set; }
    }
}