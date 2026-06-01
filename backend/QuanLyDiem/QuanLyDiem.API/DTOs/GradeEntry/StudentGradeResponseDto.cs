namespace QuanLyDiem.API.DTOs.GradeEntry
{
	public class StudentGradeResponseDto
	{
		public int EnrollmentId { get; set; }
		public int StudentId { get; set; }
		public string StudentCode { get; set; } = string.Empty;
		public string FullName { get; set; } = string.Empty;
		public string HomeroomClass { get; set; } = string.Empty;
		public int CourseClassId { get; set; }
		public string ClassCode { get; set; } = string.Empty;
		public double? ProcessScore { get; set; }
		public double? FinalScore { get; set; }
	}
}