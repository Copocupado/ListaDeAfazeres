// Ignore Spelling: Afazeres Lista

using TypeGen.Core.TypeAnnotations;

namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs
{
    [ExportTsClass]
    public class ToDoTaskUpdateDTO
    {
        public string? Title { get; set; }
        public bool? isCompleted { get; set; }

    }

}
