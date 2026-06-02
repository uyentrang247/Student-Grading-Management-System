namespace QuanLyDiem.API.DTOs.GradeEntry
{
    public class GradeEntryDto
    {
        public int EnrollmentId { get; set; }
        public int CourseClassId { get; set; }
        public double? ProcessScore { get; set; }
        public double? FinalScore { get; set; }
    }
}