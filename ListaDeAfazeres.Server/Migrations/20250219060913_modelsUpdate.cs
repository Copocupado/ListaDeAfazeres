using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListaDeAfazeres.Server.Migrations
{
    /// <inheritdoc />
    public partial class modelsUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ToDoTasks_CreatedAt",
                table: "ToDoTasks",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ToDoTasks_CreatedAt",
                table: "ToDoTasks");
        }
    }
}
