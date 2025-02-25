<template>
  <Toast 
  :close-button-props="{
    style: {
        fontSize: '0.75rem', 
        width: '1.5rem',    
        height: '1.5rem',    
        padding: '0.25rem',
      }
  }"
  />
  <ToDoTaskPageHeader/>
  <div class="!m-10">
    <div class="flex flex-col items-center justify-center text-gray-500 !mt-10">
      <ProgressSpinner v-if="fetchingTasks" style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
      animationDuration=".5s" aria-label="Custom ProgressSpinner" />
      <div v-else v-if="tasksState.areTasksEmpty" class="flex flex-col items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
        <p class="text-xl">Nenhuma tarefa encontrada</p>
      </div>
    </div>
    <div class="flex flex-col gap-2" >
      <ToDoTaskCard
        v-for="item in tasksState.tasks"
        :key="item.id"
        :to-do-task="item"
      />
    </div>
    <div
      class="sticky bottom-0 z-50 transition-transform duration-300 ease-in-out"
      :class="isPaginationVisible ? 'translate-y-0' : 'translate-y-full'"
    >
      <Paginator 
        :rows="5" 
        :totalRecords="tasksState.totalRecords" 
        :rowsPerPageOptions="getRowsPerPage" 
        @page="onPageChange"
      />
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, computed, ref, onBeforeUnmount } from 'vue';
import { useToDoTaskState } from '@/stores/ToDoTaskState';

import ToDoTaskCard from './components/ToDoTaskCard.vue';
import ToDoTaskPageHeader from './components/page_headers/toDoTaskPageHeader.vue';
import { showToast } from './services/myToastService';
import type { PageState } from 'primevue';

const tasksState = useToDoTaskState();

const fetchingTasks = ref(false)

async function onPageChange(pageState: PageState){
  await tasksState.taskStore.showPartiallyAvailableEntitiesInMainRepository(pageState.page, pageState.rows);
}

const getRowsPerPage = computed(()=> {
  const arr = [5, 10, 15]
  if(tasksState.totalRecords > arr[arr.length - 1]){
    arr.push(tasksState.totalRecords)
  }
  return arr;
})

const isPaginationVisible = ref(false); 
let lastScrollPositionPagination = 0;

function handlePaginationScroll() {
  const currentScroll = window.scrollY || document.documentElement.scrollTop;

  isPaginationVisible.value = currentScroll > lastScrollPositionPagination;
  lastScrollPositionPagination = currentScroll;
}

onMounted(async () => {
  window.addEventListener('scroll', handlePaginationScroll);
  
  try {
    fetchingTasks.value = true;
    await tasksState.taskStore.showPartiallyAvailableEntitiesInMainRepository(0, 5);
  } catch (error) {
    showToast('error', 'Erro ao buscar suas tarefas!', error);
  } finally {
    fetchingTasks.value = false;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handlePaginationScroll);
});


</script>

<style scoped>
:deep(.p-paginator) {
  background-color: inherit;
}
</style>
