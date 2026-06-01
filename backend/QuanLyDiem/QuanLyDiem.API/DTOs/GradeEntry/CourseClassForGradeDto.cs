namespace QuanLyDiem.API.DTOs.GradeEntry
{
    public class CourseClassForGradeDto
    {
        public int CourseClassId { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string LecturerName { get; set; } = string.Empty;
        public string Semester { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
    }
}