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

const emit = defineEmits(["update:modelValue", "success"]);

const modalRef = ref();
const submitting = ref(false);
const show = ref(false);

const form = reactive({
  productName: null,
  productCode: null,
  alternateProductCode: null,
});

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const onCreate = async () => {
  submitting.value = true;

  try {
    // await productApi().createProduct(modelValue.value);
    console.debug(form);

    toast.success("เพิ่มรายการสินค้าสำเร็จ", { timeout: 1000 });

    setTimeout(() => {
      modelValue.value = null;

      emit("success");
    }, 1000);
  } catch (error) {
    toast.error("ไม่สามารถเพิ่มรายการสินค้าได้ กรุณาลองใหม่อีกครั้ง");
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
  <modal ref="modalRef" id="productCreateModal" v-model="show">
    <template #title> เพิ่มรายการสินค้า </template>

    <template #default>
      <div class="row row-gap-2">
        <div class="input-group align-items-baseline">
          <b for="productName" class="form-label d-block min-w-125px"
            >ชื่อสินค้า:</b
          >
          <b-form-input
            id="productName"
            v-model="form.productName"
            type="text"
            placeholder="กรอกชื่อสินค้า"
          ></b-form-input>
        </div>
        <div class="input-group align-items-baseline">
          <b for="productCode" class="form-label d-block min-w-125px"
            >รหัสสินค้า:</b
          >
          <b-form-input
            id="productCode"
            v-model="form.productCode"
            type="text"
            placeholder="กรอกรหัสสินค้า"
          ></b-form-input>
        </div>
        <div class="input-group align-items-baseline">
          <b for="alternateProductCode" class="form-label d-block min-w-125px"
            >รหัสสินค้าสำรอง:</b
          >
          <b-form-input
            id="alternateProductCode"
            v-model="form.alternateProductCode"
            type="text"
            placeholder="กรอกรหัสสินค้าสำรอง"
          >
          </b-form-input>
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
        variant="outline-primary"
        :disabled="submitting"
        @click.prevent="onCreate"
      >
        <LineMdLoadingTwotoneLoop
          v-if="submitting"
          :style="{ fontSize: '1em' }"
        />

        <span v-else>เพิ่ม</span>
      </b-button>
    </template>
  </modal>
</template>
