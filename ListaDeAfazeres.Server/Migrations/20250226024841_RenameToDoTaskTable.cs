using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ListaDeAfazeres.Server.Migrations
{
    /// <inheritdoc />
    public partial class RenameToDoTaskTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ToDoTasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ToDoTasks", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ToDoTasks_CreatedAt",
                table: "ToDoTasks",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ToDoTasks_Title",
                table: "ToDoTasks",
                column: "Title",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ToDoTasks");
        }
    }
}
