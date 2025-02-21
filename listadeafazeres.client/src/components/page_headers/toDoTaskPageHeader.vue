<template>
  <nav :class="[
    'sticky top-0 z-50 shadow-md transition-transform duration-300 ease-in-out',
    isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
  ]"
  style="background-color: var(--p-content-background)">
    <Menubar class="!border-none !bg-inherit">
      <template #start>
        <div class="flex flex-col !m-10 gap-4">
          <div class="text-5xl subpixel-antialiased font-bold" style="color: var(--p-primary-color)">
            Lista de Afazeres
          </div>
          <div class="flex gap-4">
            <FilterPopover
              :is-applied="isFilterApplied"
              @filterChanged="handleFilter"
              :currentlyAppliedFilters="tasksState.taskStore.currentFilters"
              :isActive="tasksState.taskStore.currentFilters != null"
            />
            <SortPopover
              :is-applied="isSortApplied"
              @sortChanged="handleSort"
              :currentlyAppliedSort="tasksState.taskStore.currentSorts"
              :isActive="tasksState.taskStore.currentSorts != null"
            />
          </div>
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <Button
            size="large"
            rounded
            icon="pi pi-plus"
            @click="showCreateDialog = true"
          />
        </div>
      </template>
    </Menubar>
  </nav>

  
  <InsertOrEditTask
    :show-dialog="showCreateDialog"
    @dialog-close="showCreateDialog = false"
    @dialog-confirmed="createTask"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useToDoTaskState } from '@/stores/ToDoTaskState';
import { showToast } from '@/services/myToastService';
import FilterPopover from '@/components/utils/filter.vue';
import SortPopover from '@/components/utils/sort.vue';
import Button from 'primevue/button';
import Menubar from 'primevue/menubar';
import InsertOrEditTask from '../dialogs/ToDoTask/insertOrEditTask.vue';
import { ToDoTaskDTO } from '@/models/ToDoTask/ToDoTaskModel';
import type { FilterCriteria } from '@/models/utils/services/filterService';
import type { SortCriteria } from '@/models/utils/services/sortServices';

const tasksState = useToDoTaskState();

const isFilterApplied = ref(false);
const isSortApplied = ref(false);
const showCreateDialog = ref(false);


async function createTask(newTitle: string, callback?: () => void) {
  try {
    const dto = new ToDoTaskDTO(newTitle, false);
    await tasksState.taskStore.addEntity(dto);
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

const isNavbarVisible = ref(true);
let lastScrollPosition = 0;

function handleFilter(filter: FilterCriteria) {
  tasksState.taskStore.handleFilter(filter);
}

function handleSort(sort: SortCriteria) {
  tasksState.taskStore.handleSort(sort);
}

const handleScroll = () => {
  const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
  if (currentScrollPosition < 0) return;

  isNavbarVisible.value = currentScrollPosition < lastScrollPosition || currentScrollPosition < 10;
  lastScrollPosition = currentScrollPosition;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
