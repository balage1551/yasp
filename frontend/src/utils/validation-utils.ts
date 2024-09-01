import { Optional } from '@/utils/typeScriptUtils'
import i18n from '@/plugins/i18n/i18n'

const { t } = i18n.global

export function validateRequired(value : Array<never> | string | number | undefined, element: Optional<string>) {
  function requiredMessage(element : Optional<string>) {
    return (element === undefined)
      ? t('commonValidation.requiredGeneric')
      : t('commonValidation.required', {
        element: t(element)
      })
  }

  if (value instanceof Array) {
    return value && value?.length ? true : requiredMessage(element)
  } else if (typeof value === 'number') {
    return value || value === 0 ? true : requiredMessage(element)
  } else if (!value) {
    return requiredMessage(element)
  } else {
    return true
  }
}

export function validateContainsOnlyCharacters(value : string, element : string, validChars: string) {
  if (value.match('^[' + validChars.replace(']', '\\]') + ']*$')) {
    return true
  } else {
    return t('commonValidation.characterFilter', {
      element: t(element),
      validCharacters: validChars
    })
  }
}

export function validateMinMaxLength(value: string, element :string, minimumLength: number, maximumLength: number) {
  if (value && (value.length < minimumLength || value.length > maximumLength)) {
    return t('commonValidation.minMaxLength', {
      element: t(element),
      minimum: minimumLength,
      maximum: maximumLength
    })
  } else {
    return true
  }
}

export function validateMinLength(value: string, element :string, minimumLength: number, optional: boolean = false, trim: boolean = true) {
  const v = trim ? value?.trim() : value
  if ((v && v.length < minimumLength) || (!v && !optional)) {
    return t('commonValidation.minLength', {
      element: t(element),
      minimum: minimumLength
    })
  } else {
    return true
  }
}

export function validateMaxLength(value: string, element :string, maximumLength: number) {
  if (value && value.length > maximumLength) {
    return t('commonValidation.maxLength', {
      element: t(element),
      maximum: maximumLength
    })
  } else {
    return true
  }
}

export function validateEmail(value: string, element :string) {
  if (value && !value.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
    return t('commonValidation.email', {
      element: t(element)
    })
  } else {
    return true
  }
}

export function validatePhone(value: string, element :string) {
  if (value && !value.match(/^[+]?[0-9- ]+$/)) {
    return t('commonValidation.phone', {
      element: t(element)
    })
  } else {
    return true
  }
}

export function validateIsTheSame(firstValue: string, secondValue: string, messageKey :string) {
  if (firstValue && firstValue !== secondValue) {
    return t(messageKey)
  } else {
    return true
  }
}

//
// export function minMaxValueMessage(context, element, minimumValue, maximumValue) {
//   return context.$t('commonValidation.minMaxValue', {
//     element: context.$t(element),
//     minimum: minimumValue,
//     maximum: maximumValue
//   })
// }
//
// export function minValueMessage(context, element, minimumValue) {
//   return context.$t('commonValidation.minValue', {
//     element: context.$t(element),
//     minimum: minimumValue
//   })
// }
//
// export function validateMinMaxValue(context, value, element, minimumValue, maximumValue) {
//   if (value < minimumValue || value > maximumValue) {
//     return minMaxValueMessage(context, element, minimumValue, maximumValue)
//   } else {
//     return true
//   }
// }
//
// export function validateMinValue(context, value, element, minimumValue) {
//   if (value < minimumValue) {
//     return minValueMessage(context, element, minimumValue)
//   } else {
//     return true
//   }
// }
//
// export function nonZeroMessage(context, element) {
//   return context.$t('commonValidation.nonZero', {
//     element: context.$t(element)
//   })
// }
//
// export function validateNonZero(context, value, element) {
//   if (value === 0 || value === '0') {
//     return nonZeroMessage(context, element)
//   } else {
//     return true
//   }
// }
//
// export function validateCommentPrefixValue(context, comment, originalComment) {
//   if (isBlank(comment) || comment.startsWith(originalComment)) {
//     return true
//   } else {
//     return context.$t('commonValidation.commentPrefix')
//   }
// }
//
// export function isValidEmail(email) {
//   const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
//   return pattern.test(email)
// }
//
// export function validateEveryEmailValid(context, value) {
//   return value.every(item => isValidEmail(item)) || context.$t('commonValidation.invalidEmail')
// }
//
// export function deepEqual(object1, object2, exceptions, debug = false) {
//   if (debug) {
//     console.log('deepEqual check')
//   }
//   const keys1 = Object.keys(object1)
//   const keys2 = Object.keys(object2)
//   if (keys1.length !== keys2.length) {
//     if (debug) {
//       console.log('objects keys are different')
//       console.log(keys1)
//       console.log(keys2)
//     }
//     return false
//   }
//   for (const key of keys1) {
//     if (!exceptions.includes(key)) {
//       const val1 = object1[key]
//       const val2 = object2[key]
//       const areObjects = isObject(val1) && isObject(val2)
//       if (
//         areObjects && !deepEqual(val1, val2, exceptions) ||
//         !areObjects && val1 !== val2
//       ) {
//         if (debug) {
//           console.log('objects are different key: ' + key)
//           console.log(val1)
//           console.log(val2)
//         }
//         return false
//       }
//     }
//   }
//   return true
// }
//
// function isObject(object) {
//   return object != null && typeof object === 'object'
// }
//
// export function validateDateIsAfter(context, value, other, element, otherName) {
//   const valueAsDate = parseDate(value)
//   const otherAsDate = parseDate(other)
//   if (valueAsDate.valueOf() > otherAsDate.valueOf()) {
//     return true
//   } else {
//     return context.$t('commonValidation.dateShouldBeAfter', {
//       element: context.$t(element),
//       other: context.$t(otherName)
//     })
//   }
// }
//
// export function validateDateIsAfterOrSame(context, value, other, element, otherName) {
//   const valueAsDate = parseDate(value)
//   const otherAsDate = parseDate(other)
//   if (valueAsDate.valueOf() >= otherAsDate.valueOf()) {
//     return true
//   } else {
//     return context.$t('commonValidation.dateShouldBeAfterOrSame', {
//       element: context.$t(element),
//       other: context.$t(otherName)
//     })
//   }
// }
