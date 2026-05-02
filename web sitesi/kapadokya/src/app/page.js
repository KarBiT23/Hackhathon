'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productService } from '../services/productService';
import { ArrowRight, Sparkles, Shield, Truck, Wifi, Star } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { PRODUCT_CATEGORIES } from '../types';

const categoryIcons = {
  'Vazo': '🏺',
  'Halı': '🧶',
  'Seramik': '🎨',
  'Çömlek': '⚱️',
  'Testi': '🫗',
  'Tabak': '🍽️',
  'Diğer El Sanatları': '✨'
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const data = await productService.getAll();
      setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ minHeight: '85vh' }}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sunset via-warm-orange to-terracotta" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Hot air balloon SVG shapes */}
          <div className="absolute top-20 right-[15%] opacity-20 animate-float" style={{ animationDelay: '0s' }}>
            <svg width="80" height="100" viewBox="0 0 80 100" fill="white">
              <ellipse cx="40" cy="35" rx="35" ry="35" />
              <polygon points="15,60 65,60 55,95 25,95" />
            </svg>
          </div>
          <div className="absolute top-40 right-[35%] opacity-15 animate-float" style={{ animationDelay: '1.5s' }}>
            <svg width="50" height="65" viewBox="0 0 80 100" fill="white">
              <ellipse cx="40" cy="35" rx="35" ry="35" />
              <polygon points="15,60 65,60 55,95 25,95" />
            </svg>
          </div>
          <div className="absolute top-60 left-[10%] opacity-10 animate-float" style={{ animationDelay: '3s' }}>
            <svg width="40" height="50" viewBox="0 0 80 100" fill="white">
              <ellipse cx="40" cy="35" rx="35" ry="35" />
              <polygon points="15,60 65,60 55,95 25,95" />
            </svg>
          </div>
          
          {/* Fairy chimney silhouettes at bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 200" fill="rgba(62,42,31,0.3)" className="w-full">
              <path d="M0,200 L0,160 Q30,100 60,140 Q80,80 100,130 L120,120 Q140,60 160,110 Q200,70 220,120 L260,100 Q280,40 300,90 L340,110 Q360,50 380,100 L400,80 Q420,30 440,85 Q480,60 520,100 L560,90 Q580,40 600,80 L640,100 Q680,50 720,95 L760,80 Q780,30 800,75 L840,90 Q880,40 920,85 L960,70 Q1000,20 1040,80 L1080,60 Q1100,30 1120,70 L1160,90 Q1200,40 1240,85 L1280,70 Q1320,30 1360,80 L1400,60 Q1420,40 1440,80 L1440,200 Z" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-32 pb-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white/90 text-sm mb-6 animate-fade-in-up">
              <Sparkles size={16} />
              <span>Binlerce Yıllık Gelenek, Modern Deneyim</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up stagger-1" style={{ fontFamily: 'var(--font-display)' }}>
              Kapadokya&apos;nın
              <br />
              <span className="text-cream">El Sanatları</span>
              <br />
              Hazinesi
            </h1>
            
            <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8 max-w-xl animate-fade-in-up stagger-2">
              Her eserin arkasında bir usta, her ustanın elinde bir hikaye. 
              Kızılırmak&apos;ın kırmızı kilinden doğan sanatı keşfedin.
            </p>
            
            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
              <Link href="/products" className="inline-flex items-center gap-2 bg-white text-terracotta font-semibold px-6 py-3.5 rounded-xl hover:bg-cream transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Ürünleri Keşfet
                <ArrowRight size={18} />
              </Link>
              <Link href="/rfid" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white font-semibold px-6 py-3.5 rounded-xl border border-white/30 hover:bg-white/25 transition-all">
                <Wifi size={18} />
                RFID Kart Okut
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureItem icon={<Shield size={20} />} title="Otantik Eserler" desc="Tescilli üretim teknikleri" />
            <FeatureItem icon={<Sparkles size={20} />} title="AI Destekli" desc="Yapay zeka ürün tanıma" />
            <FeatureItem icon={<Wifi size={20} />} title="RFID Entegreli" desc="Dijital ürün deneyimi" />
            <FeatureItem icon={<Truck size={20} />} title="Dünya Geneli Kargo" desc="Güvenli teslimat" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-deep-earth mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Kategoriler
            </h2>
            <p className="text-earth text-lg">Kapadokya&apos;nın zengin el sanatları koleksiyonunu keşfedin</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {PRODUCT_CATEGORIES.map((cat, i) => (
              <Link 
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="card-hover group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl shadow-sm border border-cream hover:border-terracotta/30"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{categoryIcons[cat]}</span>
                <span className="text-sm font-medium text-dark-brown text-center">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24 bg-cream/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-deep-earth mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                Öne Çıkan Ürünler
              </h2>
              <p className="text-earth text-lg">Ustalarımızın en seçkin eserleri</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-2 text-terracotta font-semibold hover:text-hover transition-colors">
              Tümünü Gör <ArrowRight size={18} />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-square shimmer" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 shimmer rounded w-3/4" />
                    <div className="h-3 shimmer rounded w-1/2" />
                    <div className="h-5 shimmer rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.productId} product={product} index={index} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="btn-primary">
              Tüm Ürünleri Gör <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Cultural Banner */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-deep-earth via-dark-brown to-deep-earth text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm text-stone mb-6">
            <Star size={14} className="text-sunset" />
            Kültürel Miras
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            Her Eserin Bir <span className="text-sunset">Hikayesi</span> Var
          </h2>
          <p className="text-lg text-stone leading-relaxed mb-8">
            Bu eserler, Kapadokya bölgesinin tescilli teknikleri ve yerel materyalleri kullanılarak üretilmiştir. 
            Kızılırmak yatağından alınan kırmızı kil, nesilden nesile aktarılan teknikler ve ustanın benzersiz dokunuşu... 
            Her ürün, binlerce yıllık bir geleneğin yaşayan parçasıdır.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-sunset to-terracotta text-white font-semibold px-8 py-3.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Hikayeleri Keşfet
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-terracotta shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-dark-brown">{title}</p>
        <p className="text-xs text-earth">{desc}</p>
      </div>
    </div>
  );
}

function ProductCard({ product, index }) {
  return (
    <Link 
      href={`/products/${product.productId}`}
      className={`card-hover group bg-white rounded-2xl overflow-hidden shadow-sm border border-cream animate-fade-in-up stagger-${index + 1}`}
    >
      <div className="aspect-square overflow-hidden relative">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className="badge-premium">{product.category}</span>
        </div>
        {product.stock <= 5 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2.5 py-1 rounded-lg font-medium">
            Son {product.stock} adet
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-dark-brown mb-1 group-hover:text-terracotta transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
          {product.name}
        </h3>
        <p className="text-sm text-earth line-clamp-2 mb-3">{product.description.substring(0, 80)}...</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-terracotta">{formatPrice(product.price)}</span>
          <span className="text-xs text-earth bg-cream px-2 py-1 rounded-lg">{product.stock} stokta</span>
        </div>
      </div>
    </Link>
  );
}
