import { EnableEmitter, DisableEmitter, createComposer } from './composer'
import { I18nWarnCodes, getWarnMessage } from './warnings'
import { createI18nError, I18nErrorCodes } from './errors'
import {
  isString,
  isArray,
  isPlainObject,
  isNumber,
  isBoolean,
  isFunction,
  isRegExp,
  assign,
  warn
} from '@intlify/shared'

import type {
  Path,
  MessageResolver,
  PluralizationRule,
  PluralizationRules,
  LinkedModifiers,
  NamedValue,
  MessageFunction,
  Locale,
  LocaleMessages,
  LocaleMessageDictionary,
  PostTranslationHandler,
  FallbackLocale,
  LocaleMessageValue,
  TranslateOptions,
  DateTimeFormats as DateTimeFormatsType,
  NumberFormats as NumberFormatsType,
  DateTimeFormat,
  NumberFormat
} from '@intlify/core-base'
import type { VueDevToolsEmitter } from '@intlify/vue-devtools'
import type {
  VueMessageType,
  MissingHandler,
  Composer,
  ComposerOptions,
  ComposerInternalOptions
} from './composer'

/** @VueI18nLegacy */
export type TranslateResult = string
export type Choice = number
/** @VueI18nLegacy */
export type LocaleMessageObject<
  Message = string
> = LocaleMessageDictionary<Message>
export type PluralizationRulesMap = { [locale: string]: PluralizationRule }
export type WarnHtmlInMessageLevel = 'off' | 'warn' | 'error'
/** @VueI18nLegacy */
export type DateTimeFormatResult = string
/** @VueI18nLegacy */
export type NumberFormatResult = string
export interface Formatter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interpolate(message: string, values: any, path: string): Array<any> | null
}
export type ComponentInstanceCreatedListener = <Messages>(
  target: VueI18n<Messages>,
  global: VueI18n<Messages>
) => void

/**
 *  VueI18n Options
 *
 *  @remarks
 *  This option is compatible with `VueI18n` class constructor options (offered with Vue I18n v8.x)
 *
 *  @VueI18nLegacy
 */
