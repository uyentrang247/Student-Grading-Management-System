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
            // 1. Kiểm tra ràng buộc dữ liệu đầu vào (tăng cường)
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                throw new Exception("Email đã tồn tại trong hệ thống!");

            if (await _context.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
                throw new Exception("Mã giảng viên (Username) đã bị trùng!");

            if (!await _context.Faculties.AnyAsync(f => f.FacultyId == dto.FacultyId))
                throw new Exception("Khoa không tồn tại trong CSDL!");

            // 2. Tạo mật khẩu ngẫu nhiên và hash bằng BCrypt
            string randomPassword = GenerateRandomPassword(10); 
            
            var newUser = new User 
            { 
                Username = dto.Username,
                Password = BCrypt.Net.BCrypt.HashPassword(randomPassword),
                Email = dto.Email,
                FullName = dto.FullName,
                FacultyId = dto.FacultyId,
                Role = "Lecturer" // Đảm bảo Role này khớp 100% với điều kiện lọc ở các Controller khác
            };

            // 3. Lưu vào DB
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // 4. Gửi email thông báo
            try 
            {
                await SendAccountEmail(dto.Email, dto.Username, randomPassword);
                return "Tạo giảng viên thành công và đã gửi email mật khẩu.";
            }
            catch (Exception ex)
            {
                // Vẫn trả về thành công vì User đã được tạo trong DB
                return $"Đã lưu giảng viên thành công, NHƯNG gửi mail thất bại: {ex.Message}";
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
            message.From.Add(new MailboxAddress("Hệ thống QLĐ", "hethongtest1@gmail.com"));
            message.To.Add(new MailboxAddress("Giảng viên", email));
            message.Subject = "Thông tin tài khoản Giảng viên mới";
            
            message.Body = new TextPart("html") 
            {
                Text = $@"<h3>Chào mừng Giảng viên mới!</h3>
                          <p>Tài khoản của bạn đã được tạo. Vui lòng đăng nhập hệ thống:</p>
                          <p><b>Username:</b> {username}</p>
                          <p><b>Password:</b> {password}</p>
                          <p><i>Vui lòng thay đổi mật khẩu ngay sau khi đăng nhập.</i></p>"
            };

            using (var client = new SmtpClient())
            {
                // Bỏ qua chứng chỉ SSL cho môi trường test (nếu cần)
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                await client.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
                
                // Đảm bảo bồ đã bật "Xác minh 2 bước" và tạo "Mật khẩu ứng dụng" cho Gmail
                await client.AuthenticateAsync("hethongtest1@gmail.com", "gixdayknowkfpqpv");
                
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
        }
    }
}