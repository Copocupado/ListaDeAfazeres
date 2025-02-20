using ListaDeAfazeres.Server.Migrations;
using Microsoft.EntityFrameworkCore;

namespace ListaDeAfazeres.Server.Modules.Utils.Repository
{
    public class BaseRepository<T> : IBaseRepositoryMethods<T>
        where T : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<T> _dbSet;

        public BaseRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

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

        public async Task<IEnumerable<T>> GetAllAsync(
            Func<IQueryable<T>, IOrderedQueryable<T>> orderBy)
        {
            var query = orderBy(_dbSet);

            return await query.ToListAsync();
        }

        public async Task<T?> GetByPrimaryKeyAsync(object keyValues) => await _dbSet.FindAsync(keyValues);

        public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);

        public async Task DeleteAsync(object keyValues)
        {
            T? entity = await GetByPrimaryKeyAsync(keyValues);
            if (entity != null) _dbSet.Remove(entity);
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

        public async Task Update(T entity) => _dbSet.Update(entity);

        public async Task<int> CountAsync() => await _dbSet.CountAsync();
    }
}