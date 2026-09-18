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
        private readonly AppDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IHttpClientFactory httpClientFactory,
            AppDbContext context,
            ILogger<AuthController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _context = context;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { Message = "Email and Password are required." });

            var apiPayload = new
            {
                API_Action = "GetLoginData",
                // Was hardcoded as "D001" - the staging API appears to treat
                // Device_Id as a single-session slot, so reusing the same value
                // caused every login after the first to be rejected as invalid
                // even with correct credentials. Generate a fresh one each time.
                Device_Id = Guid.NewGuid().ToString(),
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

                _logger.LogInformation("Staging API raw response: {RawResponse}", responseString);

                if (!response.IsSuccessStatusCode)
                    return BadRequest(new { Message = "API connection failed.", Details = responseString });

                using var jsonDoc = JsonDocument.Parse(responseString);
                var root = jsonDoc.RootElement;

                // Status_Code 200 only confirms the external API call itself executed -
                // it does NOT mean the login credentials were accepted. The real
                // pass/fail result is inside Response_Body.
                var apiCallOk = root.TryGetProperty("Status_Code", out var statusEl)
                                 && statusEl.TryGetInt32(out var statusCode)
                                 && statusCode == 200;

                if (!apiCallOk)
                    return BadRequest(new { Message = "External API call failed.", Details = responseString });

                if (!root.TryGetProperty("Response_Body", out var responseBody) ||
                    responseBody.ValueKind != JsonValueKind.Array ||
                    responseBody.GetArrayLength() == 0)
                {
                    return BadRequest(new
                    {
                        Message = "Unexpected response format from login API.",
                        RawResponse = responseString
                    });
                }

                var firstEntry = responseBody[0];

                // If Doc_Msg is present, the staging API is reporting the login
                // itself failed (e.g. "Invalid Login Details") even though the
                // HTTP call succeeded. Surface that exact reason to the user.
                if (firstEntry.TryGetProperty("Doc_Msg", out var docMsgEl))
                {
                    var docMsg = docMsgEl.GetString() ?? "Login failed.";
                    return Unauthorized(new { Message = docMsg });
                }

                // No Doc_Msg present - treat this as a genuine successful login and
                // look for the locations array the assignment spec describes.
                JsonElement locationsElement = default;
                bool foundLocations =
                    firstEntry.TryGetProperty("User_Locations", out locationsElement) ||
                    firstEntry.TryGetProperty("Locations", out locationsElement) ||
                    root.TryGetProperty("User_Locations", out locationsElement);

                var savedLocations = new List<object>();

                if (foundLocations && locationsElement.ValueKind == JsonValueKind.Array)
                {
                    foreach (var location in locationsElement.EnumerateArray())
                    {
                        var locCode = location.TryGetProperty("Location_Code", out var lc) ? lc.GetString() : null;
                        var locName = location.TryGetProperty("Location_Name", out var ln) ? ln.GetString() : null;

                        if (locCode != null && locName != null)
                        {
                            savedLocations.Add(new { Location_Code = locCode, Location_Name = locName });

                            if (!_context.Location_Details.Any(l => l.Location_Code == locCode))
                            {
                                _context.Location_Details.Add(new LocationDetails
                                {
                                    Location_Code = locCode,
                                    Location_Name = locName
                                });
                            }
                        }
                    }

                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    Message = "Login successful!",
                    Token = "authenticated-session-token",
                    Locations = savedLocations,
                    RawData = root.Clone()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception during login");
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