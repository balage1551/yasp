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
    classDayType: {
      MONDAY: 'hétfő',
      TUESDAY: 'kedd',
      WEDNESDAY: 'szerda',
      THURSDAY: 'csütörtök',
      FRIDAY: 'péntek',
      HOLIDAY: 'szünet',
      WEEKEND: 'hétvége'
    },
    homeworkType: {
      NONE: '(nincs)',
      UNKNOWN: '(egyéb)',
      CANCELLED: '(elmaradt)',
      NORMAL: 'Normál',
      EXTRA: 'Szorgalmi',
      CLASS_WORK: 'Órai munka',
      ANNOUNCEMENT: 'Hírdetmény'
    },
    homeworkState: {
      UNFINISHED: 'Befejezetlen',
      FINISHED: 'Kész',
      CHANGED: 'Megváltozott',
      NO_STATE: '(nem kell befejezni)',
      SKIPPED: 'Kihagyott'
    },
    sourceType: {
      NONE: '(nincs)',
      MIXED: 'Vegyes',
      BOOK: 'Tankönyv',
      WORKBOOK: 'Munkafüzet',
      EXERCISE_BOOK: 'Füzet',
      PROJECT: 'Projekt',
      OTHER: 'Egyéb',
      TEST: 'Dolgozat',
    },
    subject: {
      other: {
        name: 'Egyéb',
        icon: 'help-circle-outline'
      },
      pe: {
        name: 'Testnevelés',
        icon: 'dumbbell'
      },
      music: {
        name: 'Ének',
        icon: 'music-note'
      },
      technics: {
        name: 'Technika',
        icon: 'hammer-wrench'
      },
      info: {
        name: 'Digitális kultúra',
        icon: 'laptop'
      },
      arts: {
        name: 'Rajz',
        icon: 'brush-outline'
      },
      class: {
        name: 'Osztályfőnöki óra',
        icon: 'account-group'
      },
      ethics: {
        name: 'Etika/Hittan',
        icon: 'scale-unbalanced'
      },
      math: {
        name: 'Matematika',
        icon: 'calculator'
      },
      physics: {
        name: 'Fizika',
        icon: 'gauge'
      },
      biology: {
        name: 'Biológia',
        icon: 'elephant'
      },
      chemistry: {
        name: 'Kémia',
        icon: 'atom'
      },
      geology: {
        name: 'Földrajz',
        icon: 'earth'
      },
      history: {
        name: 'Történelem',
        icon: 'castle'
      },
      literature: {
        name: 'Irodalom',
        icon: 'book-open-page-variant'
      },
      grammar: {
        name: 'Nyelvtan',
        icon: 'alphabetical-variant'
      },
      drama: {
        name: 'Dráma',
        icon: 'drama-masks'
      },
      english: {
        name: 'Angol',
        icon: 'flag'
      }
    }
  },
  userMenu: {
    preferences: 'Beállítások',
    logout: 'Kijelentkezés'
  },

  login: {
    title: 'Bejelentkezés',
    account: 'Felhasználónév',
    password: 'Jelszó',
    forgottenPassword: 'Elfelejtetted a jelszavad?',
    emailValid: 'Nem érvényes email cím',
    error: 'Hibás felhasználónév, vagy jelszó. Kérem próbálja újra!',
    redirectionError: 'Hiba átirányításkor',
    register: 'Regisztráció'
  },

  registration: {
    title: 'Regisztráció',
    account: 'Felhasználónév',
    firstName: 'Keresztnév',
    surname: 'Vezetéknév',
    nickname: 'Becenév',
    email: 'Email',
    password: 'Jelszó',
    passwordAgain: 'Jelszó ismét',
    register: 'Regisztráció',
    passwordMismatch: 'A két jelszó nem egyezik',
    existingUser: 'A felhasználónév már létezik.',
    communicationError: 'Kommunikációs hiba történt regisztráció közben.'
  },

  filters: {
    hiddenHomeworkTypes: 'Rejtett lecketípusok',
    hiddenHomeworkStates: 'Rejtett státuszok'
  },
  overview: {
    invisibleHomeworks: 'Rejtett leckék: ',
    homeworkState: {
      NO_STATE: 'Ez a bejegyzés nem igényel visszajelzést.',
      UNFINISHED: 'Ezt a leckét még nem fejezted be.',
      FINISHED: 'Ezt a leckét már befejezted.',
      SKIPPED: 'Ezt a leckét kihagytad.',
      CHANGED: 'Ez a lecke megváltozott.',
      deleted: 'Ezt a leckét törölték.'
    }
  },

  userPreferences: {
    baseData: {
      title: 'Alapadatok',
      saved: 'Az alapadatok sikeresen frissítve lettek.',
      leaveWithoutSaveDescription: 'Megváltoztattad az alapadataidat, de még nem mentetted. Mentsem mielőtt elhagynád az oldalt?',
    },
    password: {
      title: 'Jelszó',
      saved: 'Jelszó sikeresen megváltoztatva.'
    },
    seminars: {
      title: 'Tanórák',
      description: 'Válaszd ki az összes tantárgyat, amire jársz!',
      leaveWithoutSaveDescription: 'Megváltoztattad az óráid listáját, de még nem mentetted. Mentsem mielőtt elhagynád az oldalt?',
      saved: 'A tanórák listája sikeresen mentve.'
    },
    leaveWithoutSaveTitle: 'Nem mentett változások'
  },

  entity: {
    homework: {
      homeworkType: 'Lecketípus'
    }
  },

  homeworkEditor: {
    title: 'Lecke szerkesztő',
    seminar: 'Tantárgy',
    homeworkType: '@:entity.homework.homeworkType',
    seminarListHeader: {
      today: 'Mai tantárgyak',
      user: 'A te tantárgyaid',
      other: 'Egyéb tantárgyak'
    },
    sourceType: 'Forrás',
    dueDate: 'Határidő',
    description: 'Leírás',
    submit: 'Mentés',
    emptyDetails: 'A leírás nem lehet üres.',
    addMore: 'Több lecke',
  },

  dueDateDiff: {
    today: '(ma)',
    tomorrow: '(holnap)',
    afterTomorrow: '(holnapután)',
    later: '({day} nap múlva)',
    late: '({day} nap késésben)'
  },

  homeworkDetails: {
    homeworkType: '@:entity.homework.homeworkType',
    submitter: 'Feltöltötte: ',
    lastEditor: 'utoljára módosította: ',
    addAttachment: 'Új melléklet hozzáadása...',
    attachment: 'Új melléklet',
    attachmentTooLarge: 'A melléklet túl nagy méretű. (Maximum 4 MB)',
    alreadyUploaded: 'Már létezik melléklet ezzel a névvel.',
    attachmentUploaded: 'A melléklet sikeresen feltöltve.',
    readOnlyAttachment: 'A mellékletet csak a feltöltő módosíthatja.',
    removeAttachment: {
      title: 'Melléklet eltávolítása',
      message: 'Biztosan el szeretnéd távolítani a {attachmentName} fájlt a mellékletek közül?'
    },
    deleteHomework: {
      title: 'Lecke törlése',
      message: 'Biztosan törölni szeretnéd ezt a leckét?'
    }
  }

})
