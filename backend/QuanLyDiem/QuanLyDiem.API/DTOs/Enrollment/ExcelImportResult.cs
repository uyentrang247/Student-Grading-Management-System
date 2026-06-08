namespace QuanLyDiem.API.DTOs.Enrollment
{
    public class ExcelImportResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new List<string>(); // Chứa danh sách các dòng bị lỗi
    }
}
