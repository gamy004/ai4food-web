<script lang="ts" setup>
import { useToast } from "vue-toastification";
import CarbonEdit from "~icons/carbon/edit";
// import CarbonTrashCan from "~icons/carbon/trash-can";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import SwabProductHistory from "~~/models/SwabProductHistory";
import { Shift } from "~~/composables/useDate";
import { Pagination } from "~~/composables/usePagination";

export interface Props {
  date: string;
  shift: Shift;
  facilityId?: string;
  facilityItemId?: string;
  swabPeriodId?: string;
  productId?: string;
  swabTestCode?: string;
  swabSampleTypeId?: string;
  pagination: Pagination;
}

const props = withDefaults(defineProps<Props>(), {
  pagination: () => usePagination({ perPage: 20, currentPage: 1 }),
});
const route = useRoute();
// const router = useRouter();
const toast = useToast();
const { shiftToAbbreviation } = useDate();

const {
  getSwabProductHistoryById,
  getSwabPeriodById,
  getSwabTestById,
  getSwabSampleTypeById,
  api: swabApi,
} = useSwab();
const { getFacilityById, getFacilityItemById } = useFacility();
const { getProductById } = useProduct();

const countTotal = ref(0);
const loading = ref(false);
const error = ref(false);
// const removedId = ref(null);
const swapProductHistoryIds = ref([]);

const getRouteManageSwabProductHistory = (id) => {
  return {
    name: "swab-product-history-update",
    params: {
      update: id,
    },
    query: {
      redirect: route.fullPath,
    },
  };
};

const swabProductHistories = computed(() => {
  return swapProductHistoryIds.value.map(getSwabProductHistoryById);
});

const tableFields = [
  // { key: 'date', label: 'วันที่' },
  { key: "code", label: "รหัส" },
  { key: "shift", label: "กะ" },
  { key: "swabPeriodName", label: "ช่วงตรวจ" },
  { key: "facilityName", label: "เครื่อง" },
  { key: "facilityItemName", label: "ไลน์" },
  { key: "productName", label: "สินค้า" },
  { key: "productDate", label: "วันที่ผลิต" },
  { key: "productLot", label: "SubLot" },
  { key: "time", label: "เวลาบันทึก" },
  { key: "isCompleted", label: "สถานะ" },
  { key: "action", label: "", thClass: "text-center", tdClass: "text-center" },
];

const tableData = computed<any[]>(() => {
  return swabProductHistories.value.reduce<any[]>((acc, swabProductHistory) => {
    if (swabProductHistory) {
      let swabPeriod, swabTest, swabSampleType, product, facilityItem, facility;

      if (swabProductHistory.swabPeriodId) {
        swabPeriod = getSwabPeriodById(swabProductHistory.swabPeriodId);
      }

      if (swabProductHistory.swabTestId) {
        swabTest = getSwabTestById(swabProductHistory.swabTestId);

        if (swabTest?.swabSampleTypeId) {
          swabSampleType = getSwabSampleTypeById(swabTest.swabSampleTypeId);
        }
      }

      if (swabProductHistory.facilityItemId) {
        facilityItem = getFacilityItemById(swabProductHistory.facilityItemId);

        if (facilityItem?.facilityId) {
          facility = getFacilityById(facilityItem.facilityId);
        }
      }

      if (swabProductHistory.productId) {
        product = getProductById(swabProductHistory.productId);
      }

      const tableRecord: any = {
        id: swabProductHistory.id,
        // date: swabProductHistory.swabProductDate,
        time: swabProductHistory.readableSwabProductTime,
        code: swabTest ? swabTest.swabTestCode : "",
        shift: swabProductHistory.shift,
        swabPeriodName: swabPeriod ? swabPeriod.swabPeriodName : "",
        facilityName: facility ? facility.facilityName : "",
        facilityItemName: facilityItem ? facilityItem.facilityItemName : "",
        productName: product ? product.productName : "",
        productDate: swabProductHistory.shortProductDate,
        productLot: swabProductHistory.productLot || "",
        isCompleted: swabProductHistory.isCompleted,
        swabSampleTypeName: swabSampleType
          ? swabSampleType.swabSampleTypeName
          : "",
      };

      // if (swabProductHistory.facilityItemId) {
      //   const facilityItem = getFacilityItemById(
      //     swabProductHistory.facilityItemId
      //   );

      //   tableRecord.facilityItemName = facilityItem.facilityItemName;
      // }

      // if (swabProductHistory.productId) {
      //   const product = getProductById(swabProductHistory.productId);

      //   tableRecord.productName = product.productName;
      // }

      // if (swabProductHistory.productDate) {
      //   tableRecord.productDate = formatThLocale(
      //     new Date(swabProductHistory.productDate)
      //   );
      // }

      // if (swabProductHistory.productLot) {
      //   tableRecord.productLot = swabProductHistory.productLot;
      // }

      acc.push(tableRecord);
    }

    return acc;
  }, []);
});

const isPropInvalid = (props): boolean => {
  return props.date === null;
};

const fetch = async function fetch(props) {
  swapProductHistoryIds.value = [];

  if (isPropInvalid(props)) {
    return;
  }

  error.value = false;

  loading.value = true;

  try {
    const [swapProductHistoryData, total] =
      await swabApi().loadSwabProductHistory({
        ...props,
        skip: props.pagination.offset.value,
        take: props.pagination.$state.perPage,
      });

    countTotal.value = total;

    if (swapProductHistoryData && swapProductHistoryData.length) {
      swapProductHistoryIds.value = swapProductHistoryData.map(({ id }) => id);
    }
  } catch (e) {
    error.value = true;

    toast.error("โหลดข้อมูล swab สินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
      timeout: 1500,
    });
  } finally {
    loading.value = false;
  }
};

