<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";

export interface Props {
  modelValue: string | null;
}

const toast = useToast();

const { getFacilityItemById } = useFacility();

const { getProductById } = useProduct();

const {
  getSwabProductHistoryById,
  getSwabTestById,
  getSwabPeriodById,
  api: swabApi,
} = useSwab();

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(["update:modelValue", "success"]);

const modalRef = ref();
const submitting = ref(false);
const show = ref(false);

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const deletedSwabProductHistory = computed(() =>
  getSwabProductHistoryById(modelValue.value)
);

const deletedSwabTest = computed(() =>
  deletedSwabProductHistory.value
    ? getSwabTestById(deletedSwabProductHistory.value.swabTestId)
    : null
);

const facilityItem = computed(() =>
  deletedSwabProductHistory.value
    ? getFacilityItemById(deletedSwabProductHistory.value.facilityItemId)
    : null
);

const product = computed(() =>
  deletedSwabProductHistory.value
    ? getProductById(deletedSwabProductHistory.value.productId)
    : null
);

const swabPeriod = computed(() =>
  deletedSwabProductHistory.value
    ? getSwabPeriodById(deletedSwabProductHistory.value.swabPeriodId)
    : null
);

const onDeleted = async () => {
  submitting.value = true;

  try {
    await swabApi().deleteSwabProductHistory(modelValue.value);

    toast.success("ลบบันทึกการตรวจสินค้าสำเร็จ", { timeout: 1000 });

    setTimeout(() => {
      modelValue.value = null;

      emit("success");
    }, 1000);
  } catch (error) {
    toast.error("ไม่สามารถลบบันทึกการตรวจสินค้าได้ กรุณาลองใหม่อีกครั้ง");
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
      show.value = true;
    } else {
      show.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <modal ref="modalRef" id="productHistoryDeleteModal" v-model="show">
    <template #title> คุณต้องการลบข้อมูลบันทึกการตรวจสินค้านี้ใช่ไหม </template>

    <template #default>
      <p>คุณยืนยันที่จะลบข้อมูลบันทึกการตรวจสินค้านี้ใช่ไหม</p>

      <div class="alert alert-danger" role="alert">
        <div v-if="deletedSwabProductHistory">
          <b>วันที่:</b> {{ deletedSwabProductHistory.readableSwabProductDate }}
          &nbsp;
          <b>เวลา:</b> {{ deletedSwabProductHistory.readableSwabProductTime }}
        </div>

        <div v-if="deletedSwabTest">
          <b>รหัส:</b> {{ deletedSwabTest.swabTestCode }}
        </div>

        <div v-if="swabPeriod">
          <b>ช่วงตรวจ:</b> {{ swabPeriod.swabPeriodName }}
        </div>

        <div v-if="facilityItem">
          <b>ไลน์:</b> {{ facilityItem.facilityItemName }}
        </div>

        <div v-if="product"><b>สินค้า:</b> {{ product.productName }}</div>

        <div v-if="deletedSwabProductHistory">
          <b>SubLot:</b> {{ deletedSwabProductHistory.productLot }}
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
        variant="danger"
        :disabled="submitting"
        @click.prevent="onDeleted"
      >
        <LineMdLoadingTwotoneLoop
          v-if="submitting"
          :style="{ fontSize: '1em' }"
        />

        <span v-else>ลบ</span>
      </b-button>
    </template>
  </modal>
</template>
