<template>
  <div class="container">
    <div>{{ block.index }} - {{ block.slides.length }}</div>
    <slide-editor v-for="s in block.slides" :key="s.imageName" :slide="s">
    </slide-editor>
  </div>
</template>
<script setup lang="ts">

import { SlideShowBlock } from '@/entities/SlideShowTypes'
import SlideEditor from '@/components/SlideEditor.vue'

const props = withDefaults(defineProps<{
  block: SlideShowBlock
}>(), {})

</script>

<style scoped>

</style>
