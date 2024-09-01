<template>
    <div class="text-center">
        <v-menu
                open-on-hover
        >
            <template v-slot:activator="{ props }">
                <v-btn variant="text" color="primary" v-bind="props" class="mt-4" >
                    <v-img :width="24" :src="'/flags/'+localeStore.language+'.svg'" class="mr-2 mt-1"></v-img>
                    {{ $t('language.nativeName.'+localeStore.language) }}
                </v-btn>
            </template>

            <v-list class="menu">
                <v-list-item
                        v-for="(item, index) in locales"
                        :key="index"
                        class="language-menu-item"
                        @click="setLocale(item)"
                >
                    <v-list-item-title>
                        <v-img :width="24" :src="'/flags/'+item+'.svg'" class="float-start mr-2 mt-1"></v-img>
                        {{ $t('language.nativeName.'+item) }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script setup lang="ts">

import { VBtn, VImg, VList, VListItem, VListItemTitle, VMenu } from 'vuetify/components'
import { ref } from 'vue'
import { useLocaleStore } from '@/stores/localeStore'
import { ListOfSupportedLanguages, supportedLanguageList, SupportedLanguages } from '@/plugins/i18n/messages'

const localeStore = useLocaleStore()

const locales = ref<ListOfSupportedLanguages>(supportedLanguageList)

// Flags from here: https://github.com/lipis/flag-icons/tree/main/flags/4x3

function setLocale(newLocale: SupportedLanguages) {
  console.log(newLocale)
  localeStore.language = newLocale
}

</script>
<style scoped>

.menu {
    background-color: #2c3e50 !important;
    color: whitesmoke;
}

.language-menu-item:hover {
    background-color: #374d64 !important;
    cursor: pointer;
}

</style>
