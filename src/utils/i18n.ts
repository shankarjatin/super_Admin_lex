// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { ensurePrefix } from '@/utils/string'

// Check if the URL is missing the locale
export const isUrlMissingLocale = (url: string): boolean => {
  if (!url?.trim()) return true // If URL is empty, consider it missing locale
  return i18n.locales.every(locale => !(url.startsWith(`/${locale}/`) || url === `/${locale}`))
}

// Get the localized URL with proper fallback handling
export const getLocalizedUrl = (url?: string, languageCode?: string): string => {
  if (!url?.trim() || !languageCode?.trim()) {
    console.warn('getLocalizedUrl called with empty values', { url, languageCode })
    return '/' // Default to home or a fallback page
  }

  return isUrlMissingLocale(url) ? `/${languageCode}${ensurePrefix(url, '/')}` : url
}