export interface VueI18nOptions {
  /**
   * @remarks
   * The locale of localization.
   *
   * If the locale contains a territory and a dialect, this locale contains an implicit fallback.
   *
   * @VueI18nSee [Scope and Locale Changing](../guide/essentials/scope)
   *
   * @defaultValue `'en-US'`
   */
  locale?: Locale
  /**
   * @remarks
   * The locale of fallback localization.
   *
   * For more complex fallback definitions see fallback.
   *
   * @VueI18nSee [Fallbacking](../guide/essentials/fallback)
   *
   * @defaultValue The default `'en-US'` for the `locale` if it's not specified, or it's `locale` value
   */
  fallbackLocale?: FallbackLocale
  /**
   * @remarks
   * The locale messages of localization.
   *
   * @VueI18nSee [Getting Started](../guide/)
   *
   * @defaultValue `{}`
   */
  messages?: LocaleMessages<VueMessageType>
  /**
   * @remarks
   * Allow use flat json messages or not
   *
   * @defaultValue `false`
   */
  flatJson?: boolean
  /**
   * @remarks
   * The datetime formats of localization.
   *
   * @VueI18nSee [Datetime Formatting](../guide/essentials/datetime)
   *
   * @defaultValue `{}`
   */
  datetimeFormats?: DateTimeFormatsType
  /**
   * @remarks
   * The number formats of localization.
   *
   * @VueI18nSee [Number Formatting](../guide/essentials/number)
   *
   * @defaultValue `{}`
   */
  numberFormats?: NumberFormatsType
  /**
   * @remarks
   * The list of available locales in messages in lexical order.
   *
   * @defaultValue `[]`
   */
  availableLocales?: Locale[]
  /**
   * @remarks
   * Custom Modifiers for linked messages.
   *
   * @VueI18nSee [Custom Modifiers](../guide/essentials/syntax#custom-modifiers)
   */
  modifiers?: LinkedModifiers<VueMessageType>
  /**
   * @remarks
   * The formatter that implemented with Formatter interface.
   *
   * @deprecated See the [here](../guide/migration/breaking#remove-custom-formatter)
   */
  formatter?: Formatter
  /**
   * @remarks
   * A handler for localization missing.
   *
   * The handler gets called with the localization target locale, localization path key, the Vue instance and values.
   *
   * If missing handler is assigned, and occurred localization missing, it's not warned.
   *
   * @defaultValue `null`
   */
  missing?: MissingHandler
  /**
   * @remarks
   * In the component localization, whether to fall back to root level (global scope) localization when localization fails.
   *
   * If `false`, it's not fallback to root.
   *
   * @VueI18nSee [Fallbacking](../guide/essentials/fallback)
   *
   * @defaultValue `true`
   */
  fallbackRoot?: boolean
  /**
   * @remarks
   * Whether suppress warnings outputted when localization fails.
   *
   * If `true`, suppress localization fail warnings.
   *
   * If you use regular expression, you can suppress localization fail warnings that it match with translation key (e.g. `t`).
   *
   * @VueI18nSee [Fallbacking](../guide/essentials/fallback)
   *
   * @defaultValue `false`
   */
  silentTranslationWarn?: boolean | RegExp
  /**
   * @remarks
   * Whether do template interpolation on translation keys when your language lacks a translation for a key.
   *
   * If `true`, skip writing templates for your "base" language; the keys are your templates.
   *
   * @VueI18nSee [Fallbacking](../guide/essentials/fallback)
   *
   * @defaultValue `false`
   */
  silentFallbackWarn?: boolean | RegExp
  /**
   * @remarks
   * Whether suppress warnings when falling back to either `fallbackLocale` or root.
   *
   * @VueI18nSee [Fallbacking](../guide/essentials/fallback)
   *
   * @defaultValue `false`
   */
  formatFallbackMessages?: boolean
  /**
   * @remarks
   * Whether `v-t` directive's element should preserve `textContent` after directive is unbinded.
   *
   * @VueI18nSee [Custom Directive](../guide/advanced/directive)
   * @VueI18nSee [Remove `preserveDirectiveContent` option](../guide/migration/breaking#remove-preservedirectivecontent-option)
   *
   * @defaultValue `false`
   *
   * @deprecated The `v-t` directive for Vue 3 now preserves the default content. Therefore, this option and its properties have been removed from the VueI18n instance.
   */
  preserveDirectiveContent?: boolean
  /**
   * @remarks
   * Whether to allow the use locale messages of HTML formatting.
   *
   * See the warnHtmlInMessage property.
   *
   * @VueI18nSee [HTML Message](../guide/essentials/syntax#html-message)
   * @VueI18nSee [Change `warnHtmlInMessage` option default value](../guide/migration/breaking#change-warnhtmlinmessage-option-default-value)
   *
   * @defaultValue `'off'`
   */
  warnHtmlInMessage?: WarnHtmlInMessageLevel
  /**
   * @remarks
   * If `escapeParameterHtml` is configured as true then interpolation parameters are escaped before the message is translated.
   *
   * This is useful when translation output is used in `v-html` and the translation resource contains html markup (e.g. <b> around a user provided value).
   *
   * This usage pattern mostly occurs when passing precomputed text strings into UI components.
   *
   * The escape process involves replacing the following symbols with their respective HTML character entities: `<`, `>`, `"`, `'`.
   *
   * Setting `escapeParameterHtml` as true should not break existing functionality but provides a safeguard against a subtle type of XSS attack vectors.
   *
   * @VueI18nSee [HTML Message](../guide/essentials/syntax#html-message)
   *
   * @defaultValue `false`
   */
  escapeParameterHtml?: boolean
  /**
   * @remarks
   * The shared locale messages of localization for components. More detail see Component based localization.
   *
   * @VueI18nSee [Shared locale messages for components](../guide/essentials/local#shared-locale-messages-for-components)
   *
   * @defaultValue `undefined`
   */
  sharedMessages?: LocaleMessages<VueMessageType>
  /**
   * @remarks
   * A set of rules for word pluralization
   *
   * @VueI18nSee [Custom Pluralization](../guide/essentials/pluralization#custom-pluralization)
   *
   * @defaultValue `{}`
   */
  pluralizationRules?: PluralizationRules
  /**
   * @remarks
   * A handler for post processing of translation. The handler gets after being called with the `$t`, `t`, `$tc`, and `tc`.
   *
   * This handler is useful if you want to filter on translated text such as space trimming.
   *
   * @defaultValue `null`
   */
  postTranslation?: PostTranslationHandler<VueMessageType>
  /**
   * @remarks
   * Whether synchronize the root level locale to the component localization locale.
   *
   * If `false`, regardless of the root level locale, localize for each component locale.
   *
   * @VueI18nSee [Local Scope](../guide/essentials/scope#local-scope-2)
   *
   * @defaultValue `true`
   */
  sync?: boolean
  /**
   * @remarks
   * A handler for getting notified when component-local instance was created.
   *
   * The handler gets called with new and old (root) VueI18n instances.
   *
   * This handler is useful when extending the root VueI18n instance and wanting to also apply those extensions to component-local instance.
   *
   * @defaultValue `null`
   */
  componentInstanceCreatedListener?: ComponentInstanceCreatedListener
  /**
   * @remarks
   * A message resolver to resolve [`messages`](legacy#messages).
   *
   * If not specified, the vue-i18n internal message resolver will be used by default.
   *
   * You need to implement a message resolver yourself that supports the following requirements:
   *
   * - Resolve the message using the locale message of [`locale`](legacy#locale) passed as the first argument of the message resolver, and the path passed as the second argument.
   *
   * - If the message could not be resolved, you need to return `null`.
   *
   * - If you will be returned `null`, the message resolver will also be called on fallback if [`fallbackLocale`](legacy#fallbacklocale-2) is enabled, so the message will need to be resolved as well.
   *
   * The message resolver is called indirectly by the following APIs:
   *
   * - [`t`](legacy#t-key)
   *
   * - [`tc`](legacy#tc-key)
   *
   * - [`te`](legacy#te-key-locale)
   *
   * - [`tm`](legacy#tm-key)
   *
   * - [Translation component](component#translation)
   *
   * @example
   * Here is an example of how to set it up using your `createI18n`:
   * ```js
   * import { createI18n } from 'vue-i18n'
   *
   * // your message resolver
   * function messageResolver(obj, path) {
   *   // simple message resolving!
   *   const msg = obj[path]
   *   return msg != null ? msg : null
   * }
   *
   * // call with I18n option
   * const i18n = createI18n({
   *   locale: 'ja',
   *   messageResolver, // set your message resolver
   *   messages: {
   *     en: { ... },
   *     ja: { ... }
   *   }
   * })
   *
   * // the below your something to do ...
   * // ...
   * ```
   *
   * @VueI18nTip
   * :new: v9.2+
   *
   * @VueI18nWarning
   * If you use the message resolver, the [`flatJson`](legacy#flatjson) setting will be ignored. That is, you need to resolve the flat JSON by yourself.
   *
   * @VueI18nSee [Fallbacking](../guide/essentials/fallback)
   *
   * @defaultValue `undefined`
   */
  messageResolver?: MessageResolver
}

/**
 *  VueI18n legacy interfaces
 *
 *  @remarks
 *  This interface is compatible with interface of `VueI18n` class (offered with Vue I18n v8.x).
 *
 *  @VueI18nLegacy
 */
export interface VueI18n<
  Messages = {},
  DateTimeFormats = {},
  NumberFormats = {}
