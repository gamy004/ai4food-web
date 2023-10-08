<script lang="ts" setup>
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { groupBy, sortedUniqBy } from "lodash";
import { useToast } from "vue-toastification";
import { Shift } from "~~/composables/useDate";

const { api: swabApi } = useSwab();

const { formatThLocale } = useDate();

const { getSwabPeriodById } = useSwab();

const { api: swabPeriodApi } = useSwab();

export interface Props {
  date: string;
}

const props = defineProps<Props>();

const isPropInvalid = (props): boolean => {
  return props.date === null || props.dateRange === null;
};
const toast = useToast();
const swabPlans = ref([]);
const swabPlanGroupByDate = ref({});
const loading = ref(false);
const error = ref(false);

const swabPeriodSortTemplate = [
  "หลังประกอบเครื่อง",
  "ก่อนล้างระหว่างงาน",
  "หลังล้างระหว่างงาน",
  "เดินไลน์หลังพัก 4 ชม.",
  "ก่อน Super Big Cleaning",
  "ก่อนล้างท้ายกะ",
  "หลัง Super Big Cleaning",
  "หลังล้างท้ายกะ",
];

const fetchSwabPeriod = async () => {
  loading.value = true;
  try {
    await swabPeriodApi().loadAllSwabPeriod();
  } catch (error) {
    toast.error("ไม่สามารถโหลดข้อมูลช่วงตรวจได้", { timeout: 1000 });
  }
};

const emit = defineEmits(["update:item", "delete:item"]);

const promptEdit = (id) => {
  emit("update:item", id);
};

const promptRemove = (id) => {
  emit("delete:item", id);
};

const fetch = async function fetch(props) {
  if (isPropInvalid(props)) {
    return;
  }

  error.value = false;

  loading.value = true;

  try {
    swabPlans.value = [];
    swabPlanGroupByDate.value = {};

    const [year, month] = props.date.split("-");
    const data = await swabApi().loadAllSwabPlan({ year, month });
    if (data.length) {
      const groupByDate = groupBy(data, "swabPlanDate");

      for (const key in groupByDate) {
        if (Object.prototype.hasOwnProperty.call(groupByDate, key)) {
          const planPerDate = groupByDate[key];

          const plans = planPerDate.reduce((acc, swabPlan) => {
            const swabPeriod = getSwabPeriodById(swabPlan.swabPeriodId);

            const tableRecord = {
              ...swabPlan,
              swabPeriod,
            };
            acc.push(tableRecord);

            return acc;
          }, []);

          const dayShift = plans.filter((record) => record.shift === Shift.DAY);
          const nightShift = plans.filter(
            (record) => record.shift === Shift.NIGHT
          );

          const day = [];
          const night = [];
          for (let index = 0; index < swabPeriodSortTemplate.length; index++) {
            const swabPeriod = swabPeriodSortTemplate[index];

            const d = dayShift.find(
              (record) => record.swabPeriod?.swabPeriodName === swabPeriod
            );
            if (d) {
              if (
                swabPeriod === "ก่อนล้างท้ายกะ" &&
                dayShift.find(
                  (record) =>
                    record.swabPeriod?.swabPeriodName ===
                    "ก่อน Super Big Cleaning"
                )
              ) {
                continue;
              }

              if (
                swabPeriod === "หลังล้างท้ายกะ" &&
                dayShift.find(
                  (record) =>
                    record.swabPeriod?.swabPeriodName ===
                    "หลัง Super Big Cleaning"
                )
              ) {
                continue;
              }
              day.push(d);
            }

            const n = nightShift.find(
              (record) => record.swabPeriod?.swabPeriodName === swabPeriod
            );
            if (n) {
              if (
                swabPeriod === "ก่อนล้างท้ายกะ" &&
                nightShift.find(
                  (record) =>
                    record.swabPeriod?.swabPeriodName ===
                    "ก่อน Super Big Cleaning"
                )
              ) {
                continue;
              }

              if (
                swabPeriod === "หลังล้างท้ายกะ" &&
                nightShift.find(
                  (record) =>
                    record.swabPeriod?.swabPeriodName ===
                    "หลัง Super Big Cleaning"
                )
              ) {
                continue;
              }
              night.push(n);
            }
          }

          const planSorted = [...day, ...night];
          swabPlans.value = [...swabPlans.value, ...planSorted];
        }
      }

      swabPlanGroupByDate.value = groupBy(swabPlans.value, "swabPlanDate");
    }
  } catch (e) {
    console.log(e);

    error.value = true;

    toast.error(
      "โหลดข้อมูลจุดตรวจ swab สำหรับอัพเดตไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
      { timeout: 1500 }
    );
  } finally {
    loading.value = false;
  }
};

watch(() => props, fetchSwabPeriod, { immediate: true, deep: true });
watch(() => props, fetch, { immediate: true, deep: true });

defineExpose({
  fetch,
});
</script>

<template>
  <div class="swab-plan__list">
    <b-col v-if="error" class="text-center">
      <p>พบข้อผิดพลาดในการโหลดข้อมูลจุดตรวจ swab</p>

      <b-button variant="dark" @click="fetch"> โหลดข้อมูลใหม่ </b-button>
    </b-col>

    <b-col v-else>
      <b-col v-if="loading" class="text-center">
        <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
      </b-col>

      <b-col v-else>
        <b-list-group v-if="swabPlans.length" class="list-group__swab-plan">
          <div v-for="(value, key, index) in swabPlanGroupByDate" :key="index">
            <div class="fw-bold mb-3">{{ formatThLocale(key) }}</div>
            <swab-plan-list-item
              :items="value"
              class="mb-5"
              @update:item="promptEdit"
              @delete:item="promptRemove"
            ></swab-plan-list-item>
          </div>
        </b-list-group>

        <b-card v-else bg-variant="light">
          <b-card-text class="text-center"> ไม่พบข้อมูลแผนการตรวจ </b-card-text>
        </b-card>
      </b-col>
    </b-col>
  </div>
</template>
