using ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Service;
using ListaDeAfazeres.Server.Modules.Utils.BaseController;

namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.Controller
{
    public class ToDoTaskController(IToDoTaskServiceMethods service) : BaseController<ToDoTaskModel, int, ToDoTaskUpdateDto>(service)
    {
        protected override int GetEntityId(ToDoTaskModel entity)
        {
            return entity.Id;
        }
    }
}
