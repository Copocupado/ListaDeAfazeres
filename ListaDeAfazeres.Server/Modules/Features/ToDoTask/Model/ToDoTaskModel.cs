using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs;
using ListaDeAfazeres.Server.Modules.Utils.Model;
using TypeGen.Core.TypeAnnotations;

namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model
{
    [ExportTsClass]
    public class ToDoTaskModel : BaseModel
    {
        public ToDoTaskModel() {}

        public ToDoTaskModel(ToDoTaskCreateDTO dto)
        {
            Title = dto.Title;
            MarkToDoTask(dto.isCompleted);
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; private set; }

        required public string Title { get; set; }

        public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }

        public void MarkToDoTask(bool isCompleted)
        {
            CompletedAt = isCompleted ? DateTime.UtcNow : null;
        }
    }
}
