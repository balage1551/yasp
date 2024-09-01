<template>
  <div class="stack" :class="{ 'fade-in': visible, 'fade-out': !visible }" v-bind="props">
    <slot></slot>
    <div class="title">
      <slot name="title"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">

const props = withDefaults(defineProps<{
  visible?: boolean
}>(), {
  visible: true
})

</script>

<style scoped>
.stack {
  width: 100vw;
  height: 100vh;
  object-fit: contain;
  position: absolute;
  background-color: #333333;
  transition: opacity 0.5s ease-in-out;
}

.title {
  z-index: 1;
  position: absolute;
}

.fade-in {
  opacity: 1;
  z-index: 1;
}

.fade-out {
  opacity: 0;
  z-index: 0;
}
</style>
