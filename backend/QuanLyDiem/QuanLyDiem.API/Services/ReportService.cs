using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.DTOs.Report;

namespace QuanLyDiem.API.Services
{
    public class ReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        // Lấy báo cáo cho 1 lớp học phần (giảng viên)
        public async Task<ClassReportDto?> GetClassReportAsync(int courseClassId)
        {
            // Lấy thông tin lớp
            var courseClass = await _context.CourseClasses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Include(c => c.Lecturer)
                .FirstOrDefaultAsync(c => c.CourseClassId == courseClassId);

            if (courseClass == null) return null;

            // Lấy danh sách điểm của sinh viên trong lớp
            var processWeight = courseClass.Subject?.ProcessWeight ?? 0.4;
            var finalWeight = courseClass.Subject?.FinalWeight ?? 0.6;

            var enrollments = await _context.Enrollments
                .Include(e => e.Student)
                .Where(e => e.CourseClassId == courseClassId)
                .ToListAsync();

            var totalStudents = enrollments.Count;
            if (totalStudents == 0)
            {
                return CreateEmptyReport(courseClass);
            }

            // Tính điểm trung bình cho từng sinh viên
            var scores = enrollments.Select(e => new
            {
                e.EnrollmentId,
                AverageScore = e.ProcessScore.HasValue && e.FinalScore.HasValue
                    ? Math.Round(e.ProcessScore.Value * processWeight + e.FinalScore.Value * finalWeight, 1)
                    : (double?)null
            }).Where(s => s.AverageScore.HasValue).ToList();

            var validScores = scores.Where(s => s.AverageScore.HasValue).Select(s => s.AverageScore!.Value).ToList();

            if (validScores.Count == 0)
            {
                return CreateEmptyReport(courseClass);
            }

            // Thống kê đậu/rớt (>=4.0 là đậu)
            var passCount = validScores.Count(s => s >= 4.0);
            var failCount = validScores.Count(s => s < 4.0);
            var passRate = validScores.Count > 0 ? Math.Round((double)passCount / validScores.Count * 100, 1) : 0;
            var failRate = validScores.Count > 0 ? Math.Round((double)failCount / validScores.Count * 100, 1) : 0;

            // Thống kê điểm
            var averageScore = Math.Round(validScores.Average(), 1);
            var highestScore = validScores.Max();
            var lowestScore = validScores.Min();

            // Phân bố điểm theo khoảng (biểu đồ cột)
            var distribution = new DistributionDto
            {
                Range_0_4 = validScores.Count(s => s >= 0 && s < 4),
                Range_4_5 = validScores.Count(s => s >= 4 && s < 5),
                Range_5_7 = validScores.Count(s => s >= 5 && s < 7),
                Range_7_9 = validScores.Count(s => s >= 7 && s < 9),
                Range_9_10 = validScores.Count(s => s >= 9 && s <= 10)
            };

            // Phân bố điểm chữ
            var gradeDistribution = GetGradeLetterDistribution(validScores, totalStudents);

            return new ClassReportDto
            {
                CourseClassId = courseClass.CourseClassId,
                ClassCode = courseClass.ClassCode,
                SubjectName = courseClass.Subject?.SubjectName ?? "",
                SubjectCode = courseClass.Subject?.SubjectCode ?? "",
                LecturerName = courseClass.Lecturer?.FullName ?? "",
                Semester = courseClass.Semester?.Term ?? "",
                AcademicYear = courseClass.Semester?.AcademicYear ?? "",
                TotalStudents = totalStudents,
                PassCount = passCount,
                FailCount = failCount,
                PassRate = passRate,
                FailRate = failRate,
                AverageScore = averageScore,
                HighestScore = highestScore,
                LowestScore = lowestScore,
                ScoreDistribution = distribution,
                GradeLetterDistribution = gradeDistribution
            };
        }

        private ClassReportDto CreateEmptyReport(dynamic courseClass)
        {
            return new ClassReportDto
            {
                CourseClassId = courseClass.CourseClassId,
                ClassCode = courseClass.ClassCode,
                SubjectName = courseClass.Subject?.SubjectName ?? "",
                SubjectCode = courseClass.Subject?.SubjectCode ?? "",
                LecturerName = courseClass.Lecturer?.FullName ?? "",
                Semester = courseClass.Semester?.Term ?? "",
                AcademicYear = courseClass.Semester?.AcademicYear ?? "",
                TotalStudents = 0,
                PassCount = 0,
                FailCount = 0,
                PassRate = 0,
                FailRate = 0,
                AverageScore = 0,
                HighestScore = 0,
                LowestScore = 0,
                ScoreDistribution = new DistributionDto(),
                GradeLetterDistribution = new GradeLetterDistributionDto()
            };
        }

