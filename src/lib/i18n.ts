import type { BannerText } from '../types';

/**
 * Translation strings for the consent banner
 */
export interface Translation {
  title: string;
  description: string;
  acceptAll: string;
  rejectAll: string;
  savePreferences: string;
  managePreferences: string;
  necessary: string;
  analytics: string;
  marketing: string;
  preferences: string;
  necessaryDescription: string;
  analyticsDescription: string;
  marketingDescription: string;
  preferencesDescription: string;
}

/**
 * Built-in translations
 */
const translations: Record<string, Translation> = {
  en: {
    title: 'We value your privacy',
    description:
      'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
    acceptAll: 'Accept All',
    rejectAll: 'Reject All',
    savePreferences: 'Save Preferences',
    managePreferences: 'Manage Preferences',
    necessary: 'Necessary',
    analytics: 'Analytics',
    marketing: 'Marketing',
    preferences: 'Preferences',
    necessaryDescription: 'Essential cookies required for the website to function properly.',
    analyticsDescription: 'Help us understand how visitors interact with our website.',
    marketingDescription: 'Used to deliver personalized advertisements.',
    preferencesDescription: 'Remember your preferences and settings.',
  },
  nl: {
    title: 'We waarderen uw privacy',
    description:
      'We gebruiken cookies om uw browse-ervaring te verbeteren, gepersonaliseerde inhoud te leveren en ons verkeer te analyseren. Door op "Alles accepteren" te klikken, stemt u in met ons gebruik van cookies.',
    acceptAll: 'Alles accepteren',
    rejectAll: 'Alles weigeren',
    savePreferences: 'Voorkeuren opslaan',
    managePreferences: 'Voorkeuren beheren',
    necessary: 'Noodzakelijk',
    analytics: 'Analytisch',
    marketing: 'Marketing',
    preferences: 'Voorkeuren',
    necessaryDescription: 'Essentiële cookies die nodig zijn voor de goede werking van de website.',
    analyticsDescription: 'Help ons begrijpen hoe bezoekers omgaan met onze website.',
    marketingDescription: 'Gebruikt om gepersonaliseerde advertenties te leveren.',
    preferencesDescription: 'Onthoud uw voorkeuren en instellingen.',
  },
  de: {
    title: 'Wir schätzen Ihre Privatsphäre',
    description:
      'Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern, personalisierte Inhalte bereitzustellen und unseren Verkehr zu analysieren. Durch Klicken auf "Alle akzeptieren" stimmen Sie unserer Verwendung von Cookies zu.',
    acceptAll: 'Alle akzeptieren',
    rejectAll: 'Alle ablehnen',
    savePreferences: 'Einstellungen speichern',
    managePreferences: 'Einstellungen verwalten',
    necessary: 'Notwendig',
    analytics: 'Analytik',
    marketing: 'Marketing',
    preferences: 'Einstellungen',
    necessaryDescription: 'Wesentliche Cookies, die für das ordnungsgemäße Funktionieren der Website erforderlich sind.',
    analyticsDescription: 'Helfen Sie uns zu verstehen, wie Besucher mit unserer Website interagieren.',
    marketingDescription: 'Wird verwendet, um personalisierte Werbung zu liefern.',
    preferencesDescription: 'Merken Sie sich Ihre Einstellungen und Präferenzen.',
  },
  fr: {
    title: 'Nous respectons votre vie privée',
    description:
      'Nous utilisons des cookies pour améliorer votre expérience de navigation, fournir du contenu personnalisé et analyser notre trafic. En cliquant sur "Tout accepter", vous consentez à notre utilisation des cookies.',
    acceptAll: 'Tout accepter',
    rejectAll: 'Tout rejeter',
    savePreferences: 'Enregistrer les préférences',
    managePreferences: 'Gérer les préférences',
    necessary: 'Nécessaire',
    analytics: 'Analytique',
    marketing: 'Marketing',
    preferences: 'Préférences',
    necessaryDescription: 'Cookies essentiels requis pour le bon fonctionnement du site.',
    analyticsDescription: 'Nous aident à comprendre comment les visiteurs interagissent avec notre site.',
    marketingDescription: 'Utilisés pour diffuser des publicités personnalisées.',
    preferencesDescription: 'Mémoriser vos préférences et paramètres.',
  },
  es: {
    title: 'Valoramos tu privacidad',
    description:
      'Utilizamos cookies para mejorar tu experiencia de navegación, ofrecer contenido personalizado y analizar nuestro tráfico. Al hacer clic en "Aceptar todo", aceptas nuestro uso de cookies.',
    acceptAll: 'Aceptar todo',
    rejectAll: 'Rechazar todo',
    savePreferences: 'Guardar preferencias',
    managePreferences: 'Gestionar preferencias',
    necessary: 'Necesarias',
    analytics: 'Analíticas',
    marketing: 'Marketing',
    preferences: 'Preferencias',
    necessaryDescription: 'Cookies esenciales requeridas para el correcto funcionamiento del sitio.',
    analyticsDescription: 'Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio.',
    marketingDescription: 'Utilizadas para entregar anuncios personalizados.',
    preferencesDescription: 'Recordar tus preferencias y configuraciones.',
  },
  it: {
    title: 'Rispettiamo la tua privacy',
    description:
      'Utilizziamo i cookie per migliorare la tua esperienza di navigazione, fornire contenuti personalizzati e analizzare il nostro traffico. Cliccando su "Accetta tutto", acconsenti al nostro utilizzo dei cookie.',
    acceptAll: 'Accetta tutto',
    rejectAll: 'Rifiuta tutto',
    savePreferences: 'Salva preferenze',
    managePreferences: 'Gestisci preferenze',
    necessary: 'Necessari',
    analytics: 'Analitici',
    marketing: 'Marketing',
    preferences: 'Preferenze',
    necessaryDescription: 'Cookie essenziali necessari per il corretto funzionamento del sito.',
    analyticsDescription: 'Ci aiutano a capire come i visitatori interagiscono con il nostro sito.',
    marketingDescription: 'Utilizzati per fornire pubblicità personalizzate.',
    preferencesDescription: 'Ricordare le tue preferenze e impostazioni.',
  },
  pt: {
    title: 'Valorizamos sua privacidade',
    description:
      'Utilizamos cookies para melhorar sua experiência de navegação, fornecer conteúdo personalizado e analisar nosso tráfego. Ao clicar em "Aceitar tudo", você consente com nosso uso de cookies.',
    acceptAll: 'Aceitar tudo',
    rejectAll: 'Rejeitar tudo',
    savePreferences: 'Salvar preferências',
    managePreferences: 'Gerenciar preferências',
    necessary: 'Necessários',
    analytics: 'Analíticos',
    marketing: 'Marketing',
    preferences: 'Preferências',
    necessaryDescription: 'Cookies essenciais necessários para o funcionamento adequado do site.',
    analyticsDescription: 'Ajudam-nos a entender como os visitantes interagem com nosso site.',
    marketingDescription: 'Utilizados para fornecer anúncios personalizados.',
    preferencesDescription: 'Lembrar suas preferências e configurações.',
  },
  pl: {
    title: 'Cenimy Twoją prywatność',
    description:
      'Używamy plików cookie, aby poprawić Twoje wrażenia z przeglądania, dostarczać spersonalizowane treści i analizować nasz ruch. Klikając "Zaakceptuj wszystko", wyrażasz zgodę na nasze używanie plików cookie.',
    acceptAll: 'Zaakceptuj wszystko',
    rejectAll: 'Odrzuć wszystko',
    savePreferences: 'Zapisz preferencje',
    managePreferences: 'Zarządzaj preferencjami',
    necessary: 'Niezbędne',
    analytics: 'Analityczne',
    marketing: 'Marketingowe',
    preferences: 'Preferencje',
    necessaryDescription: 'Niezbędne pliki cookie wymagane do prawidłowego działania witryny.',
    analyticsDescription: 'Pomagają nam zrozumieć, jak odwiedzający wchodzą w interakcje z naszą witryną.',
    marketingDescription: 'Używane do dostarczania spersonalizowanych reklam.',
    preferencesDescription: 'Zapamiętywanie Twoich preferencji i ustawień.',
  },
};

/**
 * Get translations for a specific language
 * Falls back to English if language not found
 */
export function getTranslation(language: string): Translation {
  const lang = language.toLowerCase().substring(0, 2);
  const translation = translations[lang];
  if (translation) {
    return translation;
  }
  return translations['en']!; // English always exists
}

/**
 * Get banner text with custom overrides
 */
export function getBannerText(
  language: string,
  customText?: BannerText
): {
  title: string;
  description: string;
  acceptAll: string;
  rejectAll: string;
  savePreferences: string;
  managePreferences: string;
} {
  const t = getTranslation(language);

  return {
    title: customText?.title ?? t.title,
    description: customText?.description ?? t.description,
    acceptAll: customText?.acceptAll ?? t.acceptAll,
    rejectAll: customText?.rejectAll ?? t.rejectAll,
    savePreferences: customText?.savePreferences ?? t.savePreferences,
    managePreferences: customText?.managePreferences ?? t.managePreferences,
  };
}

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = Object.keys(translations);
