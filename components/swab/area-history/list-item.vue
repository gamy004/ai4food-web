<script lang="ts" setup>
import { ComputedRef } from "vue";
import CarbonCheckmarkFilled from "~icons/carbon/checkmark-filled";
import SwabAreaHistory from "~~/models/SwabAreaHistory";

export interface Props {
    itemNo?: number;
    prefixTitle?: string;
    // routeName: string;
    history: SwabAreaHistory;
}

const props = withDefaults(
  defineProps<Props>(),
  {
    prefixTitle: ""
  }
);

const route = useRoute();
const { getSwabAreaById } = useSwab();

const historySwabAreaName: ComputedRef<string> = computed(() => {
  const swabArea = getSwabAreaById(props.history.swabAreaId);

  return swabArea.swabAreaName;
});

const checkMarkClassName: ComputedRef<Record<string, boolean>> = computed(() => ({
  "text-secondary": !props.history.isCompleted,
  "text-success": props.history.isCompleted
}));

const badgeVariant: ComputedRef<string> = computed(() => props.history.isCompleted ? "success" : "light");

const badgeText: ComputedRef<string> = computed(() => props.history.isCompleted ? "บันทึกสำเร็จ" : "บันทึกไม่สำเร็จ");

const itemTitle: ComputedRef<string> = computed(() => {
  const { prefixTitle, itemNo } = props;

  let name = prefixTitle;

  if (itemNo) {
    name += ` ${itemNo.toString()}`;
  }

  return name;
});

const pageUpdateSwabAreaHistory: ComputedRef<object> = computed(() => {
  const routeParam = {
    name: "swab-area-history-name",
    // name: props.routeName,
    params: {
      name: historySwabAreaName.value
    },
    query: {
      areaTitle: itemTitle.value,
      id: props.history.id,
      redirect: route.fullPath
    }
  };

  return routeParam;
});

</script>

<template>
  <nuxt-link
    v-slot="{ navigate }"
    :to="pageUpdateSwabAreaHistory"
    class="list-group-item__swab-area-history text-decoration-none"
    custom
  >
    <b-list-group-item class="d-flex justify-content-between align-items-center py-4" @click="navigate">
      <span>
        <carbon-checkmark-filled
          :style="{ fontSize: '1em', marginRight: '1rem' }"
          :class="checkMarkClassName"
        />

        <b>{{ itemTitle }} : </b>

        {{ historySwabAreaName }}
      </span>

      <b-badge :variant="badgeVariant" pill>
        {{ badgeText }}
      </b-badge>
    </b-list-group-item>
  </nuxt-link>
</template>
