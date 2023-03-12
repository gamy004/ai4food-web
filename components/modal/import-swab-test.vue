<script lang="ts" setup>
import { required } from "@vuelidate/validators";
import { Ref } from "vue";
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { ResponseErrorT } from "~~/composables/useRequest";
import DatePicker from "@vuepic/vue-datepicker";
import SwabTest from "~~/models/SwabTest";

export interface Props {
  importTransactionIdValue: string;
  showValue?: boolean;
  clearable?: boolean;
  disabled?: boolean;
}

const toast = useToast();
const { getImportTransactionById } = useImport();
const { api: swabTestApi } = useSwabTest();
const props = withDefaults(defineProps<Props>(), {
  showValue: false,
  clearable: false,
  disabled: false,
});

const emit = defineEmits([
  "update:importTransactionIdValue",
  "update:showValue",
  "cancel",
]);

const modalRef = ref();
const loading: Ref<boolean> = ref(false);
const error: Ref<ResponseErrorT | null> = ref(null);
const data: Ref<SwabTest[]> = ref([]);
const importTransaction = computed(() =>
  getImportTransactionById(props.importTransactionIdValue)
);

const importTransactionIdValue = computed({
  get: () => props.importTransactionIdValue,

  set: (value) => emit("update:importTransactionIdValue", value),
});

const showValue = computed({
  get: () => props.showValue,

  set: (value) => emit("update:showValue", value),
});

const tableFields = [
  // { key: 'date', label: 'วันที่' },
  { key: "code", label: "รหัส" },
  {
    key: "isPositive",
    label: "สถานะ",
    thClass: "text-center",
    tdClass: "text-center",
  },
  {
    key: "latestRecordedAt",
    label: "อัพเดตล่าสุด",
    thClass: "text-end",
    tdClass: "text-end",
  },
  { key: "action", label: "", thClass: "text-center", tdClass: "text-center" },
];

const tableData = computed(() => {
  return data.value.map((record) => {
    const code = record.swabTestCode;

    return {
      code,
      swabTest: record,
      latestRecordedAt: record.readableBacteriaRecordedAt,
    };
  });
});

const clearState = () => {
  error.value = null;
};

const onCancel = () => {
  showValue.value = false;

  emit("cancel");
};

const fetch = async (importTransactionId) => {
  error.value = null;

  try {
    loading.value = true;

    data.value = await swabTestApi().loadSwabTest({
      importTransactionId,
    });
  } catch (e) {
    error.value = e;

    toast.error("ไม่สามารถโหลดข้อมูลรายการตรวจเชื่อได้ กรุณาลองใหม้อีกครั้ง");
  } finally {
    loading.value = false;
  }
};

watch(
  () => importTransactionIdValue.value,
  async (importTransactionid) => {
    if (importTransactionid) {
      await fetch(importTransactionid);
    } else {
      clearState();
    }
  },
  { immediate: true }
);

watch(
  () => showValue.value,
  async (showValue) => {
    if (!showValue) {
      importTransactionIdValue.value = null;
    }
  }
);
</script>

<template>
  <modal ref="modalRef" id="importSwabTestModal" v-model="showValue" size="lg">
    <template #title> ข้อมูลรายการตรวจเชื้อ </template>

    <template #header-close>
      <b-col v-if="data.length" cols="5" sm="4" class="text-end">
        <div>
          ข้อมูลนำเข้าทั้งหมด
          {{ data.length }} รายการ
        </div>
        <small>
          อัพเดตล่าสุด:
          {{ importTransaction.readableUpdatedAtTime }}
        </small>
      </b-col>
    </template>

    <template #default>
      <b-table hover responsive :items="tableData" :fields="tableFields">
        <template #cell(isPositive)="{ item }">
          <badge-bacteria-status
            :swab-test="item.swabTest as SwabTest"
          ></badge-bacteria-status>
        </template>
      </b-table>
    </template>

    <template #footer>
      <b-button variant="light" @click.prevent="onCancel"> ยกเลิก </b-button>
    </template>
  </modal>
</template>
