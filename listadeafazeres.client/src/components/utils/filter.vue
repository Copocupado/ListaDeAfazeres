<template>
  <div class="filter-popover inline-block">
    <div class="flex flex-col gap-2">
      <div>
        <Button
          icon="pi pi-filter"
          label="Filtrar"
          :severity="isActive ? 'primary' : 'secondary'"
          rounded
          @click="togglePopover"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <Chip
          v-if="currentlyAppliedFilters?.dateRange"
          :label="`Entre ${formatDateToPortuguese(
            currentlyAppliedFilters.dateRange[0]
          )} e ${formatDateToPortuguese(currentlyAppliedFilters.dateRange[1])}`"
          icon="pi pi-calendar"
          removable
          @remove="() => {
                    const newFilters: FilterCriteria = {dateRange: null, title: props.currentlyAppliedFilters?.title ?? null, completionStatus: props.currentlyAppliedFilters?.completionStatus ?? null}
                    emit('filterChanged', newFilters)
                }"
        />
        <Chip
          v-if="currentlyAppliedFilters?.title"
          :label="`Título contém: ${currentlyAppliedFilters?.title}`"
          icon="pi pi-pencil"
          removable
          @remove="() => {
                 const newFilters: FilterCriteria = {dateRange: props.currentlyAppliedFilters?.dateRange ?? null, title: null, completionStatus: props.currentlyAppliedFilters?.completionStatus ?? null}
                 emit('filterChanged', newFilters)
            }"
        />
        <Chip
          v-if="currentlyAppliedFilters?.completionStatus"
          :label="`Apenas: ${
            currentlyAppliedFilters?.completionStatus == 'completed'
              ? 'Tarefas completadas'
              : 'Tarefas não completadas'
          }`"
          icon="pi pi-check-circle"
          removable
          @remove="() => {
                const newFilters: FilterCriteria = {dateRange: props.currentlyAppliedFilters?.dateRange ?? null, title: props.currentlyAppliedFilters?.title ?? null, completionStatus: null}
                emit('filterChanged', newFilters)
            }"
        />
      </div>
    </div>
    <Popover ref="popoverRef" placement="bottom">
      <div class="p-3">
        <h4 class="mb-3">Opções de Filtro</h4>

        <div class="p-field mb-3">
          <label for="dateRange" class="block mb-1">Período</label>
          <DatePicker
            id="dateRange"
            v-model="dateRange"
            selectionMode="range"
            showTime
            placeholder="Selecione um período"
            class="w-full"
          />
        </div>

        <div class="p-field mb-3">
          <label for="titleFilter" class="block mb-1">Título contém</label>
          <InputText
            id="titleFilter"
            v-model="titleFilter"
            placeholder="Adicione uma palavra..."
            class="w-full"
          />
        </div>

        <div class="p-field mb-3">
          <label class="block mb-1">Status de Conclusão</label>
          <div class="flex flex-column gap-2">
            <div class="flex align-items-center">
              <RadioButton
                inputId="uncompleted"
                name="completionStatus"
                v-model="completionStatus"
                value="uncompleted"
                @click="() => maybeResetRadioButton('uncompleted')"
              />
              <label for="uncompleted" class="ml-2">Apenas Não Concluídos</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton
                inputId="completed"
                name="completionStatus"
                v-model="completionStatus"
                value="completed"
                @click="() => maybeResetRadioButton('completed')"
              />
              <label for="completed" class="ml-2">Apenas Concluídos</label>
            </div>
          </div>
        </div>

        <Button label="Aplicar filtros" severity="primary" class="w-full" @click="applyFilter" />
      </div>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import Popover from "primevue/popover";
import DatePicker from "primevue/datepicker";
import InputText from "primevue/inputtext";
import { Chip, RadioButton } from "primevue";
import type { FilterCriteria } from "@/models/utils/services/filterService";
import { formatDateToPortuguese } from "@/models/utils/services/timeFormatterService";

const popoverRef = ref<InstanceType<typeof Popover>>();
const dateRange = ref<Date[] | null>(null);
const titleFilter = ref<string | null>(null);
const completionStatus = ref<string | null>(null);

const emit = defineEmits<{
  (e: "filterChanged", data: FilterCriteria): void;
}>();
const props = defineProps<{
  isActive: boolean;
  currentlyAppliedFilters: FilterCriteria | null;
}>();

function togglePopover(event: MouseEvent) {
  popoverRef.value?.toggle(event);
  resetFilters()
}

function applyFilter() {
  const filterData: FilterCriteria = {
    dateRange: dateRange.value,
    title: titleFilter.value,
    completionStatus: completionStatus.value,
  };
  emit("filterChanged", filterData);
  popoverRef.value?.hide();
}

function maybeResetRadioButton(radioButtonValue: string) {
  if(completionStatus.value == radioButtonValue){
    completionStatus.value = null
  }
  return
}


function resetFilters(){
  dateRange.value = props.currentlyAppliedFilters?.dateRange ?? null
  titleFilter.value = props.currentlyAppliedFilters?.title ?? null
  completionStatus.value = props.currentlyAppliedFilters?.completionStatus ?? null
}
</script>
