import { defineStore } from "pinia";
import { ToDoTaskStore } from "./models/ToDoTaskStore";

// DTO for creating/updating tasks

export const useToDoTaskState = defineStore("toDoTask", {
  state: () => ({ taskStore: new ToDoTaskStore() }),
  getters: {
    tasks: (state) => state.taskStore.entities,
    totalRecords: (state) => state.taskStore.totalNumberOfEntities,
    areTasksEmpty: (state) => state.taskStore.totalNumberOfEntities === 0,
  },
});
