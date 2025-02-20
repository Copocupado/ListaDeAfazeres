using ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Service;
using ListaDeAfazeres.Server.Modules.Utils.BaseController;

namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.Controller
{
    public class ToDoTaskController(IToDoTaskServiceMethods service) : BaseController<ToDoTaskModel, int, ToDoTaskUpdateDTO, ToDoTaskCreateDTO>(service)
    {
        protected override ToDoTaskModel GetModelFromCreateDTO(ToDoTaskCreateDTO createDTO)
        {
            ToDoTaskModel newEntity = new() { Title = createDTO.Title };
            newEntity.MarkToDoTask(createDTO.isCompleted);

            return newEntity;
        }

        protected override ToDoTaskModel GetModelFromUpdateDTO(ToDoTaskModel oldEntity, ToDoTaskUpdateDTO updateDTO)
        {
            oldEntity.Title = updateDTO.Title ?? oldEntity.Title;
            if(updateDTO.isCompleted != null)
            {
                oldEntity.MarkToDoTask(updateDTO.isCompleted.Value);
            }
            return oldEntity;
        }

        protected override int GetEntityId(ToDoTaskModel entity)
        {
            return entity.Id;
        }

        protected override Func<IQueryable<ToDoTaskModel>, IOrderedQueryable<ToDoTaskModel>> DefaultOrderQuery()
        {
            return q => q.OrderByDescending(item => item.CreatedAt);
        }
    }
}
