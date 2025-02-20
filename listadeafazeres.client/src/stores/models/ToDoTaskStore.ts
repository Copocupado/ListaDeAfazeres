import { ToDoTaskModel } from "@/models/ToDoTask/ToDoTaskModel";
import { BaseStoreModel } from "./utils/baseModel";
import type { ToDoTaskDTO } from "../ToDoTaskStore";
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
    if (this.currentFilters != null && this.currentFilters.value != null) {
      if (this.currentFilters.value.dateRange && this.currentFilters.value.dateRange.length === 2) {
        filtered = filterItems(
          filtered,
          "createdAt",
          "greaterThan",
          this.currentFilters.value.dateRange[0],
        );
        filtered = filterItems(
          filtered,
          "createdAt",
          "lessThan",
          this.currentFilters.value.dateRange[1],
        );
      }
      if (this.currentFilters.value.title && this.currentFilters.value.title.trim() !== "") {
        filtered = filterItems(filtered, "title", "includes", this.currentFilters.value.title);
      }
      if (this.currentFilters.value.completionStatus) {
        if (this.currentFilters.value.completionStatus === "completed") {
          filtered = filtered.filter((task) => task.completedAt !== null);
        } else if (this.currentFilters.value.completionStatus === "uncompleted") {
          filtered = filtered.filter((task) => task.completedAt === null);
        }
      }
    }
    return filtered;
  }

  protected applySorts(items: ToDoTaskModel[]): ToDoTaskModel[] {
    let sortedItems = items;
    if (this.currentSorts != null && this.currentSorts.value != null) {
      sortedItems = sortItems(items, "title", this.currentSorts.value.option ?? undefined);
    }
    return sortedItems;
  }
  protected getModelsId(item: ToDoTaskModel): number {
    return item.id;
  }
}
