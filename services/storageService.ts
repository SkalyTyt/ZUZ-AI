import { Product } from '../types.ts';
import { INITIAL_INVENTORY } from '../constants.ts';

const INV_KEY = 'zuz_inventory';

export const getInventory = (): Product[] => {
  const data = localStorage.getItem(INV_KEY);
  if (!data) {
    // Initialize with seed data if empty
    localStorage.setItem(INV_KEY, JSON.stringify(INITIAL_INVENTORY));
    return INITIAL_INVENTORY;
  }
  return JSON.parse(data);
};

export const saveInventory = (inventory: Product[]) => {
  localStorage.setItem(INV_KEY, JSON.stringify(inventory));
};

export const addProduct = (product: Product) => {
  const inv = getInventory();
  const newInv = [...inv, product];
  saveInventory(newInv);
  return newInv;
};

export const updateProduct = (updatedProduct: Product) => {
  const inv = getInventory();
  const newInv = inv.map(p => p.id === updatedProduct.id ? updatedProduct : p);
  saveInventory(newInv);
  return newInv;
};

export const deleteProduct = (id: string) => {
  const inv = getInventory();
  const newInv = inv.filter(p => p.id !== id);
  saveInventory(newInv);
  return newInv;
};