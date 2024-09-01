import { inject, InjectionKey, provide } from 'vue'
import { Optional } from '@/utils/typeScriptUtils'
import { VBtn } from 'vuetify/components'
import GlobalConfirmDialog from '@/modules/dialog/GlobalConfirmDialog.vue'

/**
 * Global confirm dialog.
 *
 * **Installation:**
 *
 * The dialog has to be added to the root `App.vue` directly under the top level.
 * Also the component should be registered in the script part of the `App.vue`. The optional second parameter
 * of the registration function is a default value definition.
 *
 * ```ts
 * const confirmDialog = ref<typeof GlobalConfirmDialog>()
 *
 * onMounted(() => {
 *   if (confirmDialog.value) {
 *     registerConfirmDialog(confirmDialog.value, {
 *       // Default values
 *     })
 *   }
 * })
 * ```
 *
 * **Usage:**
 *
 * In the components where we wish to use it, simply inject the component:
 *
 * ```ts
 * const createConfirmDialog = useConfirmDialog()
 * ```
 *
 * and then use this function to create the dialog.
 */

/**
 * Custom dialog button definition
 */
export type ConfirmDialogButton = {
  /** The key of the button. It should be unique and will be returned when the button is pressed. */
    key: string
    /** Optional label text of the button. If the label starts with `@`, it is handled as message key, otherwise
     * the text is used as string literal. When omitted, the label will be retrieved from messages with a key of
     * `@common.<key>`.
     */
    label?: string
    /** Optional color of the button. When omitted, `primary` will be used. */
    color?: string
}

export class Button {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {}

  static OK = 'ok'
  static CANCEL = 'cancel'
  static YES = 'yes'
  static NO = 'no'
}

export class ButtonSet {
  // eslint-disable-next-line no-useless-constructor
  private constructor() {}

  static ok : ConfirmDialogButton[] = [
    { key: Button.OK }
  ]

  static okCancel : ConfirmDialogButton[] = [
    { key: Button.OK }, { key: Button.CANCEL }
  ]

  static yesNo: ConfirmDialogButton[] = [
    { key: Button.YES }, { key: Button.NO }
  ]

  static yesNoCancel : ConfirmDialogButton[] = [
    { key: Button.YES }, { key: Button.NO }, { key: Button.CANCEL }
  ]
}

export interface CreateConfirmDialogOptions {
    /** Title of the dialog.
     *
     * If it starts with an @, it is handled as a message key. */
    title?: string
    /** Background color of the title bar. */
    titleColor?: string

    /** Content of the dialog. New lines may be added for multiline messages. */
    content?: string
    /** (MDI) icon name */
    icon?: Optional<string>
    /** The maximum width of the dialog. */
    width?: string | number
    /** Whether the dialog is persistent */
    persistent?: boolean
    /** The list of buttons. You can use the predefined buttons from `Button`
     * or complete sets from `ButtonSet`.
     *
     * You can combine your own set by defining an array of buttons. In the array you can
     * refer to any of the predefined buttons or create your own. In the `ConfirmDialogButton`
     * object, the key should be unique and mandatory, the other fields are optional. For the
     * label, if omitted, the `common.<key>` message key would be used for fetching the label.
     * If the label is provided and starts with @, it will be regarded as a message key, otherwise as
     * a text literal. */
    buttons?: ConfirmDialogButton[]

    /** Vuetify variant of the buttons. Default is `text` */
    buttonVariant?: typeof VBtn.variant | undefined
}

let confirmDialogDefaults: CreateConfirmDialogOptions = {
  title: '@common.confirm',
  titleColor: 'bg-blue',
  width: 300,
  persistent: false,
  buttons: ButtonSet.ok,
}

export function getConfigDialogDefaults() {
  return confirmDialogDefaults
}

export type CreateConfirmDialog = (
    options: CreateConfirmDialogOptions
) => Promise<string>;

export const CreateConfirmDialogKey: InjectionKey<CreateConfirmDialog> = Symbol(
  'CreateConfirmDialogKey'
)

export function registerConfirmDialog(dialogComponent: typeof GlobalConfirmDialog, defaults?: CreateConfirmDialogOptions) {
  if (defaults) {
    confirmDialogDefaults = defaults
  }
  provide(CreateConfirmDialogKey, dialogComponent.createConfirmDialog)
}

export function useConfirmDialog() {
  return inject(CreateConfirmDialogKey)
}
