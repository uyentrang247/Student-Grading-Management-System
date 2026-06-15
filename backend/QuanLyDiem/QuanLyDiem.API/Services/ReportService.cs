using OfficeOpenXml;
using QuanLyDiem.API.Services;

namespace QuanLyDiem.API.Services
{
    public class ReportService
    {
        private readonly GradeEntryService _gradeEntryService;

        public ReportService(GradeEntryService gradeEntryService)
        {
            _gradeEntryService = gradeEntryService;
            ExcelPackage.License.SetNonCommercialPersonal("EduGrade");
        }

        // Xuất bảng điểm Excel
        public async Task<byte[]> ExportGradeReportExcelAsync(int courseClassId)
        {
            var students = await _gradeEntryService.GetStudentsByClass(courseClassId);

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("BangDiem");

            worksheet.Cells[1, 1].Value = "STT";
            worksheet.Cells[1, 2].Value = "MSSV";
            worksheet.Cells[1, 3].Value = "HỌ TÊN";
            worksheet.Cells[1, 4].Value = "LỚP SH";
            worksheet.Cells[1, 5].Value = "ĐIỂM QT";
            worksheet.Cells[1, 6].Value = "ĐIỂM CK";
            worksheet.Cells[1, 7].Value = "ĐIỂM TB";
            worksheet.Cells[1, 8].Value = "ĐIỂM CHỮ";
            worksheet.Cells[1, 9].Value = "HỆ 4";

            for (int i = 0; i < students.Count; i++)
            {
                var s = students[i];
                var avg = CalculateAverage(s.ProcessScore, s.FinalScore);

                worksheet.Cells[i + 2, 1].Value = i + 1;
                worksheet.Cells[i + 2, 2].Value = s.StudentCode;
                worksheet.Cells[i + 2, 3].Value = s.FullName;
                worksheet.Cells[i + 2, 4].Value = s.HomeroomClass;
                worksheet.Cells[i + 2, 5].Value = s.ProcessScore?.ToString() ?? "";
                worksheet.Cells[i + 2, 6].Value = s.FinalScore?.ToString() ?? "";
                worksheet.Cells[i + 2, 7].Value = avg?.ToString() ?? "";
                worksheet.Cells[i + 2, 8].Value = GetGradeLetter(avg);
                worksheet.Cells[i + 2, 9].Value = GetGradeScale4(avg)?.ToString() ?? "";
            }

            worksheet.Cells.AutoFitColumns();
            return package.GetAsByteArray();
        }

        // Xuất danh sách học lại Excel
        public async Task<byte[]> ExportFailStudentsExcelAsync(int courseClassId)
        {
            var failStudents = await _gradeEntryService.GetFailStudents(courseClassId);

            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("DanhSachHocLai");

            worksheet.Cells[1, 1].Value = "STT";
            worksheet.Cells[1, 2].Value = "MSSV";
            worksheet.Cells[1, 3].Value = "HỌ TÊN";
            worksheet.Cells[1, 4].Value = "ĐIỂM QT";
            worksheet.Cells[1, 5].Value = "ĐIỂM CK";
            worksheet.Cells[1, 6].Value = "ĐIỂM TB";

            for (int i = 0; i < failStudents.Count; i++)
            {
                var s = failStudents[i];
                worksheet.Cells[i + 2, 1].Value = i + 1;
                worksheet.Cells[i + 2, 2].Value = s.StudentCode;
                worksheet.Cells[i + 2, 3].Value = s.FullName;
                worksheet.Cells[i + 2, 4].Value = s.ProcessScore?.ToString() ?? "";
                worksheet.Cells[i + 2, 5].Value = s.FinalScore?.ToString() ?? "";
                worksheet.Cells[i + 2, 6].Value = s.AverageScore?.ToString() ?? "";
            }

            worksheet.Cells.AutoFitColumns();
            return package.GetAsByteArray();
        }

        private double? CalculateAverage(double? process, double? final)
        {
            if (process.HasValue && final.HasValue)
                return Math.Round(process.Value * 0.4 + final.Value * 0.6, 1);
            return null;
        }

        private string GetGradeLetter(double? score)
        {
            if (!score.HasValue) return "Chưa có";
            if (score >= 9.0) return "A+";
            if (score >= 8.0) return "A";
            if (score >= 7.0) return "B+";
            if (score >= 6.0) return "B";
            if (score >= 5.0) return "C";
            if (score >= 4.0) return "D";
            return "F";
        }

        private double? GetGradeScale4(double? score)
        {
            if (!score.HasValue) return null;
            if (score >= 9.0) return 4.0;
            if (score >= 8.0) return 3.5;
            if (score >= 7.0) return 3.0;
            if (score >= 6.0) return 2.5;
            if (score >= 5.0) return 2.0;
            if (score >= 4.0) return 1.5;
            return 0.0;
        }
    }
}