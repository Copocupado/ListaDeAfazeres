using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model;
using Microsoft.EntityFrameworkCore;

// *** Comandos importantes *** //

// dotnet ef migrations add modelsUpdate -> Cria as tabelas no banco de dados mas não aplica as alterações
// dotnet ef database update -> Aplica as alterações

namespace ListaDeAfazeres.Server.Migrations
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {

        // Crie novas tabelas conforme forem surgindo
        public DbSet<ToDoTaskModel> ToDoTasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);



            // *** ToDoTask *** //

            modelBuilder.Entity<ToDoTaskModel>()
                .HasIndex(t => t.Title)
                .IsUnique(); // index que evita duplicação de tarefas com o exato mesmo título

            modelBuilder.Entity<ToDoTaskModel>()
                .HasIndex(t => t.CreatedAt); // agiliza na busca por tarefas

            // *** ToDoTask *** //
        }
    }
}
