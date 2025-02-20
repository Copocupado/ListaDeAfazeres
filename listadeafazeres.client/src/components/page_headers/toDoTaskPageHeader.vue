<template>
  <Panel class="!border-none !bg-inherit">
    <template #header>
      <div class="!text-5xl !subpixel-antialiased !font-bold" style="color: var(--p-primary-color)">
        Lista de Afazeres
      </div>
    </template>
    <template #icons>
      <Button
        size="large"
        rounded
        icon="pi pi-plus"
        @click="showCreateDialog = true"
      />
    </template>
    <template #footer>
      <div class="w-full flex gap-2">
        <FilterPopover
          :is-applied="isFilterApplied"
          @filterChanged="taskStore.tasks.handleFilter"
          :currentlyAppliedFilters="taskStore.tasks.currentFilters"
          :isActive="taskStore.tasks.currentFilters != null"
        />
        <SortPopover
          :is-applied="isSortApplied"
          @sortChanged="taskStore.tasks.handleSort"
          :currentlyAppliedSort="taskStore.tasks.currentSorts"
          :isActive="taskStore.tasks.currentSorts != null"
        />
      </div>
    </template>
  </Panel>
  <InsertOrEditTask
    :show-dialog="showCreateDialog"
    @dialog-close="showCreateDialog = false"
    @dialog-confirmed="createTask"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useToDoTaskStore, ToDoTaskDTO } from '@/stores/ToDoTaskStore';
import { showToast } from '@/services/myToastService';
import FilterPopover from '@/components/utils/filter.vue';
import SortPopover from '@/components/utils/sort.vue';
import type { FilterCriteria } from '@/models/utils/services/filterService';
import type { SortCriteria } from '@/models/utils/services/sortServices';
import Button from 'primevue/button'
import Panel from 'primevue/panel'
import InsertOrEditTask from '../dialogs/ToDoTask/insertOrEditTask.vue';

const taskStore = useToDoTaskStore();

const isFilterApplied = ref(false);
const isSortApplied = ref(false);
const showCreateDialog = ref(false);


async function createTask(newTitle: string, callback?: () => void) {
  try {
    const dto = new ToDoTaskDTO(newTitle, false);
    await taskStore.tasks.addEntity(dto);
    showToast('success', 'Sucesso!', 'Tarefa adicionada!');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Um erro desconhecido ocorreu!';
    showToast('error', 'Erro ao criar uma nova tarefa!', message);
  } finally {
    if (callback) {
      callback();
    }
  }
}
</script>
