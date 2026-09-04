import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from './locales/es.json';
import en from './locales/en.json';

const LANGUAGE_STORAGE_KEY = '@scoreapp_language';

// Language detector for AsyncStorage
const languageDetector = {
	type: 'languageDetector' as const,
	async: true,
	detect: async (callback: (lang: string) => void) => {
		try {
			if (typeof window === 'undefined') {
				callback('es');
				return;
			}
			const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
			if (savedLanguage) {
				callback(savedLanguage);
			} else {
				callback('es'); // Default to Spanish
			}
		} catch (error) {
			console.error('Error al detectar el idioma:', error);
			callback('es');
		}
	},
	init: () => { },
	cacheUserLanguage: async (language: string) => {
		try {
			if (typeof window === 'undefined') {
				return;
			}
			await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
		} catch (error) {
			console.error('Error al guardar el idioma:', error);
		}
	},
};

i18n
	.use(languageDetector)
	.use(initReactI18next)
	.init({
		compatibilityJSON: 'v4',
		resources: {
			es: { translation: es },
			en: { translation: en },
		},
		fallbackLng: 'es',
		interpolation: {
			escapeValue: false,
		},
		react: {
			useSuspense: false,
		},
	});

export default i18n;
