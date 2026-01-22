# SignalR Backend Integration Guide

## Overview

This document provides C# backend integration requirements for the real-time data portal using ASP.NET Core SignalR.

## Prerequisites

- .NET 6.0 or higher
- Microsoft.AspNetCore.SignalR NuGet package

## Installation

```bash
dotnet add package Microsoft.AspNetCore.SignalR
```

## Hub Implementation

### 1. Create the RealtimeHub

Create `Hubs/RealtimeHub.cs`:

```csharp
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace YourNamespace.Hubs
{
    public class RealtimeHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("Connected", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
        }

        // Client can invoke this to request full data refresh
        public async Task RequestDataRefresh()
        {
            // Implement logic to send all current data
            await Clients.Caller.SendAsync("DataRefresh", GetAllData());
        }

        private object GetAllData()
        {
            // TODO: Implement your data retrieval logic
            return new { };
        }
    }
}
```

### 2. Configure SignalR in Program.cs (or Startup.cs)

```csharp
using YourNamespace.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add SignalR services
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(10);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// Configure CORS for SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("SignalRPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",  // Vite dev server
                "https://localhost:5173",
                "http://localhost:3000",
                "https://yourdomain.com"  // Production domain
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();  // Required for SignalR
    });
});

var app = builder.Build();

// Use CORS
app.UseCors("SignalRPolicy");

// Map SignalR hub endpoint
app.MapHub<RealtimeHub>("/realtimeHub");

app.Run();
```

## API Controller Integration

### 3. Emit Events from Controllers

Inject `IHubContext<RealtimeHub>` into your controllers to broadcast events.

#### Example: POST /data Endpoint

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using YourNamespace.Hubs;
using YourNamespace.Models;

[ApiController]
[Route("api/[controller]")]
public class DataController : ControllerBase
{
    private readonly IHubContext<RealtimeHub> _hubContext;
    private readonly IDataRepository _dataRepository;

    public DataController(IHubContext<RealtimeHub> hubContext, IDataRepository dataRepository)
    {
        _hubContext = hubContext;
        _dataRepository = dataRepository;
    }

    [HttpPost]
    public async Task<IActionResult> CreateData([FromBody] DataRecord record)
    {
        // Validate incoming data
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Save to database
        var savedRecord = await _dataRepository.CreateAsync(record);

        // Broadcast to all connected clients
        await _hubContext.Clients.All.SendAsync("DataCreated", new
        {
            id = savedRecord.Id,
            oid = savedRecord.OID,
            templateId = savedRecord.TemplateId,
            ivrInsurance = savedRecord.IVRInsurance,
            claimNo = savedRecord.ClaimNo,
            submittedAmount = savedRecord.SubmittedAmount,
            callStatus = savedRecord.CallStatus,
            dateOfService = savedRecord.DateOfService,
            callDuration = savedRecord.CallDuration,
            createdAt = savedRecord.CreatedAt,
            // Add other fields as needed
        });

        return CreatedAtAction(nameof(GetData), new { id = savedRecord.Id }, savedRecord);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetData(string id)
    {
        var record = await _dataRepository.GetByIdAsync(id);
        if (record == null)
            return NotFound();

        return Ok(record);
    }
}
```

#### Example: PATCH /data/:id/status Endpoint

```csharp
[HttpPatch("{id}/status")]
public async Task<IActionResult> UpdateDataStatus(string id, [FromBody] StatusUpdateRequest request)
{
    // Validate
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    // Update in database
    var updated = await _dataRepository.UpdateStatusAsync(id, request.Status);
    if (!updated)
        return NotFound();

    // Broadcast status update to all clients
    await _hubContext.Clients.All.SendAsync("DataStatusUpdated", new
    {
        id = id,
        templateId = updated.TemplateId,
        callStatus = request.Status,
        timestamp = DateTime.UtcNow
    });

    return Ok(new { success = true, id, status = request.Status });
}
```

#### Example: GET /data/:id/status (Direct DB Query)

```csharp
[HttpGet("{id}/status")]
public async Task<IActionResult> GetRecordStatus(string id)
{
    var record = await _dataRepository.GetByIdAsync(id);
    if (record == null)
        return NotFound();

    return Ok(new
    {
        id = record.Id,
        callStatus = record.CallStatus,
        verifiedAt = DateTime.UtcNow,
        notes = record.Notes
    });
}
```

## Data Models

### Example Data Record Model

```csharp
namespace YourNamespace.Models
{
    public class DataRecord
    {
        public string Id { get; set; }
        public string OID { get; set; }
        public string TemplateId { get; set; }
        public string IVRInsurance { get; set; }
        public string ClaimNo { get; set; }
        public decimal SubmittedAmount { get; set; }
        public string CallStatus { get; set; }  // "Completed", "Active", "Dropped"
        public DateTime DateOfService { get; set; }
        public int CallDuration { get; set; }  // in seconds
        public DateTime CreatedAt { get; set; }
        public string Notes { get; set; }
    }

