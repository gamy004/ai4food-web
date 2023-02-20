<script lang="ts" setup>
const route = useRoute();

const id = ref(route.params.id as string);
</script>

<template>
  <div>Update Page {{ id }}</div>
</template>
