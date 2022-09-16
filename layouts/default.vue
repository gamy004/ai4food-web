<script lang="ts" setup>
import CarbonArrowLeft from "~icons/carbon/arrow-left";
import CarbonLogout from "~icons/carbon/logout";
import { useNavigation } from "~~/composables/useNavigation";

const { isAuthenticated, clearAuth } = useAuth();
const { redirect } = useNavigation();
const route = useRoute();

const canGoBack = computed(() => {
  return route.meta.canGoBack;
});

function logout() {
  clearAuth();

  const router = useRouter();

  router.push({ path: "/auth/login" });
}
</script>

<template>
  <div class="container h-100 d-flex flex-column pt-4">
    <div class="d-flex w-100 justify-content-center">
      <b-button
        v-if="canGoBack"
        variant="link"
        class="button__go-back text-primary"
        @click="redirect"
      >
        <carbon-arrow-left :style="{ fontSize: '1.25em' }" />
      </b-button>

      <nuxt-link :to="{ path: '/' }" class="text-decoration-none">
        <h4 class="text-secondary">AI for Food Safety</h4>
      </nuxt-link>

      <b-button
        v-if="isAuthenticated"
        variant="link"
        class="button__logout text-dark"
        @click="logout"
      >
        <carbon-logout :style="{ fontSize: '1.25em' }" />
      </b-button>
    </div>

    <slot />
  </div>
</template>

<style scoped lang="scss">
.button {
  &__go-back {
    position: absolute;
    top: 1rem;
    left: 0.5rem;
  }

  &__logout {
    position: absolute;
    top: 1rem;
    right: 0.5rem;
  }
}
</style>
