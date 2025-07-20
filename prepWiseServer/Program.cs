
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http.Features;
using System.Text.Json;
using Microsoft.Extensions.FileProviders;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100MB
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: false));
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (true)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

// In Configure method (Startup.cs) or in Program.cs
app.UseStaticFiles();//added for wwwroot - files abilty in the prodject


app.UseAuthorization();

app.MapControllers();

app.Run();

