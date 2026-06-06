namespace QuanLyDiem.API.DTOs.Report
{
    // DTO cho báo cáo 1 lớp học phần (giảng viên xem)
    public class ClassReportDto
    {
        // Thông tin lớp
        public int CourseClassId { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string LecturerName { get; set; } = string.Empty;
        public string Semester { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;

        // Thống kê tổng quan
        public int TotalStudents { get; set; }
        public int PassCount { get; set; }
        public int FailCount { get; set; }
        public double PassRate { get; set; }  // %
        public double FailRate { get; set; }  // %
        public double AverageScore { get; set; }
        public double HighestScore { get; set; }
        public double LowestScore { get; set; }

        // Phân bố điểm theo thang 10 (cho biểu đồ cột)
        public DistributionDto ScoreDistribution { get; set; } = new();

        // Phân bố điểm chữ A, B, C, D, F
        public GradeLetterDistributionDto GradeLetterDistribution { get; set; } = new();
    }

    // Phân bố theo khoảng điểm (biểu đồ cột)
    public class DistributionDto
    {
        public int Range_0_4 { get; set; }   // 0 - 4 điểm
        public int Range_4_5 { get; set; }   // 4 - 5 điểm
        public int Range_5_7 { get; set; }   // 5 - 7 điểm
        public int Range_7_9 { get; set; }   // 7 - 9 điểm
        public int Range_9_10 { get; set; }  // 9 - 10 điểm
    }

    // Phân bố điểm chữ
    public class GradeLetterDistributionDto
    {
        public GradeLetterItemDto A { get; set; } = new();
        public GradeLetterItemDto B { get; set; } = new();
        public GradeLetterItemDto C { get; set; } = new();
        public GradeLetterItemDto D { get; set; } = new();
        public GradeLetterItemDto F { get; set; } = new();
    }

    public class GradeLetterItemDto
    {
        public int Count { get; set; }
        public double Percentage { get; set; }
        public string Range { get; set; } = string.Empty; // VD: "8.5-10"
    }
}