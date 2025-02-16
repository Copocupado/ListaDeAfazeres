using TypeGen.Core.TypeAnnotations;

namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs
{
    [ExportTsClass]
    public class ToDoTaskPostDTO
    {
        public string? Title { get; set; }
        public bool? TaskCompletionUpdate { get; set; }

    }
}
