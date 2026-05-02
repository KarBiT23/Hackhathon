'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productService } from '../../../services/productService';
import { useAuth } from '../../../contexts/AuthContext';
import { convertDriveUrl } from '../../../utils/formatters';
import { ArrowLeft, Edit2, Package, Search, Plus, X, Save, Image as ImageIcon, Tag, Loader2 } from 'lucide-react';

export default function SellerProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { seller, isAdmin } = useAuth();

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', imageUrl: '', category: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    let prods = [];
    if (isAdmin) {
      prods = await productService.getAll();
    } else {
      const sellerId = seller?.sellerId || 'seller-001';
      const rawProds = await productService.getBySeller(sellerId);
      prods = rawProds.filter(p => p.category === (seller?.specialty || 'Halı'));
    }
    setProducts(prods);
    setLoading(false);
  }

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      price: product.price || '',
      imageUrl: product.images?.[0] || '',
      category: product.category || ''
    });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      let finalImageUrl = editForm.imageUrl;
      if (finalImageUrl.includes('drive.google.com/file/d/')) {
        finalImageUrl = convertDriveUrl(finalImageUrl);
      }

      await productService.update(editingProduct.productId, {
        name: editForm.name,
        price: editForm.price,
        imageUrl: finalImageUrl,
        category: editForm.category
      });
      
      setEditingProduct(null);
      await loadProducts(); // Refresh list
    } catch (error) {
      console.error("Güncelleme hatası", error);
      alert("Güncellenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/seller" className="p-2 rounded-xl hover:bg-cream transition-colors">
              <ArrowLeft size={20} className="text-earth" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-deep-earth" style={{ fontFamily: 'var(--font-display)' }}>Ürünlerim</h1>
              <p className="text-sm text-earth">Mağazanızdaki ürünleri yönetin ve düzenleyin</p>
            </div>
          </div>
          <Link href="/seller/add-product" className="btn-primary">
            <Plus size={18} />
            Yeni Ürün Ekle
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ürün adı veya kategori ara..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone/30 bg-white focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-terracotta" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-cream">
            <Package size={48} className="mx-auto mb-4 text-earth/50" />
            <h3 className="text-lg font-bold text-dark-brown">Ürün Bulunamadı</h3>
            <p className="text-earth">Aramanıza uygun ürün yok veya henüz ürün eklemediniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <div key={product.productId} className="bg-white rounded-2xl shadow-sm border border-cream overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-cream relative">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-earth/50">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-terracotta">
                    ₺{product.price}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs font-semibold text-earth uppercase tracking-wider mb-1">{product.category}</div>
                  <h3 className="font-bold text-dark-brown text-lg mb-2 truncate">{product.name}</h3>
                  <div className="bg-cream/50 rounded-lg p-2 mb-4 border border-stone/20">
                    <p className="text-[10px] text-earth font-medium uppercase tracking-wider mb-1">RFID Kimliği:</p>
                    <p className="text-xs font-mono font-bold text-terracotta truncate">{product.productId}</p>
                  </div>
                  <button 
                    onClick={() => handleEditClick(product)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                  >
                    <Edit2 size={16} />
                    Ürünü Düzenle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-cream">
              <h3 className="text-lg font-bold text-dark-brown" style={{ fontFamily: 'var(--font-display)' }}>Ürünü Düzenle</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-earth hover:bg-cream rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-brown mb-1.5 flex items-center gap-1.5 block">
                  <span className="text-terracotta"><Tag size={14} /></span> Ürün Adı
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-dark-brown mb-1.5 flex items-center gap-1.5 block">
                  <span className="text-terracotta"><Tag size={14} /></span> Kategori
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={e => setEditForm({...editForm, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-dark-brown mb-1.5 flex items-center gap-1.5 block">
                  <span className="text-terracotta"><Tag size={14} /></span> Fiyat (₺)
                </label>
                <input
                  type="number"
                  value={editForm.price}
                  onChange={e => setEditForm({...editForm, price: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mt-4">
                <label className="text-sm font-medium text-dark-brown mb-1.5 flex items-center gap-1.5 block">
                  <span className="text-terracotta"><ImageIcon size={14} /></span> Görsel URL (Google Drive vb.)
                </label>
                <input
                  type="text"
                  value={editForm.imageUrl}
                  onChange={e => setEditForm({...editForm, imageUrl: e.target.value})}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-4 py-3 rounded-xl border border-stone/30 bg-background focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                />
                <p className="text-xs text-blue-800 mt-2">
                  Not: Google Drive linki yapıştırırsanız sistem onu otomatik olarak dönüştürecektir.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-cream flex gap-3">
              <button onClick={() => setEditingProduct(null)} disabled={saving} className="btn-secondary flex-1 justify-center">İptal</button>
              <button onClick={handleSaveEdit} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Kaydet</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
