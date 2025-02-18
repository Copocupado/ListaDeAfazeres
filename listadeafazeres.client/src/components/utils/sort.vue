<template>
    <div class="sort-popover inline-block">
        <div class="flex flex-col gap-2">
            <div>
                <Button
                    icon="pi pi-sort"
                    label="Ordenar"
                    :severity="isActive ? 'primary' : 'secondary'"
                    rounded
                    @click="togglePopover"
                />
            </div>
            <Chip
                v-if="currentlyAppliedSort?.option"
                :label="`Ordenar por: ${
                    currentlyAppliedSort?.option == 'asc' ? 'Ordem crescente' : 'Ordem descrescente'
                }`"
                :icon="`pi ${currentlyAppliedSort?.option == 'asc' ? 'pi-sort-up' : 'pi-sort-down'}`"
                removable
                @remove="() => {
                        const newSort: SortCriteria = {option: null}
                        emit('sortRemoved', newSort)
            }"/>
        </div>
        <Popover ref="popoverRef" placement="bottom">
            <div class="p-3">
                <h4 class="mb-3">Opções de Ordenação</h4>
                <div class="p-field mb-3">
                    <Select
                    id="sortSelect"
                    v-model="selectedOption"
                    :options="sortOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Organizar por..."
                    class="w-full"
                    />
                </div>
                <Button label="Aplicar ordenação" severity="primary" class="w-full" @click="applySort" />
            </div>
        </Popover>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import Button from 'primevue/button';
    import Popover from 'primevue/popover';
    import Select from 'primevue/select';
    import { Chip } from 'primevue';
    import type { SortCriteria } from '@/models/utils/services/sortServices';

    const props = defineProps<{
        isActive: boolean;
        currentlyAppliedSort: SortCriteria | null;
    }>();

    const sortOptions = [
        { label: 'Ordem crescente', value: 'asc' },
        { label: 'Ordem decrescente', value: 'desc' },
    ];

    const popoverRef = ref<InstanceType<typeof Popover>>();
    const selectedOption = ref<SortOrder | null>(null);

    const emit = defineEmits<{ (e: 'sortApplied', data: SortCriteria): void, (e: 'sortRemoved', data: SortCriteria): void }>();

    function togglePopover(event: MouseEvent) {
        popoverRef.value?.toggle(event);
    }

    function applySort() {
        const sortData: SortCriteria = {
            option: selectedOption.value,
        };
        emit('sortApplied', sortData);
        popoverRef.value?.hide();
    }
</script>
