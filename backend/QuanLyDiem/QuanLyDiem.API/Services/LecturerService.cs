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
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
                throw new Exception("Email đã tồn tại trong hệ thống!");

            if (await _context.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
                throw new Exception("Mã giảng viên (Username) đã bị trùng!");

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
                return "Tạo giảng viên thành công và đã gửi mật khẩu đến email đã nhập.";
            }
            catch (Exception ex)
            {
                return $"Đã lưu giảng viên thành công, NHƯNG gửi mail thất bại: {ex.Message}";
            }
        }

        public async Task<string> UpdateLecturerAsync(int id, UpdateLecturerDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.Role == "Lecturer");
            if (user == null) throw new Exception("Không tìm thấy giảng viên!");

            if (user.Email.ToLower() != dto.Email.ToLower())
            {
                if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower() && u.UserId != id))
                    throw new Exception("Email mới đã tồn tại trên một tài khoản khác!");
            }

            user.Email = dto.Email;
            user.FullName = dto.FullName;
            
            if (dto.FacultyId.HasValue)
            {
                user.FacultyId = dto.FacultyId.Value;
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return "Cập nhật thông tin giảng viên thành công.";
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
            message.From.Add(new MailboxAddress("Hệ thống Quản Lý Điểm QNU", "hethongtest1@gmail.com"));
            message.To.Add(new MailboxAddress("Giảng viên", email));
            message.Subject = "Thông tin tài khoản Giảng viên mới";
            
            message.Body = new TextPart("html") 
            {
                Text = $@"
<div style='font-family: ""Segoe UI"", Tahoma, Geneva, Verdana, sans-serif; max-width: 450px; margin: 0 auto; padding: 30px; border-radius: 20px; background-color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e4ecf7;'>
    <h3 style='color: #2d3748; font-size: 22px; margin-top: 0; margin-bottom: 12px; font-weight: 700;'>Chào mừng Giảng viên mới!</h3>
    <p style='color: #718096; font-size: 15px; line-height: 1.6; margin-bottom: 20px;'>Tài khoản của thầy/cô đã được khởi tạo thành công. Vui lòng đăng nhập vào hệ thống quản lý bằng thông tin dưới đây:</p>
    
    <div style='background-color: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;'>
        <p style='margin: 0 0 8px 0; color: #4a5568; font-size: 15px;'><b>Tên đăng nhập:</b> <span style='color: #2d3748;'>{username}</span></p>
        <p style='margin: 0; color: #4a5568; font-size: 15px;'><b>Mật khẩu:</b> <span style='color: #2d3748;'>{password}</span></p>
    </div>
    
    <p style='color: #718096; font-size: 14px; font-style: italic; line-height: 1.5; margin: 0; padding-top: 12px; border-top: 1px dashed #e2e8f0;'>
        * Vì lý do bảo mật, thầy/cô vui lòng sử dụng chức năng <b>""Quên mật khẩu""</b> tại trang đăng nhập để tiến hành thay đổi mật khẩu mới trong lần đầu truy cập.
    </p>
</div>"
            };

            using (var client = new SmtpClient())
            {
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                await client.ConnectAsync("smtp.gmail.com", 587, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync("hethongtest1@gmail.com", "gixdayknowkfpqpv");
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
        }
    }
}