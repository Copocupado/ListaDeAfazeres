namespace ListaDeAfazeres.Server.Modules.Utils.Service
{
    public interface IBaseServicesMethods<T>
        where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null);
        Task<IEnumerable<T>> GetAllPaginatedAsync(int pageNumber, int pageSize, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null);

        Task<T?> GetByPrimaryKeyAsync(object keyValues);

        Task AddAsync(T entity);

        Task UpdateAsync(T entity);

        Task DeleteAsync(object keyValues);

        Task<int> CountAsync();
    }
}
