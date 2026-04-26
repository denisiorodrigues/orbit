using Microsoft.EntityFrameworkCore;
using OrbitApi.Models;

namespace OrbitApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();
}
