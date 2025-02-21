<template>
  
    <Dialog @hide="handleClose" v-model:visible="localVisible" modal header="Gerenciamento de tarefas" :style="{ width: '25rem' }">
      <Form v-slot="$form" :resolver="resolver" @submit="onSubmit" class="flex justify-center flex-col gap-4">
        <div class="gap-4 mb-4">
          <IftaLabel>
            <IconField>
              <InputIcon class="pi pi-pencil" />
              <InputText name="title" type="text" id="title" fluid v-model="newTitle" variant="filled" class="w-full" />
              <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">
                {{ $form.title.error?.message }}
              </Message>
              <InputIcon v-if="isLoading" class="pi pi-spin pi-spinner" />
            </IconField>
            <label for="title">Título</label>
          </IftaLabel>
        </div>
        <div class="flex justify-end gap-2">
          <Button type="button" label="Cancelar" severity="secondary" @click="handleClose" />
          <Button type="submit" label="Salvar" />
        </div>
      </Form>
    </Dialog>
</template>
  
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import IftaLabel from 'primevue/iftalabel';
import IconField from 'primevue/iconfield';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import * as yup from 'yup';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  initialTitle: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['dialogClose', 'dialogConfirmed']);
const newTitle = ref(props.initialTitle);
const localVisible = ref(props.showDialog);
const isLoading = ref(false);

const schema = computed(() => {
  return yup.object().shape({
    title: yup
      .string()
      .trim()
      .required('O título é obrigatório')
      .test(
        'titulo-diferente',
        'O novo título não pode ser igual ao atual',
        function (value) {
          if (!props.initialTitle) return true;
          return value !== props.initialTitle;
        }
      ),
  });
});

const resolver = computed(() => yupResolver(schema.value));

watch(
  () => props.initialTitle,
  (newVal) => {
    console.log(newVal)
  }
);
watch(
  () => props.showDialog,
  (newVal) => {
    localVisible.value = newVal;
    newTitle.value = props.initialTitle
  }
);

async function onSubmit({ valid }: { valid: boolean }) {
  if (!valid) return;
  isLoading.value = true;
  emit('dialogConfirmed', newTitle.value, () => handleClose());
  isLoading.value = false;

}

function handleClose() {
  isLoading.value = false;
  emit('dialogClose');
}
</script>

