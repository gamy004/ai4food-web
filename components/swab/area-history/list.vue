<script lang="ts" setup>
import { useToast } from "vue-toastification";
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import SwabAreaHistory from "~~/models/SwabAreaHistory";
import { Shift } from "~~/composables/useDate";

export interface Props {
  date: string;
  shift: Shift;
  facilityId?: string;
  mainSwabAreaId?: string;
  swabPeriodId?: string;
}

const props = defineProps<Props>();
const toast = useToast();
const {
  loadSwabAreaToSwabAreaHistory,
  getSwabAreaHistoriesByIds,
  api: swabApi,
} = useSwab();

const loading = ref(false);
const error = ref(false);
const mainSwapAreaHistoryIds = ref([]);

const mainAreaHistories = computed(() => {
  const swabAreaHistories = getSwabAreaHistoriesByIds(
    mainSwapAreaHistoryIds.value
  );

  return loadSwabAreaToSwabAreaHistory(swabAreaHistories);
});

const subAreaHistories = computed(() => {
  console.log(mainAreaHistories.value);

  return mainAreaHistories.value.reduce((acc, mainAreaHistory) => {
    console.log(mainAreaHistory);

    const { subSwabAreaHistoryIds = [] } = mainAreaHistory;

    if (subSwabAreaHistoryIds.length) {
      acc = [...acc, ...getSwabAreaHistoriesByIds(subSwabAreaHistoryIds)];
    }

    return acc;
  }, []);
});

const isPropInvalid = (props): boolean => {
  return (
    props.facilityId === null ||
    props.mainSwabAreaId === null ||
    props.swabPeriodId === null
  );
};

const fetch = async function fetch(props) {
  mainSwapAreaHistoryIds.value = [];

  if (isPropInvalid(props)) {
    return;
  }

  error.value = false;

  loading.value = true;

  try {
    const { swabAreaHistories } = await swabApi().loadSwabAreaHistoryV2(props);

    if (swabAreaHistories && swabAreaHistories.length) {
      mainSwapAreaHistoryIds.value = swabAreaHistories.map(({ id }) => id);
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

watch(() => props, fetch, { immediate: true, deep: true });
</script>

<template>
  <div class="swab-area-history__list">
    <b-col v-if="error" class="text-center">
      <p>พบข้อผิดพลาดในการโหลดข้อมูลจุดตรวจ swab</p>

      <b-button variant="dark" @click="fetch"> โหลดข้อมูลใหม่ </b-button>
    </b-col>

    <b-col v-else>
      <b-col v-if="loading" class="text-center">
        <LineMdLoadingTwotoneLoop :style="{ fontSize: '2em' }" />
      </b-col>

      <b-col v-else>
        <b-list-group
          v-if="mainAreaHistories.length"
          class="list-group__swab-area-history"
        >
          <swab-area-history-list-item
            v-for="mainAreaHistory in mainAreaHistories"
            :key="mainAreaHistory.id"
            :history="mainAreaHistory"
            :prefix-title="`จุดหลัก (${mainAreaHistory.swabTestCode})`"
          />

          <hr v-if="subAreaHistories.length" />

          <swab-area-history-list-item
            v-for="(subAreaHistory, index) in subAreaHistories"
            :key="subAreaHistory.id"
            :history="subAreaHistory"
            :item-no="index + 1"
            prefix-title="จุดย่อยที่"
          />
        </b-list-group>

        <b-card v-else bg-variant="light">
          <b-card-text class="text-center">
            ไม่พบข้อมูลจุดตรวจ swab ที่ต้องบันทึก
          </b-card-text>
        </b-card>
      </b-col>
    </b-col>
  </div>
</template>
