using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.Analytics;
using QuanLyDiem.API.Models;

namespace QuanLyDiem.API.Services
{
    public interface IAdminStatisticsService
    {
        Task<SystemStatisticsDto> GetSystemStatisticsAsync();
    }

    public class AdminStatisticsService : IAdminStatisticsService
    {
        private readonly AppDbContext _context;

        public AdminStatisticsService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SystemStatisticsDto> GetSystemStatisticsAsync()
        {
            // Tổng quan
            var totalStudents = await _context.Students.CountAsync();
            var totalLecturers = await _context.Users.CountAsync(u => u.Role == "Lecturer");
            var totalClasses = await _context.CourseClasses.CountAsync();
            var totalSubjects = await _context.Subjects.CountAsync();
            var totalHomeroomClasses = await _context.HomeroomClasses.CountAsync();
            var totalFaculties = await _context.Faculties.CountAsync();

            // Thống kê điểm toàn hệ thống
            var allEnrollments = await _context.Enrollments
                .Include(e => e.CourseClass)
                    .ThenInclude(c => c != null ? c.Subject : null)
                .ToListAsync();

            var processWeight = 0.4;
            var finalWeight = 0.6;
            
            var validScores = new List<double>();
            var passCount = 0;
            var failCount = 0;

            foreach (var e in allEnrollments)
            {
                if (e.ProcessScore.HasValue && e.FinalScore.HasValue)
                {
                    var average = e.ProcessScore.Value * processWeight + e.FinalScore.Value * finalWeight;
                    validScores.Add(average);
                    
                    if (average >= 4.0) passCount++;
                    else failCount++;
                }
            }

            var overallAverage = validScores.Any() ? Math.Round(validScores.Average(), 2) : 0;
            var totalValidScores = validScores.Count;
            var overallPassRate = totalValidScores > 0 ? Math.Round((passCount * 100.0) / totalValidScores, 2) : 0;

            // Thống kê theo học kỳ
            var semesterStats = new List<SemesterStatisticsDto>();
            var semesters = await _context.Semesters
                .OrderByDescending(s => s.AcademicYear)
                .ThenBy(s => s.Term)
                .ToListAsync();

            foreach (var semester in semesters)
            {
                var classesInSemester = await _context.CourseClasses
                    .Where(c => c.SemesterId == semester.SemesterId)
                    .ToListAsync();
                
                var classIds = classesInSemester.Select(c => c.CourseClassId).ToList();
                
                var enrollmentsInSemester = allEnrollments
                    .Where(e => classIds.Contains(e.CourseClassId))
                    .ToList();
                
                var semesterScores = new List<double>();
                var semesterPass = 0;
                var semesterFail = 0;
                
                foreach (var e in enrollmentsInSemester)
                {
                    if (e.ProcessScore.HasValue && e.FinalScore.HasValue)
                    {
                        var avg = e.ProcessScore.Value * processWeight + e.FinalScore.Value * finalWeight;
                        semesterScores.Add(avg);
                        if (avg >= 4.0) semesterPass++;
                        else semesterFail++;
                    }
                }
                
                semesterStats.Add(new SemesterStatisticsDto
                {
                    SemesterId = semester.SemesterId,
                    Term = semester.Term,
                    AcademicYear = semester.AcademicYear,
                    TotalClasses = classesInSemester.Count,
                    TotalStudents = enrollmentsInSemester.Select(e => e.StudentId).Distinct().Count(),
                    AverageScore = semesterScores.Any() ? Math.Round(semesterScores.Average(), 2) : 0,
                    PassCount = semesterPass,
                    FailCount = semesterFail,
                    PassRate = semesterScores.Any() ? Math.Round((semesterPass * 100.0) / semesterScores.Count, 2) : 0
                });
            }

            // Top môn học - FIX LỖI DICTIONARY
            var subjectScores = new Dictionary<int, List<double>>();
            var subjectPass = new Dictionary<int, int>();
            var subjectFail = new Dictionary<int, int>();
            
            foreach (var e in allEnrollments)
            {
                var subjectId = e.CourseClass?.SubjectId ?? 0;
                if (subjectId == 0) continue;
                
                if (!subjectScores.ContainsKey(subjectId))
                {
                    subjectScores[subjectId] = new List<double>();
                    subjectPass[subjectId] = 0;
                    subjectFail[subjectId] = 0;
                }
                
                if (e.ProcessScore.HasValue && e.FinalScore.HasValue)
                {
                    var avg = e.ProcessScore.Value * processWeight + e.FinalScore.Value * finalWeight;
                    subjectScores[subjectId].Add(avg);
                    
                    if (avg >= 4.0) subjectPass[subjectId]++;
                    else subjectFail[subjectId]++;
                }
            }
            
            var topByScore = new List<TopSubjectDto>();
            var topByFailRate = new List<TopSubjectDto>();
            
            foreach (var subjectId in subjectScores.Keys)
            {
                var subject = await _context.Subjects.FindAsync(subjectId);
                if (subject == null) continue;
                
                var scores = subjectScores[subjectId];
                var pass = subjectPass[subjectId];
                var fail = subjectFail[subjectId];
                var total = scores.Count;
                
                var dto = new TopSubjectDto
                {
                    SubjectId = subject.SubjectId,
                    SubjectCode = subject.SubjectCode,
                    SubjectName = subject.SubjectName,
                    AverageScore = scores.Any() ? Math.Round(scores.Average(), 2) : 0,
                    TotalStudents = total,
                    PassCount = pass,
                    FailCount = fail,
                    FailRate = total > 0 ? Math.Round((fail * 100.0) / total, 2) : 0
                };
                
                topByScore.Add(dto);
                topByFailRate.Add(dto);
            }
            
            topByScore = topByScore.OrderByDescending(t => t.AverageScore).Take(5).ToList();
            topByFailRate = topByFailRate.OrderByDescending(t => t.FailRate).Take(5).ToList();

            // Thống kê theo khoa
            var facultyStats = new List<FacultyStatisticsDto>();
            var faculties = await _context.Faculties.ToListAsync();
            
            foreach (var faculty in faculties)
            {
                var lecturerCount = await _context.Users.CountAsync(u => u.FacultyId == faculty.FacultyId && u.Role == "Lecturer");
                var homeroomClassIds = await _context.HomeroomClasses
                    .Where(h => h.FacultyId == faculty.FacultyId)
                    .Select(h => h.HomeroomClassId)
                    .ToListAsync();
                var studentCount = await _context.Students.CountAsync(s => homeroomClassIds.Contains(s.HomeroomClassId));
                
                facultyStats.Add(new FacultyStatisticsDto
                {
                    FacultyId = faculty.FacultyId,
                    FacultyCode = faculty.FacultyCode,
                    FacultyName = faculty.FacultyName,
                    TotalLecturers = lecturerCount,
                    TotalStudents = studentCount,
                    TotalHomeroomClasses = homeroomClassIds.Count
                });
            }

            return new SystemStatisticsDto
            {
                TotalStudents = totalStudents,
                TotalLecturers = totalLecturers,
                TotalClasses = totalClasses,
                TotalSubjects = totalSubjects,
                TotalHomeroomClasses = totalHomeroomClasses,
                TotalFaculties = totalFaculties,
                OverallAverageScore = overallAverage,
                TotalPassCount = passCount,
                TotalFailCount = failCount,
                OverallPassRate = overallPassRate,
                SemesterStatistics = semesterStats,
                TopSubjectsByScore = topByScore,
                TopSubjectsByFailRate = topByFailRate,
                FacultyStatistics = facultyStats
            };
        }
    }
}