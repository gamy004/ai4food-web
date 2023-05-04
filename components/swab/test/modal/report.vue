<script lang="ts" setup>
import { required } from "@vuelidate/validators";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { ReportSwabTestData } from "~/composables/useLab";

export interface Props {
  showValue?: boolean;
  modelValue: string | null;
}

const { getSwabTestById, api: labApi } = useLab();

const props = withDefaults(defineProps<Props>(), {
  showValue: false,
});

const emit = defineEmits(["update:showValue", "update:modelValue"]);

const toast = useToast();
const modalRef = ref();
const submitting = ref(false);
const selectedReportOption = ref<string | null>(null);
const reportReason = ref("");
const reportReasonCustom = ref("");
const reportDetail = ref("");
const reportReasonOptions = ref(["ตัวอย่างสูญหาย", "ตัวอย่างไม่สมบูรณ์"]);

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const swabTest = computed(() =>
  modelValue.value ? getSwabTestById(modelValue.value) : null
);

watch(
  () => swabTest.value,
  (v) => {
    if (v) {
      if (v.reportReason) {
        const isPredefinedOption = reportReasonOptions.value.includes(
          v.reportReason
        );

        if (isPredefinedOption) {
          selectedReportOption.value = v.reportReason;
        } else {
          selectedReportOption.value = "อื่นๆ";
          reportReasonCustom.value = v.reportReason;
        }

        reportReason.value = v.reportReason;
      }

      if (v.reportDetail) {
        reportDetail.value = v.reportDetail;
      }
    }
  }
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
  clearState();
};

const clearState = () => {
  resetValidation();

  showValue.value = false;
  modelValue.value = null;
  selectedReportOption.value = null;
  reportReason.value = "";
  reportReasonCustom.value = "";
  reportDetail.value = "";
};

const onSubmit = async () => {
  validate();

  if (isInvalid.value) {
    return toast.error("ไม่สามารถทำการรายงานได้ กรุณาเช็คข้อผิดพลาด");
  }

  submitting.value = true;

  try {
    const payload: ReportSwabTestData = {
      reportReason: reportReason.value,
      reportDetail: reportDetail.value.length ? reportDetail.value : null,
    };

    if (swabTest.value) {
      await labApi().reportSwabTest(swabTest.value.id, payload);
    }

    toast.success("รายงานสำเร็จเรียบร้อย", { timeout: 1000 });

    clearState();
  } catch (error) {
    toast.error("รายงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", { timeout: 1000 });
  } finally {
    submitting.value = false;
  }
};

const onRemoveReport = async () => {
  submitting.value = true;

  try {
    if (swabTest.value) {
      await labApi().removeReportSwabTest(swabTest.value.id);
    }

    toast.success("ถอนการรายงานสำเร็จเรียบร้อย", { timeout: 1000 });

    clearState();
  } catch (error) {
    toast.error("ถอนการรายงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
      timeout: 1000,
    });
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
        <div v-if="!swabTest?.isReported">
          กรุณาเลือกเหตุผลที่ทำการรายงาน สำหรับตัวอย่างรหัส
          <b class="text-danger">{{ swabTest?.swabTestCode }}</b>
        </div>

        <div v-if="swabTest?.isReported">
          ตัวอย่างรหัส
          <b class="text-danger">{{ swabTest?.swabTestCode }}</b>
          ถูกรายงานด้วยสายเหตุ
        </div>

        <div v-if="swabTest?.isReported" class="alert alert-danger mt-2">
          {{ swabTest?.reportReason }}
        </div>

        <div v-if="swabTest?.isReported">
          รายละเอียดเพิ่มเติม: {{ swabTest?.reportDetail }}
        </div>

        <div v-if="swabTest?.isReported" class="mt-3">
          หากคุณต้องการยกเลิกการรายงาน กรุณากดปุ่ม <b>"ถอนการรายงาน"</b>
        </div>

        <b-form-group
          v-if="!swabTest?.isReported"
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

        <b-form-group
          v-if="!swabTest?.isReported"
          label-for="reportDetail"
          class="mt-3"
        >
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

        <b-button
          v-if="!swabTest?.isReported"
          type="submit"
          variant="danger"
          @click.prevent="onSubmit"
        >
          <LineMdLoadingTwotoneLoop
            v-if="submitting"
            :style="{ fontSize: '1em' }"
          />

          <span v-else>รายงาน</span>
        </b-button>

        <b-button
          v-if="swabTest?.isReported"
          type="submit"
          variant="danger"
          @click.prevent="onRemoveReport"
        >
          <LineMdLoadingTwotoneLoop
            v-if="submitting"
            :style="{ fontSize: '1em' }"
          />

          <span v-else>ถอนการรายงาน</span>
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
