namespace ListaDeAfazeres.Server.Modules.Utils.Service
{
    public interface IBaseServicesMethods<T>
        where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> GetAllPaginatedAsync(int pageNumber, int pageSize);

        Task<T?> GetByPrimaryKeyAsync(object keyValues);

        Task AddAsync(T entity);

        Task UpdateAsync(T entity);

        Task DeleteAsync(object keyValues);

        Task<int> CountAsync();
    }
}
