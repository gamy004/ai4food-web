<script lang="ts" setup>
import { useToast } from "vue-toastification";
import CarbonEdit from "~icons/carbon/edit";
// import CarbonTrashCan from "~icons/carbon/trash-can";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { Shift } from "~~/composables/useDate";

export interface Props {
  date: string;
  shift: Shift;
  facilityId?: string;
  mainSwabAreaId?: string;
  swabPeriodId?: string;
  perPage?: number;
  currentPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 20,
  currentPage: 1,
});
const route = useRoute();
const router = useRouter();
const { updateQueryParams, getCurrentQuery } = useQueryParams();
const { shiftToAbbreviation } = useDate();
const { isAllRelatedSwabAreaCompleted } = useSwabAreaHistoryStatus();
const toast = useToast();

const {
  getSwabAreaHistoryById,
  getSwabAreaById,
  getSwabPeriodById,
  getSwabTestById,
  api: swabApi,
} = useSwab();
const { getFacilityById, getFacilityItemById } = useFacility();
const countTotal = ref(0);
const hasData = ref(false);
const loading = ref(false);
const error = ref(false);
const swapAreaHistoryIds = ref([]);

const pagination = usePagination({
  perPage: parseInt(route.query.perPage as string) || props.perPage,
  currentPage: parseInt(route.query.currentPage as string) || props.currentPage,
});

const getRouteUpdateSwabAreaHistory = (id) => {
  const swabAreaHistory = getSwabAreaHistoryById(id);
  const swabArea = getSwabAreaById(swabAreaHistory.swabAreaId);

  return {
    name: "swab-area-history-update",
    query: {
      date: swabAreaHistory.swabAreaDate,
      shift: swabAreaHistory.shift,
      swabPeriodId: swabAreaHistory.swabPeriodId,
      facilityId: swabArea.facilityId,
      mainSwabAreaId: swabAreaHistory.swabAreaId,
      redirect: route.fullPath,
    },
  };
};

const swabAreaHistories = computed(() => {
  return swapAreaHistoryIds.value.map(getSwabAreaHistoryById);
});

const tableFields = [
  // { key: 'date', label: 'วันที่' },
  { key: "code", label: "รหัส", thStyle: { width: "10%" } },
  { key: "shift", label: "กะ", thStyle: { width: "5%" } },
  { key: "swabPeriodName", label: "ช่วงตรวจ", thStyle: { width: "15%" } },
  { key: "swabAreaName", label: "จุดตรวจ", thStyle: { width: "30%" } },
  { key: "facilityName", label: "เครื่อง", thStyle: { width: "10%" } },
  { key: "facilityItemName", label: "ไลน์", thStyle: { width: "10%" } },
  { key: "time", label: "เวลาบันทึก", thStyle: { width: "10%" } },
  // { key: "productName", label: "จุดตรวจ" },
  // { key: "productDate", label: "วันที่ผลิต" },
  // { key: "productLot", label: "SubLot" },
  {
    key: "isCompleted",
    label: "สถานะ",
    thClass: "text-center",
    tdClass: "text-center",
    thStyle: { width: "10%" },
  },
  { key: "action", label: "", thClass: "text-center", tdClass: "text-center" },
];

