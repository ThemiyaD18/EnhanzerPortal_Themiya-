using System.ComponentModel.DataAnnotations;

namespace EnhanzerSellsWebBackend.Models
{
    public class LocationDetails
    {
        [Key]
        public int Id { get; set; } // Primary key
        public required string Location_Code { get; set; }
        public required string Location_Name { get; set; }

        // Provide a default value so object initializers that don't set Orders
        // won't trigger the C# required-member compile-time error.

    }
}