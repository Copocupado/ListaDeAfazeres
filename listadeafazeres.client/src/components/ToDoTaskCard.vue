<template>
  <Card
    ref="taskCard"
    class="shadow-2xl transition-colors duration-1000"
    :class="{'!bg-inherit': isCompleted}"
  >
    <template #title>
      <div class="grid grid-cols-12 gap-4 items-center">
        <div class="col-span-8 flex flex-col justify-start gap-4">
          <h3 :class="{ 'line-through': isCompleted }">
            {{ props.toDoTask.title }}
          </h3>
          <p class="text-sm text-gray-500">
            Criado em: {{ toDoTask.createdAt }}<br />
            Completado em: {{ toDoTask.completedAt ?? 'Tarefa ainda não completa' }}
          </p>
          <div class="flex gap-2">
            <Button
              icon="pi pi-trash"
              severity="danger"
              aria-label="Cancel"
              raised
              size="small"
              @click="() => showAlertDialogForDeletion = true"
            />
            <Button
              icon="pi pi-pencil"
              severity="success"
              aria-label="Cancel"
              raised
              size="small"
              @click="() => showEditTaskDialog = true"
            />
          </div>
        </div>
        <div class="col-span-4 flex justify-end">
          <Checkbox v-model="isCompleted" binary size="large" @change="updateTask" />
        </div>
      </div>
    </template>
  </Card>
  <AlertDialog
    :visible="showAlertDialogForDeletion"
    @update:visible="(val) => showAlertDialogForDeletion = val"
    @response="handleDeleteRequest"
  />

  <Dialog v-model:visible="showEditTaskDialog" modal header="Edit Profile" :style="{ width: '25rem' }">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">
      Atualize a tarefa.
    </span>
    <div class="gap-4 mb-4">
      <IftaLabel>
        <IconField>
            <InputIcon class="pi pi-pencil" />
            <InputText id="title" v-model="newTitle" variant="filled" class="w-full"/>
            <InputIcon v-if="isLoading" class="pi pi-spin pi-spinner" />
        </IconField>
        <label for="title">Título</label>
      </IftaLabel>
    </div>
    <div class="flex justify-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="showEditTaskDialog = false" />
      <Button type="button" label="Save" @click="() =>{
        showEditTaskDialog = false
        updateTask()
      }" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">

import { ref } from 'vue';

import Card from 'primevue/card';
import Button from 'primevue/button';
import IftaLabel from 'primevue/iftalabel'
import IconField from 'primevue/iconfield'

import Checkbox from 'primevue/checkbox';
import { ToDoTaskModel } from '@/models/ToDoTask/ToDoTaskModel';
import { useToDoTaskStore, ToDoTaskDTO } from '@/stores/ToDoTaskStore';
import AlertDialog from './dialogs/alertDialog.vue';

const props = defineProps({
  toDoTask: {
    type: ToDoTaskModel,
    required: true,
  },
});
const taskStore = useToDoTaskStore();

let newTitle = props.toDoTask.title;

const showAlertDialogForDeletion = ref(false);
const showEditTaskDialog = ref(false);

const isCompleted = ref(props.toDoTask.completedAt != null);
const isLoading = ref(false);

async function updateTask() {
  try {
    isLoading.value = true
    const dto = new ToDoTaskDTO(newTitle, isCompleted.value);
    await taskStore.updateTask(props.toDoTask.id, dto);
  } catch (error) {
    // Revert UI changes if the update fails
    isCompleted.value = props.toDoTask.completedAt != null;
    console.error('Failed to update task:', error);
  } finally {
    isLoading.value = false
  }
}

async function handleDeleteRequest(didUserConfirm:boolean) {
  if(!didUserConfirm) return
  await taskStore.removeTask(props.toDoTask.id)
}
</script>

<style scoped>
/* Your styles here */
</style>
