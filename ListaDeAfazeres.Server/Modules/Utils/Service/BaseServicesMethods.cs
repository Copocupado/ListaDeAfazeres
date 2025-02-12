namespace ListaDeAfazeres.Server.Modules.Utils.Service
{
    public interface BaseServicesMethods<T>
    {
        Task<IEnumerable<T>> GetAllAsync();

        Task<T?> GetByPrimaryKeyAsync(object keyValues);

        Task AddAsync(T entity);

        Task Update(T entity);

        Task DeleteAsync(object keyValues);
    }
}
