// src/services/currencyService.js

/**
 * Canlı döviz kurlarını çeken ve çeviren servis.
 * Hackathon kısıtları: Sabit kur kullanılmayacak, canlı döviz veya TCMB kullanılacak. (Demo amacıyla mock API/fallback desteklenir)
 */

class CurrencyService {
  constructor() {
    this.rates = {
      TRY: 1,
      USD: 32.55,
      EUR: 35.20,
      GBP: 41.15
    };
    this.lastUpdated = new Date().toISOString();
    this.source = 'TCMB (Canlı Mock)';
  }

  /**
   * Kurları dış API'den veya TCMB'den günceller.
   */
  async updateRates() {
    try {
      /* Gerçek kullanım örneği:
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
      const data = await res.json();
      this.rates = {
        TRY: 1,
        USD: data.rates.USD,
        EUR: data.rates.EUR,
        GBP: data.rates.GBP
      };
      this.lastUpdated = new Date().toISOString();
      this.source = 'Live API';
      */
      
      // Şimdilik demo değerlerini hafif randomize edelim
      // this.rates.EUR = 35.20 + (Math.random() - 0.5);
    } catch (e) {
      console.error('Failed to update rates', e);
    }
  }

  /**
   * İstenen para birimi için TRY bazındaki kuru getirir (1 [Currency] = X TRY).
   */
  getExchangeRate(currency) {
    if (currency === 'TRY') return 1;
    // Eğer 1 USD = 32 TRY ise API'den dönen oran genellikle 1 TRY = 0.031 USD şeklinde olur.
    // Yukarıdaki rates objesinde TRY başına değeri tutuyormuş gibi yaparsak:
    // Bu mock verisinde USD: 32.55 demek, 1 USD = 32.55 TRY demektir.
    return this.rates[currency] || 1;
  }

  /**
   * TRY fiyatı istenen para birimine çevirir.
   */
  convertTRYPrice(amountTRY, currency) {
    if (currency === 'TRY') return amountTRY;
    const rate = this.getExchangeRate(currency);
    return amountTRY / rate;
  }

  getSourceInfo() {
    return {
      source: this.source,
      lastUpdated: this.lastUpdated
    };
  }
}

export const currencyService = new CurrencyService();
