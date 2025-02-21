using ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model;
using ListaDeAfazeres.Server.Modules.Utils.Repository;
using ListaDeAfazeres.Server.Modules.Utils.Service;

namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.Service
{
    public class ToDoTaskService(IBaseRepositoryMethods<ToDoTaskModel> repository) : BaseService<ToDoTaskModel, ToDoTaskUpdateDTO>(repository), IToDoTaskServiceMethods
    {
        protected override string OnUniqueConstraintException => "Já existe uma tarefa com este título. Por favor, escolha um título diferente.";

        protected override string OnForeignKeyException => "Esta tarefa não pode ser removida porque está vinculada a outra chave estrangeira";

        protected override string OnOutOfBoundsFieldException => "Os campos informados excedem o limite de caracteres permitido.";

        protected override string OnEntityNotFoundException => "Tarefa não encontrada. Verifique o ID e tente novamente.";
    }
}
