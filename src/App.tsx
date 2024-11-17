import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { AuthForm } from './components/AuthForm';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { LogOut, Plus } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function App() {
  const [session, setSession] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <AuthForm />
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Toaster position="top-right" />
      
      <nav className="glass-morphism sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Product Inventory
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary"
              >
                <Plus size={20} className="mr-2" />
                {showForm ? 'Close Form' : 'Add Product'}
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="btn-secondary"
              >
                <LogOut size={20} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {showForm && (
          <div className="mb-8 animate-fade-in">
            <ProductForm onSuccess={() => {
              setShowForm(false);
              window.location.reload();
            }} />
          </div>
        )}
        <ProductList />
      </main>
    </div>
  );
}

export default App;