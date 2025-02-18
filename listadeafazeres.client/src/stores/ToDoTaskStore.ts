import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ToDoTaskModel } from '@/models/ToDoTask/ToDoTaskModel';
import { ApiServices } from '@/models/utils/services/apiServices';
import { filterItems, type FilterCriteria } from '@/models/utils/services/filterService';
import { sortItems, type SortCriteria } from '@/models/utils/services/sortServices';

export class ToDoTaskDTO {
  constructor(
    public title: string,
    public isCompleted: boolean,
  ) {}
}

export const useToDoTaskStore = defineStore('toDoTask', () => {

  const mainTasksMap = ref(new Map<number, ToDoTaskModel>());

  const localTasksMap = ref(new Map<number, ToDoTaskModel>());

  const tasks = computed(() => {
    if(!isSortApplied.value) return Array.from(localTasksMap.value.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return Array.from(localTasksMap.value.values())
  });

  const isFilterApplied = ref(false);
  const isSortApplied = ref(false);
  const currentFilterCriteria = ref<FilterCriteria | null>(null);
  const currentSortCriteria = ref<SortCriteria | null>(null);

  const toDoTaskModelFactory = (data: any) => {
    return new ToDoTaskModel(
      data.id,
      data.title,
      new Date(data.createdAt),
      data.completedAt ? new Date(data.completedAt) : null
    );
  };

  const apiServices = new ApiServices<ToDoTaskModel, ToDoTaskDTO, number>('ToDoTask', toDoTaskModelFactory);

  function assignNewMainValue(newTaskArray: ToDoTaskModel[]) {
    mainTasksMap.value.clear();
    newTaskArray.forEach((taskData: ToDoTaskModel) => {
      mainTasksMap.value.set(taskData.id, taskData);
    });
    reapplyFiltersAndSort();
  }

  function assignNewLocalValue(newTaskArray: ToDoTaskModel[]){
    localTasksMap.value.clear();
    newTaskArray.forEach((taskData: ToDoTaskModel) => {
      localTasksMap.value.set(taskData.id, taskData);
    });
  }

  function resetLocalValue(){
    localTasksMap.value = new Map(mainTasksMap.value);
  }

  async function fetchAll() {
    const oldData = new Map(mainTasksMap.value);
    try {
      const tasksArray = await apiServices.fetchAll();
      assignNewMainValue(tasksArray);
    } catch (e) {
      mainTasksMap.value = oldData;
      resetLocalValue();
    }
  }

  async function addTask(task: ToDoTaskDTO) {
    const newTask = await apiServices.create(task);
    mainTasksMap.value.set(newTask.id, newTask);
    reapplyFiltersAndSort();
  }

  async function updateTask(id: number, updatedTask: ToDoTaskDTO) {
    const newlyUpdatedTask = await apiServices.update(id, updatedTask);
    mainTasksMap.value.set(newlyUpdatedTask.id, newlyUpdatedTask);
    reapplyFiltersAndSort();
  }

  async function getTask(id: number) {
    const task = await apiServices.read(id);
    mainTasksMap.value.set(task.id, task);
    reapplyFiltersAndSort();
  }

  async function removeTask(id: number) {
    await apiServices.delete(id);
    mainTasksMap.value.delete(id);
    reapplyFiltersAndSort();
  }

  function handleFilter(filterData: FilterCriteria) {
    isFilterApplied.value = true;
    currentFilterCriteria.value = filterData;
    
    if ((!filterData.dateRange || filterData.dateRange.length === 0) && !filterData.title && !filterData.completionStatus) {
      isFilterApplied.value = false;
      resetLocalValue();
      return;
    }

    resetLocalValue();
    let filteredTasks = Array.from(localTasksMap.value.values());

    if (filterData.dateRange && filterData.dateRange.length === 2) {
      filteredTasks = filterItems(filteredTasks, "createdAt", "greaterThan", filterData.dateRange[0]);
      filteredTasks = filterItems(filteredTasks, "createdAt", "lessThan", filterData.dateRange[1]);
    }

    if (filterData.title && filterData.title.trim() !== "") {
      filteredTasks = filterItems(filteredTasks, "title", "includes", filterData.title);
    }

    if (filterData.completionStatus) {
      // Se completado for selecionado, buscamos por todas as tarefas cujo createdAt não seja null e vice versa;
      const operator: ComparisonOperator = filterData.completionStatus === 'completed' ? 'notEquals' : 'equals';
      filteredTasks = filterItems(filteredTasks, 'completedAt', operator, null);
    }
    assignNewLocalValue(filteredTasks);
  }

  function handleSort(sortData: SortCriteria) {
    isSortApplied.value = true;
    currentSortCriteria.value = sortData;

    if (!sortData.option) {
      isSortApplied.value = false;
      return;
    }

    let orderedTasks = Array.from(localTasksMap.value.values());
    orderedTasks = sortItems(orderedTasks, "title", sortData.option);
    assignNewLocalValue(orderedTasks);
  }

  function reapplyFiltersAndSort() {
    if (isFilterApplied.value && currentFilterCriteria.value) {
      handleFilter(currentFilterCriteria.value);
    }
    if (isSortApplied.value && currentSortCriteria.value) {
      handleSort(currentSortCriteria.value);
    }
    if (!isFilterApplied.value && !isSortApplied.value) {
      resetLocalValue();
    }
  }

  return {
    tasks,
    assignNewLocalValue,
    resetLocalValue,
    fetchAll,
    addTask,
    updateTask,
    removeTask,
    getTask,
    handleFilter,
    handleSort,
    isFilterApplied,
    isSortApplied,
    currentFilterCriteria,
    currentSortCriteria,
  };
});
