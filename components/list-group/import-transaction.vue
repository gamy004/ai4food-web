<script lang="ts" setup>
import { useToast } from "vue-toastification";
import CarbonCheckmarkFilled from "~icons/carbon/checkmark-filled";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import IcTwotoneRemoveRedEye from "~icons/ic/twotone-remove-red-eye";
import { DateRangeInterface, Shift } from "~~/composables/useDate";
import { Pagination } from "~~/composables/usePagination";
import {
  ImportSource,
  // ImportStatus,
  ImportType,
} from "~~/models/ImportTransaction";

export interface Props {
  dateRange?: DateRangeInterface | null;
  importType?: ImportType;
  pagination: Pagination;
}

const props = withDefaults(defineProps<Props>(), {
  pagination: () => usePagination({ perPage: 20, currentPage: 1 }),
});

// const route = useRoute();
// const router = useRouter();
// const { shiftToAbbreviation } = useDate();
// const { isAllRelatedSwabAreaCompleted } = useSwabAreaHistoryStatus();
const toast = useToast();

const { api: importTransactionApi } = useImport();
const countTotal = ref(0);
const hasData = ref(false);
const loading = ref(false);
const error = ref(false);
const showDetailModal = ref(false);
const selectedImportTransactionId = ref(null);
const importTransactions = ref([]);

// const pagination = usePagination({
//   perPage: parseInt(route.query.perPage as string) || props.perPage,
//   currentPage: parseInt(route.query.currentPage as string) || props.currentPage,
// });

const displayData = computed(() => {
  return importTransactions.value.reduce((acc, importTransaction) => {
    const { importedFile } = importTransaction;

    console.log(importedFile);

    const tableRecord = {
      id: importTransaction.id,
      createdTime: importTransaction.readableCreatedAtTime,
      updatedTime: importTransaction.readableCreatedAtTime,
      // isPending: importTransaction.importStatus === ImportStatus.Pending,
      isCompleted: importTransaction.isCompleted,
      file: importedFile || null,
    };

    acc.push(tableRecord);

    return acc;
  }, []);
});

// const paginatedData = computed(() => pagination.paginate(displayData.value));

const fetch = async function fetch(props) {
  console.log(props);

  loading.value = true;
  error.value = false;
  hasData.value = true;
  countTotal.value = 0;
  importTransactions.value = [];

  try {
    const { total, importTransactions: importTransactionsResponse } =
      await importTransactionApi().loadTransactions({
        dateRange: props.dateRange,
        importSource: ImportSource.WEB,
        importType: props.importType,
        skip: props.pagination.offset.value,
        take: props.pagination.$state.perPage,
      });

    countTotal.value = total;

    if (importTransactionsResponse && importTransactionsResponse.length) {
      importTransactions.value = [...importTransactionsResponse];
    } else {
      hasData.value = false;
    }
  } catch (e) {
    console.log(e);

    error.value = true;

    toast.error(
      "โหลดข้อมูลการนำเข้าผลตรวจเชื้อไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      {
        timeout: 1500,
      }
    );
  } finally {
    loading.value = false;
  }
};

const onSeeDetail = (importTansactionId) => {
  selectedImportTransactionId.value = importTansactionId;

  showDetailModal.value = true;
};
// const onTableRowClicked = (item): void => {
//   router.push(getRouteUpdateSwabAreaHistory(item));
// };

watch(() => props, fetch, { immediate: true, deep: true });

defineExpose({ fetch });
</script>

<template>
  <div class="import-transaction__list">
    <b-col v-if="error" class="text-center">
      <p>พบข้อผิดพลาดในการโหลดข้อมูลการนำเข้าผลตรวจเชื้อ</p>

      <b-button variant="dark" @click="fetch(props)"> โหลดข้อมูลใหม่ </b-button>
    </b-col>

    <b-col v-else>
      <b-col v-if="loading" class="text-center">
        <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
      </b-col>

      <b-col v-else>
        <div v-if="hasData" class="d-grid gap-3">
          <b-list-group id="importTransactionSwabTestListGroup">
            <b-list-group-item
              v-for="item in displayData"
              :key="`import-transaction-list-group-item-${item.id}`"
              class="d-flex justify-content-between align-items-start list-group-item__import-transaction"
            >
              <!-- <icon-complete :active="item.isCompleted"></icon-complete> -->

              <div class="ms-2 me-auto">
                <div class="fw-bold mb-1 d-flex align-items-center">
                  <span class="me-2">{{ item.createdTime }}</span>

                  <badge-complete-status
                    :is-completed="item.isCompleted"
                    complete-text="นำเข้าเรียบร้อย"
                    in-complete-text="นำเข้าไม่สำเร็จ"
                    in-complete-variant="danger"
                  ></badge-complete-status>
                </div>

                <small>
                  <span v-if="item.createdTime !== item.updatedTime"
                    >อัพเดตล่าสุด: {{ item.updatedTime }}</span
                  >
                </small>

                <div
                  v-if="item.file"
                  class="list-group-item__import-transaction-file"
                >
                  <a
                    class="list-group-item__import-transaction-file-link"
                    :href="item.file.fileSource"
                    :download="item.file.fileName"
                    >{{ item.file.fileName }}</a
                  >
                </div>

                <!-- <div>{{ item.swabAreaName }}</div>
                <small>
                  <span>กะ: {{ shiftToAbbreviation(item.shift) }}</span>
                  <span class="mx-2">|</span>
                  <span>ช่วงตรวจ: {{ item.swabPeriodName }}</span>
                  <span v-if="item.facilityName" class="mx-2">|</span>
                  <span v-if="item.facilityName"
                    >เครื่อง: {{ item.facilityName }}</span
                  >
                  <span v-if="item.facilityItemName" class="mx-2">|</span>
                  <span v-if="item.facilityItemName"
                    >ไลน์: {{ item.facilityItemName }}</span
                  >
                </small> -->
              </div>

              <div class="position-absolute end-0 me-2">
                <!-- <LineMdLoadingTwotoneLoop
                  v-if="item.isPending"
                  :style="{ fontSize: '1em' }"
                /> -->

                <b-button
                  variant="outline-primary"
                  pill
                  size="sm"
                  @click="onSeeDetail(item.id)"
                >
                  <IcTwotoneRemoveRedEye /> เช็คข้อมูล
                </b-button>
              </div>
            </b-list-group-item>
          </b-list-group>

          <base-pagination
            v-model="pagination.$state.currentPage"
            :per-page="pagination.$state.perPage"
            :total-rows="countTotal"
            aria-controls="importTransactionSwabTestListGroup"
          />

          <modal-import-swab-test
            v-model:import-transaction-id-value="selectedImportTransactionId"
            v-model:show-value="showDetailModal"
          ></modal-import-swab-test>
        </div>

        <b-card v-else bg-variant="light">
          <b-card-text class="text-center">
            ไม่พบข้อมูลการนำเข้าผลตรวจเชื้อ
          </b-card-text>
        </b-card>
      </b-col>
    </b-col>
  </div>
</template>
