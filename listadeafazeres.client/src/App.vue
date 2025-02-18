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
  <div class="flex flex-col gap-2">
    <ToDoTaskCard
      v-for="item in tasks"
      :key="item.id"
      :to-do-task="item"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useToDoTaskStore } from '@/stores/ToDoTaskStore';

import ToDoTaskCard from './components/ToDoTaskCard.vue';
import ToDoTaskPageHeader from './components/page_headers/toDoTaskPageHeader.vue';

const store = useToDoTaskStore();
const tasks = computed(() => store.tasks);


onMounted(async () => {
  try {
    await store.fetchAll();
  } catch (error) {
    console.error('Failed to fetch items:', error);
  }
});
</script>

<style scoped>
/* Your component styles here */
</style>
