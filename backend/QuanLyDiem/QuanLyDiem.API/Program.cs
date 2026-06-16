using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Models;
using QuanLyDiem.API.Data;
using System.Text.Json.Serialization;
using QuanLyDiem.API.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using QuanLyDiem.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Cấu hình SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// Đăng ký Services
builder.Services.AddScoped<StudentService>();
builder.Services.AddScoped<EnrollmentService>();
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<LecturerService>();
builder.Services.AddScoped<GoogleAuthService>(); 
builder.Services.AddMemoryCache();             
builder.Services.AddTransient<IEmailService, EmailService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<GradeEntryService>();
builder.Services.AddScoped<ReportService>();
// Thêm vào phần đăng ký Services (sau builder.Services.AddScoped...)
builder.Services.AddScoped<ILecturerClassReportService, LecturerClassReportService>();
builder.Services.AddScoped<IAdminStatisticsService, AdminStatisticsService>();
// Cấu hình JWT Authentication
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
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

// Thứ tự Middleware quan trọng
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();