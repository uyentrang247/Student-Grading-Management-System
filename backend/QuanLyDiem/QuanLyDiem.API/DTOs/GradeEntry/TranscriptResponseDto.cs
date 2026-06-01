namespace QuanLyDiem.API.DTOs.GradeEntry
{
    public class TranscriptResponseDto
    {
        public CourseClassInfoDto CourseClass { get; set; } = new();
        public List<StudentTranscriptDto> Students { get; set; } = new();
    }

    public class CourseClassInfoDto
    {
        public int CourseClassId { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public int Credits { get; set; }
        public string Semester { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        public string LecturerName { get; set; } = string.Empty;
    }

    public class StudentTranscriptDto
    {
        public int EnrollmentId { get; set; }
        public int StudentId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public double? ProcessScore { get; set; }
        public double? FinalScore { get; set; }
        public double? AverageScore { get; set; }
        public string GradeLetter { get; set; } = string.Empty;
        public double? GradeScale4 { get; set; }
    }
}