using ListaDeAfazeres.Server.Modules.Utils.Repository;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

// Este código define uma classe abstrata BaseService que implementa operações CRUD genéricas
// e tratamento de exceções específicas para serviços que interagem com um repositório de dados.


namespace ListaDeAfazeres.Server.Modules.Utils.Service
{
    public abstract class BaseService<T, DTOType> : IBaseServicesMethods<T>
        where DTOType : notnull
        where T : class
    {
        private readonly IBaseRepositoryMethods<T> _repository;

        protected BaseService(IBaseRepositoryMethods<T> repository)
        {
            _repository = repository;
        }

        // Mensagens de erro específicas para diferentes exceções
        protected abstract string OnUniqueConstraintException { get; }
        protected abstract string OnForeignKeyException { get; }
        protected abstract string OnOutOfBoundsFieldException { get; }
        protected abstract string OnEntityNotFoundException { get; }
        protected virtual string OnCouldNotConnectToDatabaseException => "Erro ao conectar ao banco de dados. Por favor, tente novamente mais tarde.";

        // Método auxiliar para executar ações com tratamento de exceções
        private async Task<TResult> ExecuteWithExceptionHandlingAsync<TResult>(Func<Task<TResult>> action)
        {
            try
            {
                return await action();
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx)
            {
                throw sqlEx.Number switch
                {
                    2601 or 2627 => new BaseServiceException(OnUniqueConstraintException), // Violação de restrição única
                    547 => new BaseServiceException(OnForeignKeyException), // Violação de chave estrangeira
                    8152 => new BaseServiceException(OnOutOfBoundsFieldException), // Excedeu o tamanho do campo
                    _ => new BaseServiceException($"Erro de banco de dados: {sqlEx.Message}"),
                };
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new BaseServiceException("Erro de concorrência ao acessar o banco de dados.");
            }
            catch (SqlException ex) when (ex.Number is 53 or 18456 or 4060 or 10060)
            {
                throw new BaseServiceException(OnCouldNotConnectToDatabaseException);
            }
            catch (Exception ex)
            {
                throw new BaseServiceException($"Ocorreu um erro inesperado: {ex.Message}");
            }
        }

        // Implementação dos métodos do serviço utilizando o método auxiliar

        public Task<IEnumerable<T>> GetAllAsync(Func<IQueryable<T>, IOrderedQueryable<T>> orderBy) =>
            ExecuteWithExceptionHandlingAsync(() => _repository.GetAllAsync(orderBy));

        public Task<IEnumerable<T>> GetAllPaginatedAsync(int pageNumber, int pageSize, Func<IQueryable<T>, IOrderedQueryable<T>> orderBy)
        {
            if (pageSize <= 0 || pageNumber <= 0)
            {
                throw new BaseServiceException("Erro de paginação: número de páginas ou tamanho da página não pode ser menor ou igual a 0.");
            }

            return ExecuteWithExceptionHandlingAsync(() => _repository.GetAllPaginatedAsync(pageNumber, pageSize, orderBy));
        }

        public Task<T?> GetByPrimaryKeyAsync(object keyValues) =>
            ExecuteWithExceptionHandlingAsync(() => _repository.GetByPrimaryKeyAsync(keyValues));

        public Task AddAsync(T entity) =>
            ExecuteWithExceptionHandlingAsync(async () =>
            {
                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();
                return Task.CompletedTask;
            });

        public Task DeleteAsync(object keyValues) =>
            ExecuteWithExceptionHandlingAsync(async () =>
            {
                var entity = await _repository.GetByPrimaryKeyAsync(keyValues) ?? throw new BaseServiceException(OnEntityNotFoundException);
                await _repository.DeleteAsync(keyValues);
                await _repository.SaveChangesAsync();
                return Task.CompletedTask;
            });

        public Task UpdateAsync(T entity) =>
            ExecuteWithExceptionHandlingAsync(async () =>
            {
                await _repository.Update(entity);
                await _repository.SaveChangesAsync();
                return Task.CompletedTask;
            });

        public Task<int> CountAsync() =>
            ExecuteWithExceptionHandlingAsync(() => _repository.CountAsync());
    }
}
