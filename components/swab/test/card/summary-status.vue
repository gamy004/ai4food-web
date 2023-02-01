<script lang="ts" setup>
import { SwabStatus, SwabStatusMapper } from "~~/composables/useSwab";
import SwabTest from "~~/models/SwabTest";

export interface Props {
  data: SwabTest[];
  status: SwabStatus;
}

const { percentOf } = useMath();
const props = defineProps<Props>();

const statuses = computed<SwabStatusMapper[]>(() => {
  return props.data.map((swabTest) => {
    return swabTest.status;
  });
});

const countStatus = (target: SwabStatusMapper[], value: SwabStatusMapper) => {
  return target.reduce((acc, status) => {
    if (status === value) {
      acc += 1;
    }

    return acc;
  }, 0);
};

const countPendingRecord = computed(() => {
  return countStatus(statuses.value, SwabStatusMapper.pending);
});

const countNormalRecord = computed(() => {
  return countStatus(statuses.value, SwabStatusMapper.normal);
});

const countDetectedBacteriaRecord = computed(() => {
  return countStatus(statuses.value, SwabStatusMapper.detected);
});

const percentDetectedBacteria = computed(() => {
  let percent = 0;

  if (statuses.value.length > 0) {
    const countRecordedData = statuses.value.length - countPendingRecord.value;

    percent = percentOf(countDetectedBacteriaRecord.value, countRecordedData);
  }

  return percent;
});

const percentNormal = computed(() => {
  let percent = 0;

  if (statuses.value.length > 0) {
    const countRecordedData = statuses.value.length - countPendingRecord.value;

    percent = percentOf(countNormalRecord.value, countRecordedData);
  }

  return percent;
});
</script>
<template>
  <b-card-group deck>
    <b-card align="center">
      <b-card-text
        ><h4>{{ SwabStatusMapper.all }}</h4></b-card-text
      >
      <b-card-text>{{ data.length }} รายการ</b-card-text>
    </b-card>

    <b-card
      v-if="status === SwabStatus.ALL"
      border-variant="primary"
      body-bg-variant="primary"
      body-text-variant="white"
      align="center"
    >
      <b-card-text
        ><h4>{{ SwabStatusMapper.pending }}</h4></b-card-text
      >
      <b-card-text>{{ countPendingRecord }} รายการ</b-card-text>
    </b-card>

    <b-card
      v-if="status === SwabStatus.ALL"
      border-variant="success"
      body-bg-variant="success"
      body-text-variant="white"
      align="center"
    >
      <b-card-text
        ><h4>{{ SwabStatusMapper.normal }}</h4></b-card-text
      >
      <b-card-text>
        {{ countNormalRecord }} รายการ ({{ percentNormal }}%)
      </b-card-text>
    </b-card>

    <b-card
      v-if="status === SwabStatus.ALL"
      border-variant="danger"
      body-bg-variant="danger"
      body-text-variant="white"
      align="center"
    >
      <b-card-text
        ><h4>{{ SwabStatusMapper.detected }}</h4></b-card-text
      >
      <b-card-text>
        {{ countDetectedBacteriaRecord }} รายการ ({{
          percentDetectedBacteria
        }}%)
      </b-card-text>
    </b-card>
  </b-card-group>
</template>
