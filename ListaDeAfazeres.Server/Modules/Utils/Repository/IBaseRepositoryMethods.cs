﻿
namespace ListaDeAfazeres.Server.Modules.Utils.Repository
{
    public interface IBaseRepositoryMethods<T>
        where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> GetAllPaginatedAsync(int pageNumber, int pageSize);

        Task<T?> GetByPrimaryKeyAsync(object keyValues);  

        Task AddAsync(T entity);  

        Task DeleteAsync(object keyValues);

        Task Update(T entity);

        Task SaveChangesAsync();

        Task<int> CountAsync();
    }
}
