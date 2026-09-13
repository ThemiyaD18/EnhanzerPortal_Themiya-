using System.ComponentModel.DataAnnotations;

namespace EnhanzerSellsWebBackend.Models
{
    public class LocationDetails
    {
        [Key]
        public int Id { get; set; } // Primary key
        public required string Location_Code { get; set; }
        public required string Location_Name { get; set; }
    }
}