// const onTableRowClicked = (item): void => {
//   router.push(getRouteManageSwabProductHistory(item.id));
// };

watch(() => props, fetch, { immediate: true, deep: true });
</script>

<template>
  <div class="swab-product-history__list">
    <b-col v-if="error" class="text-center">
      <p>พบข้อผิดพลาดในการโหลดข้อมูล swab สินค้า</p>

      <b-button variant="dark" @click="fetch"> โหลดข้อมูลใหม่ </b-button>
    </b-col>

    <b-col v-else>
      <b-col v-if="loading" class="text-center">
        <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
      </b-col>

      <b-col v-else>
        <div v-if="tableData.length" class="d-grid gap-3">
          <b-list-group id="swabProductHistoryTable">
            <b-list-group-item
              v-for="item in tableData"
              :key="`swab-product-history-data-${item.id}`"
              class="d-flex justify-content-between align-items-start"
              :to="getRouteManageSwabProductHistory(item.id)"
            >
              <icon-complete :active="item.isCompleted"></icon-complete>

              <div class="ms-2 me-auto">
                <div class="fw-bold mb-1">
                  {{ item.code }}
                  <span v-if="item.productName.length"
                    >: {{ item.productName }}</span
                  >
                </div>
                <div>ช่วงตรวจ: {{ item.swabPeriodName }}</div>
                <small>
                  <span>กะ: {{ shiftToAbbreviation(item.shift) }}</span>
                  <!-- <span class="mx-2">|</span> -->
                  <!-- <span>ช่วงตรวจ: {{ item.swabPeriodName }}</span> -->
                  <span v-if="item.swabSampleTypeName.length" class="mx-2"
                    >|</span
                  >

                  <span v-if="item.swabSampleTypeName.length"
                    >ประเภทตัวอย่าง: {{ item.swabSampleTypeName }}</span
                  >

                  <span v-if="item.facilityName.length" class="mx-2">|</span>

                  <span v-if="item.facilityName.length"
                    >เครื่อง: {{ item.facilityName }}</span
                  >

                  <span v-if="item.facilityItemName.length" class="mx-2"
                    >|</span
                  >

                  <span v-if="item.facilityItemName.length"
                    >ไลน์: {{ item.facilityItemName }}</span
                  >

                  <span v-if="item.productLot.length" class="mx-2">|</span>

                  <span v-if="item.productLot.length"
                    >SubLot: {{ item.productLot }}</span
                  >

                  <span v-if="item.productDate.length" class="mx-2">|</span>

                  <span v-if="item.productDate.length"
                    >วันที่ผลิต: {{ item.productDate }}</span
                  >
                </small>
              </div>

              <!-- <badge-complete-status
                class="position-absolute end-0 me-2"
                :is-completed="item.isCompleted"
                complete-text="บันทึกครบเรียบร้อย"
                :in-complete-text="`บันทึกแล้ว ${item.countComplete}/${item.countArea} จุด`"
              ></badge-complete-status> -->

              <badge-complete-status
                class="position-absolute end-0 me-2"
                :is-completed="(item.isCompleted as boolean)"
              ></badge-complete-status>
            </b-list-group-item>
          </b-list-group>

          <!-- <b-table
            id="swabProductHistoryTable"
            hover
            small
            responsive
            :items="tableData"
            :fields="tableFields"
            @row-clicked="onTableRowClicked"
          >
            <template #cell(shift)="{ item }">
              {{ shiftToAbbreviation(item.shift as Shift) }}
            </template>

            <template #cell(status)="{ item }">
              <div class="text-center">
                <nuxt-link
                  v-slot="{ navigate }"
                  :to="getRouteManageSwabProductHistory(item.id)"
                  custom
                >
                  <CarbonEdit
                    style="
                       {
                        fontsize: '1em';
                      }
                    "
                    @click="navigate"
                  />
                </nuxt-link>
              </div>
            </template>

            <template #cell(action)="{ item }">
              <div class="text-center">
                <nuxt-link
                  v-slot="{ navigate }"
                  :to="getRouteManageSwabProductHistory(item.id)"
                  custom
                >
                  <CarbonEdit
                    style="
                       {
                        fontsize: '1em';
                      }
                    "
                    @click="navigate"
                  />
                </nuxt-link>
              </div>
            </template>

            <template #cell(isCompleted)="{ item }">
              <badge-complete-status
                :is-completed="(item.isCompleted as boolean)"
              ></badge-complete-status>
            </template>
          </b-table> -->

          <base-pagination
            v-model="pagination.$state.currentPage"
            :per-page="pagination.$state.perPage"
            :total-rows="countTotal"
            aria-controls="swabProductHistoryTable"
          />
        </div>

        <b-card v-else bg-variant="light">
          <b-card-text class="text-center">
            ไม่พบข้อมูล swab สินค้า
          </b-card-text>
        </b-card>
      </b-col>

      <!-- <swab-product-history-modal-delete
        v-model="removedId"
        @success="onDeleteSuccess"
      >
      </swab-product-history-modal-delete> -->
    </b-col>
  </div>
</template>
