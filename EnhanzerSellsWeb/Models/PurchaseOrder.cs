using System;
using System.ComponentModel.DataAnnotations;

namespace YourProjectNamespace.Models // Replace with your actual namespace
{
    public class PurchaseOrder
    {
        [Key]
        public string OrderNumber { get; set; }

        public string Product { get; set; }

        public DateTime DueDate { get; set; }

        public int DaysLate { get; set; }
    }
}