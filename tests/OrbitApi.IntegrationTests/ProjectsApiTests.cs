using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using OrbitApi.Models;

namespace OrbitApi.IntegrationTests;

public class ProjectsApiTests : IClassFixture<OrbitApiFactory>
{
    private readonly OrbitApiFactory _factory;

    public ProjectsApiTests(OrbitApiFactory factory) => _factory = factory;

    [Fact]
    public async Task FullCrudFlow()
    {
        var client = _factory.CreateClient();

        var createResp = await client.PostAsJsonAsync("/api/projects", new Project
        {
            Name = "Integration",
            Status = "active",
            Description = "from integration test"
        });
        createResp.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createResp.Content.ReadFromJsonAsync<Project>();
        created!.Id.Should().BeGreaterThan(0);

        var list = await client.GetFromJsonAsync<List<Project>>("/api/projects");
        list!.Should().Contain(p => p.Id == created.Id);

        var fetched = await client.GetFromJsonAsync<Project>($"/api/projects/{created.Id}");
        fetched!.Name.Should().Be("Integration");

        created.Name = "Renamed";
        var updateResp = await client.PutAsJsonAsync($"/api/projects/{created.Id}", created);
        updateResp.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await updateResp.Content.ReadFromJsonAsync<Project>();
        updated!.Name.Should().Be("Renamed");

        var deleteResp = await client.DeleteAsync($"/api/projects/{created.Id}");
        deleteResp.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var afterDelete = await client.GetAsync($"/api/projects/{created.Id}");
        afterDelete.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_ForUnknownId()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/projects/999999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_ForUnknownId()
    {
        var client = _factory.CreateClient();

        var response = await client.PutAsJsonAsync("/api/projects/999999",
            new Project { Name = "ghost" });

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
