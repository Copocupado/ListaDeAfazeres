import { ToDoTaskDTO, ToDoTaskModel } from "@/models/ToDoTask/ToDoTaskModel";
import { BaseStoreModel } from "./utils/baseModel";
import { filterItems } from "@/models/utils/services/filterService";
import { sortItems } from "@/models/utils/services/sortServices";

export class ToDoTaskStore extends BaseStoreModel<ToDoTaskModel, ToDoTaskDTO, number> {
  constructor() {
    super(
      "ToDoTask",
      (data: any) => new ToDoTaskModel(data.id, data.title, data.createdAt, data.completedAt),
    );
  }
  protected defaultSortingFunction(items: ToDoTaskModel[]): ToDoTaskModel[] {
    return items.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }
  protected applyFilters(items: ToDoTaskModel[]): ToDoTaskModel[] {
    let filtered = items;
    if (this.currentFilters != null && this.currentFilters != null) {
      if (this.currentFilters.dateRange && this.currentFilters.dateRange.length === 2) {
        filtered = filterItems(
          filtered,
          "createdAt",
          "greaterThan",
          this.currentFilters.dateRange[0],
        );
        filtered = filterItems(filtered, "createdAt", "lessThan", this.currentFilters.dateRange[1]);
      }
      if (this.currentFilters.title && this.currentFilters.title.trim() !== "") {
        filtered = filterItems(filtered, "title", "includes", this.currentFilters.title);
      }
      if (this.currentFilters.completionStatus) {
        if (this.currentFilters.completionStatus === "completed") {
          filtered = filtered.filter((task) => task.completedAt !== null);
        } else if (this.currentFilters.completionStatus === "uncompleted") {
          filtered = filtered.filter((task) => task.completedAt === null);
        }
      }
    }
    return filtered;
  }

  protected applySorts(items: ToDoTaskModel[]): ToDoTaskModel[] {
    let sortedItems = items;
    if (this.currentSorts != null && this.currentSorts != null) {
      sortedItems = sortItems(items, "title", this.currentSorts.option ?? undefined);
    }
    return sortedItems;
  }
  protected getModelsId(item: ToDoTaskModel): number {
    return item.id;
  }
}
