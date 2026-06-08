namespace QuanLyDiem.API.DTOs.Enrollment
{
    public class CourseClassDisplayDto
    {
        public int Id { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public int SubjectId { get; set; }
        public int SemesterId { get; set; }
        public int? LecturerId { get; set; }

        public string SubjectName { get; set; } = string.Empty;
        public int Credits { get; set; }
        public string Semester { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
    }
}
