export class SnackTaste {
  readonly type: string
  readonly color: string
  readonly defaultTimeout: number

  private constructor(type: string, color: string, timeout: number) {
    this.type = type
    this.color = color
    this.defaultTimeout = timeout
  }

  static INFO = new SnackTaste('INFO', 'info', 2000)
  static SUCCESS = new SnackTaste('SUCCESS', 'green', 2000)
  static WARNING = new SnackTaste('WARNING', 'warning', 5000)
  static ERROR = new SnackTaste('ERROR', 'error', 5000)
}

export interface SnackPacket {
  readonly message: string
  readonly color: string
  readonly timeout: number
}
