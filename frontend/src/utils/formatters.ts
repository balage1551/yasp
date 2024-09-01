import { DateTime } from 'ts-luxon'
import { Optional } from '@/utils/typeScriptUtils'

function asDateTime(dateTime: Optional<DateTime>) : Optional<string> {
  return dateTime?.toFormat('yyyy-MM-dd HH:mm:ss')
}

function asDate(dateTime: Optional<DateTime|Date>) : Optional<string> {
  return dateTime ? (dateTime instanceof Date ? dateTime?.toISOString()?.substring(0, 10) : dateTime?.toFormat('yyyy-MM-dd')) : undefined
}

function asTime(dateTime: Optional<DateTime>) : Optional<string> {
  return dateTime?.toFormat('HH:mm:ss')
}

function asFixed(value: Optional<number>, digits: number = 2, trim: boolean = false) : Optional<string> {
  if (value === undefined) return undefined
  let res = value.toFixed(digits)
  if (trim) {
    while (res.endsWith('0')) {
      res = res.substring(0, res.length - 1)
    }
    if (res.endsWith('.') || res.endsWith(',')) res = res.substring(0, res.length - 1)
  }
  return res
}

const formatterInstance = {
  asDateTime,
  asDate,
  asTime,
  asFixed
}

export default function useFormatter() {
  return formatterInstance
}
