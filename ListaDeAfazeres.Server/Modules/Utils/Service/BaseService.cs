using ListaDeAfazeres.Server.Modules.Utils.Repository;
using Microsoft.EntityFrameworkCore;

namespace ListaDeAfazeres.Server.Modules.Utils.Service
{
    public class BaseService<T> : BaseServicesMethods<T> where T : class
    {
        private readonly BaseRepositoryMethods<T> _repository;

        public BaseService(BaseRepositoryMethods<T> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<T?> GetByPrimaryKeyAsync(object keyValues)
        {
            return await _repository.GetByPrimaryKeyAsync(keyValues);
        }

        public async Task AddAsync(T entity)
        {
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(object keyValues)
        {
            await _repository.DeleteAsync(keyValues);
            await _repository.SaveChangesAsync();
        }

        public async Task Update(T entity) => await _repository.Update(entity);
    }

}
