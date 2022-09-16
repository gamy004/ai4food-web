<script lang="ts" setup>
import CarbonCheckmarkFilled from "~icons/carbon/checkmark-filled";
import SwabArea from "~~/models/SwabArea";
import LabTest from "~~/models/LabTest";

export interface Props {
    history?: LabTest
}

const props = withDefaults(
  defineProps<Props>(),
  {
    history: null
  }
);

// const { loadSwabAreaToSwabAreaHistory } = useSwab();

// const historyWithSwabAreas = computed((): LabTest[] => {
//     return loadSwabAreaToSwabAreaHistory(props.history);
// });

// const mainAreaHistories = computed((): LabTest[] => {
//     return historyWithSwabAreas.value.filter(({ swabArea: SwabArea }) => SwabArea.isMainArea)
// });

// const subAreaHistories = computed((): LabTest[] => {
//     return historyWithSwabAreas.value.filter(({ swabArea: SwabArea }) => SwabArea.isSubArea)
// });

// const rederedHistories = computed((): SwabAreaHistory[] => {
//     return [
//         ...mainAreaHistory.valiese,
//         ...subAreaHistory.value
//     ]
// });

</script>

<template>
  <b-list-group v-if="history" class="list-group__swab-area-history">
    <test-area-history-list-item
      :history="history"
      prefix-title="รหัส"
    />
  </b-list-group>

  <b-card v-else bg-variant="light">
    <b-card-text class="text-center">
      ไม่พบข้อมูลผลการ swab test
    </b-card-text>
  </b-card>
</template>
