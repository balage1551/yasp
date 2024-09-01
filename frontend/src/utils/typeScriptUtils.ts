// ======================================
// === OPTIONAL
// ======================================

import i18n from '@/plugins/i18n/i18n'

export type Optional<T> = T | undefined

export type Nullable<T> = T | null

export type NullableOrOptional<T> = Nullable<T> | Optional<T>

export function nullToUndefined<T>(value: NullableOrOptional<T>): Optional<T> {
  return value == null ? undefined : value
}

export function isPresent<T>(value: Optional<T>): value is T {
  return value !== undefined
}

export function ifPresent<T, R>(value: Optional<T>, op: (value: T) => R | undefined): Optional<R> {
  return (value !== undefined) ? op(value) : undefined
}

export function orElse<T>(value: Optional<T>, op: () => Optional<T>): Optional<T> {
  return (value === undefined) ? op() : value
}

export function handleOptional<T, R>(value: Optional<T>,
  opIfPresent: (value: T) => R,
  opIfNotPresent: () => R): R {
  return (value !== undefined) ? opIfPresent(value) : opIfNotPresent()
}

// ======================================
// === TYPES
// ======================================

/** Returns an object containing only the fields of T with a type of S  */
export type FieldsOfType<T, S> = {
    [Property in keyof T as T[Property] extends S ? Property : never]: T[Property]
}

/** Returns the keys of T with a type of S  */
export type KeysOfType<T, S> = keyof FieldsOfType<T, S>

export type NumberKeys<T> = KeysOfType<T, number | undefined>

// ======================================
// === UTILS
// ======================================

export function cyclicMod(value: number, modulo: number): number {
  if (modulo === 0) {
    throw new Error('Modulo should be non null.')
  }
  if (value < 0) {
    value += Math.ceil(Math.abs(value) / modulo) * modulo
  }
  value = value % modulo
  return value
}

export function boundNumber(value: number, low: number, high: number) {
  return Math.min(high, Math.max(low, value))
}

// ======================================
// === ARRAYS
// ======================================

export function rotateArray<T>(arr: T[], delta: number): T[] {
  if (delta === 0 || arr.length < 2) {
    return arr
  }
  delta = cyclicMod(delta, arr.length)
  if (delta === 0) {
    return arr
  }
  const cut = arr.splice(0, delta)
  arr.splice(arr.length, 0, ...cut)
  return arr
}

type UnionKeys<T> = T extends T ? keyof T : never;

// Improve intellisense
type Expand<T> = T extends T ? { [K in keyof T]: T[K] } : never;

export type OneOf<T extends { /**/ }[]> = {
    [K in keyof T]: Expand<T[K] & Partial<Record<Exclude<UnionKeys<T[number]>, keyof T[K]>, never>>>;
}[number];

export function arraySortBy<T extends object>(array: Array<T>, field: keyof T, descending = false): Array<T> {
  const sgn = descending ? 1 : -1
  return array.sort((e1: T, e2: T) => {
    if (e1[field] === e2[field]) {
      return 0
    } else if (e1[field] < e2[field]) {
      return -sgn
    } else {
      return sgn
    }
  })
}

export function arrayRemove<T, A extends Array<T>>(array: A, item: T): A {
  const i = array.indexOf(item)
  if (i !== -1) {
    array.splice(i, 1)
  }
  return array
}

export type EnumType = Record<string, string>;
export type EnumListItem<T extends EnumType> = { value: T[keyof T], title: string };

export function getEnumForList<T extends EnumType>(enumType: T, messageKey: string): EnumListItem<T>[] {
  const enumArray: EnumListItem<T>[] = []
  const { t } = i18n.global

  Object.entries(enumType)
    .filter(([key, value]) => typeof value !== 'function') // Filter out enum functions
    .forEach(([key, value]) => {
      enumArray.push({ value: value as T[keyof T], title: t('enums.' + messageKey + '.' + key) })
    })

  return enumArray
}
