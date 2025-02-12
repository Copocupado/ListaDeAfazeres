using ListaDeAfazeres.Server.Modules.Utils.Repository;
using Microsoft.EntityFrameworkCore;
using System;

public class BaseRepository<T> : BaseRepositoryMethods<T> where T : class
{
    private readonly DbContext _context; // Dependency Injection
    private readonly DbSet<T> _dbSet;

    public BaseRepository(DbContext context)
    {
        _context = context;
        _dbSet = _context.Set<T>();
    }

    public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();

    public async Task<T?> GetByPrimaryKeyAsync(object keyValues)
    {
        return await _dbSet.FindAsync(keyValues);  // Suporta chaves primarias únicas e compostas
    }

    public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);

    public async Task DeleteAsync(object keyValues)
    {
        var entity = await GetByPrimaryKeyAsync(keyValues);
        if (entity != null) _dbSet.Remove(entity);
    }

    public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

    public async Task Update(T entity) => _dbSet.Update(entity); // Mantido async apenas para padrão de estrutura, a função não é assíncrona
    
}