> {
  /**
   * @remarks
   * Instance ID.
   */
  id: number
  /**
   * @remarks
   * The current locale this VueI18n instance is using.
   *
   * If the locale contains a territory and a dialect, this locale contains an implicit fallback.
   *
   * @VueI18nSee [Scope and Locale Changing](../guide/essentials/scope)
   */
  locale: Locale
  /**
   * @remarks
   * The current fallback locales this VueI18n instance is using.
   *
   * @VueI18nSee [Fallbacking](../guide/essentials/fallback)
   */
  fallbackLocale: FallbackLocale
  /**
   * @remarks
   * The list of available locales in `messages` in lexical order.
   */
  readonly availableLocales: Locale[]
  /**
   * @remarks
   * The locale messages of localization.
   *
   * @VueI18nSee [Getting Started](../guide/)
   */
  readonly messages: Messages
  /**
   * @remarks
   * The datetime formats of localization.
   *
   * @VueI18nSee [Datetime Formatting](../guide/essentials/datetime)
   */
  readonly datetimeFormats: DateTimeFormats
  /**
   * @remarks
   * The number formats of localization.
   *
   * @VueI18nSee [Number Formatting](../guide/essentials/number)
   */
  readonly numberFormats: NumberFormats
  /**
   * @remarks
   * Custom Modifiers for linked messages.
   *
   * @VueI18nSee [Custom Modifiers](../guide/essentials/syntax#custom-modifiers)
   */
  readonly modifiers: LinkedModifiers<VueMessageType>
  /**
   * @remarks
   * The formatter that implemented with Formatter interface.
   *
   * @deprecated See the [here](../guide/migration/breaking#remove-custom-formatter)
   */
  formatter: Formatter
  /**
   * @remarks
   * A handler for localization missing.
   */
  missing: MissingHandler | null
  /**
   * @remarks
   * A handler for post processing of translation.
   */
  postTranslation: PostTranslationHandler<VueMessageType> | null
  /**
   * @remarks
   * Whether suppress warnings outputted when localization fails.
   *
   * @VueI18nSee [Fallbacking](../guide/essentials/fallback)
   */
  silentTranslationWarn: boolean | RegExp
  /**
   * @remarks
   * Whether suppress fallback warnings when localization fails.
   */
  silentFallbackWarn: boolean | RegExp
  /**
   * @remarks
   * Whether suppress warnings when falling back to either `fallbackLocale` or root.
   *
   * @VueI18nSee [Fallbacking](../guide/essentials/fallback)
   */
  formatFallbackMessages: boolean
  /**
   * @remarks
   * Whether synchronize the root level locale to the component localization locale.
   *
   * @VueI18nSee [Local Scope](../guide/essentials/scope#local-scope-2)
   */
  sync: boolean
  /**
   * @remarks
   * Whether to allow the use locale messages of HTML formatting.
   *
   * If you set `warn` or` error`, will check the locale messages on the VueI18n instance.
   *
   * If you are specified `warn`, a warning will be output at console.
   *
   * If you are specified `error` will occurred an Error.
   *
   * @VueI18nSee [HTML Message](../guide/essentials/syntax#html-message)
   * @VueI18nSee [Change `warnHtmlInMessage` option default value](../guide/migration/breaking#change-warnhtmlinmessage-option-default-value)
   */
  warnHtmlInMessage: WarnHtmlInMessageLevel
  /**
   * @remarks
   * Whether interpolation parameters are escaped before the message is translated.
   *
   * @VueI18nSee [HTML Message](../guide/essentials/syntax#html-message)
   */
  escapeParameterHtml: boolean
  /**
   * @remarks
   * Whether `v-t` directive's element should preserve `textContent` after directive is unbinded.
   *
   * @VueI18nSee [Custom Directive](../guide/advanced/directive)
   * @VueI18nSee [Remove preserveDirectiveContent option](../guide/migration/breaking#remove-preservedirectivecontent-option)
   *
   * @deprecated The `v-t` directive for Vue 3 now preserves the default content. Therefore, this option and its properties have been removed from the VueI18n instance.
   */
  preserveDirectiveContent: boolean
  /**
   * A set of rules for word pluralization
   *
   * @VueI18nSee [Custom Pluralization](../guide/essentials/pluralization#custom-pluralization)
   */
  pluralizationRules: PluralizationRules
  /**
   * Locale message translation.
   *
   * @remarks
   * If this is used in a reactive context, it will re-evaluate once the locale changes.
   *
   * If [i18n component options](injection#i18n) is specified, it’s translated in preferentially local scope locale messages than global scope locale messages.
   *
   * If [i18n component options](injection#i18n) isn't specified, it’s translated with global scope locale messages.
   *
   * @param key - A target locale message key
   *
   * @returns Translated message
   *
   * @VueI18nSee [Scope and Locale Changing](../guide/essentials/scope)
   */
  t(key: Path): TranslateResult
  /**
   * Locale message translation.
   *
   * @remarks
   * Overloaded `t`. About details, see the [t](legacy#t-key) details.
   *
   * @param key - A target locale message key
   * @param locale - A locale, it will be used over than global scope or local scope.
   *
   * @returns Translated message
   */
  t(key: Path, locale: Locale): TranslateResult
  /**
   * Locale message translation.
   *
   * @remarks
   * Overloaded `t`. About details, see the [t](legacy#t-key) details.
   *
   * @param key - A target locale message key
   * @param locale - A locale, it will be used over than global scope or local scope.
   * @param list - A values of list interpolation
   *
   * @returns Translated message
   *
   * @VueI18nSee [List interpolation](../guide/essentials/syntax#list-interpolation)
   */
  t(key: Path, locale: Locale, list: unknown[]): TranslateResult
  /**
   * Locale message translation.
   *
   * @remarks
   * Overloaded `t`. About details, see the [t](legacy#t-key) details.
   *
   * @param key - A target locale message key
   * @param locale - A locale, it will be used over than global scope or local scope.
   * @param named - A values of named interpolation
   *
   * @returns Translated message
   *
   * @VueI18nSee [Named interpolation](../guide/essentials/syntax#named-interpolation)
   */
  t(key: Path, locale: Locale, named: object): TranslateResult
  /**
   * Locale message translation.
   *
   * @remarks
   * Overloaded `t`. About details, see the [t](legacy#t-key) details.
   *
   * @param key - A target locale message key
   * @param list - A values of list interpolation
   *
   * @returns Translated message
   *
   * @VueI18nSee [List interpolation](../guide/essentials/syntax#list-interpolation)
   */
  t(key: Path, list: unknown[]): TranslateResult
  /**
   * Locale message translation.
   *
   * @remarks
   * Overloaded `t`. About details, see the [t](legacy#t-key) details.
   *
   * @param key - A target locale message key
   * @param named - A values of named interpolation
   *
   * @returns Translated message
   *
   * @VueI18nSee [Named interpolation](../guide/essentials/syntax#named-interpolation)
   */
  t(key: Path, named: Record<string, unknown>): TranslateResult
  /** @internal */
  t(...args: unknown[]): TranslateResult // for $t
  /**
   * Resolve locale message translation
   *
   * @remarks
   * If this is used in a reactive context, it will re-evaluate once the locale changes.
   *
   * @VueI18nTip
   * The use-case for `rt` is for programmatic locale messages translation with using `tm`, `v-for`, javascript `for` statement.
   *
   * @VueI18nWarning
   * `rt` differs from `t` in that it processes the locale message directly, not the key of the locale message. There is no internal fallback with `rt`. You need to understand and use the structure of the locale messge returned by `tm`.
   *
   * @param message - A target locale message to be resolved. You will need to specify the locale message returned by `tm`.
   *
   * @returns Translated message
   *
   * @VueI18nSee [Scope and Locale Changing](../guide/essentials/scope)
   */
  rt(message: MessageFunction<VueMessageType> | VueMessageType): string
  /**
   * Resolve locale message translation for plurals
   *
   * @remarks
   * Overloaded `rt`. About details, see the [rt](legacy#rt-message) details.
   *
   * In this overloaded `rt`, return a pluralized translation message.
   *
   * @VueI18nTip
   * The use-case for `rt` is for programmatic locale messages translation with using `tm`, `v-for`, javascript `for` statement.
   *
   * @VueI18nWarning
   * `rt` differs from `t` in that it processes the locale message directly, not the key of the locale message. There is no internal fallback with `rt`. You need to understand and use the structure of the locale messge returned by `tm`.
   *
   * @param message - A target locale message to be resolved. You will need to specify the locale message returned by `tm`.
   * @param plural - Which plural string to get. 1 returns the first one.
   * @param options - Additional {@link TranslateOptions | options} for translation
   *
   * @returns Translated message
   *
   * @VueI18nSee [Pluralization](../guide/essentials/pluralization)
   */
  rt(
    message: MessageFunction<VueMessageType> | VueMessageType,
    plural: number,
    options?: TranslateOptions
  ): string
  /**
   * Resolve locale message translation for list interpolations
   *
   * @remarks
   * Overloaded `rt`. About details, see the [rt](legacy#rt-message) details.
   *
   * In this overloaded `rt`, return a pluralized translation message.
   *
   * @VueI18nTip
   * The use-case for `rt` is for programmatic locale messages translation with using `tm`, `v-for`, javascript `for` statement.
   *
   * @VueI18nWarning
   * `rt` differs from `t` in that it processes the locale message directly, not the key of the locale message. There is no internal fallback with `rt`. You need to understand and use the structure of the locale messge returned by `tm`.
   *
   * @param message - A target locale message to be resolved. You will need to specify the locale message returned by `tm`.
   * @param list - A values of list interpolation.
   * @param options - Additional {@link TranslateOptions | options} for translation
   *
   * @returns Translated message
   *
   * @VueI18nSee [List interpolation](../guide/essentials/syntax#list-interpolation)
   */
  rt(
    message: MessageFunction<VueMessageType> | VueMessageType,
    list: unknown[],
    options?: TranslateOptions
  ): string
  /**
   * Resolve locale message translation for named interpolations
   *
   * @remarks
   * Overloaded `rt`. About details, see the [rt](legacy#rt-message) details.
   *
   * In this overloaded `rt`, for each placeholder x, the locale messages should contain a `{x}` token.
   *
   * @VueI18nTip
   * The use-case for `rt` is for programmatic locale messages translation with using `tm`, `v-for`, javascript `for` statement.
   *
   * @VueI18nWarning
   * `rt` differs from `t` in that it processes the locale message directly, not the key of the locale message. There is no internal fallback with `rt`. You need to understand and use the structure of the locale messge returned by `tm`.
   *
   * @param message - A target locale message to be resolved. You will need to specify the locale message returned by `tm`.
   * @param named - A values of named interpolation.
   * @param options - Additional {@link TranslateOptions | options} for translation
   *
   * @returns Translated message
   *
   * @VueI18nSee [Named interpolation](../guide/essentials/syntax#named-interpolation)
   */
  rt(
    message: MessageFunction<VueMessageType> | VueMessageType,
    named: NamedValue,
    options?: TranslateOptions
  ): string
  /** @internal */
  rt(...args: unknown[]): string // for $rt
  /**
   * Locale message pluralization
   *
   * @remarks
   * If this is used in a reactive context, it will re-evaluate once the locale changes.
   *
   * If [i18n component options](injection#i18n) is specified, it’s pluraled in preferentially local scope locale messages than global scope locale messages.
   *
   * If [i18n component options](injection#i18n) isn't specified, it’s pluraled with global scope locale messages.
   *
   * The plural choice number is handled with default `1`.
   *
   * @param key - A target locale message key
   *
   * @returns Pluraled message
   *
   * @VueI18nSee [Pluralization](../guide/essentials/pluralization)
   */
  tc(key: Path): TranslateResult
  /**
   * Locale message pluralization
   *
   * @remarks
   * Overloaded `tc`. About details, see the [tc](legacy#tc-key) details.
   *
   * @param key - A target locale message key
   * @param locale - A locale, it will be used over than global scope or local scope.
   *
   * @returns Pluraled message
   */
  tc(key: Path, locale: Locale): TranslateResult
  /**
   * Locale message pluralization
   *
   * @remarks
   * Overloaded `tc`. About details, see the [tc](legacy#tc-key) details.
   *
   * @param key - A target locale message key
   * @param list - A values of list interpolation
   *
   * @returns Pluraled message
   */
  tc(key: Path, list: unknown[]): TranslateResult
  /**
   * Locale message pluralization
   *
   * @remarks
   * Overloaded `tc`. About details, see the [tc](legacy#tc-key) details.
   *
   * @param key - A target locale message key
   * @param named - A values of named interpolation
   *
   * @returns Pluraled message
   */
  tc(key: Path, named: Record<string, unknown>): TranslateResult
  /**
   * Locale message pluralization
   *
   * @remarks
   * Overloaded `tc`. About details, see the [tc](legacy#tc-key) details.
   *
   * @param key - A target locale message key
   * @param choice - Which plural string to get. 1 returns the first one.
   *
   * @returns Pluraled message
   */
  tc(key: Path, choice: number): TranslateResult
  /**
   * Locale message pluralization
   *
   * @remarks
   * Overloaded `tc`. About details, see the [tc](legacy#tc-key) details.
   *
   * @param key - A target locale message key
   * @param choice - Which plural string to get. 1 returns the first one.
   * @param locale - A locale, it will be used over than global scope or local scope.
   *
   * @returns Pluraled message
   */
  tc(key: Path, choice: number, locale: Locale): TranslateResult
  /**
   * Locale message pluralization
   *
   * @remarks
   * Overloaded `tc`. About details, see the [tc](legacy#tc-key) details.
   *
   * @param key - A target locale message key
   * @param choice - Which plural string to get. 1 returns the first one.
   * @param list - A values of list interpolation
   *
   * @returns Pluraled message
   */
  tc(key: Path, choice: number, list: unknown[]): TranslateResult
  /**
   * Locale message pluralization
   *
   * @remarks
   * Overloaded `tc`. About details, see the [tc](legacy#tc-key) details.
   *
   * @param key - A target locale message key
   * @param choice - Which plural string to get. 1 returns the first one.
   * @param named - A values of named interpolation
   *
   * @returns Pluraled message
   */
  tc(key: Path, choice: number, named: Record<string, unknown>): TranslateResult
  /** @internal */
  tc(...args: unknown[]): TranslateResult // for $tc
  /**
   * Translation locale message exist
   *
   * @remarks
   * whether do exist locale message on VueI18n instance [messages](legacy#messages).
   *
   * If you specified `locale`, check the locale messages of `locale`.
   *
   * @param key - A target locale message key
   * @param locale - A target locale
   *
   * @returns If found locale message, `true`, else `false`
   */
  te(key: Path, locale?: Locale): boolean
  /**
   * Locale messages getter
   *
   * @remarks
   * If [i18n component options](injection#i18n) is specified, it’s get in preferentially local scope locale messages than global scope locale messages.
   *
   * If [i18n component options](injection#i18n) isn't specified, it’s get with global scope locale messages.
   *
   * Based on the current `locale`, locale messages will be returned from Composer instance messages.
   *
   * If you change the `locale`, the locale messages returned will also correspond to the locale.
   *
   * If there are no locale messages for the given `key` in the composer instance messages, they will be returned with [fallbacking](../guide/essentials/fallback).
   *
   * @VueI18nWarning
   * You need to use `rt` for the locale message returned by `tm`. see the [rt](legacy#rt-message) details.
   *
   * @example
   * template:
   * ```html
   * <div class="container">
   *   <template v-for="content in $tm('contents')">
   *     <h2>{{ $rt(content.title) }}</h2>
   *     <p v-for="paragraph in content.paragraphs">
   *      {{ $rt(paragraph) }}
   *     </p>
   *   </template>
   * </div>
   * ```
   *
   * ```js
   * import { createI18n } from 'vue-i18n'
   *
   * const i18n = createI18n({
   *   messages: {
   *     en: {
   *       contents: [
   *         {
   *           title: 'Title1',
   *           // ...
   *           paragraphs: [
   *             // ...
   *           ]
   *         }
   *       ]
   *     }
   *   }
   *   // ...
   * })
   * ```
   * @param key - A target locale message key
   *
   * @return Locale messages
   */
  tm(key: Path): LocaleMessageValue<VueMessageType> | {}
  /**
   * Get locale message
   *
   * @remarks
   * get locale message from VueI18n instance [messages](legacy#messages).
   *
   * @param locale - A target locale
   *
   * @returns Locale messages
   */
  getLocaleMessage(locale: Locale): LocaleMessageDictionary<VueMessageType>
  /**
   * Set locale message
   *
   * @remarks
   * Set locale message to VueI18n instance [messages](legacy#messages).
   *
   * @param locale - A target locale
   * @param message - A message
   */
  setLocaleMessage(
    locale: Locale,
    message: LocaleMessageDictionary<VueMessageType>
  ): void
  /**
   * Merge locale message
   *
   * @remarks
   * Merge locale message to VueI18n instance [messages](legacy#messages).
   *
   * @param locale - A target locale
   * @param message - A message
   */
  mergeLocaleMessage(
    locale: Locale,
    message: LocaleMessageDictionary<VueMessageType>
  ): void
  /**
   * Datetime formatting
   *
   * @remarks
   * If this is used in a reactive context, it will re-evaluate once the locale changes.
   *
   * If [i18n component options](injection#i18n) is specified, it’s formatted in preferentially local scope datetime formats than global scope locale messages.
   *
   * If [i18n component options](injection#i18n) isn't specified, it’s formatted with global scope datetime formats.
   *
   * @param value - A value, timestamp number or `Date` instance
   *
   * @returns Formatted value
   *
   * @VueI18nSee [Datetime formatting](../guide/essentials/datetime)
   */
  d(value: number | Date): DateTimeFormatResult
  /**
   * Datetime formatting
   *
   * @remarks
   * Overloaded `d`. About details, see the [d](legacy#d-value) details.
   *
   * @param value - A value, timestamp number or `Date` instance
   * @param key - A key of datetime formats
   *
   * @returns Formatted value
   */
  d(value: number | Date, key: string): DateTimeFormatResult
  /**
   * Datetime formatting
   *
   * @remarks
   * Overloaded `d`. About details, see the [d](legacy#d-value) details.
   *
   * @param value - A value, timestamp number or `Date` instance
   * @param key - A key of datetime formats
   * @param locale - A locale, it will be used over than global scope or local scope.
   *
   * @returns Formatted value
   */
  d(value: number | Date, key: string, locale: Locale): DateTimeFormatResult
  /**
   * Datetime formatting
   *
   * @remarks
   * Overloaded `d`. About details, see the [d](legacy#d-value) details.
   *
   * @param value - A value, timestamp number or `Date` instance
   * @param args - An argument values
   *
   * @returns Formatted value
   */
  d(value: number | Date, args: { [key: string]: string }): DateTimeFormatResult
  /** @internal */
  d(...args: unknown[]): DateTimeFormatResult // for $d
  /**
   * Get datetime format
   *
   * @remarks
   * get datetime format from VueI18n instance [datetimeFormats](legacy#datetimeformats).
   *
   * @param locale - A target locale
   *
   * @returns Datetime format
   */
  getDateTimeFormat(locale: Locale): DateTimeFormat
  /**
   * Set datetime format
   *
   * @remarks
   * Set datetime format to VueI18n instance [datetimeFormats](legacy#datetimeformats).
   *
   * @param locale - A target locale
   * @param format - A target datetime format
   */
  setDateTimeFormat(locale: Locale, format: DateTimeFormat): void
  /**
   * Merge datetime format
   *
   * @remarks
   * Merge datetime format to VueI18n instance [datetimeFormats](legacy#datetimeformats).
   *
   * @param locale - A target locale
   * @param format - A target datetime format
   */
  mergeDateTimeFormat(locale: Locale, format: DateTimeFormat): void
  /**
   * Number formatting
   *
   * @remarks
   * If this is used in a reactive context, it will re-evaluate once the locale changes.
   *
   * If [i18n component options](injection#i18n) is specified, it’s formatted in preferentially local scope number formats than global scope locale messages.
   *
   * If [i18n component options](injection#i18n) isn't specified, it’s formatted with global scope number formats.
   *
   * @param value - A number value
   *
   * @returns Formatted value
   *
   * @VueI18nSee [Number formatting](../guide/essentials/number)
   */
  n(value: number): NumberFormatResult
  /**
   * Number formatting
   *
   * @remarks
   * Overloaded `n`. About details, see the [n](legacy#n-value) details.
   *
   * @param value - A number value
     @param key - A key of number formats
   *
   * @returns Formatted value
   */
  n(value: number, key: string): NumberFormatResult
  /**
   * Number formatting
   *
   * @remarks
   * Overloaded `n`. About details, see the [n](legacy#n-value) details.
   *
   * @param value - A number value
   * @param key - A key of number formats
   * @param locale - A locale, it will be used over than global scope or local scope.
   *
   * @returns Formatted value
   */
  n(value: number, key: string, locale: Locale): NumberFormatResult
  /**
   * Number formatting
   *
   * @remarks
   * Overloaded `n`. About details, see the [n](legacy#n-value) details.
   *
   * @param value - A number value
   * @param args - An argument values
   *
   * @returns Formatted value
   */
  n(value: number, args: { [key: string]: string }): NumberFormatResult
  /** @internal */
  n(...args: unknown[]): NumberFormatResult // for $n
  /**
   * Get number format
   *
   * @remarks
   * get number format from VueI18n instance [numberFormats](legacy#numberFormats).
   *
   * @param locale - A target locale
   *
   * @returns Number format
   */
  getNumberFormat(locale: Locale): NumberFormat
  /**
   * Set number format
   *
   * @remarks
   * Set number format to VueI18n instance [numberFormats](legacy#numberFormats).
   *
   * @param locale - A target locale
   * @param format - A target number format
   */
  setNumberFormat(locale: Locale, format: NumberFormat): void
  /**
   * Merge number format
   *
   * @remarks
   * Merge number format to VueI18n instance [numberFormats](legacy#numberFormats).
   *
   * @param locale - A target locale
   * @param format - A target number format
   */
  mergeNumberFormat(locale: Locale, format: NumberFormat): void
  /**
   * Get choice index
   *
   * @remarks
   * Get pluralization index for current pluralizing number and a given amount of choices.
   *
   * @deprecated Use `pluralizationRules` option instead of `getChoiceIndex`.
   */
  getChoiceIndex: (choice: Choice, choicesLength: number) => number
}

