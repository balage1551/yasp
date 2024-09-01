<template>
  <v-app-bar class="app-bar">
    <v-app-bar-nav-icon color="white" size="30" class="nav-button" @click="toggleDrawer" />
    <v-app-bar-title class="pt-5 d-flex align-center">
        <v-img src="mole.png" class="app-bar-logo float-start" @click="back"></v-img>
        <application-title ref="title" interactive hide-on-mobile></application-title>
    </v-app-bar-title>
    <v-spacer></v-spacer>

    <div v-if="userStore.isGuest">
      <v-btn variant="text" color="white" class="mt-4" to="/Login">{{  $t('login.title') }}</v-btn>
    </div>
    <v-list-item v-else class="user-info pt-4 mr-2"  >
      <v-list-item-title class="user-info-title ">
        {{ userStore.currentUser?.shortName}}
      </v-list-item-title>
      <v-list-item-title class="user-info-subtitle ">
        {{ userStore.currentUser?.fullName }}
      </v-list-item-title>
    </v-list-item>
  </v-app-bar>

  <v-navigation-drawer v-model="isDrawerVisible" app color="var(--app-color-dark)" class="drawer" width="60">
    <v-list>
      <v-list-item class="nav-menu-icon" @click="toDashboard">
        <v-icon size="40" >mdi-calendar-month</v-icon>
      </v-list-item>
      <v-list-item v-if="!userStore.isGuest" class="nav-menu-icon" @click="toTodos">
        <v-icon size="40">mdi-list-status</v-icon>
      </v-list-item>
    </v-list>
    <v-list style="position: absolute; bottom: 0;">
      <v-list-item class="nav-menu-icon" @click="showChangeLog">
        <v-icon size="40">mdi-package-variant-plus</v-icon>
      </v-list-item>
      <v-list-item v-if="!userStore.isGuest" class="nav-menu-icon" @click="showPreferences">
        <v-icon size="40">mdi-cog</v-icon>
      </v-list-item>
      <v-list-item v-if="!userStore.isGuest" class="nav-menu-icon" @click="logout">
        <v-icon size="40">mdi-exit-run</v-icon>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
<script setup lang="ts">
import {
  VAppBar,
  VAppBarNavIcon,
  VAppBarTitle,
  VBtn,
  VIcon,
  VImg,
  VList,
  VListItem,
  VListItemTitle,
  VNavigationDrawer,
  VSpacer
} from 'vuetify/components'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import ApplicationTitle from '@/components/ApplicationTitle.vue'

const router = useRouter()

const userStore = useUserStore()

const title = ref<typeof ApplicationTitle>()

function back() {
  title.value?.back()
}

const isDrawerVisible = ref(false)

function toggleDrawer() {
  isDrawerVisible.value = !isDrawerVisible.value
}

function hideDrawer() {
  isDrawerVisible.value = false
}

function toDashboard() {
  hideDrawer()
  router.push({ name: 'Dashboard' })
}

function toTodos() {
  hideDrawer()
  router.push({ name: 'Todo' })
}

function logout() {
  hideDrawer()
  useUserStore().logout().then(() => {
    router.push({ name: 'Dashboard' })
  })
}

function showChangeLog() {
  hideDrawer()
  router.push({ name: 'ChangeLog' })
}

function showPreferences() {
  hideDrawer()
  router.push({ name: 'UserPreferences' })
}

</script>
<style scoped>

.app-bar {
  height: 80px;
  background-color: var(--app-color-dark);
}

.app-bar-logo {
  height: 60px;
  width: 45px;
}

.user-info {
  margin-top: 4px;
  text-align: left;
  color: white;
}

.user-info-title {
  color: white;
  font-weight: bold;
  font-variant: small-caps;
  font-size: 140%;
}

.user-info-subtitle {
  padding-top: 4px;
  color: var(--app-color-button-default-text);
  font-size: 120%;
}

.nickname {
  font-size: 120%;
  font-weight: bold;
}

.nav-button {
  margin-top: 12px;
}

.drawer {
  padding-left: 0;
  padding-right: 0;
}

.nav-menu-icon {
  padding: 0.75em 0.5em !important;
  color: white;
  text-align: left;
}

</style>
