using System.Collections.Generic;

namespace QuanLyDiem.API.DTOs.Analytics
{
    public class SystemStatisticsDto
    {
        public int TotalStudents { get; set; }
        public int TotalLecturers { get; set; }
        public int TotalClasses { get; set; }
        public int TotalSubjects { get; set; }
        public int TotalHomeroomClasses { get; set; }
        public int TotalFaculties { get; set; }
        
        public double OverallAverageScore { get; set; }
        public int TotalPassCount { get; set; }
        public int TotalFailCount { get; set; }
        public double OverallPassRate { get; set; }
        
        public List<SemesterStatisticsDto> SemesterStatistics { get; set; } = new List<SemesterStatisticsDto>();
        public List<TopSubjectDto> TopSubjectsByScore { get; set; } = new List<TopSubjectDto>();
        public List<TopSubjectDto> TopSubjectsByFailRate { get; set; } = new List<TopSubjectDto>();
        public List<FacultyStatisticsDto> FacultyStatistics { get; set; } = new List<FacultyStatisticsDto>();
    }

    public class SemesterStatisticsDto
    {
        public int SemesterId { get; set; }
        public string Term { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        public int TotalClasses { get; set; }
        public int TotalStudents { get; set; }
        public double AverageScore { get; set; }
        public int PassCount { get; set; }
        public int FailCount { get; set; }
        public double PassRate { get; set; }
    }

    public class TopSubjectDto
    {
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public double AverageScore { get; set; }
        public int TotalStudents { get; set; }
        public int PassCount { get; set; }
        public int FailCount { get; set; }
        public double FailRate { get; set; }
    }

    public class FacultyStatisticsDto
    {
        public int FacultyId { get; set; }
        public string FacultyCode { get; set; } = string.Empty;
        public string FacultyName { get; set; } = string.Empty;
        public int TotalLecturers { get; set; }
        public int TotalStudents { get; set; }
        public int TotalHomeroomClasses { get; set; }
    }
}