using System.ComponentModel.DataAnnotations;

namespace QuanLyDiem.API.DTOs.Auth
{
    public class GoogleLoginDto
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;
    }
}