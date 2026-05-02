'use client';
import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { geoService } from '../../services/geoService';
import { carbonService } from '../../services/carbonService';

const COUNTRY_CITIES = {
  "Türkiye": ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Nevşehir"],
  "Rusya Federasyonu": ["Moskova", "St. Petersburg", "Kazan", "Novosibirsk", "Soçi"],
  "Polonya": ["Varşova", "Krakow", "Wroclaw", "Poznan", "Gdansk"],
  "Ukrayna": ["Kiev", "Lviv", "Odessa", "Kharkiv", "Dnipro"],
  "Almanya": ["Berlin", "Münih", "Frankfurt", "Hamburg", "Köln"],
  "Irak": ["Bağdat", "Erbil", "Basra", "Musul", "Necef"],
  "Romanya": ["Bükreş", "Kaloşvar", "Timișoara", "Yaş", "Köstence"],
  "Bulgaristan": ["Sofya", "Filibe", "Varna", "Burgaz", "Rusçuk"],
  "İtalya": ["Roma", "Milano", "Venedik", "Floransa", "Napoli"],
  "Fransa": ["Paris", "Marsilya", "Lyon", "Toulouse", "Nice"]
};

export default function DeliveryLocationSelector({ 
  onCalculate, 
  productWeight = 1.8, 
  productionLocation = 'Avanos' 
}) {
  const [country, setCountry] = useState('Türkiye');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [transportMode, setTransportMode] = useState('Kara (TIR)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [results, setResults] = useState(null);

  const handleCalculate = async () => {
    if (!country || !city) {
      setError('Lütfen ülke ve şehir alanlarını doldurunuz.');
      return;
    }
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const fullAddress = district ? `${district}, ${city}, ${country}` : `${city}, ${country}`;
      const route = await geoService.getDeliveryRoute(productionLocation, fullAddress);
      const carbon = carbonService.calculateCarbonFootprint(route.distanceKm, productWeight, transportMode);

      if (onCalculate) {
        onCalculate(
          {
            fullAddress,
            country,
            city,
            district,
            ...route
          }, 
          carbon, 
          transportMode, 
          route.isDemo
        );
        
        setResults({
          distanceKm: route.distanceKm,
          carbonFootprint: carbon,
          transportMode
        });
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError('Hesaplama sırasında bir hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C65A2E]/20 mb-6">
      <h3 className="text-lg font-bold text-[#3E2A1F] mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
        <MapPin className="text-[#C65A2E]" size={20} />
        Teslimat ve Karbon Hesapla
      </h3>
      
      {error && <p className="text-xs text-red-500 mb-3 font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-[#5A3E2B] mb-1">Ülke</label>
          <input 
            type="text" 
            value={country} 
            onChange={e => {
              setCountry(e.target.value);
              setCity(''); // Ülke değiştiğinde şehri temizle
            }}
            list="countries"
            className="w-full bg-[#F5E6D3]/30 border border-[#C65A2E]/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C65A2E]"
          />
          <datalist id="countries">
            {Object.keys(COUNTRY_CITIES).map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#5A3E2B] mb-1">Şehir</label>
          <input 
            type="text" 
            value={city} 
            onChange={e => setCity(e.target.value)}
            list="cities"
            placeholder="Örn: İstanbul"
            className="w-full bg-[#F5E6D3]/30 border border-[#C65A2E]/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C65A2E]"
          />
          <datalist id="cities">
            {(COUNTRY_CITIES[country] || []).map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#5A3E2B] mb-1">İlçe / Açık Adres</label>
          <input 
            type="text" 
            value={district} 
            onChange={e => setDistrict(e.target.value)}
            placeholder="Örn: Kadıköy"
            className="w-full bg-[#F5E6D3]/30 border border-[#C65A2E]/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C65A2E]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[#5A3E2B] mb-1">Taşıma Modu</label>
          <select 
            value={transportMode} 
            onChange={e => setTransportMode(e.target.value)}
            className="w-full bg-[#F5E6D3]/30 border border-[#C65A2E]/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C65A2E]"
          >
            <option value="Kara (TIR)">Kara (TIR)</option>
            <option value="Demiryolu">Demiryolu</option>
            <option value="Hava Kargo">Hava Kargo</option>
            <option value="Deniz Yolu">Deniz Yolu</option>
          </select>
        </div>
      </div>
      
      <button 
        onClick={handleCalculate}
        disabled={loading}
        className="w-full bg-[#C65A2E] hover:bg-[#A04520] text-white rounded-xl py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Search size={16} />
            Mesafeyi ve Karbonu Hesapla
          </>
        )}
      </button>

      {success && results && (
        <div className="mt-6 p-4 bg-[#F5E6D3]/50 rounded-xl border border-[#C65A2E]/30 animate-fade-in">
          <h4 className="font-bold text-[#3E2A1F] mb-3 text-sm flex items-center gap-2">
            ✅ Hesaplama Sonucu Tablosu
          </h4>
          <table className="w-full text-sm text-left">
            <tbody>
              <tr className="border-b border-[#C65A2E]/10">
                <td className="py-2 text-[#5A3E2B]">Tahmini Mesafe</td>
                <td className="py-2 font-bold text-[#C65A2E] text-right">{results.distanceKm} km</td>
              </tr>
              <tr className="border-b border-[#C65A2E]/10">
                <td className="py-2 text-[#5A3E2B]">Taşıma Modu</td>
                <td className="py-2 font-bold text-[#C65A2E] text-right">{results.transportMode}</td>
              </tr>
              <tr>
                <td className="py-2 text-[#5A3E2B]">Karbon Ayak İzi</td>
                <td className="py-2 font-bold text-[#C65A2E] text-right">{results.carbonFootprint} kg CO₂</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
