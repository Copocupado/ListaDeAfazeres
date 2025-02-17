<template>
  <div>
    <ToDoTaskCard
      v-for="item in tasks"
      :key="item.id"
      :to-do-task="item"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useToDoTaskStore, ToDoTaskDTO } from '@/stores/ToDoTaskStore';
import ToDoTaskCard from './components/ToDoTaskCard.vue';

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
