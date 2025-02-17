namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs
{
    public class ToDoTaskCreateDTO
    {
        required public string Title { get; set; }
        required public bool isCompleted { get; set; }

    }
}
