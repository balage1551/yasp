<template>
  <v-app class="app">
<!--    <div ref="appBarWrapper">-->
<!--      <application-bar ref="appBar"></application-bar>-->
<!--    </div>-->
    <v-main>
      <slot/>
    </v-main>
  </v-app>
</template>
<script setup lang="ts">

import { VApp, VMain } from 'vuetify/components'

// const appBar = ref<typeof ApplicationBar>()
// const appBarWrapper = ref<HTMLDivElement>()
// const mainStyle = ref('margin-top: 80px !important; padding-top: 0;')

</script>

<style scoped>

</style>
