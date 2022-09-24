<script lang="ts" setup>
definePageMeta({
  title: "Ai4FoodSafety - Home Page",

  middleware: ["auth"],
});

const route = useRoute();
const { isAuthenticated, authUser } = useAuth();

const pageExportSwabPlan = {
  name: "export-swab-report",
};

const pageSwabArea = {
  name: "swab-area",
};

const pageSwabProduct = {
  name: "swab-product",
};

const pageUpdateSwabArea = {
  name: "swab-test-update-area",
};

const pageUpdateSwabProduct = {
  name: "swab-test-update-product",
};

const pageManageSwabArea = {
  name: "manage-swab-area",
};
</script>

<template>
  <div class="page__home mt-4">
    <div v-if="isAuthenticated" class="row">
      <div class="col">
        <h2 class="font-weight-bold">
          ยินดีต้อนรับ, {{ authUser.displayName }}
        </h2>
      </div>
    </div>

    <div class="row">
      <div class="col col-md-6 col-lg-4">
        <div v-if="authUser.isInSwabTeam" class="d-grid gap-2 mt-4">
          <h4 class="font-weight-bold">รายการข้อมูลพื้นฐาน</h4>
          <nuxt-link v-slot="{ navigate }" :to="pageExportSwabPlan" custom>
            <button-arrow-right
              variant="outline-primary"
              block
              size="lg"
              class="w-100"
              @click="navigate"
            >
              รายการจุดตรวจ swab
            </button-arrow-right>
          </nuxt-link>
        </div>

        <div class="d-grid gap-2 mt-4">
          <h4 class="font-weight-bold">ระบบบันทึกข้อมูล</h4>

          <nuxt-link v-slot="{ navigate }" :to="pageSwabArea" custom>
            <button-arrow-right
              v-if="authUser.isInSwabTeam"
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              บันทึกจุดตรวจ Swab
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link v-slot="{ navigate }" :to="pageSwabProduct" custom>
            <button-arrow-right
              v-if="authUser.isInSwabTeam"
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              บันทึกการตรวจสินค้า
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link v-slot="{ navigate }" :to="pageUpdateSwabArea" custom>
            <button-arrow-right
              v-if="authUser.isInLabTeam"
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              บันทึกผลจุดตรวจ Swab
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link v-slot="{ navigate }" :to="pageUpdateSwabProduct" custom>
            <button-arrow-right
              v-if="authUser.isInLabTeam"
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              บันทึกผลการตรวจสินค้า
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link v-slot="{ navigate }" :to="pageManageSwabArea" custom>
            <button-arrow-right
              v-if="authUser.isInSwabTeam"
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              จัดการจุดตรวจ swab
            </button-arrow-right>
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>
