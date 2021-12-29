<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
<style>
@media (prefers-color-scheme: dark) {
  body { background: #333; color: white; }
}
@media (prefers-color-scheme: light) {
  body { background: #ddd; color: black; }
}
</style>
