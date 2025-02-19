using ListaDeAfazeres.Server.Modules.Utils.Repository;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace ListaDeAfazeres.Server.Modules.Utils.Service
{
    public abstract class BaseService<T, DTOType>(IBaseRepositoryMethods<T> repository) : IBaseServicesMethods<T>
        where DTOType : notnull
        where T : class
    {
        private readonly IBaseRepositoryMethods<T> _repository = repository;

        public string OnCouldNotConnectToDatabaseException => "Erro ao conectar ao banco de dados. Por favor, tente novamente mais tarde.";
        abstract public string OnUniqueConstraintException { get; }
        abstract public string OnForeignKeyException { get; }
        abstract public string OnOutOfBoundsFieldException { get; }
        abstract public string OnEntityNotFoundException { get; }

        public async Task<IEnumerable<T>> GetAllAsync(Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null)
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx)
            {

                throw sqlEx.Number switch
                {
                    2601 or 2627 => new BaseServiceException(OnUniqueConstraintException),

                    547 => new BaseServiceException(OnForeignKeyException),

                    8152 => new BaseServiceException(OnOutOfBoundsFieldException),
                    _ => new BaseServiceException($"Erro de banco de dados: {sqlEx.Message}"),
                };
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new BaseServiceException("Erro de concorrência ao acessar o banco de dados.");
            }
            catch (SqlException ex) when (ex.Number == 53 || ex.Number == 18456 || ex.Number == 4060 || ex.Number == 10060)
            {
                throw new BaseServiceException(OnCouldNotConnectToDatabaseException);
            }
            catch (Exception ex)
            {
                throw new BaseServiceException($"Ocorreu um erro inesperado: {ex.Message}");
            }
        }

        public async Task<IEnumerable<T>> GetAllPaginatedAsync(int pageNumber, int pageSize, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null)
        {
            if (pageSize <= 0 || pageNumber <= 0)
            {
                throw new BaseServiceException("Erro de paginação: número de páginas ou tamanho da página não pode ser menor ou igual a 0.");
            }

            try
            {
                return await _repository.GetAllPaginatedAsync(pageNumber, pageSize);
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx)
            {
                throw sqlEx.Number switch
                {
                    2601 or 2627 => new BaseServiceException(OnUniqueConstraintException),

                    547 => new BaseServiceException(OnForeignKeyException),

                    8152 => new BaseServiceException(OnOutOfBoundsFieldException),
                    _ => new BaseServiceException($"Erro de banco de dados: {sqlEx.Message}"),
                };
            }
            catch (DbUpdateConcurrencyException)
            {

                throw new BaseServiceException("Erro de concorrência ao acessar o banco de dados.");
            }
            catch (SqlException ex) when (ex.Number == 53 || ex.Number == 18456 || ex.Number == 4060 || ex.Number == 10060)
            {

                throw new BaseServiceException(OnCouldNotConnectToDatabaseException);
            }
            catch (Exception ex)
            {

                throw new BaseServiceException($"Ocorreu um erro inesperado: {ex.Message}");
            }
        }

        public async Task<T?> GetByPrimaryKeyAsync(object keyValues)
        {
            return await _repository.GetByPrimaryKeyAsync(keyValues);
        }

        public async Task AddAsync(T entity)
        {
            try
            {
                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx)
            {
                switch (sqlEx.Number)
                {
                    case 2601: 
                    case 2627:
                        throw new BaseServiceException(OnUniqueConstraintException);

                    case 547: 
                        throw new BaseServiceException(OnForeignKeyException);

                    case 8152: 
                        throw new BaseServiceException(OnOutOfBoundsFieldException);

                    default:
                        throw;
                }
            }
            catch (SqlException ex) when (ex.Number == 53 || ex.Number == 18456 || ex.Number == 4060 || ex.Number == 10060)
            {
                throw new BaseServiceException(OnCouldNotConnectToDatabaseException);
            }
        }

        public async Task DeleteAsync(object keyValues)
        {
            try
            {
                var entity = await _repository.GetByPrimaryKeyAsync(keyValues) ?? throw new BaseServiceException(OnEntityNotFoundException);
                await _repository.DeleteAsync(keyValues);
                await _repository.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx)
            {
                switch (sqlEx.Number)
                {
                    case 547: 
                        throw new BaseServiceException(OnForeignKeyException);

                    default:
                        throw;
                }
            }
            catch (SqlException ex) when (ex.Number == 53 || ex.Number == 18456 || ex.Number == 4060 || ex.Number == 10060)
            {
                throw new BaseServiceException(OnCouldNotConnectToDatabaseException);
            }
        }

        public async Task UpdateAsync(T entity)
        {
            try
            {
                await _repository.Update(entity);
                await _repository.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx)
            {
                switch (sqlEx.Number)
                {
                    case 2601: 
                    case 2627:
                        throw new BaseServiceException(OnUniqueConstraintException);

                    case 547: 
                        throw new BaseServiceException(OnForeignKeyException);

                    case 8152: 
                        throw new BaseServiceException(OnOutOfBoundsFieldException);

                    default:
                        throw;
                }
            }
            catch (SqlException ex) when (ex.Number == 53 || ex.Number == 18456 || ex.Number == 4060 || ex.Number == 10060)
            {
                throw new BaseServiceException(OnCouldNotConnectToDatabaseException);
            }
        }

        public async Task<int> CountAsync()
        {
            try
            {
                return await _repository.CountAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx)
            {
                switch (sqlEx.Number)
                {
                    case 547: 
                        throw new BaseServiceException(OnForeignKeyException);
                    case 2601: 
                    case 2627:
                        throw new BaseServiceException(OnUniqueConstraintException);
                    case 8152:
                        throw new BaseServiceException(OnOutOfBoundsFieldException);
                    default:
                        throw;
                }
            }
            catch (SqlException ex) when (ex.Number == 53 || ex.Number == 18456 || ex.Number == 4060 || ex.Number == 10060)
            {
                throw new BaseServiceException(OnCouldNotConnectToDatabaseException);
            }
            catch (Exception ex)
            {
                throw new BaseServiceException($"Ocorreu um erro inesperado: {ex.Message}");
            }
        }
    }
}
