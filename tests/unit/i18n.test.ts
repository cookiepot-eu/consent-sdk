import { describe, it, expect } from 'vitest';
import { getTranslation, getBannerText, SUPPORTED_LANGUAGES } from '../../src/lib/i18n';

describe('i18n', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    it('should include all 8 supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'pl']);
    });
  });

  describe('getTranslation', () => {
    it('should return English translation', () => {
      const translation = getTranslation('en');
      expect(translation.title).toBe('We value your privacy');
      expect(translation.acceptAll).toBe('Accept All');
    });

    it('should return Dutch translation', () => {
      const translation = getTranslation('nl');
      expect(translation.title).toBe('We waarderen uw privacy');
      expect(translation.acceptAll).toBe('Alles accepteren');
    });

    it('should return German translation', () => {
      const translation = getTranslation('de');
      expect(translation.title).toBe('Wir schätzen Ihre Privatsphäre');
      expect(translation.acceptAll).toBe('Alle akzeptieren');
    });

    it('should return French translation', () => {
      const translation = getTranslation('fr');
      expect(translation.title).toBe('Nous respectons votre vie privée');
      expect(translation.acceptAll).toBe('Tout accepter');
    });

    it('should return Spanish translation', () => {
      const translation = getTranslation('es');
      expect(translation.title).toBe('Valoramos tu privacidad');
      expect(translation.acceptAll).toBe('Aceptar todo');
    });

    it('should return Italian translation', () => {
      const translation = getTranslation('it');
      expect(translation.title).toBe('Rispettiamo la tua privacy');
      expect(translation.acceptAll).toBe('Accetta tutto');
    });

    it('should return Portuguese translation', () => {
      const translation = getTranslation('pt');
      expect(translation.title).toBe('Valorizamos sua privacidade');
      expect(translation.acceptAll).toBe('Aceitar tudo');
    });

    it('should return Polish translation', () => {
      const translation = getTranslation('pl');
      expect(translation.title).toBe('Cenimy Twoją prywatność');
      expect(translation.acceptAll).toBe('Zaakceptuj wszystko');
    });

    it('should fallback to English for unsupported language', () => {
      const translation = getTranslation('xx');
      expect(translation.title).toBe('We value your privacy');
      expect(translation.acceptAll).toBe('Accept All');
    });

    it('should handle language code with region', () => {
      const translation = getTranslation('en-US');
      expect(translation.title).toBe('We value your privacy');
    });

    it('should be case insensitive', () => {
      const translation = getTranslation('NL');
      expect(translation.title).toBe('We waarderen uw privacy');
    });
  });

  describe('getBannerText', () => {
    it('should return default text for language', () => {
      const text = getBannerText('en');
      expect(text.title).toBe('We value your privacy');
      expect(text.acceptAll).toBe('Accept All');
      expect(text.rejectAll).toBe('Reject All');
    });

    it('should override title with custom text', () => {
      const text = getBannerText('en', { title: 'Custom Title' });
      expect(text.title).toBe('Custom Title');
      expect(text.acceptAll).toBe('Accept All'); // Should keep default
    });

    it('should override description with custom text', () => {
      const text = getBannerText('en', { description: 'Custom Description' });
      expect(text.description).toBe('Custom Description');
      expect(text.title).toBe('We value your privacy'); // Should keep default
    });

    it('should override acceptAll with custom text', () => {
      const text = getBannerText('en', { acceptAll: 'OK' });
      expect(text.acceptAll).toBe('OK');
      expect(text.rejectAll).toBe('Reject All'); // Should keep default
    });

    it('should override rejectAll with custom text', () => {
      const text = getBannerText('en', { rejectAll: 'No Thanks' });
      expect(text.rejectAll).toBe('No Thanks');
      expect(text.acceptAll).toBe('Accept All'); // Should keep default
    });

    it('should override all text with custom text', () => {
      const customText = {
        title: 'Custom Title',
        description: 'Custom Description',
        acceptAll: 'Accept',
        rejectAll: 'Decline',
      };
      const text = getBannerText('en', customText);
      expect(text.title).toBe('Custom Title');
      expect(text.description).toBe('Custom Description');
      expect(text.acceptAll).toBe('Accept');
      expect(text.rejectAll).toBe('Decline');
    });

    it('should work with different languages and custom text', () => {
      const text = getBannerText('de', { acceptAll: 'Okay' });
      expect(text.title).toBe('Wir schätzen Ihre Privatsphäre'); // German default
      expect(text.acceptAll).toBe('Okay'); // Custom
    });
  });
});
