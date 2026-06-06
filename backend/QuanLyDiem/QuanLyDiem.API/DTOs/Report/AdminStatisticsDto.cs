namespace QuanLyDiem.API.DTOs.Report
{
    // DTO cho Admin thống kê tổng hợp
    public class AdminStatisticsDto
    {
        // Tổng quan toàn trường
        public OverviewStatisticsDto Overview { get; set; } = new();

        // Thống kê theo khoa
        public List<FacultyStatisticsDto> FacultyStatistics { get; set; } = new();

        // Thống kê theo môn học (top 10 môn có tỷ lệ rớt cao nhất)
        public List<SubjectStatisticsDto> TopFailSubjects { get; set; } = new();

        // Thống kê theo học kỳ
        public List<SemesterStatisticsDto> SemesterStatistics { get; set; } = new();

        // Biểu đồ phân bố điểm toàn trường
        public DistributionDto OverallScoreDistribution { get; set; } = new();
    }

    public class OverviewStatisticsDto
    {
        public int TotalStudents { get; set; }
        public int TotalLecturers { get; set; }
        public int TotalSubjects { get; set; }
        public int TotalCourseClasses { get; set; }
        public int TotalEnrollments { get; set; }
        public double OverallPassRate { get; set; }  // %
        public double AverageScoreAll { get; set; }
    }

    public class FacultyStatisticsDto
    {
        public int FacultyId { get; set; }
        public string FacultyName { get; set; } = string.Empty;
        public int StudentCount { get; set; }
        public int LecturerCount { get; set; }
        public int CourseClassCount { get; set; }
        public double PassRate { get; set; }  // %
        public double AverageScore { get; set; }
    }

    public class SubjectStatisticsDto
    {
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int Credits { get; set; }
        public int TotalStudents { get; set; }
        public int PassCount { get; set; }
        public int FailCount { get; set; }
        public double PassRate { get; set; }
        public double FailRate { get; set; }
        public double AverageScore { get; set; }
    }

    public class SemesterStatisticsDto
    {
        public int SemesterId { get; set; }
        public string Term { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        public int CourseClassCount { get; set; }
        public int TotalStudents { get; set; }
        public double PassRate { get; set; }
        public double AverageScore { get; set; }
    }
}