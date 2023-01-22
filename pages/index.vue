<script lang="ts" setup>
definePageMeta({
  title: "Ai4FoodSafety - Home Page",

  middleware: ["auth"],
});

const route = useRoute();
const { isAuthenticated, authUser } = useAuth();

const pageExportSwabPlan = {
  name: "export-lab-report",
  query: {
    view: "area",
  },
};

const pageReportSwab = {
  name: "report-swab-area",
};

const pageSwabArea = {
  name: "swab-area",
};

const pageSwabProduct = {
  name: "swab-product",
};

const pageUpdateSwabTestArea = {
  name: "swab-test-update-area",
};

const pageUpdateSwabTestProduct = {
  name: "swab-test-update-product",
};

const pageUpdateBacteriaSpecieArea = {
  name: "swab-test-update-bacteria-specie-area",
};

const pageUpdateBacteriaSpecieProduct = {
  name: "swab-test-update-bacteria-specie-product",
};

const pageManageSwabArea = {
  name: "manage-swab-area",
};

const pageManageProduct = {
  name: "manage-product",
};

const pageImportProductSchedule = {
  name: "import-product-schedule",
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
        <div class="d-grid gap-2 mt-4">
          <h4 class="font-weight-bold">รายการข้อมูลพื้นฐาน</h4>

          <nuxt-link
            v-if="authUser.isInProductionTeam || authUser.isInAdminTeam"
            v-slot="{ navigate }"
            :to="pageManageProduct"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              จัดการสินค้าอาหาร
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link
            v-if="authUser.isInProductionTeam || authUser.isInAdminTeam"
            v-slot="{ navigate }"
            :to="pageImportProductSchedule"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              จัดการแผนการผลิต
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link
            v-if="authUser.isInSwabTeam || authUser.isInAdminTeam"
            v-slot="{ navigate }"
            :to="pageManageSwabArea"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              จัดการจุดตรวจ swab
            </button-arrow-right>
          </nuxt-link>
        </div>

        <div class="d-grid gap-2 mt-4">
          <h4 class="font-weight-bold">ออกรายงานและรายการข้อมูล</h4>

          <nuxt-link
            v-if="authUser.isInSwabTeam || authUser.isInAdminTeam"
            v-slot="{ navigate }"
            :to="pageExportSwabPlan"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              block
              size="lg"
              class="w-100"
              @click="navigate"
            >
              ออกรายงานจุด swab
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link
            v-if="authUser.isInSwabTeam || authUser.isInAdminTeam"
            v-slot="{ navigate }"
            :to="pageReportSwab"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              block
              size="lg"
              class="w-100"
              @click="navigate"
            >
              รายการผลตรวจ swab
            </button-arrow-right>
          </nuxt-link>
        </div>

        <div class="d-grid gap-2 mt-4">
          <h4 class="font-weight-bold">ระบบบันทึกข้อมูล</h4>

          <nuxt-link
            v-if="authUser.isInSwabTeam"
            v-slot="{ navigate }"
            :to="pageSwabArea"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              บันทึกจุดตรวจ swab
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link
            v-if="authUser.isInSwabTeam"
            v-slot="{ navigate }"
            :to="pageSwabProduct"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              บันทึกการตรวจสินค้า
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link
            v-if="authUser.isInLabTeam"
            v-slot="{ navigate }"
            :to="pageUpdateSwabTestArea"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              บันทึกผล lab จุดตรวจ swab
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link
            v-if="authUser.isInLabTeam"
            v-slot="{ navigate }"
            :to="pageUpdateSwabTestProduct"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              บันทึกผล lab การตรวจสินค้า
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link
            v-if="authUser.isInLabTeam"
            v-slot="{ navigate }"
            :to="pageUpdateBacteriaSpecieArea"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              บันทึกผล specie เชื้อจุดตรวจ swab
            </button-arrow-right>
          </nuxt-link>

          <nuxt-link
            v-if="authUser.isInLabTeam"
            v-slot="{ navigate }"
            :to="pageUpdateBacteriaSpecieProduct"
            custom
          >
            <button-arrow-right
              variant="outline-primary"
              size="lg"
              class="w-100"
              @click="navigate"
            >
              บันทึกผล specie เชื้อสินค้า
            </button-arrow-right>
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>
