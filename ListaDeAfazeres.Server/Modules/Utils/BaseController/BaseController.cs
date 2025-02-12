using ListaDeAfazeres.Server.Modules.Utils.Service;
using Microsoft.AspNetCore.Mvc;

namespace ListaDeAfazeres.Server.Modules.Utils.BaseController
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseController<T> : ControllerBase where T : class
    {
        protected readonly BaseServicesMethods<T> _service;

        public BaseController(BaseServicesMethods<T> service)
        {
            _service = service;
        }

        // GET: api/[controller]
        [HttpGet]
        public virtual async Task<ActionResult<IEnumerable<T>>> GetAll()
        {
            var entities = await _service.GetAllAsync();
            return Ok(entities);
        }

        // GET: api/[controller]/5
        [HttpGet("{id}")]
        public virtual async Task<ActionResult<T>> Get(object id)
        {
            var entity = await _service.GetByPrimaryKeyAsync(id);
            if (entity == null)
                return NotFound();

            return Ok(entity);
        }

        // POST: api/[controller]
        [HttpPost]
        public virtual async Task<ActionResult<T>> Create([FromBody] T newEntity)
        {
            await _service.AddAsync(newEntity);
            return CreatedAtAction(nameof(Get), new { id = GetEntityId(newEntity) }, newEntity);
        }

        // DELETE: api/[controller]/5
        [HttpDelete("{id}")]
        public virtual async Task<IActionResult> Delete(object id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
        protected abstract object? GetEntityId(T entity);
    }
}
