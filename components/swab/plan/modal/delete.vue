<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";

export interface Props {
  modelValue: string | null;
}

const toast = useToast();

const { api: swabApi, getSwabPlanById, getSwabPeriodById } = useSwab();

const { formatThLocale } = useDate();

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(["update:modelValue", "success", "error"]);

const modalRef = ref();
const deletedSwabPlanData = reactive({
  totalItems: 0,
  swabPlanCode: "",
  swabPeriodId: null,
  shift: null,
  swabPlanNote: "",
  swabPlanDate: null,
});
const loading = ref(false);
const submitting = ref(false);
const error = ref(false);
const show = ref(false);

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const swabPeriod = computed(() => {
  return getSwabPeriodById(deletedSwabPlanData.swabPeriodId);
});

const reFetch = () => {
  error.value = false;
};

const onSubmit = async () => {
  submitting.value = true;

  try {
    const deletedSwabPlan = await swabApi().deleteSwabPlan(modelValue.value);

    setTimeout(() => {
      toast.success("ลบแผนการตรวจสำเร็จ", { timeout: 1000 });

      modelValue.value = null;

      emit("success", deletedSwabPlan);
    }, 1000);
  } catch (error) {
    toast.error("ไม่สามารถลบแผนการตรวจได้ กรุณาลองใหม่อีกครั้ง");

    emit("error", error);
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};

watch(
  () => modelValue.value,
  (value) => {
    if (value) {
      const swabPlanData = getSwabPlanById(value);
      deletedSwabPlanData.swabPlanCode = swabPlanData.swabPlanCode;
      deletedSwabPlanData.swabPlanDate = swabPlanData.swabPlanDate;
      deletedSwabPlanData.swabPeriodId = swabPlanData.swabPeriodId;
      deletedSwabPlanData.shift = swabPlanData.shift;
      deletedSwabPlanData.swabPlanNote = swabPlanData.swabPlanNote;

      show.value = true;
    } else {
      show.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <b-form @submit="onSubmit">
    <modal ref="modalRef" id="modalDeleteProduct" v-model="show">
      <template #title> คุณต้องการลบข้อมูลแผนการตรวจนี้ใช่ไหม </template>

      <template #default>
        <div v-if="error" class="text-center">
          <p>พบข้อผิดพลาดในการโหลดข้อมูลแผนการตรวจ</p>

          <b-button variant="dark" @click="reFetch"> โหลดข้อมูลใหม่ </b-button>
        </div>

        <div v-else>
          <div
            v-if="loading"
            class="d-flex justify-content-center align-items-center my-4"
          >
            <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
          </div>

          <div v-else>
            <div>
              <p>คุณยืนยันที่จะลบข้อมูลแผนการตรวจนี้ใช่ไหม</p>

              <div>
                <div class="alert alert-danger" role="alert">
                  <div class="fw-bold mb-3">
                    {{
                      deletedSwabPlanData?.swabPlanDate
                        ? formatThLocale(deletedSwabPlanData.swabPlanDate)
                        : ""
                    }}
                  </div>
                  <b-row>
                    <b-col cols="4">
                      <b>จุดตรวจ: </b>
                      <span>{{ deletedSwabPlanData.totalItems }} จุด</span>
                    </b-col>

                    <b-col cols="8">
                      <b>ชุดอักษร: </b>
                      <span>{{ deletedSwabPlanData?.swabPlanCode }}</span>
                    </b-col>

                    <b-col cols="4">
                      <b>กะ: </b>
                      <span>{{ deletedSwabPlanData.shift }}</span>
                    </b-col>

                    <b-col cols="8">
                      <b>ช่วงเวลา: </b>
                      <span>{{ swabPeriod?.swabPeriodName }}</span>
                    </b-col>

                    <b-col cols="12">
                      <b>รายละเอียด: </b>
                      <span>{{
                        deletedSwabPlanData?.swabPlanNote
                          ? deletedSwabPlanData?.swabPlanNote
                          : "-"
                      }}</span>
                    </b-col>
                  </b-row>
                </div>

                <p>
                  หากแผนการตรวจถูกลบ
                  ข้อมูลที่ผูกกับแผนการตรวจนี้ทั้งหมดจะถูกลบด้วย
                  คุณแน่ใจว่าต้องการลบแผนการตรวจนี้ใช่ไหม
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <b-button
          v-if="!submitting"
          variant="light"
          @click.prevent="modelValue = null"
        >
          ยกเลิก
        </b-button>

        <b-button
          type="submit"
          variant="danger"
          :disabled="loading || submitting"
        >
          <LineMdLoadingTwotoneLoop
            v-if="submitting"
            :style="{ fontSize: '1em' }"
          />

          <span v-else>ลบ</span>
        </b-button>
      </template>
    </modal>
  </b-form>
</template>
