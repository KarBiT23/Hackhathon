'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productService } from '../../services/productService';
import { shippingService } from '../../services/shippingService';
import { geoService } from '../../services/geoService';
import { carbonService } from '../../services/carbonService';
import { currencyService } from '../../services/currencyService';
import { formatPrice } from '../../utils/formatters';
import { CreditCard, Truck, CheckCircle, ShoppingBag, Lock, ArrowLeft, Package, Calendar, Clock, Hash, Leaf, DollarSign } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const [product, setProduct] = useState(null);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [step, setStep] = useState(1); // 1: review, 2: payment, 3: success
  const [loading, setLoading] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  // Hackathon Modules State
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [transportMode, setTransportMode] = useState('Kara (TIR)');
  const [distanceKm, setDistanceKm] = useState(730);
  const [carbonFootprint, setCarbonFootprint] = useState(0);

  useEffect(() => {
    async function load() {
      if (productId) {
        const prod = await productService.getById(productId);
        setProduct(prod);
        if (prod) {
          const shipping = await shippingService.getBySeller(prod.sellerId);
          setShippingOptions(shipping);
          if (shipping.length > 0) setSelectedShipping(shipping[0]);

          try {
            const route = await geoService.getDeliveryRoute(prod.productionCity || 'Avanos', 'İstanbul');
            setDistanceKm(route.distanceKm);
            setCarbonFootprint(carbonService.calculateCarbonFootprint(route.distanceKm, prod.weightKg || 1.8, transportMode));
          } catch(e) {
            console.error(e);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [productId]);

  useEffect(() => {
    if (product) {
      setCarbonFootprint(carbonService.calculateCarbonFootprint(distanceKm, product.weightKg || 1.8, transportMode));
    }
  }, [transportMode, distanceKm, product]);

  const totalPrice = product ? product.price + (selectedShipping?.price || 0) : 0;

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));
    setStep(3);
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="h-8 shimmer rounded w-48 mb-8" />
        <div className="h-64 shimmer rounded-2xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="text-earth mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-dark-brown mb-2" style={{ fontFamily: 'var(--font-display)' }}>Sepetiniz Boş</h2>
        <p className="text-earth mb-6">Henüz ürün seçmediniz.</p>
        <Link href="/products" className="btn-primary">Ürünlere Göz At</Link>
      </div>
    );
  }

  // Step 3: Success
  if (step === 3) {
    const now = new Date();
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-md border border-cream p-8 lg:p-12 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-deep-earth mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Siparişiniz Onaylandı!
          </h2>
          <p className="text-earth mb-8">Ödeme başarıyla tamamlandı. (Demo simülasyonu)</p>
          
          <div className="bg-cream/50 rounded-2xl p-6 text-left mb-8 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-earth flex items-center gap-2"><Hash size={14} /> Sipariş No</span>
              <span className="font-mono font-semibold text-dark-brown">ORD-{Date.now().toString().slice(-8)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-earth flex items-center gap-2"><Package size={14} /> Ürün</span>
              <span className="font-medium text-dark-brown">{product.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-earth flex items-center gap-2"><Calendar size={14} /> Tarih</span>
              <span className="font-medium text-dark-brown">{now.toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-earth flex items-center gap-2"><Clock size={14} /> Saat</span>
              <span className="font-medium text-dark-brown">{now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="border-t border-stone/20 pt-3 flex justify-between items-center">
              <span className="font-semibold text-dark-brown">Toplam</span>
              <span className="text-xl font-bold text-terracotta">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-earth">Ödeme Durumu</span>
              <span className="text-green-600 font-semibold flex items-center gap-1">
                <CheckCircle size={14} /> Ödendi
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`/products/${product.productId}`} className="btn-secondary">
              Ürüne Dön
            </Link>
            <Link href="/" className="btn-primary">
              Ana Sayfaya Git
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/products/${product.productId}`} className="p-2 rounded-xl hover:bg-cream transition-colors">
            <ArrowLeft size={20} className="text-earth" />
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-deep-earth" style={{ fontFamily: 'var(--font-display)' }}>
            {step === 1 ? 'Sipariş Özeti' : 'Ödeme'}
          </h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-10">
          <StepIndicator number={1} label="Özet" active={step >= 1} current={step === 1} />
          <div className="flex-1 h-0.5 bg-stone/20" />
          <StepIndicator number={2} label="Ödeme" active={step >= 2} current={step === 2} />
          <div className="flex-1 h-0.5 bg-stone/20" />
          <StepIndicator number={3} label="Onay" active={step >= 3} current={step === 3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <>
                {/* Product */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream">
                  <h3 className="font-semibold text-dark-brown mb-4">Ürün</h3>
                  <div className="flex gap-4">
                    <img src={product.images[0]} alt={product.name} className="w-24 h-24 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-semibold text-dark-brown">{product.name}</h4>
                      <p className="text-sm text-earth">{product.category}</p>
                      <p className="text-lg font-bold text-terracotta mt-1">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream">
                  <h3 className="font-semibold text-dark-brown mb-4 flex items-center gap-2">
                    <Truck size={18} className="text-terracotta" />
                    Kargo Seçimi
                  </h3>
                  <div className="space-y-3">
                    {shippingOptions.map(opt => (
                      <label 
                        key={opt.shippingOptionId}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedShipping?.shippingOptionId === opt.shippingOptionId
                            ? 'border-terracotta bg-cream/50'
                            : 'border-stone/20 hover:border-stone/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShipping?.shippingOptionId === opt.shippingOptionId}
                            onChange={() => setSelectedShipping(opt)}
                            className="accent-terracotta w-4 h-4"
                          />
                          <div>
                            <p className="font-medium text-dark-brown">{opt.companyName}</p>
                            <p className="text-sm text-earth">{opt.deliveryTime} {opt.internationalAvailable && '• Uluslararası'}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-dark-brown">
                          {opt.freeShipping ? <span className="text-green-600">Ücretsiz</span> : formatPrice(opt.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hackathon: Sürdürülebilir Teslimat Kartı */}
                <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-sm border border-stone/20 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Leaf size={18} className="text-[#C65A2E]" />
                    <h3 className="font-semibold text-[#3E2A1F]">Teslimat Karbon Etkisi</h3>
                  </div>
                  <div className="space-y-3 text-sm text-[#5A3E2B]">
                    <div className="flex justify-between items-center">
                      <span>Taşıma Modu:</span>
                      <select 
                        className="bg-white border border-[#C65A2E]/30 rounded px-3 py-1.5 text-xs font-medium"
                        value={transportMode}
                        onChange={(e) => setTransportMode(e.target.value)}
                      >
                        <option value="Kara (TIR)">Kara (TIR)</option>
                        <option value="Demiryolu">Demiryolu</option>
                        <option value="Hava Kargo">Hava Kargo</option>
                        <option value="Deniz Yolu">Deniz Yolu</option>
                      </select>
                    </div>
                    <div className="flex justify-between">
                      <span>Tahmini Mesafe:</span> 
                      <span className="font-medium">{distanceKm} km</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#3E2A1F]/10">
                      <span className="font-semibold">Tahmini Karbon:</span> 
                      <span className="font-bold text-lg text-[#C65A2E]">{carbonFootprint} kg CO₂</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#5A3E2B]/70 mt-3 italic">
                    Demo Modu: OpenRouteService mesafe verisi ve taşıma moduna göre hesaplanmıştır.
                  </p>
                </div>

                <button onClick={() => setStep(2)} className="btn-primary w-full justify-center text-lg py-3.5 mt-6">
                  Ödemeye Geç
                </button>
              </>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream">
                <h3 className="font-semibold text-dark-brown mb-6 flex items-center gap-2">
                  <CreditCard size={18} className="text-terracotta" />
                  Kart Bilgileri
                  <Lock size={14} className="text-earth ml-auto" />
                  <span className="text-xs text-earth">Güvenli Ödeme (Demo)</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark-brown mb-1.5 block">Kart Numarası</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark-brown mb-1.5 block">Kart Üzerindeki İsim</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="AD SOYAD"
                      className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-dark-brown mb-1.5 block">Son Kullanma</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark-brown mb-1.5 block">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
                    Geri
                  </button>
                  <button 
                    onClick={handlePayment} 
                    disabled={processing}
                    className="btn-primary flex-1 justify-center text-lg py-3.5 disabled:opacity-60"
                  >
                    {processing ? 'İşleniyor...' : `${formatPrice(totalPrice)} Öde`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream h-fit sticky top-24">
            <h3 className="font-semibold text-dark-brown mb-4">Sipariş Özeti</h3>
            <div className="flex gap-3 mb-4 pb-4 border-b border-cream">
              <img src={product.images[0]} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <p className="font-medium text-dark-brown text-sm">{product.name}</p>
                <p className="text-xs text-earth">{product.category}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4 pb-4 border-b border-cream">
              <div className="flex justify-between text-sm">
                <span className="text-earth">Ürün</span>
                <span className="text-dark-brown">{formatPrice(product.price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-earth">Kargo</span>
                <span className="text-dark-brown">
                  {selectedShipping?.freeShipping ? <span className="text-green-600">Ücretsiz</span> : formatPrice(selectedShipping?.price || 0)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-dark-brown">Toplam</span>
              <span className="text-2xl font-bold text-terracotta">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {/* Hackathon: Canlı Kur Özeti Sidebar */}
          {step < 3 && (
            <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-sm border border-stone/20 h-fit mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-[#C65A2E]" />
                  <h3 className="font-semibold text-[#3E2A1F]">Canlı Kur Özeti</h3>
                </div>
                <select 
                  className="bg-white border border-[#C65A2E]/30 rounded px-2 py-1 text-xs"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="space-y-2 text-sm text-[#5A3E2B]">
                <div className="flex justify-between"><span>Ürün Fiyatı:</span> <span className="font-medium text-[#C65A2E]">₺{totalPrice}</span></div>
                <div className="flex justify-between"><span>Seçilen Para Birimi:</span> <span>{selectedCurrency}</span></div>
                <div className="flex justify-between"><span>Kur Kaynağı:</span> <span>{currencyService.getSourceInfo().source}</span></div>
                <div className="flex justify-between"><span>Güncel Kur:</span> <span>{currencyService.getExchangeRate(selectedCurrency)}</span></div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#3E2A1F]/10">
                  <span className="font-semibold">Yaklaşık Tutar:</span> 
                  <span className="font-bold text-lg text-[#C65A2E]">{currencyService.convertTRYPrice(totalPrice, selectedCurrency).toFixed(2)} {selectedCurrency}</span>
                </div>
              </div>
              <p className="text-[10px] text-[#5A3E2B]/70 mt-3 italic">
                Demo Modu: TCMB canlı kur simülasyonudur.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StepIndicator({ number, label, active, current }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
        current ? 'bg-terracotta text-white' : active ? 'bg-green-500 text-white' : 'bg-cream text-earth'
      }`}>
        {active && !current ? <CheckCircle size={16} /> : number}
      </div>
      <span className={`text-sm font-medium hidden sm:block ${current ? 'text-terracotta' : 'text-earth'}`}>{label}</span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-12"><div className="h-8 shimmer rounded w-48 mb-8" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
