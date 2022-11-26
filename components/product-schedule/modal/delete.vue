<script lang="ts" setup>
import { Ref } from "vue";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import ProductSchedule from "~~/models/ProductSchedule";

export interface Props {
  idValue: string | null;
  showValue?: boolean;
}

const toast = useToast();
const { formatThLocale, formatTimeThLocale } = useDate();
const {
  api: productApi,
  getProductById,
  getProductScheduleById,
} = useProduct();

const props = withDefaults(defineProps<Props>(), {
  showValue: false,
});

const emit = defineEmits([
  "update:idValue",
  "update:showValue",
  "success",
  "error",
]);

const modalRef = ref();
const deletedProductSchedule: Ref<ProductSchedule | null> = ref(null);
const loading = ref(false);
const submitting = ref(false);
const error = ref(false);

const idValue = computed({
  get: () => props.idValue,

  set: (value) => emit("update:idValue", value),
});

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const relatedProduct = computed(() =>
  deletedProductSchedule.value
    ? getProductById(deletedProductSchedule.value.productId)
    : null
);

const clearState = () => {
  idValue.value = null;

  showValue.value = false;
};

const onSubmit = async () => {
  submitting.value = true;

  try {
    const productSchedule = await productApi().deleteProductSchedule(
      idValue.value
    );

    setTimeout(() => {
      toast.success("ลบแผนการผลิตสินค้าสำเร็จ", { timeout: 1000 });

      clearState();

      emit("success", productSchedule);
    }, 1000);
  } catch (e) {
    error.value = e;

    toast.error("ไม่สามารถลบแผนการผลิตสินค้าได้ กรุณาลองใหม่อีกครั้ง");

    emit("error", error);
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};

watch(
  () => idValue.value,
  (value) => {
    if (value) {
      deletedProductSchedule.value = getProductScheduleById(value);
    } else {
      deletedProductSchedule.value = null;
    }
  },
  { immediate: true }
);
</script>

<template>
  <b-form @submit="onSubmit">
    <modal ref="modalRef" id="modalDeleteProductSchedule" v-model="showValue">
      <template #title> คุณต้องการลบข้อมูลแผนการผลิตสินค้านี้ใช่ไหม </template>

      <template #default>
        <div
          v-if="loading"
          class="d-flex justify-content-center align-items-center my-4"
        >
          <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
        </div>

        <div v-else>
          <div>
            <p>คุณยืนยันที่จะลบข้อมูลแผนการผลิตสินค้านี้ใช่ไหม</p>

            <div class="alert alert-danger" role="alert">
              <div v-if="deletedProductSchedule">
                <div>
                  <b>วันผลิต:</b>
                  {{
                    formatThLocale(deletedProductSchedule.productScheduleDate)
                  }}
                </div>

                <div>
                  <b>เวลาผลิต:</b>
                  {{
                    formatTimeThLocale(
                      deletedProductSchedule.productScheduleStartedAt
                    )
                  }}
                  -
                  {{
                    formatTimeThLocale(
                      deletedProductSchedule.productScheduleEndedAt ===
                        "23:59:59"
                        ? "00:00:00"
                        : deletedProductSchedule.productScheduleEndedAt
                    )
                  }}
                </div>

                <div v-if="relatedProduct">
                  <div>
                    <b>รหัสสินค้าหลัก:</b> {{ relatedProduct.productCode }}
                  </div>
                  <div>
                    <b>รหัสสินค้ารอง:</b>
                    {{ relatedProduct.alternateProductCode }}
                  </div>
                  <div><b>ชื่อสินค้า:</b> {{ relatedProduct.productName }}</div>
                </div>

                <div>
                  <b>จำนวน:</b>
                  {{ deletedProductSchedule.productScheduleAmount }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <b-button
          v-if="!submitting"
          variant="light"
          @click.prevent="clearState"
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
