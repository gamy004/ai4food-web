<script setup lang="ts">
definePageMeta({
  title: "Ai4FoodSafety - Swab Plan Create Page",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: {
    name: "/",
  },
});

const show = ref(false);

const swabPlanListRef = ref(null);

const route = useRoute();

const { today, onlyMonth } = useDate();

const currentDate = today();

const filter = reactive({
  date: (route.query.date as string) || onlyMonth(currentDate),
});

const createPlan = () => {
  show.value = true;
};

const onManagedSuccess = async () => {
  swabPlanListRef.value?.fetch({ date: filter.date });
};
</script>

<template>
  <div class="page__swab-plan-create mt-4">
    <h2 class="font-weight-bold">แผนการตรวจ</h2>

    <b-row align-v="end">
      <b-col cols="12" md="9">
        <swab-plan-filter v-model="filter"></swab-plan-filter>
      </b-col>
      <b-col cols="12" md="3" class="text-end">
        <b-button variant="outline-primary" @click="createPlan">
          เพิ่มแผน
        </b-button>
      </b-col>
    </b-row>

    <b-row class="mt-5">
      <b-col cols="12">
        <swab-plan-list
          ref="swabPlanListRef"
          :date="filter.date"
        ></swab-plan-list>
      </b-col>
    </b-row>

    <swab-plan-modal-manage
      v-model:show-value="show"
      @success="onManagedSuccess"
    />
  </div>
</template>