    public class StatusUpdateRequest
    {
        public string Status { get; set; }
    }
}
```

## SignalR Hub Methods Expected by Frontend

The frontend expects these hub method names:

### 1. DataCreated

Emitted when a new record is created via POST /data.

**Payload:**

```json
{
  "id": "string",
  "oid": "string",
  "templateId": "string",
  "ivrInsurance": "string",
  "claimNo": "string",
  "submittedAmount": 0,
  "callStatus": "Active",
  "dateOfService": "2026-01-21T00:00:00Z",
  "callDuration": 120,
  "createdAt": "2026-01-21T10:30:00Z"
}
```

### 2. DataStatusUpdated

Emitted when a record's status is updated via PATCH /data/:id/status.

**Payload:**

```json
{
  "id": "string",
  "templateId": "string",
  "callStatus": "Completed",
  "timestamp": "2026-01-21T10:35:00Z"
}
```

## Testing the Integration

### 1. Test SignalR Connection

```bash
# Frontend will automatically connect to:
https://localhost:44395/realtimeHub
```

### 2. Test POST /data

```bash
curl -X POST https://localhost:44395/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "oid": "OID123",
    "templateId": "CLAIMS-001",
    "ivrInsurance": "Blue Cross",
    "claimNo": "CLM-2024-001",
    "submittedAmount": 1500.00,
    "callStatus": "Active",
    "dateOfService": "2024-01-15",
    "callDuration": 180
  }'
```

Expected: Frontend receives `DataCreated` event and displays new row.

### 3. Test PATCH /data/:id/status

```bash
curl -X PATCH https://localhost:44395/api/data/YOUR_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed"
  }'
```

Expected: Frontend receives `DataStatusUpdated` event and updates row.

## Environment Variables

Ensure your backend is running on the expected URLs:

- **Development:** `https://localhost:44395`
- **Production:** Update `VITE_API_URL` and `VITE_SIGNALR_HUB_URL` in frontend `.env.production`

## Troubleshooting

### CORS Issues

- Ensure `.AllowCredentials()` is set in CORS policy
- Verify origins match exactly (http vs https, port numbers)

### Connection Failures

- Check that hub endpoint is mapped: `app.MapHub<RealtimeHub>("/realtimeHub")`
- Verify SSL certificate is trusted
- Check firewall/network settings

### Events Not Received

- Verify hub method names match exactly: `DataCreated`, `DataStatusUpdated`
- Check payload structure matches frontend expectations
- Use browser DevTools > Network > WS tab to inspect WebSocket frames

## Security Considerations

### Authentication

Add authentication to SignalR hub:

```csharp
[Authorize]
public class RealtimeHub : Hub
{
    // Hub methods
}
```

### Authorization

Filter broadcasts to specific users/groups:

```csharp
// Send to specific user
await _hubContext.Clients.User(userId).SendAsync("DataCreated", data);

// Send to specific group
await _hubContext.Clients.Group(groupName).SendAsync("DataCreated", data);
```

## Additional Resources

- [ASP.NET Core SignalR Documentation](https://docs.microsoft.com/en-us/aspnet/core/signalr/)
- [SignalR JavaScript Client](https://docs.microsoft.com/en-us/aspnet/core/signalr/javascript-client)
- [SignalR Hubs](https://docs.microsoft.com/en-us/aspnet/core/signalr/hubs)

---

**Last Updated:** January 21, 2026  
**Contact:** Frontend Team - genesys-flow-professional project
