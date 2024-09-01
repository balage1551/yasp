import { messagesHU } from '@/plugins/i18n/messages_hu'

/**
    Adding a new language:

    1. Create a new message (`message_<LANG>.ts`) file and translate all HU messages (you can merge the
        `messagesCommon` into it to bring all the non-language specific messages.
    2. Add the (native) name of the language to the `language.nativeName` structure in `messagesCommon`
    3. Add the language to this `messages` structure
    4. Fetch the flag from https://github.com/lipis/flag-icons/tree/main/flags/4x3 and add it to `public/flags`
    5. On server side, add the language to `Language.kt`
    6. Create a new `Messages_<LANG>.properties` in resources

 */

export const messages = {
  hu: messagesHU
}

export type SupportedLanguages = keyof typeof messages

export type ListOfSupportedLanguages = Array<SupportedLanguages>

export const supportedLanguageList : ListOfSupportedLanguages = Object.keys(messages) as ListOfSupportedLanguages
