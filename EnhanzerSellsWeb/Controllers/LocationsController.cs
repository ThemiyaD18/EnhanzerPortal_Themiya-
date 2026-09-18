using EnhanzerSellsWebBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
// Keep your existing using statements...

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

        // --- Add these new endpoints for the Dashboard Widgets ---

        // 1. Get Latest 5 Purchase Orders
        [HttpGet("~/api/Location/GetLatestPurchaseOrders")]
        public async Task<IActionResult> GetLatestPurchaseOrders()
        {
            var orders = await _context.PurchaseOrders
                .OrderByDescending(o => o.OrderNumber)
                .Take(5)
                .Select(o => new {
                    purchaseOrderId = o.OrderNumber,
                    netAmount = o.NetAmount,
                    numberOfItems = o.NumberOfItems
                })
                .ToListAsync();

            return Ok(orders);
        }

        // 2. Get Oldest 10 Purchase Order Items
        [HttpGet("~/api/Location/GetOldestPurchaseOrderItems")]
        public async Task<IActionResult> GetOldestPurchaseOrderItems()
        {
            var items = await _context.PurchaseOrderItems
                .OrderBy(i => i.Id)
                .Take(10)
                .Select(i => new {
                    purchaseOrderId = i.OrderNumber,
                    itemName = i.ItemName,
                    quantity = i.Quantity
                })
                .ToListAsync();

            return Ok(items);
        }

        // 3. Get Item Quantity Distribution for Donut Chart
        [HttpGet("~/api/Location/GetItemQuantityDistribution")]
        public async Task<IActionResult> GetItemQuantityDistribution()
        {
            var distribution = await _context.PurchaseOrderItems
                .GroupBy(i => i.ItemName)
                .Select(g => new {
                    itemName = g.Key,
                    totalQuantity = g.Sum(i => i.Quantity)
                })
                .ToListAsync();

            return Ok(distribution);
        }
    }
}