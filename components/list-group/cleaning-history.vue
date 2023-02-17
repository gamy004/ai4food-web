<script lang="ts" setup>
import { useToast } from "vue-toastification";
import CarbonCheckmarkFilled from "~icons/carbon/checkmark-filled";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { Shift } from "~~/composables/useDate";
import { Pagination } from "~~/composables/usePagination";

export interface Props {
  date: string;
  shift: Shift;
  facilityId?: string;
  facilityItemId?: string;
  swabAreaId?: string;
  swabPeriodId?: string;
  swabTestCode?: string;
  pagination: Pagination;
}

const props = withDefaults(defineProps<Props>(), {
  pagination: () => usePagination({ perPage: 20, currentPage: 1 }),
});

const route = useRoute();
const router = useRouter();
const { shiftToAbbreviation } = useDate();
// const { isAllRelatedSwabAreaCompleted } = useSwabAreaHistoryStatus();
const toast = useToast();

const {
  getSwabAreaHistoryById,
  getSwabAreaById,
  getSwabPeriodById,
  getSwabTestById,
} = useSwab();
const { getCleaningHistoryById, api: cleaningApi } = useCleaning();
const { getFacilityById, getFacilityItemById } = useFacility();
const countTotal = ref(0);
const hasData = ref(false);
const loading = ref(false);
const error = ref(false);
const cleaningHistoryIds = ref([]);

// const pagination = usePagination({
//   perPage: parseInt(route.query.perPage as string) || props.perPage,
//   currentPage: parseInt(route.query.currentPage as string) || props.currentPage,
// });

const getRouteUpdateCleaningHistory = (item) => {
  return {
    name: "update-cleaning-history-id",
    params: {
      id: item.id,
    },
    query: {
      redirect: route.fullPath,
    },
  };
};

const cleaningHistories = computed(() => {
  return cleaningHistoryIds.value.map(getCleaningHistoryById);
});

const displayData = computed(() => {
  return cleaningHistories.value.reduce((acc, cleaningHistory) => {
    const swabAreaHistory = getSwabAreaHistoryById(
      cleaningHistory.swabAreaHistoryId
    );

    const swabArea = getSwabAreaById(swabAreaHistory.swabAreaId);
    const swabPeriod = getSwabPeriodById(swabAreaHistory.swabPeriodId);
    const swabTest = getSwabTestById(swabAreaHistory.swabTestId);
    const facilityItem = getFacilityItemById(swabAreaHistory.facilityItemId);
    const facility = getFacilityById(swabArea.facilityId);
    // const { isCompleted, countComplete, countArea } =
    //   isAllRelatedSwabAreaCompleted(swabAreaHistory);

    const tableRecord = {
      id: cleaningHistory.id,
      time: swabAreaHistory.readableSwabAreaTime,
      code: swabTest.swabTestCode,
      shift: swabAreaHistory.shift,
      swabPeriodName: swabPeriod ? swabPeriod.swabPeriodName : "",
      swabAreaName: swabArea ? swabArea.swabAreaName : "",
      facilityName: facility ? facility.facilityName : "",
      facilityItemName: facilityItem ? facilityItem.facilityItemName : "",
      isCompleted: false,
      //   countComplete,
      //   countArea,
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

    return acc;
  }, []);
});

// const paginatedData = computed(() => pagination.paginate(displayData.value));

const isPropInvalid = (props): boolean => {
  return props.date === null;
};

const fetch = async function fetch(props) {
  if (isPropInvalid(props)) {
    return;
  }

  loading.value = true;
  error.value = false;
  hasData.value = true;
  countTotal.value = 0;
  cleaningHistoryIds.value = [];

  try {
    const { total, cleaningHistories } =
      await cleaningApi().loadCleaningHistory({
        ...props,
        skip: props.pagination.offset.value,
        take: props.pagination.$state.perPage,
      });

    countTotal.value = total;

    if (cleaningHistories && cleaningHistories.length) {
      cleaningHistoryIds.value = cleaningHistories.map(({ id }) => id);
    } else {
      hasData.value = false;
    }
  } catch (e) {
    console.log(e);

    error.value = true;

    toast.error("โหลดข้อมูลประวัติทำความสะอาดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
      timeout: 1500,
    });
  } finally {
    loading.value = false;
  }
};

// const onTableRowClicked = (item): void => {
//   router.push(getRouteUpdateSwabAreaHistory(item));
// };

watch(() => props, fetch, { immediate: true, deep: true });
</script>

<template>
  <div class="swab-product-history__list">
    <b-col v-if="error" class="text-center">
      <p>พบข้อผิดพลาดในการโหลดข้อมูลประวัติทำความสะอาด</p>

      <b-button variant="dark" @click="fetch(props)"> โหลดข้อมูลใหม่ </b-button>
    </b-col>

    <b-col v-else>
      <b-col v-if="loading" class="text-center">
        <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
      </b-col>

      <b-col v-else>
        <div v-if="hasData" class="d-grid gap-3">
          <!-- <b-table
            id="cleaningHistoryTable"
            hover
            small
            responsive
            :items="displayData"
            :fields="tableFields"
            @row-clicked="onTableRowClicked"
          >
            <template #cell(shift)="{ item }">
              {{ shiftToAbbreviation(item.shift) }}
            </template>

            <template #cell(status)="{ item }">
              <div class="text-center">
                <nuxt-link
                  v-slot="{ navigate }"
                  :to="getRouteUpdateSwabAreaHistory(item)"
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
                  :to="getRouteUpdateSwabAreaHistory(item)"
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
                :is-completed="item.isCompleted"
                complete-text="บันทึกครบเรียบร้อย"
                :in-complete-text="`บันทึกแล้ว ${item.countComplete}/${item.countArea} จุด`"
              ></badge-complete-status>
            </template>
          </b-table> -->

          <b-list-group id="cleaningHistoryListGroup">
            <b-list-group-item
              v-for="item in displayData"
              :key="`swab-area-history-data-${item.id}`"
              class="d-flex justify-content-between align-items-start"
              :to="getRouteUpdateCleaningHistory(item)"
            >
              <icon-complete :active="item.isCompleted"></icon-complete>

              <div class="ms-2 me-auto">
                <div class="fw-bold mb-1">
                  {{ item.code }}
                </div>
                <div>{{ item.swabAreaName }}</div>
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
                </small>
              </div>

              <badge-complete-status
                class="position-absolute end-0 me-2"
                :is-completed="item.isCompleted"
              ></badge-complete-status>
            </b-list-group-item>
          </b-list-group>

          <base-pagination
            v-model="pagination.$state.currentPage"
            :per-page="pagination.$state.perPage"
            :total-rows="countTotal"
            aria-controls="cleaningHistoryListGroup"
          />
          <!-- <b-pagination
            v-model="pagination.$state.currentPage"
            align="center"
            :total-rows="countTotal"
            :per-page="pagination.$state.perPage"
            first-number
            last-number
            aria-controls="cleaningHistoryTable"
          /> -->
        </div>

        <b-card v-else bg-variant="light">
          <b-card-text class="text-center">
            ไม่พบข้อมูลประวัติทำความสะอาด
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
