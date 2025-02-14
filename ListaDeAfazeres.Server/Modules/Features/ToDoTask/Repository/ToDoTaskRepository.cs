using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model;
using ListaDeAfazeres.Server.Modules.Utils;
using ListaDeAfazeres.Server.Modules.Utils.Repository;

namespace ListaDeAfazeres.Server.Modules.Features.ToDoTask.Repository
{
    public class ToDoTaskRepository : BaseRepository<ToDoTaskModel>, IToDoTaskRepositoryMethods
    {
        public ToDoTaskRepository(AppDbContext context) : base(context) { }

        // Implementação dos métodos customizados vem aqui
    }
}
