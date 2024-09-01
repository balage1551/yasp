<template>
    <span class="app-bar-app-name" :style="'font-size: '+size+'px;'">
      <span v-if="isLargeScreen || !hideOnMobile" @click="back">
        <span class="app-name-initial">H</span>omework
        <span class="app-name-initial">M</span>ole<span class="super">2</span>
      </span>
    </span>
</template>
<script setup lang="ts">

import { useRouter } from 'vue-router'
import { computed, ref } from 'vue'

const router = useRouter()

const props = withDefaults(defineProps<{
  interactive?: boolean,
  hideOnMobile?: boolean,
  size?: number
}>(), {
  interactive: false,
  hideOnMobile: false,
  size: 50
})

const isLargeScreen = computed(() => {
  return window.innerWidth > 700
})

const DEFAULT_BACK_PATH = '/dashboard'
const previousRoute = ref(DEFAULT_BACK_PATH)

function back() {
  if (props.interactive) {
    // console.log('Moving back: ', previousRoute.value)
    router.push({ path: previousRoute.value, replace: true })
  }
}

router.afterEach((to, from) => {
  // console.log('FROM', from)
  previousRoute.value = from?.path ?? DEFAULT_BACK_PATH
})

defineExpose({ back })

</script>

<style scoped>

.app-bar-app-name {
  color: snow;
  padding-left: 10px;
  margin-top: -15px;
  user-select: none;
}

.app-name-initial {
  color: red;
}

.super {
  vertical-align: super;
  font-size: 70%;
  font-weight: bold;
  color: red;
}

</style>
