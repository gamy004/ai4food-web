<script lang="ts" setup>
import Datepicker from "@vuepic/vue-datepicker";
import { ResponseErrorT } from "~~/composables/useRequest";
import { Ref } from "vue";
import { useToast } from "vue-toastification";
import { BodyManageSwabPlan } from "~~/composables/useSwab";

const toast = useToast();
const { today, onlyDate, formatShortYear } = useDate();

const { api: swabApi } = useSwab();

const currentDate = today();

export interface Props {
  idValue: string | null;
  showValue: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  idValue: null,
  showValue: false,
});

const form = reactive({
  swabPlanDate: onlyDate(currentDate),
  swabPlanCode: formatShortYear(currentDate),
  swabPeriod: null,
  shift: null,
  swabPlanNote: "",
});

const emit = defineEmits([
  "update:idValue",
  "update:showValue",
  "success",
  "error",
]);

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const idValue = computed({
  get: () => props.idValue,

  set: (value) => emit("update:idValue", value),
});

const formDate = computed({
  get: () => form.swabPlanDate,
  set: (value) => {
    const updatedValue = onlyDate(value);

    form.swabPlanDate = updatedValue;

    form.swabPlanCode = formatShortYear(value);
  },
});

const formSwabPeriod = computed({
  get: () => {
    return form.swabPeriod ? { id: form.swabPeriod.id } : null;
  },

  set: (value) => {
    if (value && value.id) {
      form.swabPeriod = { id: value.id };
    } else {
      form.swabPeriod = null;
    }
  },
});

const validationRules = {};

const { validate, isInvalid, isFormInvalid, resetValidation } = useValidation(
  validationRules,
  form
);

const modalRef = ref();
const submitting = ref(false);
const error: Ref<ResponseErrorT | null> = ref(null);

const clearState = () => {
  resetValidation();

  error.value = null;

  form.swabPlanDate = onlyDate(currentDate);
  form.swabPlanCode = formatShortYear(currentDate);
  form.swabPeriod = null;
  form.shift = null;
  form.swabPlanNote = "";
};

const onCancel = () => {
  if (idValue.value) {
    idValue.value = null;
  } else {
    clearState();
  }

  showValue.value = false;
};

const onSubmit = async () => {
  error.value = null;

  validate();

  if (isInvalid.value) {
    return toast.error("ไม่สามารถส่งข้อมูลได้ กรุณาเช็คข้อผิดพลาด");
  }

  submitting.value = true;

  try {
    const body: BodyManageSwabPlan = {
      swabPlanDate: form.swabPlanDate,
      swabPlanCode: form.swabPlanCode,
      swabPeriod: form.swabPeriod,
      shift: form.shift,
      swabPlanNote: form.swabPlanNote,
    };

    let swabPlan;

    if (idValue.value) {
      // swabPlan = await swabApi().createSwabPlan(idValue.value, body);
    } else {
      swabPlan = await swabApi().createSwabPlan(body);
    }

    setTimeout(() => {
      showValue.value = false;

      if (idValue.value) {
        idValue.value = null;
      } else {
        clearState();
      }

      toast.success("เพิ่มแผนการตรวจสำเร็จ", { timeout: 1000 });

      console.log(swabPlan);

      emit("success", swabPlan);
    }, 1000);
  } catch (errorResponse) {
    error.value = errorResponse;

    toast.error("ไม่สามารถเพิ่มแผนการตรวจได้ กรุณาลองใหม่อีกครั้ง");

    emit("error", errorResponse);
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};

defineExpose({ clearState });
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
                >วันที่</label
              >
              <Datepicker
                id="swabPlanDate"
                v-model="formDate"
                class="form-control p-0 border-0"
                :enable-time-picker="false"
                locale="th"
                utc
                :disabled="submitting"
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
              <b-form-input v-model="form.swabPlanCode" type="text" disabled />
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
                required
                :disabled="submitting"
              ></swab-period-select>
            </div>
          </b-col>

          <b-col cols="4">
            <div class="input-group align-items-baseline">
              <label for="date" class="form-label d-block min-w-50px">กะ</label>
              <shift-select
                v-model="form.shift"
                class="col"
                required
                :disabled="submitting"
              ></shift-select>
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
                :disabled="submitting"
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
