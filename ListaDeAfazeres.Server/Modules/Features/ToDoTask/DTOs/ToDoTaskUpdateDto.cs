namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs
{
    public class ToDoTaskUpdateDto
    {
        public required string? Title { get; set; }
        public bool? TaskCompletionUpdate { get; set; }
    
    }
}