        private GradeLetterDistributionDto GetGradeLetterDistribution(List<double> scores, int totalStudents)
        {
            var aCount = scores.Count(s => s >= 8.5);
            var bCount = scores.Count(s => s >= 7.0 && s < 8.5);
            var cCount = scores.Count(s => s >= 5.5 && s < 7.0);
            var dCount = scores.Count(s => s >= 4.0 && s < 5.5);
            var fCount = scores.Count(s => s < 4.0);

            return new GradeLetterDistributionDto
            {
                A = new GradeLetterItemDto
                {
                    Count = aCount,
                    Percentage = totalStudents > 0 ? Math.Round((double)aCount / totalStudents * 100, 1) : 0,
                    Range = "8.5 - 10"
                },
                B = new GradeLetterItemDto
                {
                    Count = bCount,
                    Percentage = totalStudents > 0 ? Math.Round((double)bCount / totalStudents * 100, 1) : 0,
                    Range = "7.0 - 8.4"
                },
                C = new GradeLetterItemDto
                {
                    Count = cCount,
                    Percentage = totalStudents > 0 ? Math.Round((double)cCount / totalStudents * 100, 1) : 0,
                    Range = "5.5 - 6.9"
                },
                D = new GradeLetterItemDto
                {
                    Count = dCount,
                    Percentage = totalStudents > 0 ? Math.Round((double)dCount / totalStudents * 100, 1) : 0,
                    Range = "4.0 - 5.4"
                },
                F = new GradeLetterItemDto
                {
                    Count = fCount,
                    Percentage = totalStudents > 0 ? Math.Round((double)fCount / totalStudents * 100, 1) : 0,
                    Range = "< 4.0"
                }
            };
        }

        // Lấy danh sách lớp mà giảng viên phụ trách (cho dropdown)
        public async Task<List<CourseClassSimpleDto>> GetLecturerCourseClassesAsync(int lecturerId)
        {
            return await _context.CourseClasses
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Where(c => c.LecturerId == lecturerId)
                .Select(c => new CourseClassSimpleDto
                {
                    CourseClassId = c.CourseClassId,
                    ClassCode = c.ClassCode,
                    SubjectName = c.Subject != null ? c.Subject.SubjectName : "",
                    Semester = c.Semester != null ? c.Semester.Term : "",
                    AcademicYear = c.Semester != null ? c.Semester.AcademicYear : ""
                })
                .ToListAsync();
        }

        // Admin: Thống kê tổng hợp (ĐÃ BỎ PHẦN THỐNG KÊ THEO KHOA VÌ Subject KHÔNG CÓ FacultyId)
        public async Task<AdminStatisticsDto> GetAdminStatisticsAsync(int? facultyId = null, int? semesterId = null)
        {
            var result = new AdminStatisticsDto();

            // Tổng quan
            result.Overview.TotalStudents = await _context.Students.CountAsync();
            result.Overview.TotalLecturers = await _context.Users.CountAsync(u => u.Role == "Lecturer");
            result.Overview.TotalSubjects = await _context.Subjects.CountAsync();
            result.Overview.TotalCourseClasses = await _context.CourseClasses.CountAsync();
            result.Overview.TotalEnrollments = await _context.Enrollments.CountAsync();

            // Tính điểm trung bình và tỷ lệ đậu toàn trường
            var allScores = await GetAllValidScoresAsync();
            if (allScores.Any())
            {
                result.Overview.AverageScoreAll = Math.Round(allScores.Average(), 1);
                var passCount = allScores.Count(s => s >= 4.0);
                result.Overview.OverallPassRate = Math.Round((double)passCount / allScores.Count * 100, 1);
                result.OverallScoreDistribution = GetScoreDistribution(allScores);
            }

            // BỎ FacultyStatistics vì Subject không có FacultyId
            result.FacultyStatistics = new List<FacultyStatisticsDto>();

            // Top môn có tỷ lệ rớt cao nhất
            result.TopFailSubjects = await GetTopFailSubjectsAsync(10);

            // Thống kê theo học kỳ
            result.SemesterStatistics = await GetSemesterStatisticsAsync();

            return result;
        }

        private async Task<List<double>> GetAllValidScoresAsync()
        {
            var enrollments = await _context.Enrollments
                .Include(e => e.CourseClass)
                    .ThenInclude(c => c!.Subject)
                .Where(e => e.ProcessScore.HasValue && e.FinalScore.HasValue)
                .ToListAsync();

            var scores = new List<double>();
            foreach (var e in enrollments)
            {
                var processWeight = e.CourseClass?.Subject?.ProcessWeight ?? 0.4;
                var finalWeight = e.CourseClass?.Subject?.FinalWeight ?? 0.6;
                var avg = e.ProcessScore!.Value * processWeight + e.FinalScore!.Value * finalWeight;
                scores.Add(Math.Round(avg, 1));
            }
            return scores;
        }

