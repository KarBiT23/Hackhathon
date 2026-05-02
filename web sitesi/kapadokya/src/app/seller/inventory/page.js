'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { inventoryService } from '../../../services/inventoryService';
import { productService } from '../../../services/productService';
import { getStockStatus } from '../../../utils/formatters';
import { ArrowLeft, Warehouse, AlertTriangle, Package, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      const inv = await inventoryService.getAll();
      const prods = await productService.getAll();
      setInventory(inv);
      setProducts(prods);
      setLoading(false);
    }
    load();
  }, []);

  const getProductName = (productId) => {
    const p = products.find(p => p.productId === productId);
    return p?.name || productId;
  };

  const getProductCategory = (productId) => {
    const p = products.find(p => p.productId === productId);
    return p?.category || '';
  };

  const filtered = inventory.filter(item => {
    const name = getProductName(item.productId).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const criticalCount = inventory.filter(i => i.currentStock <= i.criticalStock).length;

  return (
    <div className="bg-background min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/seller" className="p-2 rounded-xl hover:bg-cream transition-colors">
            <ArrowLeft size={20} className="text-earth" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-deep-earth" style={{ fontFamily: 'var(--font-display)' }}>Stok Takip</h1>
            <p className="text-sm text-earth">Ürün stok durumlarını ve varyantlarını yönetin</p>
          </div>
        </div>

        {/* Critical alert */}
        {criticalCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3 animate-fade-in">
            <AlertTriangle size={20} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-800 font-medium">{criticalCount} üründe kritik stok seviyesine ulaşıldı!</p>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone/30 bg-white focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 shimmer rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(item => {
              const status = getStockStatus(item.currentStock, item.criticalStock);
              const isExpanded = expandedId === item.inventoryId;
              return (
                <div key={item.inventoryId} className="bg-white rounded-2xl shadow-sm border border-cream overflow-hidden">
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : item.inventoryId)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        status.color === 'danger' ? 'bg-red-100 text-red-600' :
                        status.color === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-dark-brown">{getProductName(item.productId)}</p>
                        <p className="text-sm text-earth">{getProductCategory(item.productId)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-dark-brown text-lg">{item.currentStock}</p>
                        <p className={`text-xs font-medium ${
                          status.color === 'danger' ? 'text-red-600' :
                          status.color === 'warning' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>{status.label}</p>
                      </div>
                      {isExpanded ? <ChevronUp size={18} className="text-earth" /> : <ChevronDown size={18} className="text-earth" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-cream p-5 bg-cream/20 animate-fade-in">
                      <div className="flex items-center gap-2 mb-3">
                        <p className="text-sm text-earth">Kritik Seviye: <span className="font-semibold text-dark-brown">{item.criticalStock}</span></p>
                      </div>
                      <h4 className="text-sm font-semibold text-dark-brown mb-3">Varyantlar</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {item.variants.map((v, i) => (
                          <div key={i} className="bg-white rounded-xl p-3 border border-cream text-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-dark-brown">{v.model}</span>
                              <span className={`font-bold ${v.stock <= 2 ? 'text-red-600' : 'text-green-600'}`}>{v.stock}</span>
                            </div>
                            <p className="text-earth text-xs">Renk: {v.color}</p>
                            <p className="text-earth text-xs">Boyut: {v.size}</p>
                            <p className="text-earth text-xs">Malzeme: {v.material}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
