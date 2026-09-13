using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EnhanzerSellsWebBackend.Data;

namespace EnhanzerSellsWebBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LocationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetLocations()
        {
            // Fetches only the Location_Name column for the Batch dropdown
            var locations = await _context.Location_Details.Select(l => l.Location_Name).ToListAsync();
            return Ok(locations);
        }
    }
}