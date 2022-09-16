<script lang="ts" setup>
import DatePicker from "@vuepic/vue-datepicker";
import { ConenctProductData } from "~~/composables/useSwab";

export interface FormData {
  productLot?: string;
  productDate?: string;
  product?: ConenctProductData;
}

export interface FormInvalidData {
  productLot?: boolean | null;
  productDate?: boolean | null;
  product?: boolean | null;
}

export interface Props {
  clearable?: boolean;
  disabled?: boolean;
  modelValue?: FormData;
  invalidState?: FormInvalidData
}

const props = withDefaults(
  defineProps<Props>(),
  {
    clearable: false,
    disabled: false
  }
);

const emit = defineEmits(["update:modelValue"]);

const form = computed({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value)
});

const formProductLot = computed({
  get: (): string => {
    return form.value.productLot;
  },

  set: (v: string) => {
    form.value.productLot = v.toUpperCase();
  }
});

</script>

<template>
  <b-row>
    <b-col md="6" class="mt-2">
      <div class="input-group align-items-baseline">
        <label for="swabAreaSwabedAt" class="form-label min-w-125px d-block col-12 col-md-auto">สินค้า
        </label>

        <div class="form-control p-0 border-0">
          <product-select id="product" v-model="form.product" :disabled="disabled" :clearable="clearable" />

          <b-form-invalid-feedback :state="props.invalidState?.product">
            กรุณาเลือกสินค้า
          </b-form-invalid-feedback>
        </div>
      </div>
    </b-col>

    <b-col md="6" class="mt-2">
      <div class="input-group align-items-baseline">
        <label for="productDate" class="form-label min-w-125px d-block col-12 col-md-auto">วันที่ผลิต</label>

        <date-picker id="productDate" v-model="form.productDate" class="form-control p-0 border-0"
          :enable-time-picker="false" locale="th" utc auto-apply :clearable="false" />
      </div>
    </b-col>

    <b-col md="6" class="mt-3">
      <div class="input-group align-items-baseline">
        <label for="productLot" class="form-label min-w-125px d-block col-12 col-md-auto">SubLot
          สินค้า</label>

        <div class="form-control p-0 border-0">
          <b-form-input id="productLot" v-model="formProductLot" class="text-capitalize" :disabled="disabled"
            type="text" />

          <b-form-invalid-feedback :state="props.invalidState?.productLot">
            กรุณากรอก SubLot สินค้า
          </b-form-invalid-feedback>
        </div>
      </div>
    </b-col>
  </b-row>
</template>