/**
 * @internal
 */
export interface VueI18nInternal<
  Messages = {},
  DateTimeFormats = {},
  NumberFormats = {}
> {
  __composer: Composer<Messages, DateTimeFormats, NumberFormats>
  __onComponentInstanceCreated(target: VueI18n<Messages>): void
  __enableEmitter?: (emitter: VueDevToolsEmitter) => void
  __disableEmitter?: () => void
}

/**
 * Convert to I18n Composer Options from VueI18n Options
 *
 * @internal
 */
function convertComposerOptions<
  Messages = {},
  DateTimeFormats = {},
  NumberFormats = {}
>(
  options: VueI18nOptions &
    ComposerInternalOptions<Messages, DateTimeFormats, NumberFormats>
): ComposerOptions &
  ComposerInternalOptions<Messages, DateTimeFormats, NumberFormats> {
  const locale = isString(options.locale) ? options.locale : 'en-US'
  const fallbackLocale =
    isString(options.fallbackLocale) ||
    isArray(options.fallbackLocale) ||
    isPlainObject(options.fallbackLocale) ||
    options.fallbackLocale === false
      ? options.fallbackLocale
      : locale
  const missing = isFunction(options.missing) ? options.missing : undefined
  const missingWarn =
    isBoolean(options.silentTranslationWarn) ||
    isRegExp(options.silentTranslationWarn)
      ? !options.silentTranslationWarn
      : true
  const fallbackWarn =
    isBoolean(options.silentFallbackWarn) ||
    isRegExp(options.silentFallbackWarn)
      ? !options.silentFallbackWarn
      : true
  const fallbackRoot = isBoolean(options.fallbackRoot)
    ? options.fallbackRoot
    : true
  const fallbackFormat = !!options.formatFallbackMessages
  const modifiers = isPlainObject(options.modifiers) ? options.modifiers : {}
  const pluralizationRules = options.pluralizationRules
  const postTranslation = isFunction(options.postTranslation)
    ? options.postTranslation
    : undefined
  const warnHtmlMessage = isString(options.warnHtmlInMessage)
    ? options.warnHtmlInMessage !== 'off'
    : true
  const escapeParameter = !!options.escapeParameterHtml
  const inheritLocale = isBoolean(options.sync) ? options.sync : true

  if (__DEV__ && options.formatter) {
    warn(getWarnMessage(I18nWarnCodes.NOT_SUPPORTED_FORMATTER))
  }

  if (__DEV__ && options.preserveDirectiveContent) {
    warn(getWarnMessage(I18nWarnCodes.NOT_SUPPORTED_PRESERVE_DIRECTIVE))
  }

  let messages = options.messages
  if (isPlainObject(options.sharedMessages)) {
    const sharedMessages = options.sharedMessages as LocaleMessages<VueMessageType>
    const locales: Locale[] = Object.keys(sharedMessages)
    messages = locales.reduce((messages, locale) => {
      const message = messages[locale] || (messages[locale] = {})
      assign(message, sharedMessages[locale])
      return messages
    }, (messages || {}) as LocaleMessages<VueMessageType>) as typeof options.messages
  }
  const { __i18n, __root } = options

  const datetimeFormats = options.datetimeFormats
  const numberFormats = options.numberFormats
  const flatJson = options.flatJson

  return {
    locale,
    fallbackLocale,
    messages,
    flatJson,
    datetimeFormats,
    numberFormats,
    missing,
    missingWarn,
    fallbackWarn,
    fallbackRoot,
    fallbackFormat,
    modifiers,
    pluralRules: pluralizationRules,
    postTranslation,
    warnHtmlMessage,
    escapeParameter,
    messageResolver: options.messageResolver,
    inheritLocale,
    __i18n,
    __root
  }
}

