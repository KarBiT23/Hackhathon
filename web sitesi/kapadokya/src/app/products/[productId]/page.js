'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productService } from '../../../services/productService';
import { artisanService } from '../../../services/artisanService';
import { advertisementService } from '../../../services/advertisementService';
import { aiService } from '../../../services/aiService';
import { formatPrice, CULTURAL_INFO_TEXT } from '../../../utils/formatters';
import { 
  ShoppingCart, Heart, Share2, Video, Sparkles, MapPin, Award, 
  ChevronLeft, Camera, Globe, Hash as XIcon, MessageCircle, Copy, Check,
  Film, AlertCircle, User, Clock, Palette, Hammer
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

  useEffect(() => {
    async function loadProduct() {
      const prod = await productService.getById(params.productId);
      if (prod) {
        setProduct(prod);
        const art = await artisanService.getById(prod.artisanId);
        setArtisan(art);
        const ad = await advertisementService.getByProduct(prod.productId);
        setAdvertisement(ad);
      }
      setLoading(false);
    }
    loadProduct();
  }, [params.productId]);

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
