using System.Collections.Generic;

namespace QuanLyDiem.API.DTOs.Report
{
    public class LecturerClassReportDto
    {
        public int CourseClassId { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int Credits { get; set; }
        public string Semester { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        
        public double PassRate { get; set; }
        public double FailRate { get; set; }
        public double AverageScore { get; set; }
        public double HighestScore { get; set; }
        public double LowestScore { get; set; }
        public int TotalStudents { get; set; }
        
        public List<GradeDistributionDto> GradeDistribution { get; set; } = new List<GradeDistributionDto>();
        public List<ScoreRangeDto> ScoreRanges { get; set; } = new List<ScoreRangeDto>();
    }

    public class GradeDistributionDto
    {
        public string Grade { get; set; } = string.Empty;
        public string Range { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class ScoreRangeDto
    {
        public string Range { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }
}