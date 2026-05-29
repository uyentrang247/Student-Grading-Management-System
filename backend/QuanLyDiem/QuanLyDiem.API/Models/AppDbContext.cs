using Microsoft.EntityFrameworkCore;
using QuanLyDiem.API.Models;

namespace QuanLyDiem.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Faculty> Faculties { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Semester> Semesters { get; set; }
        public DbSet<CourseClass> CourseClasses { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<HomeroomClass> HomeroomClasses { get; set; }
    }
}