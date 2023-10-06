<script lang="ts" setup>
import LineMdLoadingTwotoneLoop from "~icons/line-md/loading-twotone-loop";
import { groupBy } from "lodash";
import { useToast } from "vue-toastification";
const { api: swabApi } = useSwab();

const { formatThLocale } = useDate();

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
      swabPlans.value = data;
      const groupByDate = groupBy(data, "swabPlanDate");
      swabPlanGroupByDate.value = groupByDate;
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
