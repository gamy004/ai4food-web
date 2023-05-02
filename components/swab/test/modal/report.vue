<script lang="ts" setup>
import { required } from "@vuelidate/validators";
import { useToast } from "vue-toastification";

export interface Props {
  showValue?: boolean;
  modelValue: string | null;
}

const { getSwabTestById } = useLab();

const props = withDefaults(defineProps<Props>(), {
  showValue: false,
});

const emit = defineEmits(["update:showValue", "update:modelValue"]);

const toast = useToast();
const modalRef = ref();
const submitting = ref(false);
const selectedReportOption = ref(null);
const reportReason = ref("");
const reportReasonCustom = ref("");
const reportDetail = ref("");
const reportReasonOptions = ref([
  "ตัวอย่างผลตรวจสูญหาย",
  "ตัวอย่างผลตรวจไม่สมบูรณ์",
]);

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const swabTest = computed(() =>
  props.modelValue ? getSwabTestById(props.modelValue) : null
);

const validationRules = {
  reportReason: {
    required,
    $lazy: true,
  },
};

const { isInvalid, isFormInvalid, validate, resetValidation } = useValidation(
  validationRules,
  {
    reportReason,
  }
);

const reportReasonRequiredState = computed(() =>
  isFormInvalid("reportReason", ["required"])
);

const onReportReasonOptionSelected = (option: string) => {
  if (option !== "อื่นๆ") {
    reportReason.value = option;
  } else {
    reportReason.value = reportReasonCustom.value;
  }
};

const onReportReasonCustomInput = (text: string) => {
  reportReason.value = text;
};

const onCancel = () => {
  resetValidation();
  showValue.value = false;
  selectedReportOption.value = null;
  reportReason.value = "";
  reportReasonCustom.value = "";
  reportDetail.value = "";
};

const onSubmit = async () => {
  validate();

  if (isInvalid.value) {
    return toast.error("ไม่สามารถส่งรายงานผลตรวจได้ กรุณาเช็คข้อผิดพลาด");
  }

  submitting.value = true;

  try {
    showValue.value = false;
  } catch (error) {
    toast.error("แจ้งหายไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", { timeout: 1000 });
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <b-form @submit="onSubmit">
    <modal ref="modalRef" id="swabTestReportModal" v-model="showValue">
      <template #title> <span>รายงาน</span></template>

      <template #default>
        <div>
          กรุณาเลือกเหตุผลที่ทำการรายงานผลตรวจรหัส
          <b class="text-danger">{{ swabTest?.swabTestCode }}</b>
        </div>

        <b-form-group
          v-slot="{ ariaDescribedby }"
          :state="reportReasonRequiredState"
          class="mb-2 form-group__report-reason"
        >
          <b-form-radio
            v-for="reportReasonOption in reportReasonOptions"
            v-model="selectedReportOption"
            :aria-describedby="ariaDescribedby"
            name="reportReason"
            :value="reportReasonOption"
            @input="onReportReasonOptionSelected"
            >{{ reportReasonOption }}</b-form-radio
          >

          <b-form-radio
            v-model="selectedReportOption"
            :aria-describedby="ariaDescribedby"
            name="reportReason"
            value="อื่นๆ"
            @input="onReportReasonOptionSelected"
            >อื่นๆ
            <b-form-input
              :disabled="selectedReportOption !== 'อื่นๆ'"
              type="text"
              name="reportReasonCustom"
              class="mt-2"
              v-model="reportReasonCustom"
              @input="onReportReasonCustomInput"
            ></b-form-input>
          </b-form-radio>

          <b-form-invalid-feedback
            v-if="isInvalid"
            :state="reportReasonRequiredState"
          >
            กรุณาเลือกเหตุผลที่ทำการรายงาน
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group label-for="reportDetail" class="mt-3">
          <b-form-textarea
            name="reportDetail"
            v-model="reportDetail"
            placeholder="รายละเอียดเพิ่มเติม (Optional)"
            rows="3"
            max-rows="6"
          ></b-form-textarea>
        </b-form-group>
      </template>

      <template #footer>
        <b-button variant="light" @click.prevent="onCancel"> ยกเลิก </b-button>

        <b-button type="submit" variant="danger" @click.prevent="onSubmit">
          รายงาน
        </b-button>
      </template>
    </modal>
  </b-form>
</template>

<style lang="scss">
#swabTestReportModal {
  .form-group__report-reason {
    .form-check-label {
      width: 100%;
    }

    .form-check {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }
  }
}
</style>
