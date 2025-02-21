// Este código implementa um repositório genérico na camada de acesso a dados de uma aplicação ASP.NET Core.
// O repositório fornece operações CRUD (Create, Read, Update, Delete) e suporte à paginação para qualquer entidade do tipo T.
// Ele utiliza o Entity Framework Core para interagir com o banco de dados

using ListaDeAfazeres.Server.Migrations;
using Microsoft.EntityFrameworkCore;

namespace ListaDeAfazeres.Server.Modules.Utils.Repository
{
    public class BaseRepository<T> : IBaseRepositoryMethods<T>
        where T : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<T> _dbSet;

        // Construtor que inicializa o contexto do banco de dados e o DbSet para a entidade T.
        public BaseRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        // Método para obter uma lista paginada de entidades, ordenada conforme a função fornecida.
        public async Task<IEnumerable<T>> GetAllPaginatedAsync(
            int pageNumber,
            int pageSize,
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy)
        {
            var query = orderBy(_dbSet);

            return await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        // Método para obter todas as entidades, ordenadas conforme a função fornecida.
        public async Task<IEnumerable<T>> GetAllAsync(
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy)
        {
            var query = orderBy(_dbSet);

            return await query.ToListAsync();
        }

        // Método para obter uma entidade pelo seu valor de chave primária.
        public async Task<T?> GetByPrimaryKeyAsync(object keyValues) => await _dbSet.FindAsync(keyValues);

        // Método para adicionar uma nova entidade ao DbSet.
        public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);

        // Método para remover uma entidade com base no seu valor de chave primária.
        public async Task DeleteAsync(object keyValues)
        {
            T? entity = await GetByPrimaryKeyAsync(keyValues);
            if (entity != null) _dbSet.Remove(entity);
        }

        // Método para salvar as alterações realizadas no contexto do banco de dados.
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

        // Método para atualizar uma entidade existente no DbSet.
        public async Task Update(T entity) => _dbSet.Update(entity);

        // Método para contar o número total de entidades no DbSet.
        public async Task<int> CountAsync() => await _dbSet.CountAsync();
    }
}
