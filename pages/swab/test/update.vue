<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import LabTest from "~~/models/LabTest";

definePageMeta({
    title: "Ai4FoodSafety - Update Test Page",

    middleware: [
        "auth"
    ],

    canGoBack: true
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { today, onlyDate, formatTimeThLocale } = useDate();
const { api: swabApi } = useSwab();

const perPage = ref(100);
const currentPage = ref(1);
const currentDate = today();
const results = ref([]);
const hasResults = ref(false);
const loading = ref(false);
const error = ref(false);
const labTestId = ref();

const form = reactive({
    date: route.query.date as string || onlyDate(currentDate)
});

const filteredData = computed(
    () => results.value.filter((_, idx) => {
        return (idx >= (currentPage.value - 1) * perPage.value) && (idx < currentPage.value * perPage.value);
    })
);

const status = (el) => {
    console.debug("watch bacteria: ", el.swabTest.bacteria)
    if (el.swabTest.swabTestRecordedAt === null) {
        return "รอผล"
    }
    else if (el.swabTest.swabTestRecordedAt !== null && el.swabTest.bacteria.length === 0) {

        return "ปกติ"
    }
    else if (el.swabTest.swabTestRecordedAt !== null && el.swabTest.bacteria.length > 0) {
        return "พบเชื้อ"
    }
    else {
        return "Error"
    }
}

const fetch = async () => {
    hasResults.value = false;
    error.value = false;
    loading.value = true;

    try {
        results.value = [];
        const labTestData: LabTest[] = await swabApi().loadAllSwabTest(form.date);

        if (labTestData && labTestData.length) {
            // console.debug("watch labtestdata: ", labTestData)
            // labTestId.value = labTestData.map(({ swabTestId }) => swabTestId);
            labTestData.forEach((el, idx) => {
                // console.debug("watch index: ", idx)
                // console.debug("watch element: ", el)

                results.value.push({
                    ลำดับ: idx + 1,
                    // วันที่: el.swabAreaDate,
                    เวลา: formatTimeThLocale(el.swabAreaSwabedAt),
                    ช่วงตรวจ: el.swabPeriod ? el.swabPeriod.swabPeriodName : "",
                    เครื่อง: el.swabArea.facility.facilityName,
                    จุดตรวจ: el.swabArea.swabAreaName,
                    รหัส: el.swabTest.swabTestCode,
                    สถานะ: status(el),
                    id: el.id,
                    swabTestId: el.swabTestId,
                    hasBacteria: el.swabTest.bacteria.length > 0,
                    bacteria: el.swabTest.bacteria
                });
            });
        }

        hasResults.value = results.value.length > 0;
    } catch (e) {
        console.log(e);

        error.value = true;
    } finally {
        loading.value = false;
    }
};

async function onSubmit(swabTestId, hasBacteria) {
    error.value = false;
    loading.value = true;

    try {
        await swabApi().updateLabTestById(swabTestId, !hasBacteria);

        fetch();
    } catch (e) {
        console.log(e);

        error.value = true;
        toast.error("อัพเดทผลแล็ปไม่สำเร็จ", { timeout: 1000 });
    } finally {
        loading.value = false;
    }
}

// onBeforeMount(fetch);
watch(() => form.date, fetch, { immediate: true, deep: true });
</script>

<template>
    <div class="page__update-plan mt-4">
        <h2 class="font-weight-bold text-center">
            อัพเดทผลการตรวจ swab test
        </h2>

        <div v-if="loading" class="col text-center mt-5">
            <line-md-loading-twotone-loop :style="{ fontSize: '2em' }" />
        </div>

        <div v-else class="d-grid gap-2 mt-3">
            <test-filter v-model="form" />

            <hr>

            <div v-if="hasResults">
                <!-- <b-table id="result-table" hover small caption-top responsive :items="filteredData" /> -->
                <b-table-simple hover small caption-top responsive>
                    <thead>
                        <tr>
                            <th>ลำดับ</th>
                            <th>เวลา</th>
                            <th>ช่วงตรวจ</th>
                            <th>เครื่อง</th>
                            <th>จุดตรวจ</th>
                            <th>รหัส</th>
                            <th>สถานะ</th>
                            <th>พบเชื้อ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="result in filteredData" :key="result['id']">
                            <td>{{ result['ลำดับ'] }}</td>
                            <td>{{ result['เวลา'] }}</td>
                            <td>{{ result['ช่วงตรวจ'] }}</td>
                            <td>{{ result['เครื่อง'] }}</td>
                            <td>{{ result['จุดตรวจ'] }}</td>
                            <td>{{ result['รหัส'] }}</td>
                            <td>{{ result['สถานะ'] }}</td>
                            <td>
                                <b-form-checkbox :value="true" v-model="result['hasBacteria']"
                                    @click="onSubmit(result['swabTestId'], result['hasBacteria'])" />
                            </td>
                        </tr>
                    </tbody>
                </b-table-simple>
                <b-pagination v-model="currentPage" align="center" :total-rows="results.length" :per-page="perPage"
                    aria-controls="result-table" />
            </div>
            <div v-else>
                <b-card bg-variant="light">
                    <b-card-text class="text-center">
                        ไม่พบข้อมูลผลการตรวจ swab
                    </b-card-text>
                </b-card>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.input {
    &__swab-area-date {
        margin-left: 0.1rem !important;
    }
}
</style>
