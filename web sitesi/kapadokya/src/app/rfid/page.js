'use client';

import { useState } from 'react';
import Link from 'next/link';
import { rfidService } from '../../services/rfidService';
import { formatPrice, formatDate, formatTime } from '../../utils/formatters';
import { Wifi, Search, CreditCard, Package, User, Calendar, Clock, Hash, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const DEMO_CARDS = [
  { id: 'rfid-001', label: 'Demo Kart 1 — Kırmızı Kil Vazo' },
  { id: 'rfid-002', label: 'Demo Kart 2 — Seramik Tabak' },
  { id: 'rfid-003', label: 'Demo Kart 3 — Kapadokya Testi' },
];

export default function RFIDPage() {
  const [rfidInput, setRfidInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleLookup = async (cardId) => {
    const id = cardId || rfidInput.trim();
    if (!id) {
      setError('Lütfen bir RFID kart ID girin.');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    setScanned(true);
    
    const data = await rfidService.lookupCard(id);
    
    if (data) {
      setResult(data);
    } else {
      setError('Bu RFID kartına ait kayıt bulunamadı.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-background min-h-screen py-8 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cream rounded-full text-sm text-earth mb-4">
            <Wifi size={16} className="text-terracotta" />
            RFID Dijital Deneyim
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-deep-earth mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            RFID Kart Okuma
          </h1>
          <p className="text-earth text-lg max-w-xl mx-auto">
            Ürününüzle birlikte gelen RFID kartınızı okutarak dijital deneyiminize erişin.
          </p>
        </div>

        {/* Scanner Area */}
        <div className="bg-white rounded-3xl shadow-md border border-cream overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-terracotta via-warm-orange to-sunset p-6 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 ${loading ? '' : 'animate-pulse-glow'}`}>
              <CreditCard size={32} className="text-white" />
            </div>
            <h2 className="text-white font-semibold text-lg">Kart Okutma Alanı</h2>
            <p className="text-white/70 text-sm mt-1">RFID kartınızı okuyucuya yaklaştırın veya ID&apos;yi manuel girin</p>
          </div>

          <div className="p-6 lg:p-8">
            {/* Manual input */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth" />
                <input
                  type="text"
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  placeholder="RFID Kart ID girin (örn: rfid-001)"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-stone/30 bg-background text-dark-brown focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 transition-all text-lg"
                />
              </div>
              <button 
                onClick={() => handleLookup()}
                disabled={loading}
                className="btn-primary px-6 py-3.5 text-lg disabled:opacity-60"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                Oku
              </button>
            </div>

            {/* Demo cards */}
            <div>
              <p className="text-sm text-earth mb-3">Hızlı Demo — bir karta tıklayın:</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_CARDS.map(card => (
                  <button
                    key={card.id}
                    onClick={() => { setRfidInput(card.id); handleLookup(card.id); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cream hover:bg-stone/30 text-sm text-dark-brown font-medium transition-colors border border-stone/20"
                  >
                    <CreditCard size={14} className="text-terracotta" />
                    {card.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 flex items-start gap-3 animate-fade-in">
            <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-red-800">{error}</p>
              <p className="text-sm text-red-600 mt-1">Lütfen geçerli bir RFID kart ID deneyin.</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 animate-fade-in">
            <Loader2 size={40} className="animate-spin text-terracotta mx-auto mb-3" />
            <p className="text-earth">Kart okunuyor...</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="animate-fade-in-up">
            {/* Success badge */}
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle size={20} className="text-green-500" />
              <span className="font-semibold text-green-700">Kart başarıyla okundu!</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-cream overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-64 shrink-0">
                    <img 
                      src={result.product.images[0]} 
                      alt={result.product.name}
                      className="w-full h-48 sm:h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1">
                    <span className="badge-premium mb-2 inline-block">{result.product.category}</span>
                    <h3 className="text-xl font-bold text-deep-earth mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                      {result.product.name}
                    </h3>
                    <p className="text-sm text-earth mb-4 line-clamp-3">{result.product.description}</p>
                    <span className="text-2xl font-bold text-terracotta">{formatPrice(result.product.price)}</span>
                    <div className="mt-4">
                      <Link href={`/products/${result.product.productId}`} className="btn-primary text-sm py-2">
                        Ürün Detayını Gör <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream">
                  <h4 className="font-semibold text-dark-brown mb-3 flex items-center gap-2">
                    <Package size={16} className="text-terracotta" />
                    Sipariş Bilgileri
                  </h4>
                  <div className="space-y-3">
                    <InfoRow icon={<Hash size={14} />} label="Sipariş No" value={result.order.orderId} />
                    <InfoRow icon={<Calendar size={14} />} label="Tarih" value={formatDate(result.order.orderDate)} />
                    <InfoRow icon={<Clock size={14} />} label="Saat" value={result.order.orderTime} />
                    <InfoRow 
                      icon={<CheckCircle size={14} />} 
                      label="Ödeme" 
                      value={result.order.paymentStatus === 'paid' ? 'Ödendi ✓' : 'Beklemede'} 
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream">
                  <h4 className="font-semibold text-dark-brown mb-3 flex items-center gap-2">
                    <User size={16} className="text-terracotta" />
                    Müşteri
                  </h4>
                  <p className="text-dark-brown font-medium">{result.user.name}</p>
                  <p className="text-sm text-earth">{result.user.country}</p>
                </div>

                <div className="bg-cream/50 rounded-2xl p-5 border border-stone/20">
                  <h4 className="font-semibold text-dark-brown mb-2 flex items-center gap-2">
                    <CreditCard size={16} className="text-terracotta" />
                    RFID Kart
                  </h4>
                  <p className="text-sm text-earth">Kart ID: <span className="font-mono font-medium text-dark-brown">{result.card.rfidCardId}</span></p>
                  <p className="text-sm text-earth mt-1">Durum: <span className="text-green-600 font-medium">{result.card.isActive ? 'Aktif' : 'Pasif'}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-earth">
        <span className="text-stone">{icon}</span>
        {label}
      </div>
      <span className="text-sm font-medium text-dark-brown">{value}</span>
    </div>
  );
}
