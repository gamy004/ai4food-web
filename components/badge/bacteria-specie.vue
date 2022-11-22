<script lang="ts" setup>
import { ColorVariant } from "bootstrap-vue-3/src/types";
import { ComputedRef } from "vue";
import { useLab } from "~~/composables/useLab";

export interface Props {
  swabTestId: string;
}

const { getBacteriaBySwabTestId, getBacteriaSpecieBySwabTestId } = useLab();

const props = defineProps<Props>();

const bacteriaSpecies = computed(() => {
  return getBacteriaSpecieBySwabTestId(props.swabTestId);
});

const hasBacteria: ComputedRef<boolean> = computed(() => {
  const bacteria = getBacteriaBySwabTestId(props.swabTestId);

  return bacteria && bacteria.length > 0;
});

const hasBacteriaSpecie: ComputedRef<boolean> = computed(() => {
  return bacteriaSpecies.value && bacteriaSpecies.value.length > 0;
});
</script>

<template>
  <div v-if="hasBacteria">
    <span v-if="hasBacteriaSpecie">
      <b-badge
        v-for="bacteriaSpecie in bacteriaSpecies"
        variant="danger"
        pill
        class="mx-1"
      >
        {{ bacteriaSpecie.bacteriaSpecieName }}
      </b-badge>
    </span>

    <b-badge v-else variant="primary" pill> รอผลตรวจ </b-badge>
  </div>
</template>
