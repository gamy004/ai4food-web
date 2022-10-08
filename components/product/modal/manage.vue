<script lang="ts" setup>
import { required } from "@vuelidate/validators";
import { Ref } from "vue";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { BodyManageProduct } from "~~/composables/useProduct";
import { ResponseErrorT } from "~~/composables/useRequest";

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

const emit = defineEmits([
  "update:idValue",
  "update:showValue",
  "success",
  "error",
]);

const modalRef = ref();
const submitting = ref(false);
const error: Ref<ResponseErrorT | null> = ref(null);
// const show = ref(false);

const form = reactive({
  productName: null,
  productCode: null,
  alternateProductCode: null,
});

const validationRules = {
  productName: { required, $lazy: true },
  productCode: { required, $lazy: true },
  alternateProductCode: { required, $lazy: true },
};

const { validate, isInvalid, isFormInvalid, resetValidation } = useValidation(
  validationRules,
  form
);

const productNameRequiredState = computed(() =>
  isFormInvalid("productName", ["required"])
);
const productCodeRequiredState = computed(() =>
  isFormInvalid("productCode", ["required"])
);
const alternateProductCodeRequiredState = computed(() =>
  isFormInvalid("alternateProductCode", ["required"])
);

const productNameExistsState = computed(() =>
  error.value ? !isErrorDataExists(error.value, "Product", "productName") : null
);
const productCodeExistsState = computed(() =>
  error.value ? !isErrorDataExists(error.value, "Product", "productCode") : null
);
const alternateProductCodeExistsState = computed(() =>
  error.value
    ? !isErrorDataExists(error.value, "Product", "alternateProductCode")
    : null
);

const formInvalidState = computed(() => {
  let isProductNameInvalid = null;
  let isProductCodeInvalid = null;
  let isAlternateProductCodeInvalid = null;

  if (isInvalid.value) {
    isProductNameInvalid = productNameRequiredState.value;
    isProductCodeInvalid = productCodeRequiredState.value;
    isAlternateProductCodeInvalid = alternateProductCodeRequiredState.value;
  }

  if (error.value) {
    isProductNameInvalid = productNameExistsState.value;
    isProductCodeInvalid = productCodeExistsState.value;
    isAlternateProductCodeInvalid = alternateProductCodeExistsState.value;
  }

  return {
    productName: isProductNameInvalid,
    productCode: isProductCodeInvalid,
    alternateProductCode: isAlternateProductCodeInvalid,
  };
});

const idValue = computed({
  get: () => props.idValue,

  set: (value) => emit("update:idValue", value),
});

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const actionText = computed(() => (idValue.value ? "อัพเดต" : "เพิ่ม"));

const clearState = () => {
  resetValidation();

  error.value = null;

  form.productName = null;
  form.productCode = null;
  form.alternateProductCode = null;
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
    const body: BodyManageProduct = {
      productName: form.productName,
      productCode: form.productCode,
      alternateProductCode: form.alternateProductCode,
    };

    let product;

    if (idValue.value) {
      product = await productApi().updateProduct(idValue.value, body);
    } else {
      product = await productApi().createProduct(body);
    }

    setTimeout(() => {
      showValue.value = false;

      if (idValue.value) {
        idValue.value = null;
      } else {
        clearState();
      }

      toast.success(`${actionText.value}รายการสินค้าสำเร็จ`, { timeout: 1000 });

      emit("success", product);
    }, 1000);
  } catch (errorResponse) {
    console.log(errorResponse);

    error.value = errorResponse;

    toast.error(
      `ไม่สามารถ${actionText.value}รายการสินค้าได้ กรุณาลองใหม่อีกครั้ง`
    );

    emit("error", errorResponse);
  } finally {
    setTimeout(() => {
      submitting.value = false;
    }, 1000);
  }
};

defineExpose({ clearState });

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
      clearState();
    }
  },
  { immediate: true }
);
</script>

<template>
  <b-form @submit="onSubmit">
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
              :state="formInvalidState.productName"
              type="text"
              placeholder="กรอกชื่อสินค้า"
            ></b-form-input>

            <b-form-invalid-feedback
              v-if="error"
              :state="productNameExistsState"
            >
              ชื่อสินค้าซ้ำ
            </b-form-invalid-feedback>

            <b-form-invalid-feedback
              v-if="isInvalid"
              :state="productNameRequiredState"
            >
              กรุณากรอกชื่อสินค้า
            </b-form-invalid-feedback>
          </div>
          <div class="input-group align-items-baseline">
            <b for="productCode" class="form-label d-block min-w-125px"
              >รหัสสินค้า</b
            >
            <b-form-input
              id="productCode"
              v-model="form.productCode"
              :state="formInvalidState.productCode"
              type="text"
              placeholder="กรอกรหัสสินค้า"
            ></b-form-input>

            <b-form-invalid-feedback
              v-if="error"
              :state="productCodeExistsState"
            >
              รหัสสินค้าซ้ำ
            </b-form-invalid-feedback>

            <b-form-invalid-feedback
              v-if="isInvalid"
              :state="productCodeRequiredState"
            >
              กรุณากรอกรหัสสินค้า
            </b-form-invalid-feedback>
          </div>
          <div class="input-group align-items-baseline">
            <b for="alternateProductCode" class="form-label d-block min-w-125px"
              >รหัสสินค้าสำรอง</b
            >
            <b-form-input
              id="alternateProductCode"
              v-model="form.alternateProductCode"
              :state="formInvalidState.alternateProductCode"
              type="text"
              placeholder="กรอกรหัสสินค้าสำรอง"
            >
            </b-form-input>

            <b-form-invalid-feedback
              v-if="error"
              :state="alternateProductCodeExistsState"
            >
              รหัสสินค้าสำรองซ้ำ
            </b-form-invalid-feedback>

            <b-form-invalid-feedback
              v-if="isInvalid"
              :state="alternateProductCodeRequiredState"
            >
              กรุณากรอกรหัสสินค้าสำรอง
            </b-form-invalid-feedback>
          </div>
        </div>
      </template>

      <template #footer>
        <b-button v-if="!submitting" variant="light" @click.prevent="onCancel">
          ยกเลิก
        </b-button>

        <b-button type="submit" variant="primary" :disabled="submitting">
          <LineMdLoadingTwotoneLoop
            v-if="submitting"
            :style="{ fontSize: '1em' }"
          />

          <span v-else>{{ actionText }}</span>
        </b-button>
      </template>
    </modal>
  </b-form>
</template>
