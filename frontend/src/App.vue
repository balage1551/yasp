<template>
  <router-view/>
  <global-confirm-dialog ref="confirmDialog" ></global-confirm-dialog>
  <global-snackbar :gap="30" :max-stack="8"></global-snackbar>
</template>
<script setup lang="ts">
import GlobalSnackbar from '@/modules/snackbar/GlobalSnackbar.vue'
import GlobalConfirmDialog from '@/modules/dialog/GlobalConfirmDialog.vue'
import { onMounted, ref } from 'vue'
import { useLocaleStore } from '@/stores/localeStore'
import { registerConfirmDialog } from '@/modules/dialog/confirmDialog'

const confirmDialog = ref<typeof GlobalConfirmDialog>()

const localeStore = useLocaleStore()

onMounted(() => {
  if (confirmDialog.value) {
    registerConfirmDialog(confirmDialog.value, {
      width: 600,
      buttonVariant: 'elevated'
    })
  }
})

</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
