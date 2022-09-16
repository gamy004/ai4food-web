<script lang="ts" setup>
import vSelect from "vue-select";
import { useToast } from "vue-toastification";
import Product from "~~/models/Product";

export type ProductSelectData = {
  id: string;
};

export interface Props {
  clearable?: boolean;
  modelValue?: ProductSelectData | null;
}

const toast = useToast();

const { api: productApi, getProductByIds } = useProduct();

const props = withDefaults(defineProps<Props>(), {
  clearable: false,
  modelValue: () => null,
});

const emit = defineEmits(["update:modelValue"]);

const isFetched = ref(false);
const loading = ref(false);
const productIds = ref([]);

const products = computed(() => getProductByIds(productIds.value));

const modelValue = computed({
  get: () => props.modelValue,

  set: (value) => emit("update:modelValue", value),
});

const fetch = async () => {
  if (!isFetched.value) {
    loading.value = true;

    try {
      const ProductData: Product[] = await productApi().loadAllProduct();

      if (ProductData.length) {
        productIds.value = ProductData.map(({ id }) => id);
      }
    } catch (error) {
      toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้", { timeout: 1000 });
    } finally {
      loading.value = false;
      isFetched.value = true;
    }
  }
};

onBeforeMount(async () => {
  isFetched.value = false;

  await fetch();
});
</script>

<template>
  <v-select
    v-model="modelValue"
    :options="products"
    label="productName"
    :loading="loading"
    :clearable="clearable"
    :reduce="({ id }) => ({ id })"
    deselect-from-dropdown
    @open="fetch"
  >
    <template #selected-option="{ productCode, productName }">
      {{ productCode }}: {{ productName }}
    </template>

    <template #option="{ productCode, productName }">
      {{ productCode }}: {{ productName }}
    </template>

    <!-- <template #search="{ attributes, events }">
            <input class="vs__search" :required="!modelValue" v-bind="attributes" v-on="events" />
        </template> -->
  </v-select>
</template>
