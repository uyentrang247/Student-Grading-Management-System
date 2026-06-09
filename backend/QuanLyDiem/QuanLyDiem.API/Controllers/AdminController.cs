using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyDiem.API.DTOs.Analytics;
using QuanLyDiem.API.Services;

namespace QuanLyDiem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminStatisticsService _adminStatisticsService;

        public AdminController(IAdminStatisticsService adminStatisticsService)
        {
            _adminStatisticsService = adminStatisticsService;
        }

        [HttpGet("statistics/overview")]
        public async Task<IActionResult> GetSystemStatistics()
        {
            try
            {
                var statistics = await _adminStatisticsService.GetSystemStatisticsAsync();
                return Ok(new { success = true, data = statistics });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}