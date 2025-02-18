using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Service;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model;
using ListaDeAfazeres.Server.Modules.Utils.Repository;
using Moq;
using Xunit;
using FluentAssertions;

public class ToDoTaskServiceTests
{
    private readonly Mock<IBaseRepositoryMethods<ToDoTaskModel>> _mockRepository;
    private readonly ToDoTaskService _service;

    public ToDoTaskServiceTests()
    {
        _mockRepository = new Mock<IBaseRepositoryMethods<ToDoTaskModel>>();
        _service = new ToDoTaskService(_mockRepository.Object);
    }

    [Fact]
    public async Task AddAsync_Should_Call_Repository_Method()
    {
        var task = new ToDoTaskModel() { Title = "New Task" };

        await _service.AddAsync(task);

        _mockRepository.Verify(repo => repo.AddAsync(task), Times.Once);
        _mockRepository.Verify(repo => repo.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task GetByPrimaryKeyAsync_Should_Return_Task()
    {
        var task = new ToDoTaskModel() { Title = "New Task" };
        _mockRepository.Setup(repo => repo.GetByPrimaryKeyAsync(task.Id))
            .ReturnsAsync(task);

        var result = await _service.GetByPrimaryKeyAsync(task.Id);

        result.Should().NotBeNull();
        result!.Title.Should().Be("Existing Task");
    }
}
