import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Search, Edit2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { EditProductForm } from './EditProductForm';

interface Product {
  id: number;
  name: string;
  price: number;
  comments: string;
  image_url: string;
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await supabase.storage
        .from('productimages')
        .remove([imageUrl]);

      const { error: dbError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      toast.success('Product deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            {products.length === 0 ? 'No products found. Add some!' : 'No products match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card overflow-hidden group animate-slide-up">
              <div className="relative">
                <img
                  src={`https://nxzkvylcjnsupftfrsfe.supabase.co/storage/v1/object/public/productimages/${product.image_url}`}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-4 left-4 right-4 flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id, product.image_url)}
                      className="p-2 rounded-full bg-white/90 text-red-600 hover:bg-white transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-blue-600 font-medium mb-2">${product.price.toFixed(2)}</p>
                <p className="text-gray-600 text-sm line-clamp-2">{product.comments}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
}