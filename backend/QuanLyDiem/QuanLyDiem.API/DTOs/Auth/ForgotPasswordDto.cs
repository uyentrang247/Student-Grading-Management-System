namespace QuanLyDiem.API.DTOs.Auth
{
    public class ForgotPasswordDto
    {
        // Thêm = string.Empty; để triệt tiêu lỗi CS8618
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}