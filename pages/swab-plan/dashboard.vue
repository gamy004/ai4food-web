<script setup lang="ts">
definePageMeta({
  title: "Ai4FoodSafety - Swab Plan Create Page",
  middleware: ["auth"],
  canGoBack: true,
  fallBackRedirect: {
    name: "/",
  },
});

const route = useRoute();

const { today, onlyMonth } = useDate();

const currentDate = today();

const form = reactive({
  date: (route.query.date as string) || onlyMonth(currentDate),
});
</script>

<template>
  <div class="page__swab-plan-create mt-4">
    <h2 class="font-weight-bold">แผนการตรวจ</h2>

    <b-row align-v="end">
      <b-col cols="12" md="9">
        <swab-plan-filter v-model="form"></swab-plan-filter>
      </b-col>
      <b-col cols="12" md="3" class="text-end">
        <b-button variant="outline-primary"> สร้างแผน </b-button>
      </b-col>
    </b-row>
  </div>
</template>
