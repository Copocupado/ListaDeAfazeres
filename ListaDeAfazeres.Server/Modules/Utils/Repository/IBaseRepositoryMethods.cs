
namespace ListaDeAfazeres.Server.Modules.Utils.Repository
{
    public interface IBaseRepositoryMethods<T>
        where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(Func<IQueryable<T>, IOrderedQueryable<T>> orderBy);
        Task<IEnumerable<T>> GetAllPaginatedAsync(int pageNumber, int pageSize, Func<IQueryable<T>, IOrderedQueryable<T>> orderBy);
        Task<T?> GetByPrimaryKeyAsync(object keyValues);
        Task AddAsync(T entity);
        Task DeleteAsync(object keyValues);
        Task Update(T entity);
        Task SaveChangesAsync();
        Task<int> CountAsync();
    }
}
