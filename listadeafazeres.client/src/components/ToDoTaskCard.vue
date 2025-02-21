<template>
  <Card ref="taskCard"
        class="shadow-2xl transition-colors duration-1000"
        :class="{ '!bg-inherit': isCompleted }">
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
              optimisticCompletedAt
                ? formatDateToPortuguese(optimisticCompletedAt)
                : "Tarefa ainda não completa"
            }}
          </p>
          <div class="flex gap-2">
            <Button icon="pi pi-trash"
                    severity="danger"
                    aria-label="Cancel"
                    raised
                    size="small"
                    @click="showAlertDialogForDeletion = true"></Button>
            <Button icon="pi pi-pencil"
                    severity="success"
                    aria-label="Edit"
                    raised
                    size="small"
                    @click="showEditTaskDialog = true"></Button>
          </div>
        </div>
        <div class="col-span-4 flex justify-end">
          <!-- Atualiza a tarefa imediatamente ao alterar o checkbox -->
          <Checkbox v-model="isCompleted" binary size="large" @click="debounceFunc"/>
        </div>
      </div>
    </template>
  </Card>
  <AlertDialog :visible="showAlertDialogForDeletion"
               @update:visible="val => showAlertDialogForDeletion = val"
               @response="handleDeleteRequest" />
  <InsertOrEditTask :show-dialog="showEditTaskDialog"
                    :initial-title="toDoTask.title"
                    @dialog-close="showEditTaskDialog = false"
                    @dialog-confirmed="updateFunction" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import { showToast } from '@/services/myToastService';

  import Card from 'primevue/card';
  import Button from 'primevue/button';
  import Checkbox from 'primevue/checkbox';

  import { ToDoTaskDTO, ToDoTaskModel } from '@/models/ToDoTask/ToDoTaskModel';
  import { useToDoTaskState } from '@/stores/ToDoTaskState';

  import AlertDialog from './dialogs/alertDialog.vue';
  import InsertOrEditTask from './dialogs/ToDoTask/insertOrEditTask.vue';
  import { formatDateToPortuguese } from '@/models/utils/services/timeFormatterService';
  import debounce from 'lodash/debounce';

  const props = defineProps<{
    toDoTask: ToDoTaskModel;
  }>();

  const optimisticCompletedAt = ref<Date | null>(props.toDoTask.completedAt)

  const tasksState = useToDoTaskState();

  const showAlertDialogForDeletion = ref(false);
  const showEditTaskDialog = ref(false);


  const isCompleted = ref(props.toDoTask.completedAt !== null);

  const debounceFunc = debounce(async () => {
    optimisticCompletedAt.value = optimisticCompletedAt.value == null ? new Date() : null
    await updateFunction();
  }, 300);

  async function updateFunction(newTitle?: string, callback: Function = () => {}) {

    let maybeDisplayToast: Function = () => {}
    if(newTitle != undefined) {
      maybeDisplayToast = () => showToast('success', 'Sucesso ao editar!', 'Tarefa editada com sucesso!');
    } 

    try {
      const dto = new ToDoTaskDTO(newTitle ?? props.toDoTask.title, isCompleted.value);
      await tasksState.taskStore.updateEntity(props.toDoTask.id, dto);
      maybeDisplayToast()
    } catch (e) {
      isCompleted.value = props.toDoTask.completedAt !== null;
      if (e instanceof Error) {
        showToast('error', 'Erro ao atualizar tarefa', e.message);
      } else {
        showToast('error', 'Erro desconhecido', 'Ocorreu um erro inesperado.');
      }
    } finally {
      if(callback instanceof Function){
        await callback(); 
      }
    }
  } 

  async function handleDeleteRequest(didUserConfirm: boolean) {
    try {
      if (!didUserConfirm) return;
      await tasksState.taskStore.removeEntity(props.toDoTask.id);
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
