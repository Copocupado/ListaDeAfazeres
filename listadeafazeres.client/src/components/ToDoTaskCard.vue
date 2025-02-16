<template>
  <Card ref="taskCard" class="shadow-2xl transition-colors duration-1000" :class="{'!bg-inherit': isCompleted}">
      <template #title>
        <div class="grid grid-cols-12 gap-4 items-center">
          <div class="col-span-8 flex flex-col justify-start gap-4">
            <h3 :class="{ 'line-through ': isCompleted }">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </h3>
            <p class="text-sm text-gray-500">
              Criado em: {{ creationTime }}<br />
              Completado em: {{ completionTime }}
            </p>
            <div class="flex gap-2">
              <Button icon="pi pi-trash" severity="danger" aria-label="Cancel" raised size="small" />
              <Button icon="pi pi-pencil" severity="success" aria-label="Cancel" raised size="small" />
            </div>
          </div>
          <div class="col-span-4 flex justify-end">
            <Checkbox v-model="isCompleted" binary size="large" />
          </div>
        </div>
      </template>
    </Card>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { debounce } from 'lodash'
import Card from 'primevue/card';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

const emit = defineEmits(['updateToDoTask'])

// Reactive state
const isCompleted = ref(false);
const creationTime = '2025-02-16 10:00 AM';
const completionTime = 'Not Completed';

function updateToDoTask() {
  emit('updateToDoTask', {})
}
function toggleTask() {
  isCompleted.value = !isCompleted.value;
  debouncedUpdate()
}

// Debounce method
const debouncedUpdate = debounce(updateToDoTask, 300)

</script>

<style scoped>
@keyframes drawLine {
  from {
    /* The line is scaled from 0 horizontally (not visible) */
    transform: translateY(-50%) scaleX(0);
  }
  to {
    /* The line scales to full width while keeping its rotation */
    transform: translateY(-50%) scaleX(1);
  }
}

.animate-draw-line {
  animation: drawLine 0.5s ease-out forwards;
}
</style>
