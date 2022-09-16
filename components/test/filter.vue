<script setup lang="ts">
import Datepicker from "@vuepic/vue-datepicker";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { Shift, ShiftMapper } from "~~/composables/useDate.js";
import { HiddenState, useHiddenState } from "~~/composables/useHiddenState";

export interface FormData {
  date?: string;
}

export interface Props {
  disabled?: boolean;
  modelValue: FormData;
  hiddenState?: HiddenState<'date'>
  // invalidState?: FormInvalidData
}

const props = withDefaults(
  defineProps<Props>(),
  {
    disabled: false
  }
);

const emit = defineEmits(["update:modelValue"]);
const route = useRoute();
const router = useRouter();
const { onlyDate } = useDate();
const loading = ref(false);
const error = ref(false);


const form = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const hiddenState = useHiddenState(props.hiddenState);

const formDate = computed({
  get: () => form.value.date,
  set: (value) => {
    const updatedValue = onlyDate(value);

    form.value.date = updatedValue;

    router.replace({
      query: {
        ...route.query,
        date: updatedValue
      }
    });
  }
})

</script>

<template>
  <div class="swab-area-history__filter">

    <b-col v-if="loading" class="text-center">
      <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
    </b-col>

    <b-col v-else>
      <div class="row">
        <div v-if="!hiddenState.isHidden('date')" class="col-8">
          <div class="input-group align-items-baseline">
            <label for="date" class="form-label d-block col-3">วันที่</label>

            <Datepicker v-model="formDate" :enable-time-picker="false" locale="th" utc auto-apply :clearable="false"
              class="col-9" />
          </div>
        </div>
      </div>

    </b-col>
  </div>
</template>
