using ListaDeAfazeres.Server.Modules.Utils;
using Microsoft.EntityFrameworkCore;
using NetCore.AutoRegisterDi;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


automaticallyRegisterServicesAndRepos(builder);

// Busca por todos os controladores
builder.Services.AddControllers()
    .AddApplicationPart(typeof(Program).Assembly)
    .AddControllersAsServices();


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

static void automaticallyRegisterServicesAndRepos(WebApplicationBuilder builder)
{
    builder.Services.RegisterAssemblyPublicNonGenericClasses(
        Assembly.GetExecutingAssembly())
    .Where(c => c.Name.EndsWith("Repository") || c.Name.EndsWith("Service"))
    .AsPublicImplementedInterfaces();

}