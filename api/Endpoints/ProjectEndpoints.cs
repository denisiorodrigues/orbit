using Microsoft.EntityFrameworkCore;
using OrbitApi.Data;
using OrbitApi.Models;

namespace OrbitApi.Endpoints;

public static class ProjectEndpoints
{
    public static void MapProjectEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/projects");

        group.MapGet("/", async (AppDbContext db) =>
            await db.Projects.OrderByDescending(p => p.UpdatedAt).ToListAsync());

        group.MapGet("/{id:int}", async (int id, AppDbContext db) =>
            await db.Projects.FindAsync(id) is Project project
                ? Results.Ok(project)
                : Results.NotFound());

        group.MapPost("/", async (Project project, AppDbContext db) =>
        {
            project.CreatedAt = DateTime.UtcNow;
            project.UpdatedAt = DateTime.UtcNow;
            db.Projects.Add(project);
            await db.SaveChangesAsync();
            return Results.Created($"/api/projects/{project.Id}", project);
        });

        group.MapPut("/{id:int}", async (int id, Project input, AppDbContext db) =>
        {
            var project = await db.Projects.FindAsync(id);
            if (project is null) return Results.NotFound();

            project.Name = input.Name;
            project.Description = input.Description;
            project.Status = input.Status;
            project.RepoUrl = input.RepoUrl;
            project.LiveUrl = input.LiveUrl;
            project.Technologies = input.Technologies;
            project.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return Results.Ok(project);
        });

        group.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var project = await db.Projects.FindAsync(id);
            if (project is null) return Results.NotFound();

            db.Projects.Remove(project);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
