using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using EnhanzerSellsWebBackend.Data;
using EnhanzerSellsWebBackend.Models;

namespace EnhanzerSellsWebBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly AppDbContext _context; // Added the database context

        // Inject both the HttpClient and AppDbContext
        public AuthController(IHttpClientFactory httpClientFactory, AppDbContext context)
        {
            _httpClientFactory = httpClientFactory;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { Message = "Email and Password are required." });

            var apiPayload = new
            {
                API_Action = "GetLoginData",
                Device_Id = "D001",
                Sync_Time = "",
                Company_Code = request.Email,
                API_Body = new
                {
                    Username = request.Email,
                    Pw = request.Password
                }
            };

            var client = _httpClientFactory.CreateClient();
            var content = new StringContent(JsonSerializer.Serialize(apiPayload), Encoding.UTF8, "application/json");

            var endpoint = "https://ez-staging-api.azurewebsites.net/api/External_Api/POS_Api/Invoke";

            try
            {
                var response = await client.PostAsync(endpoint, content);
                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    return BadRequest(new { Message = "API connection failed.", Details = responseString });

                using var jsonDoc = JsonDocument.Parse(responseString);

                if (jsonDoc.RootElement.TryGetProperty("Status_Code", out JsonElement statusCodeElement) &&
                    statusCodeElement.TryGetInt32(out int statusCode) && statusCode == 200)
                {
                    // 1. Extract the Response_Body array
                    if (jsonDoc.RootElement.TryGetProperty("Response_Body", out JsonElement responseBody) && responseBody.GetArrayLength() > 0)
                    {
                        // 2. Extract the User_Locations array from inside Response_Body
                        var userLocations = responseBody[0].GetProperty("User_Locations");

                        // 3. Loop through and save to SQL Server
                        foreach (var location in userLocations.EnumerateArray())
                        {
                            var locCode = location.GetProperty("Location_Code").GetString();
                            var locName = location.GetProperty("Location_Name").GetString();

                            // 4. Ensure we don't save duplicate locations if the user logs in multiple times
                            if (locCode != null && locName != null && !_context.Location_Details.Any(l => l.Location_Code == locCode))
                            {
                                _context.Location_Details.Add(new LocationDetails
                                {
                                    Location_Code = locCode,
                                    Location_Name = locName
                                });
                            }
                        }

                        // Commit the transaction to the database
                        await _context.SaveChangesAsync();
                    }

                    return Ok(new
                    {
                        Message = "Login successful! Locations saved to SQL Server.",
                        RawData = jsonDoc.RootElement.Clone()
                    });
                }

                return BadRequest(new { Message = "Authentication failed.", Details = responseString });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Internal server error.", Details = ex.Message });
            }
        }
    }

    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}