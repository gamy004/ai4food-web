<script lang="ts" setup>
import Datepicker from "@vuepic/vue-datepicker";

export interface ModelValue {
  from: string | null;
  to: string | null;
}

export interface Props {
  cancelText?: string;
  selectText?: string;
  locale?: string;
  modelValue?: ModelValue;
}

const { onlyDate, parseDate } = useDate();

const emit = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
  cancelText: "ยกเลิก",
  selectText: "ยืนยัน",
  locale: "en",
  modelValue: () => ({
    from: null,
    to: null,
  }),
});

const date = ref(
  props.modelValue
    ? [
        props.modelValue.from ? parseDate(props.modelValue.from) : null,
        props.modelValue.to ? parseDate(props.modelValue.to) : null,
      ]
    : null
);

// const fromDateString = computed(() =>
//   dateRange.from !== null ? onlyDate(dateRange.from) : ""
// );

// const toDateString = computed(() =>
//   dateRange.to !== null ? onlyDate(dateRange.to) : ""
// );

watch(date, (dateValue) => {
  if (dateValue !== null) {
    const fromDateString = onlyDate(dateValue[0]);

    emit("update:modelValue", {
      from: fromDateString,
      to: dateValue[1] !== null ? onlyDate(dateValue[1]) : fromDateString,
    });
  } else {
    emit("update:modelValue", {
      from: null,
      to: null,
    });
  }
});

function onDatepickerCleared() {
  date.value = null;
}
</script>

<template>
  <Datepicker
    v-model="date"
    range
    :enable-time-picker="false"
    :locale="locale"
    :cancel-text="cancelText"
    :select-text="selectText"
    @cleared="onDatepickerCleared"
  />
</template>
