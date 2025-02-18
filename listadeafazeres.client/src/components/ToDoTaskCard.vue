<template>
  <Card
    ref="taskCard"
    class="shadow-2xl transition-colors duration-1000"
    :class="{ '!bg-inherit': isCompleted }"
  >
    <template #title>
      <div class="grid grid-cols-12 gap-4 items-center">
        <div class="col-span-8 flex flex-col justify-start gap-4">
          <h3 :class="{ 'line-through': isCompleted }">
            {{ toDoTask.title }}
          </h3>
          <p class="text-sm text-gray-500">
            Criado em: {{ formatDateToPortuguese(toDoTask.createdAt) }}<br />
            Completado em:
            {{
              toDoTask.completedAt
                ? formatDateToPortuguese(toDoTask.completedAt)
                : "Tarefa ainda não completa"
            }}
          </p>
          <div class="flex gap-2">
            <Button
              icon="pi pi-trash"
              severity="danger"
              aria-label="Cancel"
              raised
              size="small"
              @click="showAlertDialogForDeletion = true"
            ></Button>
            <Button
              icon="pi pi-pencil"
              severity="success"
              aria-label="Edit"
              raised
              size="small"
              @click="showEditTaskDialog = true"
            ></Button>
          </div>
        </div>
        <div class="col-span-4 flex justify-end">
          <Checkbox v-model="isCompleted" binary size="large" @change="() => updateTask()" />
        </div>
      </div>
    </template>
  </Card>
  <AlertDialog
    :visible="showAlertDialogForDeletion"
    @update:visible="val => showAlertDialogForDeletion = val"
    @response="handleDeleteRequest"
  />
  <InsertOrEditTask
    :show-dialog="showEditTaskDialog"
    :initial-title="toDoTask.title"
    @dialog-close="showEditTaskDialog = false"
    @dialog-confirmed="updateTask"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { showToast } from '@/services/myToastService';

import Card from 'primevue/card';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

import { ToDoTaskModel } from '@/models/ToDoTask/ToDoTaskModel';
import { useToDoTaskStore, ToDoTaskDTO } from '@/stores/ToDoTaskStore';

import AlertDialog from './dialogs/alertDialog.vue';
import InsertOrEditTask from './dialogs/ToDoTask/insertOrEditTask.vue';
import { formatDateToPortuguese } from '@/models/utils/services/timeFormatterService';

const props = defineProps<{
  toDoTask: ToDoTaskModel;
}>();

const taskStore = useToDoTaskStore();

const showAlertDialogForDeletion = ref(false);
const showEditTaskDialog = ref(false);

const isCompleted = ref(props.toDoTask.completedAt !== null);

async function updateTask(
  newTitle: string = props.toDoTask.title,
  callback?: () => void
) {
  try {
    const oldTitle = props.toDoTask.title;
    const dto = new ToDoTaskDTO(newTitle, isCompleted.value);
    await taskStore.updateTask(props.toDoTask.id, dto);

    if (newTitle !== oldTitle) {
      showToast('success', 'Sucesso ao editar!', 'Tarefa editada com sucesso!');
    }
  } catch (e) {
    isCompleted.value = props.toDoTask.completedAt !== null;
    if (e instanceof Error) {
      showToast('error', 'Erro ao atualizar tarefa', e.message);
    } else {
      showToast('error', 'Erro desconhecido', 'Ocorreu um erro inesperado.');
    }
  } finally {
    if (callback) {
      callback();
    }
  }
}

async function handleDeleteRequest(didUserConfirm: boolean) {
  try {
    if (!didUserConfirm) return;
    await taskStore.removeTask(props.toDoTask.id);
    showToast('success', 'Sucesso ao excluir!', 'Tarefa excluída com sucesso!');
  } catch (e) {
    if (e instanceof Error) {
      showToast('error', 'Erro ao excluir tarefa', e.message);
    } else {
      showToast('error', 'Erro desconhecido', 'Ocorreu um erro inesperado.');
    }
  }
}
</script>
