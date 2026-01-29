import React, { useState, useEffect } from 'react';
import { User, Product } from '../types';
import { getInventory, addProduct, updateProduct, deleteProduct } from '../services/storageService';
import { resetChat } from '../services/geminiService';

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
  onSwitchToChat: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout, onSwitchToChat }) => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    refreshInventory();
  }, []);

  const refreshInventory = () => {
    setInventory(getInventory());
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentProduct({
      quantity: 0,
      price: 0,
      category: 'General'
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту позицию?')) {
      deleteProduct(id);
      refreshInventory();
      // Reset chat so AI picks up new inventory context next time
      resetChat();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProduct.name || !currentProduct.sku) return;

    if (currentProduct.id) {
      updateProduct(currentProduct as Product);
    } else {
      addProduct({
        ...currentProduct,
        id: Date.now().toString()
      } as Product);
    }
    
    setIsEditing(false);
    refreshInventory();
    resetChat(); // Critical: Forces AI to reload context with new data
  };

  return (
    <div className="min-h-screen bg-zuz-black flex flex-col">
       {/* Admin Header */}
       <div className="bg-zuz-dark border-b border-zuz-border p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="bg-zuz-red text-white text-xs font-bold px-2 py-1 rounded">ADMIN</div>
          <h1 className="text-xl font-display font-bold text-white">Управление Складом ZUZ</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={onSwitchToChat} className="text-sm text-gray-400 hover:text-white transition-colors">
            Вернуться в чат
          </button>
          <button onClick={onLogout} className="text-sm text-zuz-red hover:text-red-400 transition-colors">
            Выйти
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full flex-1">
        
        {/* Form Modal/Section */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zuz-dark border border-zuz-border p-6 rounded-lg w-full max-w-2xl shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-white border-b border-zuz-border pb-2">
                {currentProduct.id ? 'Редактировать товар' : 'Добавить новый товар'}
              </h2>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Название</label>
                   <input 
                     className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none" 
                     value={currentProduct.name || ''} 
                     onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                     placeholder="Например: Проставка 20мм"
                     required
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Артикул (SKU)</label>
                   <input 
                     className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none" 
                     value={currentProduct.sku || ''} 
                     onChange={e => setCurrentProduct({...currentProduct, sku: e.target.value})}
                     required
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Категория</label>
                   <input 
                     className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none" 
                     value={currentProduct.category || ''} 
                     onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Количество (шт)</label>
                   <input 
                     type="number"
                     className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none" 
                     value={currentProduct.quantity || 0} 
                     onChange={e => setCurrentProduct({...currentProduct, quantity: Number(e.target.value)})}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Цена (руб)</label>
                   <input 
                     type="number"
                     className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none" 
                     value={currentProduct.price || 0} 
                     onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})}
                   />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Описание</label>
                   <textarea 
                     className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none h-24 resize-none" 
                     value={currentProduct.description || ''} 
                     onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                   />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-zuz-red hover:bg-red-700 text-white font-bold rounded"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zuz-dark p-6 rounded border border-zuz-border">
            <h3 className="text-gray-400 text-sm uppercase">Всего позиций</h3>
            <p className="text-3xl font-display font-bold text-white mt-2">{inventory.length}</p>
          </div>
          <div className="bg-zuz-dark p-6 rounded border border-zuz-border">
             <h3 className="text-gray-400 text-sm uppercase">Товаров в наличии</h3>
             <p className="text-3xl font-display font-bold text-green-500 mt-2">
               {inventory.filter(i => i.quantity > 0).length}
             </p>
          </div>
          <div className="bg-zuz-dark p-6 rounded border border-zuz-border">
             <h3 className="text-gray-400 text-sm uppercase">Нет в наличии</h3>
             <p className="text-3xl font-display font-bold text-zuz-red mt-2">
               {inventory.filter(i => i.quantity === 0).length}
             </p>
          </div>
        </div>

        {/* Table Controls */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display font-bold">Инвентарь</h2>
          <button 
            onClick={handleAddNew}
            className="bg-white text-black hover:bg-gray-200 font-bold px-6 py-3 rounded flex items-center gap-2 transition-colors"
          >
            <span>+ Добавить товар</span>
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-zuz-dark border border-zuz-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-zuz-gray text-xs uppercase border-b border-zuz-border">
                  <th className="p-4 font-bold">SKU</th>
                  <th className="p-4 font-bold">Название</th>
                  <th className="p-4 font-bold">Остаток</th>
                  <th className="p-4 font-bold">Цена</th>
                  <th className="p-4 font-bold text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zuz-border">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-400">{item.sku}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${item.quantity > 0 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {item.quantity} шт.
                      </span>
                    </td>
                    <td className="p-4 font-mono text-white">{item.price} ₽</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-bold"
                      >
                        ИЗМ
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-zuz-red hover:text-red-400 text-sm font-bold"
                      >
                        УДАЛ
                      </button>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Склад пуст. Добавьте первый товар.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          * Изменения в этой таблице мгновенно обновляют контекст AI менеджера.
        </p>
      </div>
    </div>
  );
};