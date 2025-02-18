using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Controller;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Service;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using FluentAssertions;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs;

public class ToDoTaskControllerTests
{
    private readonly Mock<IToDoTaskServiceMethods> _mockService;
    private readonly ToDoTaskController _controller;
 
    public ToDoTaskControllerTests()
    {
        _mockService = new Mock<IToDoTaskServiceMethods>();
        _controller = new ToDoTaskController(_mockService.Object);
    }

    [Fact]
    public async Task GetAll_Should_Return_Ok_With_Tasks()
    {
        var tasks = new List<ToDoTaskModel> { new() { Title = "Task 1" }, new() { Title = "Task 2" } };
        _mockService.Setup(svc => svc.GetAllAsync()).ReturnsAsync(tasks);

        var result = await _controller.GetAllAsync();

        var okResult = result.Result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.Value.Should().BeEquivalentTo(tasks);
    }

    [Fact]
    public async Task Get_Should_Return_NotFound_When_Task_Does_Not_Exist()
    {
        _mockService.Setup(svc => svc.GetByPrimaryKeyAsync(1)).ReturnsAsync((ToDoTaskModel?)null);

        var result = await _controller.Get(1);

        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Create_Should_Return_CreatedAtAction()
    {
        var task = new ToDoTaskCreateDTO() { Title = "New Task", isCompleted = false };

        var result = await _controller.Create(task);

        var createdResult = result.Result as CreatedAtActionResult;
        createdResult.Should().NotBeNull();
    }
}
