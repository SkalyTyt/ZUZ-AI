import React, { useState, useEffect } from 'react';
import { User, Product } from '../types.ts';
import { getInventory, addProduct, updateProduct, deleteProduct } from '../services/storageService.ts';
import { resetChat } from '../services/geminiService.ts';

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
  onSwitchToChat: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout, onSwitchToChat }) => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  useEffect(() => {
    refreshInventory();
  }, []);

  const refreshInventory = () => {
    setInventory(getInventory());
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentProduct({
      quantity: 0,
      price: 0,
      category: 'Колесные проставки'
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту позицию?')) {
      deleteProduct(id);
      refreshInventory();
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
    resetChat();
  };

  return (
    <div className="min-h-screen bg-zuz-black flex flex-col">
       {/* Admin Header */}
       <div className="bg-zuz-dark border-b border-zuz-border p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-30 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-zuz-red text-white text-xs font-bold px-2 py-1 rounded">ADMIN</div>
          <h1 className="text-xl font-display font-bold text-white truncate">Склад ZUZ</h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto justify-end">
          <button onClick={onSwitchToChat} className="text-sm text-gray-400 hover:text-white transition-colors">
            Чат
          </button>
          <button onClick={onLogout} className="text-sm text-zuz-red hover:text-red-400 transition-colors">
            Выйти
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto w-full flex-1">
        
        {/* Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zuz-dark border border-zuz-border p-6 rounded-lg w-full max-w-2xl shadow-2xl relative">
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-6 text-white border-b border-zuz-border pb-2">
                {currentProduct.id ? 'Редактировать товар' : 'Новая позиция'}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                
                {/* Priority Fields: SKU & Price */}
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded border border-white/10">
                    <div>
                        <label className="block text-xs font-bold text-zuz-red uppercase mb-1">Артикул (SKU) *</label>
                        <input 
                            className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none font-mono" 
                            value={currentProduct.sku || ''} 
                            onChange={e => setCurrentProduct({...currentProduct, sku: e.target.value})}
                            required
                            placeholder="SP-001"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-green-500 uppercase mb-1">Цена (RUB) *</label>
                        <input 
                            type="number"
                            className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none font-mono" 
                            value={currentProduct.price || ''} 
                            onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})}
                            required
                            placeholder="0"
                        />
                    </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Название товара *</label>
                   <input 
                     className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none" 
                     value={currentProduct.name || ''} 
                     onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                     placeholder="Проставка колесная..."
                     required
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Остаток (шт)</label>
                        <input 
                            type="number"
                            className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none" 
                            value={currentProduct.quantity || 0} 
                            onChange={e => setCurrentProduct({...currentProduct, quantity: Number(e.target.value)})}
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
                </div>

                <div>
                   <label className="block text-xs font-bold text-zuz-gray uppercase mb-1">Описание для нейросети</label>
                   <textarea 
                     className="w-full bg-zuz-black border border-zuz-border p-3 text-white rounded focus:border-zuz-red outline-none h-24 resize-none" 
                     value={currentProduct.description || ''} 
                     onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                     placeholder="Опишите характеристики, материал и применимость..."
                   />
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    className="w-full md:w-auto px-8 py-3 bg-zuz-red hover:bg-red-700 text-white font-bold rounded uppercase tracking-wider transition-all"
                  >
                    Сохранить изменения
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
                <input 
                    type="text"
                    placeholder="Поиск по артикулу или названию..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zuz-dark border border-zuz-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-zuz-red transition-all"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3.5 text-gray-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            
            <button 
                onClick={handleAddNew}
                className="w-full md:w-auto bg-white text-black hover:bg-gray-200 font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors uppercase tracking-wide text-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Добавить позицию
            </button>
        </div>

        {/* Stats Row - Simplified */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
             <div className="bg-zuz-dark border border-zuz-border p-4 rounded">
                <div className="text-xs text-gray-500 uppercase">Всего товаров</div>
                <div className="text-xl font-bold font-display">{inventory.length}</div>
             </div>
             <div className="bg-zuz-dark border border-zuz-border p-4 rounded">
                <div className="text-xs text-gray-500 uppercase">Найдено</div>
                <div className="text-xl font-bold font-display text-white">{filteredInventory.length}</div>
             </div>
        </div>

        {/* Inventory List */}
        <div className="bg-zuz-dark border border-zuz-border rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-gray-400 text-xs uppercase border-b border-zuz-border">
                  <th className="p-4 font-bold tracking-wider">Артикул / SKU</th>
                  <th className="p-4 font-bold tracking-wider">Товар</th>
                  <th className="p-4 font-bold tracking-wider">Цена</th>
                  <th className="p-4 font-bold tracking-wider">Остаток</th>
                  <th className="p-4 font-bold text-right">Управление</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zuz-border/50">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                        <span className="font-mono text-zuz-red font-bold bg-red-900/20 px-2 py-1 rounded text-sm">
                            {item.sku}
                        </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white mb-1">{item.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1 group-hover:text-gray-300 transition-colors">
                          {item.description}
                      </div>
                    </td>
                    <td className="p-4">
                        <div className="font-mono text-white text-lg">{item.price} ₽</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.quantity > 10 ? 'bg-green-900/30 text-green-400' :
                          item.quantity > 0 ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-500'
                      }`}>
                        {item.quantity > 0 ? `${item.quantity} шт` : 'Нет в наличии'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
                            title="Редактировать"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-zuz-red hover:bg-red-900/20 rounded transition-colors"
                            title="Удалить"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      {searchTerm ? 'Ничего не найдено по запросу.' : 'Список товаров пуст.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};