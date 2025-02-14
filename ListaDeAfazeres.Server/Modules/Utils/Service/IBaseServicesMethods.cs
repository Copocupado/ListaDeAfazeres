namespace ListaDeAfazeres.Server.Modules.Utils.Service
{
    public interface IBaseServicesMethods<T>
        where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();

        Task<T?> GetByPrimaryKeyAsync(object keyValues);

        Task AddAsync(T entity);

        Task UpdateAsync(T entity);

        Task DeleteAsync(object keyValues);
    }
}
