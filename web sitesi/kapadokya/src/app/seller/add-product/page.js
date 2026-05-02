'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { aiService } from '../../../services/aiService';
import { formatPrice } from '../../../utils/formatters';
import { 
  Camera, Sparkles, Upload, Loader2, CheckCircle, ArrowLeft, Film, 
  Save, Image as ImageIcon, Tag, FileText, Palette, Hammer, BookOpen
} from 'lucide-react';

export default function AddProductPage() {
  const [step, setStep] = useState(1); // 1: capture, 2: AI result, 3: form
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    materials: '',
    technique: '',
    culturalStory: '',
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      // Fallback: use demo image
      handleDemoCapture();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      
      // Stop camera
      const stream = videoRef.current.srcObject;
      stream?.getTracks().forEach(t => t.stop());
      setCameraActive(false);
    }
  };

  const handleDemoCapture = () => {
    setCapturedImage('https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop');
  };

  const handleAIAnalyze = async () => {
    setAnalyzing(true);
    const result = await aiService.analyzeProduct(capturedImage);
    setAiResult(result);
    setForm({
      ...form,
      name: result.suggestedName,
      category: result.category,
      description: result.suggestedDescription,
      materials: result.suggestedMaterials,
      technique: result.suggestedTechnique,
      culturalStory: result.suggestedCulturalStory,
    });
    setAnalyzing(false);
    setStep(2);
  };

  const handleSave = () => {
    // Demo save
    setStep(3);
  };

  const handleAIVideo = () => {
    setShowVideoModal(true);
  };

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/seller" className="p-2 rounded-xl hover:bg-cream transition-colors">
            <ArrowLeft size={20} className="text-earth" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-deep-earth" style={{ fontFamily: 'var(--font-display)' }}>
              AI Destekli Ürün Kayıt
            </h1>
            <p className="text-sm text-earth">Kamera ile ürünü tanıtın, AI otomatik analiz etsin</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-8">
          <StepBadge n={1} label="Fotoğraf" active={step >= 1} current={step === 1} />
          <div className="flex-1 h-0.5 bg-stone/20" />
          <StepBadge n={2} label="AI Analiz" active={step >= 2} current={step === 2} />
          <div className="flex-1 h-0.5 bg-stone/20" />
          <StepBadge n={3} label="Kaydet" active={step >= 3} current={step === 3} />
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-cream overflow-hidden">
            {/* Camera area */}
            <div className="aspect-video bg-deep-earth relative flex items-center justify-center">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-stone">
                  <Camera size={64} className="mx-auto mb-4 opacity-40" />
                  <p className="text-lg font-medium">Kamera Alanı</p>
                  <p className="text-sm opacity-60">Ürününüzün fotoğrafını çekin veya yükleyin</p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-3">
                {!cameraActive && !capturedImage && (
                  <>
                    <button onClick={startCamera} className="btn-primary flex-1">
                      <Camera size={18} />
                      Kamerayı Aç
                    </button>
                    <button onClick={handleDemoCapture} className="btn-secondary flex-1">
                      <ImageIcon size={18} />
                      Demo Görsel Kullan
                    </button>
                  </>
                )}
                {cameraActive && (
                  <button onClick={capturePhoto} className="btn-primary w-full justify-center text-lg py-3.5">
                    <Camera size={20} />
                    Fotoğraf Çek
                  </button>
                )}
                {capturedImage && !analyzing && (
                  <>
                    <button onClick={() => { setCapturedImage(null); setCameraActive(false); }} className="btn-secondary flex-1">
                      Tekrar Çek
                    </button>
                    <button onClick={handleAIAnalyze} className="btn-primary flex-1 text-lg py-3">
                      <Sparkles size={18} />
                      AI ile Analiz Et
                    </button>
                  </>
                )}
                {analyzing && (
                  <div className="w-full text-center py-4">
                    <Loader2 size={32} className="animate-spin text-terracotta mx-auto mb-2" />
                    <p className="text-earth font-medium">AI ürünü analiz ediyor...</p>
                    <p className="text-xs text-earth/60 mt-1">Kategori, açıklama ve detaylar otomatik oluşturuluyor</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* AI Result */}
            {aiResult && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-brown">AI Analiz Sonucu</h3>
                    <p className="text-sm text-earth">Güven oranı: %{Math.round(aiResult.confidence * 100)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 rounded-xl p-3">
                    <p className="text-xs text-earth font-medium">Tespit Edilen Kategori</p>
                    <p className="font-semibold text-dark-brown">{aiResult.category}</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-3">
                    <p className="text-xs text-earth font-medium">Önerilen İsim</p>
                    <p className="font-semibold text-dark-brown text-sm">{aiResult.suggestedName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream space-y-5">
              <h3 className="font-semibold text-dark-brown text-lg flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <FileText size={18} className="text-terracotta" />
                Ürün Bilgileri
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Ürün Adı" icon={<Tag size={14} />} value={form.name} onChange={v => setForm({...form, name: v})} />
                <div>
                  <label className="text-sm font-medium text-dark-brown mb-1.5 flex items-center gap-1.5 block">
                    <Tag size={14} className="text-terracotta" /> Kategori
                  </label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta"
                  >
                    <option value="">Seçin</option>
                    {['Vazo','Halı','Seramik','Çömlek','Testi','Tabak','Diğer El Sanatları'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <FormTextArea label="Açıklama" icon={<FileText size={14} />} value={form.description} onChange={v => setForm({...form, description: v})} rows={3} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Fiyat (₺)" icon={<Tag size={14} />} value={form.price} onChange={v => setForm({...form, price: v})} type="number" placeholder="0.00" />
                <FormField label="Stok Adedi" icon={<Tag size={14} />} value={form.stock} onChange={v => setForm({...form, stock: v})} type="number" placeholder="0" />
              </div>

              <FormField label="Malzeme" icon={<Palette size={14} />} value={form.materials} onChange={v => setForm({...form, materials: v})} />
              <FormField label="Üretim Tekniği" icon={<Hammer size={14} />} value={form.technique} onChange={v => setForm({...form, technique: v})} />
              <FormTextArea label="Kültürel Hikaye" icon={<BookOpen size={14} />} value={form.culturalStory} onChange={v => setForm({...form, culturalStory: v})} rows={4} />

              {/* AI Video Button */}
              <button 
                onClick={handleAIVideo}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                <Film size={18} />
                AI Video Oluştur
              </button>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">Geri</button>
                <button onClick={handleSave} className="btn-primary flex-1 justify-center text-lg py-3">
                  <Save size={18} />
                  Ürünü Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-cream text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-deep-earth mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Ürün Kaydedildi!
            </h2>
            <p className="text-earth mb-2">{form.name}</p>
            <p className="text-sm text-earth/60 mb-8">Ürün başarıyla oluşturuldu. (Demo simülasyonu)</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => { setStep(1); setCapturedImage(null); setAiResult(null); setForm({ name:'', category:'', description:'', price:'', stock:'', materials:'', technique:'', culturalStory:'' }); }} className="btn-secondary">
                Yeni Ürün Ekle
              </button>
              <Link href="/seller" className="btn-primary">
                Panele Dön
              </Link>
            </div>
          </div>
        )}
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
              <p className="text-earth mb-6">AI video oluşturma özelliği yakında aktif edilecektir.</p>
              <button onClick={() => setShowVideoModal(false)} className="btn-primary w-full justify-center">Tamam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepBadge({ n, label, active, current }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
        current ? 'bg-terracotta text-white' : active ? 'bg-green-500 text-white' : 'bg-cream text-earth'
      }`}>{active && !current ? <CheckCircle size={14} /> : n}</div>
      <span className={`text-sm font-medium hidden sm:block ${current ? 'text-terracotta' : 'text-earth'}`}>{label}</span>
    </div>
  );
}

function FormField({ label, icon, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="text-sm font-medium text-dark-brown mb-1.5 flex items-center gap-1.5 block">
        <span className="text-terracotta">{icon}</span> {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
      />
    </div>
  );
}

function FormTextArea({ label, icon, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className="text-sm font-medium text-dark-brown mb-1.5 flex items-center gap-1.5 block">
        <span className="text-terracotta">{icon}</span> {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 resize-none"
      />
    </div>
  );
}
