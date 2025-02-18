using ListaDeAfazeres.Server.Modules.Utils.Repository;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model;
using Microsoft.EntityFrameworkCore;
using Xunit;
using FluentAssertions;
using ListaDeAfazeres.Server.Modules.Utils;

public class BaseRepositoryTests
{
    private readonly AppDbContext _dbContext;
    private readonly BaseRepository<ToDoTaskModel> _repository;

    public BaseRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase")
            .Options;

        _dbContext = new AppDbContext(options);
        _repository = new BaseRepository<ToDoTaskModel>(_dbContext);
    }

    [Fact]
    public async Task AddAsync_Should_Add_Entity_To_Database()
    {
        var task = new ToDoTaskModel() { Title = "Test Task" };

        await _repository.AddAsync(task);
        await _repository.SaveChangesAsync();

        var retrievedTask = await _repository.GetByPrimaryKeyAsync(task.Id);
        retrievedTask.Should().NotBeNull();
        retrievedTask!.Title.Should().Be("Test Task");
    }

    [Fact]
    public async Task DeleteAsync_Should_Remove_Entity()
    {
        var task = new ToDoTaskModel() { Title = "Test Task" };
        await _repository.AddAsync(task);
        await _repository.SaveChangesAsync();

        await _repository.DeleteAsync(task.Id);
        await _repository.SaveChangesAsync();

        var deletedTask = await _repository.GetByPrimaryKeyAsync(task.Id);
        deletedTask.Should().BeNull();
    }
}
