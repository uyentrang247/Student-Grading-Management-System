using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using QuanLyDiem.API.Models;

namespace QuanLyDiem.API.Helpers
{
    public class JwtHelper
    {
        private readonly IConfiguration _config;

        public JwtHelper(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var secretKey = jwtSettings["Key"] ?? "ChuoiKeyBaoMatSieuCapVipProNhatDinhPhaiDuDai123456";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                
                // BỔ SUNG DÒNG NÀY ĐỂ ĐƯA FULLNAME VÀO TOKEN
                new Claim("FullName", user.FullName ?? ""), 
                
                new Claim("role", user.Role ?? "User")
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"] ?? "QuanLyDiemAPI",
                audience: jwtSettings["Audience"] ?? "QuanLyDiemAngular",
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}