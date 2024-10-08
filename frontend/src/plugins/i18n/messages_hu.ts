import { messagesCommon } from '@/plugins/i18n/messages_common'
import { merge } from 'lodash'

export const messagesHU = merge({}, messagesCommon, {
  common: {
    appName: 'Homework Mole 2',
    close: 'Bezárás',
    operations: 'Műveletek',
    edit: 'Szerkesztés',
    view: 'Megnyitás',
    delete: 'Törlés',
    restore: 'Visszaállítás',
    copy: 'Másolás',
    new: 'Új',
    switch: 'Váltás',
    loadingIsInProgress: 'Betöltés folyamatban...',
    yes: 'Igen',
    no: 'Nem',
    open: 'Betöltés',
    reset: 'Visszaállítás',
    save: 'Mentés',
    add: 'Hozzáadás',
    ok: 'Ok',
    cancel: 'Mégsem',
    next: 'Következő',
    prev: 'Előző',
    finish: 'Befejezés',
    saveSuccessful: 'Sikeres mentés',
    deleteSuccessful: 'Sikeres törlés',
    restoreSuccessful: 'Sikeres visszaállítás',
    refreshSuccessful: 'Sikeres frissítés',
    confirmDelete: 'Biztosan törli?',
    deletedVisibility: 'Törölt látszik',
    saveError: 'Sikertelen mentés',
    loadingError: 'Sikertelen betöltés',
    deleteError: 'Sikertelen törlés',
    commonError: 'Hiba történt a művelet közben',
    listLoadingError: 'Hiba történt a lista betöltése közben',
    createDate: 'Létrehozás dátuma',
    name: 'Név',
    type: 'Típus',
    code: 'Kód',
    currency: 'Pénznem',
    newTitle: ' létrehozása',
    editTitle: ' szerkesztése',
    viewTitle: ' adatai',
    status: 'Státusz',
    greaterThan: 'Nagyobb mint',
    comment: 'Megjegyzés',
    deleted: 'Törölve',
    from: 'Dátumtól',
    to: 'Dátumig',
    range: 'Dátumtól-ig',
    filterFrom: '{value}-tól',
    filterTo: '{value}-ig',
    true: 'Igen',
    false: 'Nem',
    approve: 'Jóváhagyás',
    revert: 'Visszavonás',
    id: 'Azonosító',
    none: '(nincs)',
    day: 'nap',
    confirm: 'Megerősítés'
  },
  commonValidation: {
    required: '{element} megadása kötelező',
    requiredGeneric: 'A mező kitöltése kötelező',
    minLength: '{element} hossza legalább {minimum} karakter kell legyen',
    maxLength: '{element} hossza maximum {maximum} karakter',
    minMaxLength: '{element} hossza minimum {minimum}, maximum {maximum} karakter',
    minMaxValue: '{element} értéke minimum {minimum}, maximum {maximum} lehet',
    minValue: '{element} értéke minimum {minimum} lehet',
    validationError: 'Hiányzó vagy hibás értékű mezők találhatók!',
    invalidNumber: 'Érvénytelen szám',
    nonZero: '{element} nem lehet 0',
    dateShouldBeAfter: '{element} későbbi kell legyen, mint a {other}',
    email: 'Érvénytelen email cím',
    phone: 'Érvénytelen telefonszám. Megengedett karakterek: 0-9, kötőjel, szóköz és opcionálisan az országhívó + jele',
  },
  enums: {
  },
  editor: {
    scan: 'Beolvasás',
    title: 'Szerkesztő',
    directory: 'Könyvtár',
    name: 'Diavetítés neve',
    info: '{blockCount} blokk, {totalCount} dia.',
    block: {
      name: 'Megnevezés'
    },
    atTheEnd: {
      continue: 'Folytatás',
      hold: 'Megállás',
      loop: 'Ismétlés'
    },
    drag: '{count} kép',
    deleteSlide: {
      title: 'Diák törlése',
      message: 'Biztosan törli a kiválasztott diákat?'
    },
    transition: {
      continue: 'Folytatás',
      hold: 'Megállás',
      holdOnce: 'Megállás első alkalommal',
    },
    trigger: 'Dia:',
    groupSlideTrigger: 'Dia egy csoportban:',
    groupTrigger: 'Csoport:'
  },
  dashboard: {
    deleteSlideShow: {
      title: 'Diavetítés törlése',
      message: 'Biztosan törli a "{name}" diavetítést?',
      success: 'Diavetítés sikeresen törölve'
    },
  },
  slideShowInfo: {
    title: 'Diavetítések',
    new: 'Új diavetítés',
    edit: 'Diavetítés szerkesztése',
    delete: 'Diavetítés törlése',
    details: {
      numberOfSlides: 'Diák száma',
      numberOfBlocks: 'Blokkok száma'
    },
    play: 'Lejátszás',
  },
  labelEditor: {
    title: 'Felirat szerkesztő',
    text: 'Szöveg',
    size: 'Betűméret',
    anchorY: 'Függőleges pozíció',
    anchorX: 'Vízszintes pozíció',
    align: 'Igazítás',
    color: 'Szín',
    outlined: 'Körvonal',
    outline: {
      width: 'Vastagság',
      color: 'Szín'
    },
    save: 'Mentés',
    remove: 'Eltávolítás',
  },
  saveError: {
    alreadyExists: 'Mentés sikertelen: Már létezik ilyen nevű diavetítés',
  },
  saveSuccess: 'Diavetítés sikeresen mentve'
})
