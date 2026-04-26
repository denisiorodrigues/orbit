using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using OrbitApi.Data;
using OrbitApi.Models;

namespace OrbitApi.Endpoints;

public static class ProjectEndpoints
{
    public static void MapProjectEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/projects").WithTags("Projects");

        group.MapGet("/", GetAll).WithName("GetProjects").WithOpenApi();
        group.MapGet("/{id:int}", GetById).WithName("GetProjectById").WithOpenApi();
        group.MapPost("/", Create).WithName("CreateProject").WithOpenApi();
        group.MapPut("/{id:int}", Update).WithName("UpdateProject").WithOpenApi();
        group.MapDelete("/{id:int}", Delete).WithName("DeleteProject").WithOpenApi();
    }

    public static async Task<Ok<List<Project>>> GetAll(AppDbContext db) =>
        TypedResults.Ok(await db.Projects.OrderByDescending(p => p.UpdatedAt).ToListAsync());

    public static async Task<Results<Ok<Project>, NotFound>> GetById(int id, AppDbContext db) =>
        await db.Projects.FindAsync(id) is { } project
            ? TypedResults.Ok(project)
            : TypedResults.NotFound();

    public static async Task<Created<Project>> Create(Project project, AppDbContext db)
    {
        project.CreatedAt = DateTime.UtcNow;
        project.UpdatedAt = DateTime.UtcNow;
        db.Projects.Add(project);
        await db.SaveChangesAsync();
        return TypedResults.Created($"/api/projects/{project.Id}", project);
    }

    public static async Task<Results<Ok<Project>, NotFound>> Update(int id, Project input, AppDbContext db)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is null) return TypedResults.NotFound();

        project.Name = input.Name;
        project.Description = input.Description;
        project.Status = input.Status;
        project.RepoUrl = input.RepoUrl;
        project.LiveUrl = input.LiveUrl;
        project.Technologies = input.Technologies;
        project.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return TypedResults.Ok(project);
    }

    public static async Task<Results<NoContent, NotFound>> Delete(int id, AppDbContext db)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is null) return TypedResults.NotFound();

        db.Projects.Remove(project);
        await db.SaveChangesAsync();
        return TypedResults.NoContent();
    }
}
