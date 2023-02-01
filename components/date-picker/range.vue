<script lang="ts" setup>
import Datepicker from "@vuepic/vue-datepicker";
import { DateRangeInterface } from "~~/composables/useDate";

export interface Props {
  cancelText?: string;
  selectText?: string;
  locale?: string;
  placeholder?: string;
  clearable?: boolean;
  autoApply?: boolean;
  modelValue?: DateRangeInterface | null;
}

const { onlyDate, parseDate } = useDate();

const emit = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
  cancelText: "ยกเลิก",
  selectText: "ยืนยัน",
  locale: "en",
  placeholder: "",
  clearable: false,
  autoApply: false,
  modelValue: null,
});

const date = computed({
  get: () => {
    return props.modelValue
      ? [
          props.modelValue.from ? parseDate(props.modelValue.from) : null,
          props.modelValue.to ? parseDate(props.modelValue.to) : null,
        ]
      : null;
  },

  set: (dateValue) => {
    if (dateValue !== null) {
      const fromDateString = onlyDate(dateValue[0]);

      emit("update:modelValue", {
        from: fromDateString,
        to: dateValue[1] !== null ? onlyDate(dateValue[1]) : fromDateString,
      });
    } else {
      emit("update:modelValue", null);
    }
  },
});

// const fromDateString = computed(() =>
//   dateRange.from !== null ? onlyDate(dateRange.from) : ""
// );

// const toDateString = computed(() =>
//   dateRange.to !== null ? onlyDate(dateRange.to) : ""
// );
// watch(
//   () => props.modelValue,
//   (modelValue) => {
//     console.log(1);

//     date.value = modelValue
//       ? [
//           modelValue.from ? parseDate(modelValue.from) : null,
//           modelValue.to ? parseDate(modelValue.to) : null,
//         ]
//       : null;
//   },
//   { immediate: true }
// );

// watch(date, (dateValue) => {
//   console.log(2);

//   if (dateValue !== null) {
//     const fromDateString = onlyDate(dateValue[0]);

//     emit("update:modelValue", {
//       from: fromDateString,
//       to: dateValue[1] !== null ? onlyDate(dateValue[1]) : fromDateString,
//     });
//   } else {
//     emit("update:modelValue", {
//       from: null,
//       to: null,
//     });
//   }
// });

function clearDate() {
  date.value = null;
}

defineExpose({ clearDate });
</script>

<template>
  <Datepicker
    v-model="date"
    range
    utc
    :placeholder="placeholder"
    :enable-time-picker="false"
    :locale="locale"
    :cancel-text="cancelText"
    :select-text="selectText"
    :auto-apply="autoApply"
    :clearable="clearable"
    @cleared="clearDate"
  />
</template>
