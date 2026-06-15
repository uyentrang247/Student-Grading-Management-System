using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.Report;
using QuanLyDiem.API.Models;

namespace QuanLyDiem.API.Services
{
    public interface ILecturerClassReportService
    {
        Task<LecturerClassReportDto> GetClassReportAsync(int lecturerId, int courseClassId);
        Task<List<CourseClass>> GetMyClassesAsync(int lecturerId, int? semesterId = null);
    }

    public class LecturerClassReportService : ILecturerClassReportService
    {
        private readonly AppDbContext _context;

        public LecturerClassReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CourseClass>> GetMyClassesAsync(int lecturerId, int? semesterId = null)
        {
            var query = _context.CourseClasses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Where(c => c.LecturerId == lecturerId);

            if (semesterId.HasValue)
            {
                query = query.Where(c => c.SemesterId == semesterId.Value);
            }

            return await query.ToListAsync();
        }

        public async Task<LecturerClassReportDto> GetClassReportAsync(int lecturerId, int courseClassId)
        {
            var courseClass = await _context.CourseClasses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .FirstOrDefaultAsync(c => c.CourseClassId == courseClassId && c.LecturerId == lecturerId);

            if (courseClass == null)
            {
                throw new UnauthorizedAccessException("Bạn không phụ trách lớp học phần này");
            }

            var enrollments = await _context.Enrollments
                .Include(e => e.Student)
                .Where(e => e.CourseClassId == courseClassId)
                .ToListAsync();

            var totalStudents = enrollments.Count;
            
            if (totalStudents == 0)
            {
                return new LecturerClassReportDto
                {
                    CourseClassId = courseClassId,
                    ClassCode = courseClass.ClassCode,
                    SubjectName = courseClass.Subject?.SubjectName ?? "",
                    Credits = courseClass.Subject?.Credits ?? 0,
                    Semester = courseClass.Semester?.Term ?? "",
                    AcademicYear = courseClass.Semester?.AcademicYear ?? "",
                    TotalStudents = 0,
                    PassRate = 0,
                    FailRate = 0,
                    AverageScore = 0,
                    HighestScore = 0,
                    LowestScore = 0,
                    GradeDistribution = new List<GradeDistributionDto>(),
                    ScoreRanges = new List<ScoreRangeDto>()
                };
            }

            var processWeight = courseClass.Subject?.ProcessWeight ?? 0.4;
            var finalWeight = courseClass.Subject?.FinalWeight ?? 0.6;

            var studentScores = new List<double>();
            var passCount = 0;
            var failCount = 0;

            foreach (var e in enrollments)
            {
                if (e.ProcessScore.HasValue && e.FinalScore.HasValue)
                {
                    var average = Math.Round(
                        e.ProcessScore.Value * processWeight + 
                        e.FinalScore.Value * finalWeight, 
                        1
                    );
                    studentScores.Add(average);
                    
                    if (average >= 4.0) passCount++;
                    else failCount++;
                }
            }

            var validScores = studentScores;
            var avgScore = validScores.Any() ? Math.Round(validScores.Average(), 1) : 0;
            var highestScore = validScores.Any() ? validScores.Max() : 0;
            var lowestScore = validScores.Any() ? validScores.Min() : 0;
            var passRate = validScores.Any() ? Math.Round((passCount * 100.0) / validScores.Count, 1) : 0;
            var failRate = validScores.Any() ? Math.Round((failCount * 100.0) / validScores.Count, 1) : 0;

            // Grade distribution
            var gradeDistribution = new List<GradeDistributionDto>();
            var gradeRanges = new List<(string Grade, string Range, double Min, double Max, string Color)>
            {
                ("A", "8.5 - 10", 8.5, 10.0, "#28a745"),
                ("B", "7.0 - 8.4", 7.0, 8.4, "#17a2b8"),
                ("C", "5.5 - 6.9", 5.5, 6.9, "#ffc107"),
                ("D", "4.0 - 5.4", 4.0, 5.4, "#fd7e14"),
                ("F", "< 4.0", 0, 3.9, "#dc3545")
            };

            foreach (var range in gradeRanges)
            {
                var count = validScores.Count(s => s >= range.Min && s <= range.Max);
                var percentage = totalStudents > 0 ? Math.Round((count * 100.0) / totalStudents, 1) : 0;
                
                gradeDistribution.Add(new GradeDistributionDto
                {
                    Grade = range.Grade,
                    Range = range.Range,
                    Count = count,
                    Percentage = percentage,
                    Color = range.Color
                });
            }

            // Score ranges for bar chart
            var scoreRanges = new List<ScoreRangeDto>();
            var barRanges = new List<(string Range, double Min, double Max)>
            {
                ("0-4", 0, 4),
                ("4-5", 4, 5),
                ("5-7", 5, 7),
                ("7-9", 7, 9),
                ("9-10", 9, 10)
            };

            foreach (var range in barRanges)
            {
                var count = validScores.Count(s => s >= range.Min && s < range.Max);
                var percentage = totalStudents > 0 ? Math.Round((count * 100.0) / totalStudents, 1) : 0;
                
                scoreRanges.Add(new ScoreRangeDto
                {
                    Range = range.Range,
                    Count = count,
                    Percentage = percentage
                });
            }

            return new LecturerClassReportDto
            {
                CourseClassId = courseClassId,
                ClassCode = courseClass.ClassCode,
                SubjectName = courseClass.Subject?.SubjectName ?? "",
                Credits = courseClass.Subject?.Credits ?? 0,
                Semester = courseClass.Semester?.Term ?? "",
                AcademicYear = courseClass.Semester?.AcademicYear ?? "",
                TotalStudents = totalStudents,
                PassRate = passRate,
                FailRate = failRate,
                AverageScore = avgScore,
                HighestScore = highestScore,
                LowestScore = lowestScore,
                GradeDistribution = gradeDistribution,
                ScoreRanges = scoreRanges
            };
        }
    }
}