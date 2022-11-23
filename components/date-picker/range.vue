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
  clearable?: boolean;
  modelValue?: ModelValue;
}

const { onlyDate, parseDate } = useDate();

const emit = defineEmits(["update:modelValue"]);

const props = withDefaults(defineProps<Props>(), {
  cancelText: "ยกเลิก",
  selectText: "ยืนยัน",
  locale: "en",
  clearable: false,
  modelValue: () => ({
    from: null,
    to: null,
  }),
});

const date = ref(null);

// const fromDateString = computed(() =>
//   dateRange.from !== null ? onlyDate(dateRange.from) : ""
// );

// const toDateString = computed(() =>
//   dateRange.to !== null ? onlyDate(dateRange.to) : ""
// );
const updateDate = (value: ModelValue) => {
  date.value = value
    ? [
        value.from ? parseDate(value.from) : null,
        value.to ? parseDate(value.to) : null,
      ]
    : null;
};

const clearDate = () => {
  date.value = null;
};

defineExpose({ updateDate, clearDate });

updateDate(props.modelValue);

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
</script>

<template>
  <Datepicker
    v-model="date"
    range
    :enable-time-picker="false"
    :locale="locale"
    :cancel-text="cancelText"
    :select-text="selectText"
    :clearable="clearable"
    @cleared="clearDate"
  />
</template>
