import { defineStore } from "pinia";
import { reactive, ref, computed } from "vue";
import { ToDoTaskModel } from "@/models/ToDoTask/ToDoTaskModel";
import { ApiServices, type PagedResult } from "@/models/utils/services/apiServices";
import { filterItems, type FilterCriteria } from "@/models/utils/services/filterService";
import { sortItems, type SortCriteria } from "@/models/utils/services/sortServices";
import { ToDoTaskStore } from "./models/ToDoTaskStore";

// DTO for creating/updating tasks
export class ToDoTaskDTO {
  constructor(
    public title: string,
    public isCompleted: boolean,
  ) {}
}

export const useToDoTaskStore = defineStore("toDoTask", () => {
  const tasks = new ToDoTaskStore();
  /*// mainRepo: full set of tasks fetched from DB (authoritative source)
  const mainRepo = reactive(new Map<number, ToDoTaskModel>());
  // tasksToDisplay: working set after applying filtering and sorting (full dataset)
  const tasksToDisplay = ref<ToDoTaskModel[]>([]);
  // localRepo: paginated slice of tasksToDisplay (displayed to the user)
  const localRepo = ref<ToDoTaskModel[]>([]);

  // Pagination state
  const currentPage = ref(0); // zero-based page index
  const pageSize = ref(10);
  const totalCount = ref(0);

  // Filtering & Sorting state
  const isFilterApplied = ref(false);
  const currentFilter = ref<FilterCriteria | null>(null);
  const isSortApplied = ref(false);
  const currentSort = ref<SortCriteria | null>(null);

  // Optional: store last paginated result (if needed)
  const lastPaginatedResult = ref<PagedResult<ToDoTaskModel> | null>(null);

  // Expose tasks for UI (paginated view)
  const tasks = computed(() => localRepo.value);

  // API service configuration and model factory
  function toDoTaskModelFactory(data: any): ToDoTaskModel {
    return new ToDoTaskModel(
      data.id,
      data.title,
      new Date(data.createdAt),
      data.completedAt ? new Date(data.completedAt) : null,
    );
  }

  const apiServices = new ApiServices<ToDoTaskModel, ToDoTaskDTO, number>(
    "ToDoTask",
    toDoTaskModelFactory,
  );

  // --- Helpers ---

  // Default sort: by createdAt descending (latest first)
  function sortByCreatedAtDescending(arr: ToDoTaskModel[]): ToDoTaskModel[] {
    return arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Rebuild tasksToDisplay from mainRepo:
  // Start with all tasks from mainRepo (sorted by default),
  // then apply any active filters and extra sort.
  function updateTasksToDisplayFromMain() {
    let arr = Array.from(mainRepo.values());
    // Default sort by creation date descending
    arr = sortByCreatedAtDescending(arr);

    // Apply filtering if active
    if (isFilterApplied.value && currentFilter.value) {
      arr = applyFilter(arr, currentFilter.value);
    }
    // Apply additional sort if provided (e.g. by title)
    if (isSortApplied.value && currentSort.value) {
      arr = applySort(arr, currentSort.value);
    }
    tasksToDisplay.value = arr;
    totalCount.value = arr.length;
    updateLocalRepo();
  }

  // Update localRepo: take a paginated slice of tasksToDisplay.
  function updateLocalRepo() {
    const startAt = currentPage.value * pageSize.value;
    const endAt = startAt + pageSize.value;
    localRepo.value = tasksToDisplay.value.slice(startAt, endAt);
  }

  // Filtering helper – using filterItems or custom logic.
  function applyFilter(tasks: ToDoTaskModel[], filter: FilterCriteria): ToDoTaskModel[] {
    let filtered = tasks;
    if (filter.dateRange && filter.dateRange.length === 2) {
      filtered = filterItems(filtered, "createdAt", "greaterThan", filter.dateRange[0]);
      filtered = filterItems(filtered, "createdAt", "lessThan", filter.dateRange[1]);
    }
    if (filter.title && filter.title.trim() !== "") {
      filtered = filterItems(filtered, "title", "includes", filter.title);
    }
    if (filter.completionStatus) {
      if (filter.completionStatus === "completed") {
        filtered = filtered.filter((task) => task.completedAt !== null);
      } else if (filter.completionStatus === "uncompleted") {
        filtered = filtered.filter((task) => task.completedAt === null);
      }
    }
    return filtered;
  }

  // Sorting helper – using sortItems utility (for example, by title)
  function applySort(tasks: ToDoTaskModel[], sortCriteria: SortCriteria): ToDoTaskModel[] {
    return sortItems(tasks, "title", sortCriteria.option ?? undefined);
  }

  // --- API & CRUD Operations ---

  // fetchAll(): Load all tasks from API and update repos.
  async function fetchAll() {
    try {
      const allTasks = await apiServices.fetchAll();
      mainRepo.clear();
      allTasks.forEach((task) => mainRepo.set(task.id, task));
      updateTasksToDisplayFromMain();
    } catch (e) {
      console.error("Error fetching all tasks", e);
    }
  }

  // fetchPaginated(): Fetch a specific page if tasks for that page are not already available.
  async function fetchPaginated(page: number, size: number) {
    // Update pagination parameters
    currentPage.value = page;
    pageSize.value = size;

    // Recalculate local view from tasksToDisplay
    updateLocalRepo();
    const localCount = localRepo.value.length;
    // If localRepo is empty (or incomplete) but we expect data, fetch from API.
    if (localCount === 0) {
      try {
        console.log("Fetching paginated data from API...");
        // Note: API might use 1-based indexing
        const paginatedResult = await apiServices.fetchAllPaginated(page + 1, size);
        if (paginatedResult) {
          // Add the fetched tasks to mainRepo
          paginatedResult.items.forEach((task) => {
            mainRepo.set(task.id, task);
          });
          lastPaginatedResult.value = paginatedResult;
          // Update tasksToDisplay after new data arrives
          updateTasksToDisplayFromMain();
        }
      } catch (e) {
        console.error("Error fetching paginated data", e);
      }
    } else {
      // Data for the requested page already exists locally.
      updateLocalRepo();
    }
  }

  // --- CRUD Operations ---

  async function addTask(dto: ToDoTaskDTO) {
    try {
      const newTask = await apiServices.create(dto);
      mainRepo.set(newTask.id, newTask);
      updateTasksToDisplayFromMain();
    } catch (e) {
      console.error("Error adding task", e);
    }
  }

  async function updateTask(id: number, dto: ToDoTaskDTO) {
    try {
      const updatedTask = await apiServices.update(id, dto);
      mainRepo.set(updatedTask.id, updatedTask);
      updateTasksToDisplayFromMain();
    } catch (e) {
      console.error("Error updating task", e);
    }
  }

  async function removeTask(id: number) {
    try {
      await apiServices.delete(id);
      mainRepo.delete(id);
      updateTasksToDisplayFromMain();
    } catch (e) {
      console.error("Error removing task", e);
    }
  }

  async function getTask(id: number) {
    try {
      const task = await apiServices.read(id);
      mainRepo.set(task.id, task);
      updateTasksToDisplayFromMain();
    } catch (e) {
      console.error("Error getting task", e);
    }
  }

  // --- Filtering & Sorting ---

  function handleFilter(filterData: FilterCriteria) {
    if (!filterData.dateRange && !filterData.title && !filterData.completionStatus) {
      isFilterApplied.value = false;
      currentFilter.value = null;
    } else {
      isFilterApplied.value = true;
      currentFilter.value = filterData;
    }
    // Reset pagination when filter changes
    currentPage.value = 0;
    updateTasksToDisplayFromMain();
  }

  function handleSort(sortData: SortCriteria) {
    if (!sortData.option) {
      isSortApplied.value = false;
      currentSort.value = null;
    } else {
      isSortApplied.value = true;
      currentSort.value = sortData;
    }
    // Reset pagination when sort changes
    currentPage.value = 0;
    updateTasksToDisplayFromMain();
  }

  // --- Pagination Controls ---

  function setPage(page: number) {
    currentPage.value = page;
    updateLocalRepo();
  }

  function setPageSize(size: number) {
    pageSize.value = size;
    currentPage.value = 0;
    updateLocalRepo();
  }

  return {
    // Repositories and state
    tasks, // Final paginated tasks for UI
    mainRepo, // Full dataset from DB
    tasksToDisplay, // Filtered and sorted working set
    localRepo, // Paginated slice for display
    currentPage,
    pageSize,
    totalCount,
    lastPaginatedResult,
    // CRUD operations
    fetchAll,
    fetchPaginated,
    addTask,
    updateTask,
    removeTask,
    getTask,
    // Filtering & Sorting
    isFilterApplied,
    currentFilter,
    isSortApplied,
    currentSort,
    handleFilter,
    handleSort,
    // Pagination controls
    setPage,
    setPageSize,
  };*/ return { tasks };
});
