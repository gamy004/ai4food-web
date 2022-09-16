<script lang="ts" setup>
import { useToast } from "vue-toastification";
import CarbonEdit from "~icons/carbon/edit";
import CarbonTrashCan from "~icons/carbon/trash-can";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import SwabProductHistory from "~~/models/SwabProductHistory";
import { Shift } from "~~/composables/useDate";

export interface Props {
    date: string;
    shift: Shift;
    facilityId?: string;
    facilityItemId?: string;
    swabPeriodId?: string;
}

const props = defineProps<Props>();
const route = useRoute();
const toast = useToast();

const { formatTimeThLocale } = useDate();

const {
    getSwabProductHistoriesByIds,
    getSwabPeriodById,
    getSwabTestById,
    api: swabApi
} = useSwab();

const {
    // getFacilityById,
    getFacilityItemById
} = useFacility();

const {
    getProductById
} = useProduct();

const loading = ref(false);
const error = ref(false);
const removedId = ref(null);
const swapProductHistoryIds = ref([]);

const getRouteManageSwabProductHistory = (id) => {
    return {
        name: "swab-product-history-update",
        params: {
            update: id
        },
        query: {
            redirect: route.fullPath
        }
    }
};

const swabProductHistories = computed(() => {
    let histories = getSwabProductHistoriesByIds(swapProductHistoryIds.value);

    return histories;
});

const tableFields = [
    // { key: 'date', label: 'วันที่' },
    { key: 'time', label: 'เวลา' },
    { key: 'code', label: 'รหัส' },
    { key: 'swabPeriodName', label: 'ช่วงตรวจ' },
    // { key: 'facilityName', label: 'เครื่อง' },
    { key: 'facilityItemName', label: 'ไลน์' },
    { key: 'productName', label: 'สินค้า' },
    { key: 'productLot', label: 'SubLot' },
    { key: 'action', label: '', thClass: "text-center", tdClass: "text-center" },
]
const tableData = computed(() => {
    return swabProductHistories.value.reduce(
        (acc, swabProductHistory) => {
            const swabPeriod = getSwabPeriodById(swabProductHistory.swabPeriodId);
            const swabTest = getSwabTestById(swabProductHistory.swabTestId);
            const facilityItem = getFacilityItemById(swabProductHistory.facilityItemId);
            // const facility = facilityItem ? getFacilityById(facilityItem.facilityId) : null;
            const product = getProductById(swabProductHistory.productId);

            acc.push({
                id: swabProductHistory.id,
                // date: swabProductHistory.swabProductDate,
                time: formatTimeThLocale(swabProductHistory.swabProductSwabedAt),
                code: swabTest.swabTestCode,
                swabPeriodName: swabPeriod.swabPeriodName,
                // facilityName: facility ? facility.facilityName : "ไม่ระบุ",
                facilityItemName: facilityItem ? facilityItem.facilityItemName : "ไม่ระบุ",
                productName: product.productName,
                productLot: swabProductHistory.productLot
            });

            return acc;
        }, []
    );
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
        props;
        const swapProductHistoryData: SwabProductHistory[] = await swabApi().loadSwabProductHistory(props);

        if (swapProductHistoryData && swapProductHistoryData.length) {
            swapProductHistoryIds.value = swapProductHistoryData.map(({ id }) => id);
        }
    } catch (e) {
        console.log(e);

        error.value = true;

        toast.error("โหลดข้อมูล swab สินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", { timeout: 1500 });
    } finally {
        loading.value = false;
    }
};

const onDeleteSuccess = async () => {
    await fetch(props);
}

const promptRemove = (id) => {
    removedId.value = id;
}

watch(() => props, fetch, { immediate: true, deep: true });

</script>

<template>
    <div class="swab-product-history__list">
        <b-col v-if="error" class="text-center">
            <p>พบข้อผิดพลาดในการโหลดข้อมูล swab สินค้า</p>

            <b-button variant="dark" @click="fetch">
                โหลดข้อมูลใหม่
            </b-button>
        </b-col>

        <b-col v-else>
            <b-col v-if="loading" class="text-center">
                <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
            </b-col>

            <b-col v-else>
                <b-table v-if="tableData.length" id="swabProductHistoryTable" hover small responsive :items="tableData"
                    :fields="tableFields">
                    <template #cell(status)="{ item }">
                        <div class="text-center">
                            <nuxt-link v-slot="{ navigate }" :to="getRouteManageSwabProductHistory(item.id)" custom>
                                <CarbonEdit style="{ fontSize: '1em'}" @click="navigate" />
                            </nuxt-link>
                        </div>
                    </template>

                    <template #cell(action)="{ item }">
                        <div class="text-center">
                            <nuxt-link v-slot="{ navigate }" :to="getRouteManageSwabProductHistory(item.id)" custom>
                                <CarbonEdit style="{ fontSize: '1em'}" @click="navigate" />
                            </nuxt-link>

                            <a href="javascript:void(0)" @click="promptRemove(item.id)" class="ms-3 text-danger">
                                <CarbonTrashCan style="{ fontSize: '1em'}" />
                            </a>
                        </div>
                    </template>
                </b-table>

                <b-card v-else bg-variant="light">
                    <b-card-text class="text-center">
                        ไม่พบข้อมูล swab สินค้า
                    </b-card-text>
                </b-card>
            </b-col>

            <swab-product-history-modal-delete v-model="removedId" @success="onDeleteSuccess">
            </swab-product-history-modal-delete>
        </b-col>
    </div>
</template>