        private DistributionDto GetScoreDistribution(List<double> scores)
        {
            return new DistributionDto
            {
                Range_0_4 = scores.Count(s => s >= 0 && s < 4),
                Range_4_5 = scores.Count(s => s >= 4 && s < 5),
                Range_5_7 = scores.Count(s => s >= 5 && s < 7),
                Range_7_9 = scores.Count(s => s >= 7 && s < 9),
                Range_9_10 = scores.Count(s => s >= 9 && s <= 10)
            };
        }

        private async Task<List<SubjectStatisticsDto>> GetTopFailSubjectsAsync(int top)
        {
            var subjects = await _context.Subjects.ToListAsync();
            var result = new List<SubjectStatisticsDto>();

            foreach (var subject in subjects)
            {
                var stats = await GetSubjectStatisticsAsync(subject.SubjectId);
                if (stats.TotalStudents > 0)
                {
                    result.Add(stats);
                }
            }

            return result.OrderByDescending(s => s.FailRate).Take(top).ToList();
        }

        private async Task<SubjectStatisticsDto> GetSubjectStatisticsAsync(int subjectId)
        {
            var subject = await _context.Subjects.FindAsync(subjectId);
            if (subject == null) return new SubjectStatisticsDto();

            var enrollments = await _context.Enrollments
                .Include(e => e.CourseClass)
                .Where(e => e.CourseClass != null && e.CourseClass.SubjectId == subjectId
                    && e.ProcessScore.HasValue && e.FinalScore.HasValue)
                .ToListAsync();

            var scores = new List<double>();
            foreach (var e in enrollments)
            {
                var processWeight = subject.ProcessWeight;
                var finalWeight = subject.FinalWeight;
                var avg = e.ProcessScore!.Value * processWeight + e.FinalScore!.Value * finalWeight;
                scores.Add(Math.Round(avg, 1));
            }

            var totalStudents = scores.Count;
            var passCount = scores.Count(s => s >= 4.0);
            var failCount = totalStudents - passCount;
            var passRate = totalStudents > 0 ? Math.Round((double)passCount / totalStudents * 100, 1) : 0;
            var failRate = totalStudents > 0 ? Math.Round((double)failCount / totalStudents * 100, 1) : 0;
            var avgScore = totalStudents > 0 ? Math.Round(scores.Average(), 1) : 0;

            return new SubjectStatisticsDto
            {
                SubjectId = subject.SubjectId,
                SubjectCode = subject.SubjectCode,
                SubjectName = subject.SubjectName,
                Credits = subject.Credits,
                TotalStudents = totalStudents,
                PassCount = passCount,
                FailCount = failCount,
                PassRate = passRate,
                FailRate = failRate,
                AverageScore = avgScore
            };
        }

        private async Task<List<SemesterStatisticsDto>> GetSemesterStatisticsAsync()
        {
            var semesters = await _context.Semesters.ToListAsync();
            var result = new List<SemesterStatisticsDto>();

            foreach (var semester in semesters)
            {
                var courseClasses = await _context.CourseClasses
                    .Where(c => c.SemesterId == semester.SemesterId)
                    .ToListAsync();

                var courseClassIds = courseClasses.Select(c => c.CourseClassId).ToList();

                var enrollments = await _context.Enrollments
                    .Where(e => courseClassIds.Contains(e.CourseClassId)
                        && e.ProcessScore.HasValue && e.FinalScore.HasValue)
                    .ToListAsync();

                var scores = new List<double>();
                foreach (var e in enrollments)
                {
                    var courseClass = courseClasses.FirstOrDefault(c => c.CourseClassId == e.CourseClassId);
                    if (courseClass?.Subject != null)
                    {
                        var avg = e.ProcessScore!.Value * courseClass.Subject.ProcessWeight
                                + e.FinalScore!.Value * courseClass.Subject.FinalWeight;
                        scores.Add(Math.Round(avg, 1));
                    }
                }

                var totalStudents = scores.Count;
                var passCount = scores.Count(s => s >= 4.0);
                var passRate = totalStudents > 0 ? Math.Round((double)passCount / totalStudents * 100, 1) : 0;
                var avgScore = totalStudents > 0 ? Math.Round(scores.Average(), 1) : 0;

                result.Add(new SemesterStatisticsDto
                {
                    SemesterId = semester.SemesterId,
                    Term = semester.Term,
                    AcademicYear = semester.AcademicYear,
                    CourseClassCount = courseClasses.Count,
                    TotalStudents = totalStudents,
                    PassRate = passRate,
                    AverageScore = avgScore
                });
            }

            return result;
        }
    }

    public class CourseClassSimpleDto
    {
        public int CourseClassId { get; set; }
        public string ClassCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string Semester { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
    }
}