import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ToDoTaskModel } from '@/models/ToDoTask/ToDoTaskModel';
import { Services } from '@/models/utils/services/service';

export class ToDoTaskDTO {
  constructor(
    public title: string,
    public isCompleted: boolean,
  ) {}
}

export const useToDoTaskStore = defineStore('toDoTask', () => {
  const _tasksMap = ref(new Map<number, ToDoTaskModel>());

  const tasks = computed(() => Array.from(_tasksMap.value.values()));

  const toDoTaskModelFactory = (data: any) => {
    return new ToDoTaskModel(
      data.id,
      data.title,
      new Date(data.createdAt),
      data.completedAt ? new Date(data.completedAt) : null
    );
  };

  const services = new Services<ToDoTaskModel, ToDoTaskDTO, number>('ToDoTask', toDoTaskModelFactory);

  async function fetchAll() {
    const oldData = new Map(_tasksMap.value); // Create a shallow copy
    try {
      const tasksArray = await services.fetchAll();
      _tasksMap.value.clear();
      tasksArray.forEach((taskData: ToDoTaskModel) => {
        _tasksMap.value.set(taskData.id, taskData);
      });
    } catch (e) {
      _tasksMap.value = oldData; // Revert to old data on error
    }
  }

  async function addTask(task: ToDoTaskDTO) {
    const newTask = await services.create(task);
    _tasksMap.value.set(newTask.id, newTask);
  }

  async function updateTask(id: number, updatedTask: ToDoTaskDTO) {
    const newlyUpdatedTask = await services.update(id, updatedTask);
    _tasksMap.value.set(newlyUpdatedTask.id, newlyUpdatedTask);
  }

  async function getTask(id: number) {
    const task = await services.read(id);
    _tasksMap.value.set(task.id, task);
  }

  async function removeTask(id: number) {
    await services.delete(id);
    _tasksMap.value.delete(id);
  }

  return {
    tasks,
    fetchAll,
    addTask,
    updateTask,
    removeTask,
    getTask,
  };
});
