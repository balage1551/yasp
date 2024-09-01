import { validateContainsOnlyCharacters, validateEmail, validateRequired } from '@/utils/validation-utils'

export const accountRules = [
  (v: string) => validateRequired(v, 'registration.account'),
  (v: string) => validateContainsOnlyCharacters(v, 'registration.account', 'a-zA-Z0-9_-')
]

export const firstNameRules = [
  (v: string) => validateRequired(v, 'registration.firstName'),
]

export const surnameRules = [
  (v: string) => validateRequired(v, 'registration.surname'),
]

export const nicknameRules: ((v: string) => boolean | string)[] = []

export const emailRules = [
  (v: string) => validateEmail(v, 'registration.email')
]
