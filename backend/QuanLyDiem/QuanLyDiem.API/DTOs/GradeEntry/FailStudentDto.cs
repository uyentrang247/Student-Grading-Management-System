namespace QuanLyDiem.API.DTOs.GradeEntry
{
    public class FailStudentDto
    {
        public int EnrollmentId { get; set; }
        public int StudentId { get; set; }
        public string StudentCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public double? ProcessScore { get; set; }
        public double? FinalScore { get; set; }
        public double? AverageScore { get; set; }
    }
}