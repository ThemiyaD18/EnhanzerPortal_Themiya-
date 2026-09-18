using System;
using System.Collections.Generic; // Required for ICollection
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EnhanzerSellsWebBackend.Models // Updated to match your actual project
{
    public class PurchaseOrder
    {
        [Key]
        public string OrderNumber { get; set; } = string.Empty;

        public string Product { get; set; } = string.Empty;

        public DateTime DueDate { get; set; }

        public int DaysLate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal NetAmount { get; set; }

        public int NumberOfItems { get; set; }

        // Added this line so Entity Framework knows about the relationship
        public ICollection<PurchaseOrderItem>? Items { get; set; }
    }
}