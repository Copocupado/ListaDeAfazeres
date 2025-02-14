using ListaDeAfazeres.Server.Modules.Utils.Model;
using ListaDeAfazeres.Server.Modules.Utils.Service;
using Microsoft.AspNetCore.Mvc;

namespace ListaDeAfazeres.Server.Modules.Utils.BaseController
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseController<T, IdType, DTOType>(IBaseServicesMethods<T> service) : ControllerBase
        where DTOType : notnull
        where IdType : notnull
        where T : BaseModel
    {
        protected readonly IBaseServicesMethods<T> _service = service;

        [HttpGet]
        public virtual async Task<ActionResult<IEnumerable<T>>> GetAll()
        {
            try
            {
                var entities = await _service.GetAllAsync();
                return Ok(entities);
            }
            catch (BaseServiceException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public virtual async Task<ActionResult<T>> Get([FromRoute] IdType id)
        {
            try
            {
                var entity = await _service.GetByPrimaryKeyAsync(id);
                if (entity == null)
                    return NotFound("Tarefa não encontrada");

                return Ok(entity);
            }
            catch (BaseServiceException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public virtual async Task<ActionResult<T>> Create([FromBody] T newEntity)
        {
            try
            {
                await _service.AddAsync(newEntity);
                return CreatedAtAction(nameof(Get), new { id = GetEntityId(newEntity) }, newEntity);
            }
            catch (BaseServiceException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

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

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] IdType id, [FromBody] DTOType modelToUpdate)
        {
            try
            {
                T? existingTask = await _service.GetByPrimaryKeyAsync(id);
                if (existingTask == null)
                    return NotFound("Tarefa não encontrada");

                existingTask.UpdateFromDto(modelToUpdate);
                await _service.UpdateAsync(existingTask);
                return NoContent();
            }
            catch (BaseServiceException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        protected abstract IdType GetEntityId(T entity);
    }
}
