<template>
  <div class="container">
    {{ slide.inBlockIndex }} - {{ slide.imageName }}
   </div>
</template>
<script setup lang="ts">

import { Slide } from '@/entities/SlideShowTypes'

const props = withDefaults(defineProps<{
  slide: Slide
}>(), {})

</script>

<style scoped>

</style>
