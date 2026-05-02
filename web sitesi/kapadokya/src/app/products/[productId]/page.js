'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productService } from '../../../services/productService';
import { artisanService } from '../../../services/artisanService';
import { advertisementService } from '../../../services/advertisementService';
import { aiService } from '../../../services/aiService';
import { geoService } from '../../../services/geoService';
import { carbonService } from '../../../services/carbonService';
import { currencyService } from '../../../services/currencyService';
import { formatPrice, CULTURAL_INFO_TEXT } from '../../../utils/formatters';
import { 
  ShoppingCart, Heart, Share2, Video, Sparkles, MapPin, Award, 
  ChevronLeft, Camera, Globe, Hash as XIcon, MessageCircle, Copy, Check,
  Film, AlertCircle, User, Clock, Palette, Hammer, Leaf, DollarSign, Route
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [artisan, setArtisan] = useState(null);
  const [advertisement, setAdvertisement] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoMessage, setVideoMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Hackathon Modules State
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [transportMode, setTransportMode] = useState('Kara (TIR)');
  const [distanceKm, setDistanceKm] = useState(730);
  const [carbonFootprint, setCarbonFootprint] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      const prod = await productService.getById(params.productId);
      if (prod) {
        setProduct(prod);
        const art = await artisanService.getById(prod.artisanId);
        setArtisan(art);
        const ad = await advertisementService.getByProduct(prod.productId);
        setAdvertisement(ad);

        // Hackathon computations
        try {
          const route = await geoService.getDeliveryRoute(prod.productionCity || 'Avanos', 'İstanbul');
          setDistanceKm(route.distanceKm);
          const carbon = carbonService.calculateCarbonFootprint(route.distanceKm, prod.weightKg || 1.8, transportMode);
          setCarbonFootprint(carbon);
        } catch(e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
    loadProduct();
  }, [params.productId]);

  // Recalculate carbon when transport mode changes
  useEffect(() => {
    if (product) {
      const carbon = carbonService.calculateCarbonFootprint(distanceKm, product.weightKg || 1.8, transportMode);
      setCarbonFootprint(carbon);
    }
  }, [transportMode, distanceKm, product]);

  const handleAIVideo = async () => {
    const result = await aiService.generateVideo(product?.productId);
    setVideoMessage(result.message);
    setShowVideoModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = product ? `${product.name} - Kapadokya El Sanatları` : '';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square shimmer rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 shimmer rounded w-3/4" />
            <div className="h-4 shimmer rounded w-1/2" />
            <div className="h-6 shimmer rounded w-1/3" />
            <div className="h-32 shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle size={48} className="text-earth mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-dark-brown mb-2" style={{ fontFamily: 'var(--font-display)' }}>Ürün Bulunamadı</h2>
        <p className="text-earth mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/products" className="btn-primary">Ürünlere Dön</Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-earth">
          <Link href="/" className="hover:text-terracotta transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-terracotta transition-colors">Ürünler</Link>
          <span>/</span>
          <span className="text-dark-brown font-medium">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Product Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-cream shadow-md">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-terracotta shadow-md' : 'border-cream hover:border-stone'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <span className="badge-premium mb-3 inline-block">{product.category}</span>
              <h1 className="text-3xl lg:text-4xl font-bold text-deep-earth mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {product.name}
              </h1>
              <p className="text-earth leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-end gap-4">
              <span className="text-4xl font-bold text-terracotta">{formatPrice(product.price)}</span>
              <span className="text-sm text-earth bg-cream px-3 py-1 rounded-lg mb-1">
                {product.stock > 0 ? `${product.stock} adet stokta` : 'Tükendi'}
              </span>
            </div>

            {/* Cultural Info Card */}
            <div className="bg-gradient-to-r from-cream to-card p-5 rounded-2xl border border-stone/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sunset to-terracotta flex items-center justify-center shrink-0">
                  <Award size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-dark-brown mb-1 text-sm">Kültürel Miras Bilgilendirmesi</h4>
                  <p className="text-sm text-earth leading-relaxed italic">
                    &ldquo;{CULTURAL_INFO_TEXT}&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Link href={`/checkout?product=${product.productId}`} className="btn-primary flex-1 justify-center text-lg py-3.5">
                <ShoppingCart size={20} />
                Satın Al
              </Link>
              <button className="btn-secondary px-4">
                <Heart size={20} />
              </button>
              <button onClick={() => setShowShare(!showShare)} className="btn-secondary px-4 relative">
                <Share2 size={20} />
              </button>
            </div>

            {/* Share dropdown */}
            {showShare && (
              <div className="bg-white rounded-2xl shadow-lg border border-cream p-4 animate-fade-in">
                <h4 className="font-semibold text-dark-brown mb-3 text-sm">Paylaş</h4>
                <div className="grid grid-cols-5 gap-2">
                  <ShareButton 
                    icon={<Camera size={18} />} 
                    label="Instagram" 
                    color="bg-pink-500"
                    href={`https://www.instagram.com/`}
                  />
                  <ShareButton 
                    icon={<Globe size={18} />} 
                    label="Facebook" 
                    color="bg-blue-600"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  />
                  <ShareButton 
                    icon={<XIcon size={18} />} 
                    label="X" 
                    color="bg-black"
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`}
                  />
                  <ShareButton 
                    icon={<MessageCircle size={18} />} 
                    label="WhatsApp" 
                    color="bg-green-500"
                    href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                  />
                  <button onClick={handleCopyLink} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-cream transition-colors">
                    <div className="w-9 h-9 rounded-full bg-stone flex items-center justify-center text-white">
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </div>
                    <span className="text-xs text-earth">{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Material & Technique */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 border border-cream">
                <div className="flex items-center gap-2 mb-2">
                  <Palette size={16} className="text-terracotta" />
                  <span className="text-xs font-semibold text-dark-brown uppercase tracking-wide">Malzeme</span>
                </div>
                <p className="text-sm text-earth">{product.materials}</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-cream">
                <div className="flex items-center gap-2 mb-2">
                  <Hammer size={16} className="text-terracotta" />
                  <span className="text-xs font-semibold text-dark-brown uppercase tracking-wide">Teknik</span>
                </div>
                <p className="text-sm text-earth">{product.technique}</p>
              </div>
            </div>

            {/* AI Video Button */}
            <button 
              onClick={handleAIVideo}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              <Film size={18} />
              AI Video Oluştur
            </button>
          </div>
        </div>

        {/* Product Story */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Cultural Story */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-cream">
            <h2 className="text-2xl font-bold text-deep-earth mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Ürünün Hikayesi
            </h2>
            <p className="text-earth leading-relaxed mb-6">{product.culturalStory}</p>
            
            <h3 className="text-lg font-semibold text-dark-brown mb-3">Kapadokya ile Bağlantısı</h3>
            <p className="text-earth leading-relaxed">
              Bu eser, Kapadokya&apos;nın eşsiz coğrafyası ve binlerce yıllık kültürel birikiminin bir yansımasıdır. 
              Bölgenin volkanik toprakları, doğal mineralleri ve yüzyıllar içinde gelişen zanaat teknikleri, 
              her bir ürüne benzersiz bir karakter kazandırır.
            </p>
          </div>

          {/* Artisan Info */}
          {artisan && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream">
              <h3 className="text-lg font-semibold text-deep-earth mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Usta Bilgileri
              </h3>
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sunset to-terracotta flex items-center justify-center mb-3">
                  <User size={32} className="text-white" />
                </div>
                <h4 className="font-bold text-dark-brown">{artisan.name}</h4>
                <div className="flex items-center gap-1 text-sm text-earth mt-1">
                  <MapPin size={14} />
                  {artisan.region}
                </div>
              </div>
              <p className="text-sm text-earth leading-relaxed mb-4">{artisan.bio}</p>
              <div>
                <h5 className="text-xs font-semibold text-dark-brown uppercase tracking-wide mb-2">Uzmanlık Alanları</h5>
                <div className="flex flex-wrap gap-1.5">
                  {artisan.techniques.map(tech => (
                    <span key={tech} className="text-xs bg-cream text-earth px-2 py-1 rounded-lg">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hackathon Technical Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* 1. Canlı Kur ile Fiyat Kartı */}
          <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-sm border border-stone/20">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-[#C65A2E]" />
              <h3 className="text-lg font-bold text-[#3E2A1F]" style={{ fontFamily: 'var(--font-display)' }}>Canlı Kur ile Fiyat</h3>
            </div>
            <div className="space-y-2 text-sm text-[#5A3E2B]">
              <div className="flex justify-between"><span>Ana Fiyat:</span> <span className="font-semibold text-[#C65A2E]">₺{product.price}</span></div>
              <div className="flex justify-between items-center">
                <span>Seçilen Para Birimi:</span>
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
              <div className="flex justify-between"><span>Kur Kaynağı:</span> <span>{currencyService.getSourceInfo().source}</span></div>
              <div className="flex justify-between"><span>Güncel Kur:</span> <span>1 {selectedCurrency} = {currencyService.getExchangeRate(selectedCurrency)} TL</span></div>
              <div className="flex justify-between mt-2 pt-2 border-t border-[#3E2A1F]/10">
                <span className="font-semibold">Yaklaşık Tutar:</span> 
                <span className="font-bold text-lg text-[#C65A2E]">{currencyService.convertTRYPrice(product.price, selectedCurrency).toFixed(2)} {selectedCurrency}</span>
              </div>
            </div>
            <p className="text-[10px] text-[#5A3E2B]/70 mt-4 leading-tight italic">
              Demo Modu: Bu veriler prototip amaçlı gösterilmektedir. Döviz kuru TCMB canlı kur verisi simülasyonudur.
            </p>
          </div>

          {/* 2. Ürünün Yolculuğu Kartı */}
          <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-sm border border-stone/20">
            <div className="flex items-center gap-2 mb-4">
              <Route size={20} className="text-[#C65A2E]" />
              <h3 className="text-lg font-bold text-[#3E2A1F]" style={{ fontFamily: 'var(--font-display)' }}>Ürünün Yolculuğu</h3>
            </div>
            <div className="space-y-2 text-sm text-[#5A3E2B]">
              <div className="flex justify-between"><span>Üretim Yeri:</span> <span className="font-medium text-right">{product.productionLocation || 'Avanos, Kapadokya'}</span></div>
              <div className="flex justify-between"><span>Teslimat Noktası:</span> <span className="font-medium text-right">İstanbul, Türkiye</span></div>
              <div className="flex justify-between"><span>Veri Kaynağı:</span> <span className="font-medium text-right text-xs">OpenStreetMap / Nominatim</span></div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#3E2A1F]/10">
                <span className="font-semibold">Tahmini Rota Mesafesi:</span> 
                <span className="font-bold text-[#C65A2E]">{distanceKm} km</span>
              </div>
              
              {/* Harita Placeholder */}
              <div className="mt-4 h-24 bg-[#E07A3F]/10 rounded-xl border border-[#E07A3F]/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C65A2E 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                <div className="flex items-center gap-2 text-[#C65A2E] font-medium text-xs z-10">
                  <MapPin size={14} /> <span>{product.productionCity || 'Avanos'}</span>
                  <div className="w-12 h-[2px] bg-[#C65A2E] border-dashed" />
                  <MapPin size={14} /> <span>İstanbul</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#5A3E2B]/70 mt-3 leading-tight italic">
              Demo Modu: Gerçek kullanımda OpenRouteService üzerinden hesaplanacaktır.
            </p>
          </div>

          {/* 3. Sürdürülebilir Teslimat Kartı */}
          <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-sm border border-stone/20">
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={20} className="text-[#C65A2E]" />
              <h3 className="text-lg font-bold text-[#3E2A1F]" style={{ fontFamily: 'var(--font-display)' }}>Sürdürülebilir Teslimat</h3>
            </div>
            <div className="space-y-2 text-sm text-[#5A3E2B]">
              <div className="flex justify-between items-center">
                <span>Taşıma Modu:</span>
                <select 
                  className="bg-white border border-[#C65A2E]/30 rounded px-2 py-1 text-xs"
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                >
                  <option value="Kara (TIR)">Kara (TIR)</option>
                  <option value="Demiryolu">Demiryolu</option>
                  <option value="Hava Kargo">Hava Kargo</option>
                  <option value="Deniz Yolu">Deniz Yolu</option>
                </select>
              </div>
              <div className="flex justify-between"><span>Ürün Ağırlığı:</span> <span>{product.weightKg || 1.8} kg</span></div>
              <div className="flex justify-between"><span>Emisyon Faktörü:</span> <span className="text-xs text-right">{carbonService.getEmissionFactor(transportMode)} kg CO₂ / ton-km</span></div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#3E2A1F]/10">
                <span className="font-semibold">Tahmini Karbon Ayak İzi:</span> 
                <span className="font-bold text-lg text-[#C65A2E]">{carbonFootprint} kg CO₂</span>
              </div>
            </div>
            <p className="text-[10px] text-[#5A3E2B]/70 mt-4 leading-tight italic">
              Karbon hesabı, açık kaynak coğrafi veri ile hesaplanan mesafe ve taşıma moduna göre tahmini olarak oluşturulmuştur.
            </p>
          </div>
        </div>

        {/* Video Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-cream mb-16">
          <h2 className="text-2xl font-bold text-deep-earth mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Reklam Videosu
          </h2>
          {advertisement?.videoUrl ? (
            <div className="aspect-video bg-deep-earth rounded-xl flex items-center justify-center">
              <div className="text-center text-stone">
                <Video size={48} className="mx-auto mb-2 text-warm-orange" />
                <p className="text-sm">Demo video alanı</p>
                <p className="text-xs text-stone/60 mt-1">{advertisement.videoUrl}</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-cream/50 rounded-xl flex items-center justify-center border-2 border-dashed border-stone/30">
              <div className="text-center text-earth">
                <Video size={48} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">Bu ürün için henüz reklam videosu eklenmemiştir.</p>
                <p className="text-sm text-earth/60 mt-1">Satıcı yakında bir tanıtım videosu ekleyebilir.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowVideoModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Film size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-dark-brown mb-2" style={{ fontFamily: 'var(--font-display)' }}>AI Video</h3>
              <p className="text-earth mb-6">{videoMessage}</p>
              <button onClick={() => setShowVideoModal(false)} className="btn-primary w-full justify-center">
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareButton({ icon, label, color, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-cream transition-colors">
      <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white`}>
        {icon}
      </div>
      <span className="text-xs text-earth">{label}</span>
    </a>
  );
}
