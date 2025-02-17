<template>
    <Dialog
      v-model:visible="localVisible"
      :modal="true"
      :closable="true"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">{{ title }}</span>
        </div>
      </template>
      <p>{{ message }}</p>
      <template #footer>
        <div class="flex !justify-between w-full">
          <Button label="Mudei de ideia" severity="danger" @click="() => getResponse(false)" />
          <Button label="Continuar" variant="text" @click="() => getResponse(true)" />
        </div>
      </template>
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  import Dialog from 'primevue/dialog';
  import Button from 'primevue/button';
  
  const props = defineProps({
    title: {
      type: String,
      default: 'Alto lá!',
    },
    message: {
      type: String,
      default: 'Tem certeza que deseja prosseguir?',
    },
    visible: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['update:visible', 'response']);
  
  // Create a local reactive variable for visibility.
  const localVisible = ref(props.visible);
  
  // Sync local state with parent prop.
  watch(
    () => props.visible,
    (newVal) => {
      localVisible.value = newVal;
    }
  );
  
  // Emit changes from local state back to the parent.
  watch(localVisible, (newVal) => {
    emit('update:visible', newVal);
  });


  function getResponse(didUserConfirm: boolean){
    emit('update:visible', false);
    emit('response', didUserConfirm)
  }
  </script>
  
  <style scoped>
  /* Your styles here */
  </style>
  