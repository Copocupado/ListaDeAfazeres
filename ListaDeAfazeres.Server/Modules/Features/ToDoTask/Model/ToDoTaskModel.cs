using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs;
using ListaDeAfazeres.Server.Modules.Utils.Model;

namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model
{
    public class ToDoTaskModel : BaseModel
    {
        public ToDoTaskModel() {}

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

        public override void UpdateFromDto(object updateValues)
        {
            var dto = (ToDoTaskUpdateDto)updateValues;

            Title = dto.Title ?? Title;

            if (dto.TaskCompletionUpdate != null)
            {
                MarkToDoTask(dto.TaskCompletionUpdate.Value);
            }
        }
    }
}
