using BCrypt.Net;
using MailKit.Net.Smtp;
using MimeKit;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.Models;
using QuanLyDiem.API.DTOs.Lecturer;
using Microsoft.EntityFrameworkCore;

namespace QuanLyDiem.API.Services
{
    public class LecturerService
    {
        private readonly AppDbContext _context;

        public LecturerService(AppDbContext context)
        {
            _context = context;
        }

 public async Task<string> CreateLecturerAsync(CreateLecturerDto dto)
{
    if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        throw new Exception("Email đã tồn tại!");
    
    if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
        throw new Exception("Mã giảng viên đã bị trùng!");

    if (!await _context.Faculties.AnyAsync(f => f.FacultyId == dto.FacultyId))
        throw new Exception("Khoa không tồn tại trong CSDL!");

    string randomPassword = GenerateRandomPassword(10); 
    
    var newUser = new User 
    { 
        Username = dto.Username,
        Password = BCrypt.Net.BCrypt.HashPassword(randomPassword),
        Email = dto.Email,
        FullName = dto.FullName,
        FacultyId = dto.FacultyId,
        Role = "Lecturer"
    };

    _context.Users.Add(newUser);
    await _context.SaveChangesAsync();

    try 
    {
        await SendAccountEmail(dto.Email, dto.Username, randomPassword);
        return "Tuyệt vời! Tạo giảng viên VÀ gửi email thành công.";
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[EMAIL ERROR]: {ex.Message}");
        return $"Đã lưu giảng viên thành công, NHƯNG gửi mail thất bại. Lỗi: {ex.Message}";
    }
}

private string GenerateRandomPassword(int length)
{
    const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$";
    var random = new Random();
    return new string(Enumerable.Repeat(validChars, length).Select(s => s[random.Next(s.Length)]).ToArray());
}
private async Task SendAccountEmail(string email, string username, string password)
{
    var message = new MimeMessage();
    // 1. Địa chỉ email gửi (Phải trùng với tài khoản Gmail bồ dùng để authenticate bên dưới)
    message.From.Add(new MailboxAddress("Hệ thống QLĐ", "hethongtest1@gmail.com"));
    message.To.Add(new MailboxAddress("Giảng viên", email));
    message.Subject = "Thông tin tài khoản Giảng viên mới";
    
    message.Body = new TextPart("html") 
    {
        Text = $@"<h3>Chào mừng Giảng viên mới!</h3>
                  <p>Tài khoản của bạn đã được tạo vui lòng đăng nhập và thay đổi mật khẩu:</p>
                  <p><b>Username:</b> {username}</p>
                  <p><b>Password:</b> {password}</p>"
    };

    using (var client = new SmtpClient())
    {
        client.ServerCertificateValidationCallback = (s, c, h, e) => true;

        // 2. Đổi sang Host và Port của Gmail thật (Cổng 587)
        await client.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
        
        // 3. Điền Email gửi và Mật khẩu ứng dụng (App Password 16 ký tự) của bồ vào đây
        // Ví dụ dùng lại mã app password cũ của bồ:
        await client.AuthenticateAsync("hethongtest1@gmail.com", "gixdayknowkfpqpv");
        
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
    }
}