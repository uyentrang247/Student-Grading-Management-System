using System.ComponentModel.DataAnnotations;

namespace QuanLyDiem.API.DTOs.Auth
{
    public class LoginDto
    {
        [Required]
        public string UsernameOrEmail { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }
    }
}