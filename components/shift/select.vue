<script lang="ts" setup>
import { Shift, ShiftMapper } from "~~/composables/useDate";

export interface Props {
    facilityId?: string;
    modelValue?: Shift | null;
}

const props = withDefaults(
    defineProps<Props>(),
    {
        facilityId: null,
        modelValue: null
    }
);

const emit = defineEmits(["update:modelValue"]);

const shiftOptions = [
    { value: Shift.DAY, text: ShiftMapper[Shift.DAY] },
    { value: Shift.NIGHT, text: ShiftMapper[Shift.NIGHT] }
];

const modelValue = computed({
    get: () => props.modelValue,

    set: value => emit("update:modelValue", value)
});
</script>

<template>
    <b-form-select v-model="modelValue" :options="shiftOptions" class="col-9" />
</template>
