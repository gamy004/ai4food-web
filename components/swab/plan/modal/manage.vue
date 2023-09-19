<script lang="ts" setup>
import Datepicker from "@vuepic/vue-datepicker";

export interface FormData {
  swabPlanDate?: string;
  swabRound?: string;
  swabPeriodId: string | null;
  shift: string | null;
  swabPlanNote: string | null;
}

const { onlyDate, formatShortYear } = useDate();

export interface Props {
  idValue: string | null;
  showValue: boolean;
  modelValue: FormData;
}

const props = withDefaults(defineProps<Props>(), {
  idValue: null,
  showValue: false,
});

const emit = defineEmits([
  "update:idValue",
  "update:showValue",
  "success",
  "error",
  "update:modelValue",
]);

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const idValue = computed({
  get: () => props.idValue,

  set: (value) => emit("update:idValue", value),
});

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const onCancel = () => {
  if (idValue.value) {
    idValue.value = null;
  } else {
    // clearState();
  }

  showValue.value = false;
};

const formDate = computed({
  get: () => form.value.swabPlanDate,
  set: (value) => {
    const updatedValue = onlyDate(value);

    form.value.swabPlanDate = updatedValue;

    form.value.swabRound = formatShortYear(value);
  },
});

const formSwabPeriod = computed({
  get: () => {
    return form.value.swabPeriodId ? { id: form.value.swabPeriodId } : null;
  },

  set: (value) => {
    if (value && value.id) {
      form.value.swabPeriodId = value.id;
    } else {
      form.value.swabPeriodId = null;
    }
  },
});
</script>

<template>
  <modal id="swabPlanCreateModal" ref="modalRef" v-model="showValue" size="lg">
    <template #title> เพิ่มแผนการตรวจ </template>

    <template #default>
      <b-container>
        <b-row class="row-gap-2 mb-4">
          <b-col cols="8">
            <div class="input-group align-items-baseline">
              <label for="date" class="form-label d-block min-w-125px"
                >วันที่ (เดือน/ปี)</label
              >
              <Datepicker
                id="swabPlanDate"
                v-model="formDate"
                class="form-control p-0 border-0"
                :enable-time-picker="false"
                locale="th"
                utc
                :disabled="disabled"
                auto-apply
                :clearable="false"
              />
            </div>
          </b-col>

          <b-col cols="4">
            <div class="input-group align-items-baseline">
              <label for="date" class="form-label d-block min-w-50px"
                >รอบ</label
              >
              <b-form-input v-model="form.swabRound" type="text" disabled />
            </div>
          </b-col>
        </b-row>

        <b-row class="row-gap-2 mb-4">
          <b-col cols="8">
            <div class="input-group align-items-baseline">
              <label for="date" class="form-label d-block min-w-125px"
                >ช่วงเวลา</label
              >
              <swab-period-select
                v-model="formSwabPeriod"
                class="col"
              ></swab-period-select>
            </div>
          </b-col>

          <b-col cols="4">
            <div class="input-group align-items-baseline">
              <label for="date" class="form-label d-block min-w-50px">กะ</label>
              <shift-select v-model="form.shift" class="col"></shift-select>
            </div>
          </b-col>
        </b-row>

        <b-row class="row-gap-2">
          <b-col cols="12">
            <div class="input-group align-items-baseline">
              <label for="date" class="form-label d-block min-w-125px"
                >รายละเอียด</label
              >
              <b-form-textarea
                v-model="form.swabPlanNote"
                class="col"
              ></b-form-textarea>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </template>

    <template #footer>
      <b-button v-if="!submitting" variant="light" @click.prevent="onCancel">
        ยกเลิก
      </b-button>
      <b-button
        variant="outline-primary"
        :disabled="submitting"
        @click.prevent="onSubmit"
      >
        <LineMdLoadingTwotoneLoop
          v-if="submitting"
          :style="{ fontSize: '1em' }"
        />

        <span v-else>บันทึก</span>
      </b-button>
    </template>
  </modal>
</template>
