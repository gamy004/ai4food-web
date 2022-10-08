<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";

export interface Props {
  modelValue: string | null;
}

const toast = useToast();

const { getProductById, api: productApi } = useProduct();

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
});

const emit = defineEmits(["update:modelValue", "success", "error"]);

const modalRef = ref();
const deletedProduct = ref(null);
const submitting = ref(false);
const show = ref(false);

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const onSubmit = async () => {
  submitting.value = true;

  try {
    const deletedProduct = await productApi().deleteProduct(modelValue.value);

    setTimeout(() => {
      toast.success("ลบสินค้าสำเร็จ", { timeout: 1000 });

      modelValue.value = null;

      emit("success", deletedProduct);
    }, 1000);
  } catch (error) {
    toast.error("ไม่สามารถลบสินค้าได้ กรุณาลองใหม่อีกครั้ง");

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
      deletedProduct.value = getProductById(modelValue.value);
      show.value = true;
    } else {
      show.value = false;
      deletedProduct.value = null;
    }
  },
  { immediate: true }
);
</script>

<template>
  <b-form @submit="onSubmit">
    <modal ref="modalRef" id="modalDeleteProduct" v-model="show">
      <template #title> คุณต้องการลบข้อมูลสินค้านี้ใช่ไหม </template>

      <template #default>
        <p>คุณยืนยันที่จะลบข้อมูลสินค้านี้ใช่ไหม</p>

        <div class="alert alert-danger" role="alert">
          <div v-if="deletedProduct">
            <div><b>สินค้า:</b> {{ deletedProduct.productName }}</div>
            <div><b>รหัสสินค้า:</b> {{ deletedProduct.productCode }}</div>
            <div>
              <b>รหัสสินค้าสำรอง:</b> {{ deletedProduct.alternateProductCode }}
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

        <b-button type="submit" variant="danger" :disabled="submitting">
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
