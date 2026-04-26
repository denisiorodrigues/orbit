using FluentAssertions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using OrbitApi.Data;
using OrbitApi.Endpoints;
using OrbitApi.Models;

namespace OrbitApi.UnitTests;

public class ProjectEndpointsTests
{
    private static AppDbContext CreateDb() =>
        new(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    [Fact]
    public async Task GetAll_ReturnsProjectsOrderedByUpdatedAtDesc()
    {
        await using var db = CreateDb();
        db.Projects.AddRange(
            new Project { Name = "old", UpdatedAt = DateTime.UtcNow.AddDays(-1) },
            new Project { Name = "new", UpdatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();

        var result = await ProjectEndpoints.GetAll(db);

        result.Value.Should().NotBeNull();
        result.Value!.Should().HaveCount(2);
        result.Value![0].Name.Should().Be("new");
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenMissing()
    {
        await using var db = CreateDb();

        var result = await ProjectEndpoints.GetById(999, db);

        result.Result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task GetById_ReturnsProject_WhenExists()
    {
        await using var db = CreateDb();
        var project = new Project { Name = "alpha" };
        db.Projects.Add(project);
        await db.SaveChangesAsync();

        var result = await ProjectEndpoints.GetById(project.Id, db);

        var ok = result.Result.Should().BeOfType<Ok<Project>>().Subject;
        ok.Value!.Name.Should().Be("alpha");
    }

    [Fact]
    public async Task Create_PersistsProjectAndSetsTimestamps()
    {
        await using var db = CreateDb();
        var input = new Project { Name = "shiny", Status = "active" };

        var result = await ProjectEndpoints.Create(input, db);

        result.Value!.Id.Should().BeGreaterThan(0);
        result.Value.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        result.Value.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        (await db.Projects.CountAsync()).Should().Be(1);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenMissing()
    {
        await using var db = CreateDb();

        var result = await ProjectEndpoints.Update(999, new Project { Name = "x" }, db);

        result.Result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task Update_AppliesChangesAndBumpsUpdatedAt()
    {
        await using var db = CreateDb();
        var project = new Project { Name = "old", UpdatedAt = DateTime.UtcNow.AddDays(-1) };
        db.Projects.Add(project);
        await db.SaveChangesAsync();
        var oldUpdatedAt = project.UpdatedAt;

        var input = new Project { Name = "new", Status = "done", Description = "desc" };
        var result = await ProjectEndpoints.Update(project.Id, input, db);

        var ok = result.Result.Should().BeOfType<Ok<Project>>().Subject;
        ok.Value!.Name.Should().Be("new");
        ok.Value.Status.Should().Be("done");
        ok.Value.Description.Should().Be("desc");
        ok.Value.UpdatedAt.Should().BeAfter(oldUpdatedAt);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenMissing()
    {
        await using var db = CreateDb();

        var result = await ProjectEndpoints.Delete(999, db);

        result.Result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task Delete_RemovesProject()
    {
        await using var db = CreateDb();
        var project = new Project { Name = "doomed" };
        db.Projects.Add(project);
        await db.SaveChangesAsync();

        var result = await ProjectEndpoints.Delete(project.Id, db);

        result.Result.Should().BeOfType<NoContent>();
        (await db.Projects.CountAsync()).Should().Be(0);
    }
}
