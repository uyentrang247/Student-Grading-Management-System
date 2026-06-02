using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Models;
using QuanLyDiem.API.Data;
using QuanLyDiem.API.Helpers; // 1. SỬA LỖI: Thêm dòng này để nhận PasswordHasher và JwtHelper
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using QuanLyDiem.API.Services;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Giữ nguyên cấu hình SQLite của nhóm bạn
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. CẤU HÌNH JWT AUTHENTICATION: Giúp Backend sinh và hiểu được mã Token thật
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "QuanLyDiemAPI",
            ValidAudience = "QuanLyDiemAngular",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("ChuoiKeyBaoMatSieuCapVipProNhatDinhPhaiDuDai123456"))
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<AuthService>();
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// 3. SỬA THỨ TỰ MIDDLEWARE: CORS phải đứng trước, sau đó tới Auth
app.UseCors("AllowAngular");

app.UseAuthentication(); // Kích hoạt xác thực Token
app.UseAuthorization();

app.MapControllers();

app.Run();