const tableData = computed(() => {
  return swabAreaHistories.value.reduce((acc, swabAreaHistory) => {
    const swabArea = getSwabAreaById(swabAreaHistory.swabAreaId);
    const facility = getFacilityById(swabArea.facilityId);
    const swabPeriod = getSwabPeriodById(swabAreaHistory.swabPeriodId);
    const swabTest = getSwabTestById(swabAreaHistory.swabTestId);
    const facilityItem = getFacilityItemById(swabAreaHistory.facilityItemId);

    const { isCompleted, countComplete, countArea } =
      isAllRelatedSwabAreaCompleted(swabAreaHistory);

    const tableRecord = {
      id: swabAreaHistory.id,
      // date: swabAreaHistory.swabAreaDate,
      time: swabAreaHistory.readableSwabAreaTime,
      code: swabTest.swabTestCode,
      shift: swabAreaHistory.shift,
      swabPeriodName: swabPeriod ? swabPeriod.swabPeriodName : "",
      swabAreaName: swabArea ? swabArea.swabAreaName : "",
      facilityName: facility ? facility.facilityName : "",
      facilityItemName: facilityItem ? facilityItem.facilityItemName : "",
      // productName: product ? product.productName : "",
      // productDate: swabAreaHistory.readableProductDate,
      // productLot: swabAreaHistory.productLot || "",
      isCompleted,
      countComplete,
      countArea,
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

// const paginatedData = computed(() => pagination.paginate(tableData.value));

const isPropInvalid = (props): boolean => {
  return props.date === null;
};

const fetch = async function fetch(props) {
  countTotal.value = 0;
  hasData.value = true;

  swapAreaHistoryIds.value = [];

  if (isPropInvalid(props)) {
    return;
  }

  error.value = false;

  loading.value = true;

  try {
    const { total, swabAreaHistories } = await swabApi().loadSwabAreaHistoryV2({
      ...props,
      skip: pagination.offset.value,
      take: pagination.$state.perPage,
    });

    countTotal.value = total;

    if (swabAreaHistories && swabAreaHistories.length) {
      swapAreaHistoryIds.value = swabAreaHistories.map(({ id }) => id);
    } else {
      hasData.value = false;
    }
  } catch (e) {
    console.log(e);

    error.value = true;

    toast.error("โหลดข้อมูล swab จุดตรวจไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", {
      timeout: 1500,
    });
  } finally {
    loading.value = false;
  }
};

const onTableRowClicked = (item): void => {
  router.push(getRouteUpdateSwabAreaHistory(item.id));
};

watch(() => props, fetch, { immediate: true, deep: true });

watch(
  () => pagination.$state,
  (paginationState) => {
    updateQueryParams({
      ...getCurrentQuery(),
      perPage: paginationState.perPage,
      currentPage: paginationState.currentPage,
    });

    fetch(props);
  },
  { deep: true }
);
</script>

<template>
  <div class="swab-product-history__list">
    <b-col v-if="error" class="text-center">
      <p>พบข้อผิดพลาดในการโหลดข้อมูล swab จุดตรวจ</p>

      <b-button variant="dark" @click="fetch(props)"> โหลดข้อมูลใหม่ </b-button>
    </b-col>

    <b-col v-else>
      <b-col v-if="loading" class="text-center">
        <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
      </b-col>

      <b-col v-else>
        <div v-if="hasData">
          <b-table
            id="swabProductHistoryTable"
            hover
            small
            responsive
            :items="tableData"
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
                  :to="getRouteUpdateSwabAreaHistory(item.id)"
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
                  :to="getRouteUpdateSwabAreaHistory(item.id)"
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

                <!-- <a
                href="javascript:void(0)"
                @click="promptRemove(item.id)"
                class="ms-3 text-danger"
              >
                <CarbonTrashCan
                  style="
                     {
                      fontsize: '1em';
                    }
                  "
                />
              </a> -->
              </div>
            </template>

            <template #cell(isCompleted)="{ item }">
              <badge-complete-status
                :is-completed="item.isCompleted"
                complete-text="บันทึกครบเรียบร้อย"
                :in-complete-text="`บันทึกแล้ว ${item.countComplete}/${item.countArea} จุด`"
              ></badge-complete-status>
            </template>
          </b-table>

          <b-pagination
            v-model="pagination.$state.currentPage"
            align="center"
            :total-rows="countTotal"
            :per-page="pagination.$state.perPage"
            first-number
            last-number
            aria-controls="swabProductHistoryTable"
          />
        </div>

        <b-card v-else bg-variant="light">
          <b-card-text class="text-center">
            ไม่พบข้อมูล swab จุดตรวจ
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
