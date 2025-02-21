/* Este código define uma classe abstrata 'BaseController' que serve como controlador base na arquitetura de três camadas de uma aplicação ASP.NET Core.
 A arquitetura de três camadas é composta por:
 1. Camada de Apresentação (Controller): Responsável por lidar com as requisições HTTP e retornar respostas adequadas.
 2. Camada de Negócio (Service): Contém a lógica de negócios da aplicação.
 3. Camada de Dados (Repository): Gerencia o acesso e a persistência dos dados no banco de dados.
 O 'BaseController' fornece operações CRUD genéricas e paginadas para entidades que herdam de 'BaseModel'.
 Ele utiliza serviços que implementam a interface 'IBaseServicesMethods<T>' para realizar essas operações.*/

using ListaDeAfazeres.Server.Modules.Features.ToDoTask.Model;
using ListaDeAfazeres.Server.Modules.Utils.Model;
using ListaDeAfazeres.Server.Modules.Utils.Service;
using Microsoft.AspNetCore.Mvc;

namespace ListaDeAfazeres.Server.Modules.Utils.BaseController
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseController<T, IdType, UpdateDTOType, CreateDTOType> : ControllerBase
        where CreateDTOType : notnull
        where UpdateDTOType : notnull
        where IdType : notnull
        where T : BaseModel
    {
        protected readonly IBaseServicesMethods<T> _service;

        // Construtor que recebe uma implementação de 'IBaseServicesMethods<T>'.
        protected BaseController(IBaseServicesMethods<T> service)
        {
            _service = service;
        }

        // Método para obter entidades de forma paginada.
        [HttpGet("paginated")]
        public virtual async Task<ActionResult<PaginationModel<T>>> GetAllPaginated(
            [FromQuery] int? pageNumber,
            [FromQuery] int? pageSize)
        {
            try
            {
                int actualPageNumber = pageNumber ?? 1;
                int actualPageSize = pageSize ?? 10;

                IEnumerable<T> entities = await _service.GetAllPaginatedAsync(actualPageNumber, actualPageSize, DefaultOrderQuery());
                int totalCount = await _service.CountAsync();

                var result = new PaginationModel<T>
                {
                    Items = entities,
                    TotalCount = totalCount,
                    PageSize = actualPageSize,
                    CurrentPage = actualPageNumber
                };

                return Ok(result);
            }
            catch (BaseServiceException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Método para obter todas as entidades.
        [HttpGet("all")]
        public virtual async Task<ActionResult<IEnumerable<T>>> GetAllAsync()
        {
            try
            {
                IEnumerable<T> entities = await _service.GetAllAsync(DefaultOrderQuery());
                return Ok(entities);
            }
            catch (BaseServiceException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Método para obter uma entidade específica pelo ID.
        [HttpGet("{id}")]
        public virtual async Task<ActionResult<T>> Get([FromRoute] IdType id)
        {
            try
            {
                T? entity = await _service.GetByPrimaryKeyAsync(id);
                if (entity == null)
                    return NotFound("Item não encontrado");

                return Ok(entity);
            }
            catch (BaseServiceException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Método para criar uma nova entidade.
        [HttpPost]
        public virtual async Task<ActionResult<T>> Create([FromBody] CreateDTOType createDto)
        {
            try
            {
                T newEntity = GetModelFromCreateDTO(createDto);

                await _service.AddAsync(newEntity);
                return CreatedAtAction(nameof(Get), new { id = GetEntityId(newEntity) }, newEntity);
            }
            catch (BaseServiceException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // Método para deletar uma entidade pelo ID.
        [HttpDelete("{id}")]
        public virtual async Task<IActionResult> Delete([FromRoute] IdType id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return NoContent();
            }
            catch (BaseServiceException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // Método para atualizar uma entidade existente.
        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] IdType id, [FromBody] UpdateDTOType modelToUpdate)
        {
            try
            {
                T? existingEntity = await _service.GetByPrimaryKeyAsync(id);
                if (existingEntity == null)
                    return NotFound("Item não encontrado");

                existingEntity = GetModelFromUpdateDTO(existingEntity, modelToUpdate);
                await _service.UpdateAsync(existingEntity);
                return CreatedAtAction(nameof(Get), new { id = GetEntityId(existingEntity) }, existingEntity);
            }
            catch (BaseServiceException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        // Métodos abstratos que devem ser implementados nas classes derivadas para mapear DTOs para modelos e definir a ordenação padrão.
        protected abstract IdType GetEntityId(T entity);
        protected abstract T GetModelFromUpdateDTO(T oldEntity, UpdateDTOType updateDTO);
        protected abstract T GetModelFromCreateDTO(CreateDTOType createDTO);
        protected abstract Func<IQueryable<T>, IOrderedQueryable<T>> DefaultOrderQuery();
    }
}