/**
 * create VueI18n interface factory
 *
 * @internal
 */
export function createVueI18n<
  Options extends VueI18nOptions = object,
  Messages extends Record<
    keyof Options['messages'],
    LocaleMessageDictionary<VueMessageType>
  > = Record<
    keyof Options['messages'],
    LocaleMessageDictionary<VueMessageType>
  >,
  DateTimeFormats extends Record<
    keyof Options['datetimeFormats'],
    DateTimeFormat
  > = Record<keyof Options['datetimeFormats'], DateTimeFormat>,
  NumberFormats extends Record<
    keyof Options['numberFormats'],
    NumberFormat
  > = Record<keyof Options['numberFormats'], NumberFormat>
>(
  options: Options = {} as Options
): VueI18n<
  Options['messages'],
  Options['datetimeFormats'],
  Options['numberFormats']
> {
  const composer = createComposer<VueMessageType>(
    convertComposerOptions<Messages, DateTimeFormats, NumberFormats>(options)
  ) as Composer<Messages, DateTimeFormats, NumberFormats>

  // defines VueI18n
  const vueI18n = {
    // id
    id: composer.id,

    // locale
    get locale(): Locale {
      return composer.locale.value
    },
    set locale(val: Locale) {
      composer.locale.value = val
    },

    // fallbackLocale
    get fallbackLocale(): FallbackLocale {
      return composer.fallbackLocale.value
    },
    set fallbackLocale(val: FallbackLocale) {
      composer.fallbackLocale.value = val
    },

    // messages
    get messages(): Messages {
      return composer.messages.value
    },

    // datetimeFormats
    get datetimeFormats(): DateTimeFormats {
      return composer.datetimeFormats.value
    },

    // numberFormats
    get numberFormats(): NumberFormats {
      return composer.numberFormats.value
    },

    // availableLocales
    get availableLocales(): Locale[] {
      return composer.availableLocales
    },

    // formatter
    get formatter(): Formatter {
      __DEV__ && warn(getWarnMessage(I18nWarnCodes.NOT_SUPPORTED_FORMATTER))
      // dummy
      return {
        interpolate() {
          return []
        }
      }
    },
    set formatter(val: Formatter) {
      __DEV__ && warn(getWarnMessage(I18nWarnCodes.NOT_SUPPORTED_FORMATTER))
    },

    // missing
    get missing(): MissingHandler | null {
      return composer.getMissingHandler()
    },
    set missing(handler: MissingHandler | null) {
      composer.setMissingHandler(handler)
    },

    // silentTranslationWarn
    get silentTranslationWarn(): boolean | RegExp {
      return isBoolean(composer.missingWarn)
        ? !composer.missingWarn
        : composer.missingWarn
    },
    set silentTranslationWarn(val: boolean | RegExp) {
      composer.missingWarn = isBoolean(val) ? !val : val
    },

    // silentFallbackWarn
    get silentFallbackWarn(): boolean | RegExp {
      return isBoolean(composer.fallbackWarn)
        ? !composer.fallbackWarn
        : composer.fallbackWarn
    },
    set silentFallbackWarn(val: boolean | RegExp) {
      composer.fallbackWarn = isBoolean(val) ? !val : val
    },

    // modifiers
    get modifiers(): LinkedModifiers<VueMessageType> {
      return composer.modifiers
    },

    // formatFallbackMessages
    get formatFallbackMessages(): boolean {
      return composer.fallbackFormat
    },
    set formatFallbackMessages(val: boolean) {
      composer.fallbackFormat = val
    },

    // postTranslation
    get postTranslation(): PostTranslationHandler<VueMessageType> | null {
      return composer.getPostTranslationHandler()
    },
    set postTranslation(
      handler: PostTranslationHandler<VueMessageType> | null
    ) {
      composer.setPostTranslationHandler(handler)
    },

    // sync
    get sync(): boolean {
      return composer.inheritLocale
    },
    set sync(val: boolean) {
      composer.inheritLocale = val
    },

    // warnInHtmlMessage
    get warnHtmlInMessage(): WarnHtmlInMessageLevel {
      return composer.warnHtmlMessage ? 'warn' : 'off'
    },
    set warnHtmlInMessage(val: WarnHtmlInMessageLevel) {
      composer.warnHtmlMessage = val !== 'off'
    },

    // escapeParameterHtml
    get escapeParameterHtml(): boolean {
      return composer.escapeParameter
    },
    set escapeParameterHtml(val: boolean) {
      composer.escapeParameter = val
    },

    // preserveDirectiveContent
    get preserveDirectiveContent(): boolean {
      __DEV__ &&
        warn(getWarnMessage(I18nWarnCodes.NOT_SUPPORTED_PRESERVE_DIRECTIVE))
      return true
    },
    set preserveDirectiveContent(val: boolean) {
      __DEV__ &&
        warn(getWarnMessage(I18nWarnCodes.NOT_SUPPORTED_PRESERVE_DIRECTIVE))
    },

    // pluralizationRules
    get pluralizationRules(): PluralizationRules {
      return composer.pluralRules || {}
    },

    // for internal
    __composer: composer,

    // t
    t(...args: unknown[]): TranslateResult {
      const [arg1, arg2, arg3] = args
      const options = {} as TranslateOptions
      let list: unknown[] | null = null
      let named: NamedValue | null = null

      if (!isString(arg1)) {
        throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT)
      }
      const key = arg1

      if (isString(arg2)) {
        options.locale = arg2
      } else if (isArray(arg2)) {
        list = arg2
      } else if (isPlainObject(arg2)) {
        named = arg2 as NamedValue
      }

      if (isArray(arg3)) {
        list = arg3
      } else if (isPlainObject(arg3)) {
        named = arg3 as NamedValue
      }

      return composer.t(key, list || named || {}, options)
    },

    rt(...args: unknown[]): TranslateResult {
      return composer.rt(...args)
    },

    // tc
    tc(...args: unknown[]): TranslateResult {
      const [arg1, arg2, arg3] = args
      const options = { plural: 1 } as TranslateOptions
      let list: unknown[] | null = null
      let named: NamedValue | null = null

      if (!isString(arg1)) {
        throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT)
      }
      const key = arg1

      if (isString(arg2)) {
        options.locale = arg2
      } else if (isNumber(arg2)) {
        options.plural = arg2
      } else if (isArray(arg2)) {
        list = arg2
      } else if (isPlainObject(arg2)) {
        named = arg2 as NamedValue
      }

      if (isString(arg3)) {
        options.locale = arg3
      } else if (isArray(arg3)) {
        list = arg3
      } else if (isPlainObject(arg3)) {
        named = arg3 as NamedValue
      }

      return composer.t(key, list || named || {}, options)
    },

    // te
    te(key: Path, locale?: Locale): boolean {
      return composer.te(key, locale)
    },

    // tm
    tm(key: Path): LocaleMessageValue<VueMessageType> | {} {
      return composer.tm(key)
    },

    // getLocaleMessage
    getLocaleMessage(locale: Locale): LocaleMessageDictionary<VueMessageType> {
      return composer.getLocaleMessage(locale)
    },

    // setLocaleMessage
    setLocaleMessage(
      locale: Locale,
      message: LocaleMessageDictionary<VueMessageType>
    ): void {
      composer.setLocaleMessage(locale, message)
    },

    // mergeLocaleMessage
    mergeLocaleMessage(
      locale: Locale,
      message: LocaleMessageDictionary<VueMessageType>
    ): void {
      composer.mergeLocaleMessage(locale, message)
    },

    // d
    d(...args: unknown[]): DateTimeFormatResult {
      return composer.d(...args)
    },

    // getDateTimeFormat
    getDateTimeFormat(locale: Locale): DateTimeFormat {
      return composer.getDateTimeFormat(locale)
    },

    // setDateTimeFormat
    setDateTimeFormat(locale: Locale, format: DateTimeFormat): void {
      composer.setDateTimeFormat(locale, format)
    },

    // mergeDateTimeFormat
    mergeDateTimeFormat(locale: Locale, format: DateTimeFormat): void {
      composer.mergeDateTimeFormat(locale, format)
    },

    // n
    n(...args: unknown[]): NumberFormatResult {
      return composer.n(...args)
    },

    // getNumberFormat
    getNumberFormat(locale: Locale): NumberFormat {
      return composer.getNumberFormat(locale)
    },

    // setNumberFormat
    setNumberFormat(locale: Locale, format: NumberFormat): void {
      composer.setNumberFormat(locale, format)
    },

    // mergeNumberFormat
    mergeNumberFormat(locale: Locale, format: NumberFormat): void {
      composer.mergeNumberFormat(locale, format)
    },

    // getChoiceIndex
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getChoiceIndex(choice: Choice, choicesLength: number): number {
      __DEV__ &&
        warn(getWarnMessage(I18nWarnCodes.NOT_SUPPORTED_GET_CHOICE_INDEX))
      return -1
    },

    // for internal
    __onComponentInstanceCreated(target: VueI18n<Messages>): void {
      const { componentInstanceCreatedListener } = options
      if (componentInstanceCreatedListener) {
        componentInstanceCreatedListener<Messages>(target, vueI18n)
      }
    }
  }

  // for vue-devtools timeline event
  if (__DEV__) {
    ;(vueI18n as VueI18nInternal).__enableEmitter = (
      emitter: VueDevToolsEmitter
    ): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const __composer = composer as any
      __composer[EnableEmitter] && __composer[EnableEmitter](emitter)
    }
    ;(vueI18n as VueI18nInternal).__disableEmitter = (): void => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const __composer = composer as any
      __composer[DisableEmitter] && __composer[DisableEmitter]()
    }
  }

  return vueI18n
}
