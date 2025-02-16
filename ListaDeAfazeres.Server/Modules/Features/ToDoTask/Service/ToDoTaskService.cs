using ListaDeAfazeres.Server.Modules.Features.ToDoTask.DTOs;
using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model;
using ListaDeAfazeres.Server.Modules.Utils.Repository;
using ListaDeAfazeres.Server.Modules.Utils.Service;

namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.Service
{
    public class ToDoTaskService : BaseService<ToDoTaskModel, ToDoTaskPostDTO>, IToDoTaskServiceMethods
    {
        public ToDoTaskService(IBaseRepositoryMethods<ToDoTaskModel> repository) : base(repository)
        {
        }

        public override string OnUniqueConstraintException => "Já existe uma tarefa com este título. Por favor, escolha um título diferente.";

        public override string OnForeignKeyException => "Esta tarefa não pode ser removida porque está vinculada a outra chave estrangeira";

        public override string OnOutOfBoundsFieldException => "Os campos informados excedem o limite de caracteres permitido.";

        public override string OnEntityNotFoundException => "Tarefa não encontrada. Verifique o ID e tente novamente.";
    }
}
