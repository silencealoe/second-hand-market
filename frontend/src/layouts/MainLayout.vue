<template>
  <div class="main-layout">
    <div class="content">
      <router-view />
    </div>
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import TabBar from '@/components/TabBar.vue'
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 50px;
}
</style>

