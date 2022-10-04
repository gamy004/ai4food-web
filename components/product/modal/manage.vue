<script lang="ts" setup>
import { Ref } from "vue";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { ResponseErrorT } from "~~/composables/useRequest";
import Product from "~~/models/Product";

export interface Props {
  idValue: string | null;
  showValue?: boolean;
}

const toast = useToast();
const { isErrorDataExists } = useRequest();
const { getProductById, api: productApi } = useProduct();

const props = withDefaults(defineProps<Props>(), {
  idValue: null,
  showValue: false,
});

const emit = defineEmits(["update:idValue", "update:showValue", "success"]);

const modalRef = ref();
const submitting = ref(false);
const error: Ref<ResponseErrorT | null> = ref(null);
// const show = ref(false);

const form = reactive({
  productName: null,
  productCode: null,
  alternateProductCode: null,
});

const idValue = computed({
  get: () => props.idValue,

  set: (value) => emit("update:idValue", value),
});

watch(
  () => idValue.value,
  (id) => {
    if (id) {
      const product = getProductById(id);

      if (product) {
        form.productName = product.productName;
        form.productCode = product.productCode;
        form.alternateProductCode = product.alternateProductCode;
      }
    } else {
      form.productName = "";
      form.productCode = "";
      form.alternateProductCode = "";
    }
  },
  { immediate: true }
);

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const actionText = computed(() => (idValue.value ? "อัพเดต" : "เพิ่ม"));
const productNameInvalidState = computed(() =>
  error.value ? !isErrorDataExists(error.value, "Product", "productName") : null
);
const productCodeInvalidState = computed(() =>
  error.value ? !isErrorDataExists(error.value, "Product", "productCode") : null
);
const alternateProductCodeInvalidState = computed(() =>
  error.value
    ? !isErrorDataExists(error.value, "Product", "alternateProductCode")
    : null
);

const onCancel = () => {
  showValue.value = false;
  idValue.value = null;
};

const onSubmit = async () => {
  error.value = null;
  submitting.value = true;

  try {
    if (idValue.value) {
      await productApi().updateProduct(idValue.value, {
        productName: form.productName,
        productCode: form.productCode,
        alternateProductCode: form.alternateProductCode,
      });
    } else {
      await productApi().createProduct({
        productName: form.productName,
        productCode: form.productCode,
        alternateProductCode: form.alternateProductCode,
      });
    }

    toast.success(`${actionText.value}รายการสินค้าสำเร็จ`, { timeout: 1000 });

    setTimeout(() => {
      showValue.value = false;
      idValue.value = null;

      emit("success");
    }, 1000);
  } catch (errorResponse) {
    error.value = errorResponse;

    toast.error(
      `ไม่สามารถ${actionText.value}รายการสินค้าได้ กรุณาลองใหม่อีกครั้ง`
    );
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};
</script>

<template>
  <modal ref="modalRef" id="productCreateModal" v-model="showValue">
    <template #title> {{ actionText }}รายการสินค้า </template>

    <template #default>
      <div class="row row-gap-2">
        <div class="input-group align-items-baseline">
          <b for="productName" class="form-label d-block min-w-125px"
            >ชื่อสินค้า</b
          >
          <b-form-input
            id="productName"
            v-model="form.productName"
            :state="productNameInvalidState"
            type="text"
            placeholder="กรอกชื่อสินค้า"
          ></b-form-input>

          <b-form-invalid-feedback :state="productNameInvalidState">
            ชื่อสินค้าซ้ำ
          </b-form-invalid-feedback>
        </div>
        <div class="input-group align-items-baseline">
          <b for="productCode" class="form-label d-block min-w-125px"
            >รหัสสินค้า</b
          >
          <b-form-input
            id="productCode"
            v-model="form.productCode"
            :state="productCodeInvalidState"
            type="text"
            placeholder="กรอกรหัสสินค้า"
          ></b-form-input>

          <b-form-invalid-feedback :state="productCodeInvalidState">
            รหัสสินค้าซ้ำ
          </b-form-invalid-feedback>
        </div>
        <div class="input-group align-items-baseline">
          <b for="alternateProductCode" class="form-label d-block min-w-125px"
            >รหัสสินค้าสำรอง</b
          >
          <b-form-input
            id="alternateProductCode"
            v-model="form.alternateProductCode"
            :state="alternateProductCodeInvalidState"
            type="text"
            placeholder="กรอกรหัสสินค้าสำรอง"
          >
          </b-form-input>

          <b-form-invalid-feedback :state="alternateProductCodeInvalidState">
            รหัสสินค้าสำรองซ้ำ
          </b-form-invalid-feedback>
        </div>
      </div>
    </template>

    <template #footer>
      <b-button v-if="!submitting" variant="light" @click.prevent="onCancel">
        ยกเลิก
      </b-button>

      <b-button
        variant="primary"
        :disabled="submitting"
        @click.prevent="onSubmit"
      >
        <LineMdLoadingTwotoneLoop
          v-if="submitting"
          :style="{ fontSize: '1em' }"
        />

        <span v-else>{{ actionText }}</span>
      </b-button>
    </template>
  </modal>
</template>
