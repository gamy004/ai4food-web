<script setup lang="ts">
import Datepicker from "@vuepic/vue-datepicker";

export interface FormData {
  date?: string;
}

export interface Props {
  disabled?: boolean;
  modelValue: FormData;
  hiddenState?: BooleanState<"date">;
  colState?: ColState<"date">;
  clearableState?: BooleanState<"date">;
  placeholderDate?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholderDate: "",
});

const emit = defineEmits(["update:modelValue"]);
const { updateQueryParams, getCurrentQuery } = useQueryParams();
const { onlyMonth } = useDate();

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const hiddenState = computed(() => useHiddenState(props.hiddenState));
const colState = useColState(props.colState);
const clearableState = useClearableState(props.clearableState);

const getUpdatedQuery = () => {
  let updatedQuery: any = { ...getCurrentQuery() };

  if (updatedQuery.currentPage && updatedQuery.currentPage !== "1") {
    updatedQuery = {
      ...updatedQuery,
      currentPage: 1,
    };
  }

  return updatedQuery;
};

const formDate = computed({
  get: () => {
    return {
      month: new Date(form.value.date).getMonth(),
      year: new Date(form.value.date).getFullYear(),
    };
  },
  set: (value) => {
    let updatedQuery: any = getUpdatedQuery();

    // updatePaginateState();

    const { month, year } = value;

    const updatedValue = onlyMonth(new Date(year, month));

    form.value.date = updatedValue;

    updateQueryParams({
      ...updatedQuery,
      date: updatedValue,
    });
  },
});
</script>

<template>
  <div class="swab-plan__filter">
    <div class="row">
      <div
        v-if="!hiddenState.isHidden('date', false)"
        :class="[colState.colClass('date', 'md-8')]"
      >
        <div class="input-group align-items-baseline">
          <label for="date" class="form-label d-block min-w-125px"
            >วันที่ (เดือน/ปี)</label
          >
          <Datepicker
            v-model="formDate"
            :enable-time-picker="false"
            locale="th"
            class="col"
            utc
            auto-apply
            month-picker
            :clearable="clearableState.isClearable('date')"
            :disabled="disabled"
            :placeholder="placeholderDate"
          />
        </div>
      </div>
    </div>
  </div>
</template>
