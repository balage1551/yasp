<template>
  <div class="black">
    <v-layout class="public-background full-screen justify-center">
      <router-view>
      </router-view>
    </v-layout>
  </div>
</template>

<script setup lang="ts">
import { VLayout } from 'vuetify/components'
import { RouterView } from 'vue-router'
</script>

<style>
.black {
  background-color: #080f17;
}

.public-background {
  background-size: cover !important;
}

.app-title {
  text-align: center;
  font-size: 40px;
  font-weight: normal;
  color:  #caa92b;
  font-family: Bauhaus93, sans-serif;
}

.card-background {
  background-color: #aaaaaa !important;
  border-color: white !important;
}

.full-screen {
  height: 100vh;
}
</style>
