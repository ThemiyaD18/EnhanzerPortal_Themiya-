using EnhanzerSellsWebBackend.Models;
using Microsoft.EntityFrameworkCore;
using YourProjectNamespace.Models;

namespace EnhanzerSellsWebBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // This creates the Location_Details table
        public DbSet<LocationDetails> Location_Details { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
    }
}