using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EnhanzerSellsWebBackend.Models
{
    public class PurchaseOrderItem
    {
        [Key]
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }

        [ForeignKey("OrderNumber")]
        public PurchaseOrder? PurchaseOrder { get; set; }
    }
}