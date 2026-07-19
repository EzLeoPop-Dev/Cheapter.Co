// @ts-nocheck
"use client";
import React, { createContext, useContext, useState } from 'react';

const MockStoreContext = createContext();

export function MockStoreProvider({ children }) {
  // --- MOCK DATA SEED ---
  const initialProducts = [
    {
      id: 'BK-001', name: 'แฮร์รี่ พอตเตอร์ เล่ม 1', author: 'J.K. Rowling', publisher: 'Nanmeebooks',
      description: 'เด็กชายผู้รอดชีวิต', price: 395, cost: 250, sku: 'SKU-001', barcode: '9781234567890',
      type: 'physical', status: 'active', cover: 'https://images.unsplash.com/photo-1626618012641-bfbca5a31239?q=80&w=400&auto=format&fit=crop',
      quantity: 15, reserved: 2, available: 13, reorderPoint: 10
    },
    {
      id: 'BK-002', name: 'ปรมาจารย์ลัทธิมาร เล่ม 1', author: 'โม่เซียงถงซิ่ว', publisher: 'Bakery Book',
      description: 'เรื่องราวของเว่ยอู๋เซี่ยน', price: 450, cost: 300, sku: 'SKU-002', barcode: '9781234567891',
      type: 'physical', status: 'active', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
      quantity: 5, reserved: 1, available: 4, reorderPoint: 10
    },
    {
      id: 'BK-003', name: 'คิดแบบยิว', author: 'เอมี่ ไชวา', publisher: 'Amarin',
      description: 'เคล็ดลับความสำเร็จ', price: 300, cost: 200, sku: 'SKU-003', barcode: '9781234567892',
      type: 'physical', status: 'draft', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
      quantity: 0, reserved: 0, available: 0, reorderPoint: 15
    },
    {
      id: 'BK-004', name: 'The Psychology of Money', author: 'Morgan Housel', publisher: 'Live Rich',
      description: 'จิตวิทยาว่าด้วยเงิน', price: 290, cost: 180, sku: 'SKU-004', barcode: '9781234567893',
      type: 'physical', status: 'active', cover: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?q=80&w=400&auto=format&fit=crop',
      quantity: 25, reserved: 2, available: 23, reorderPoint: 10
    },
    {
      id: 'BK-005', name: 'Sapiens เซเปียนส์', author: 'Yuval Noah Harari', publisher: 'Gypsy',
      description: 'ประวัติศาสตร์ฉบับย่อของมนุษยชาติ', price: 590, cost: 350, sku: 'SKU-005', barcode: '9781234567894',
      type: 'physical', status: 'active', cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400&auto=format&fit=crop',
      quantity: 40, reserved: 5, available: 35, reorderPoint: 15
    },
    {
      id: 'EB-001', name: 'Atomic Habits (E-Book)', author: 'James Clear', publisher: 'Se-ed',
      description: 'เพราะชีวิตดีได้กว่าที่เป็น', price: 250, cost: 0, sku: 'SKU-006', barcode: '9781234567895',
      type: 'ebook', status: 'active', cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop',
      quantity: 999, reserved: 0, available: 999, reorderPoint: 0, trialLimit: 15
    },
    {
      id: 'SN-001', name: 'ตำนานจอมยุทธ์ภูตถังซาน', author: 'ถังเจียซานเซ่า', publisher: 'Dek-D',
      description: 'นิยายแปลจีนกำลังภายใน', price: 0, cost: 0, sku: 'SKU-007', barcode: '9781234567896',
      type: 'serial', status: 'active', cover: 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?q=80&w=400&auto=format&fit=crop',
      quantity: 999, reserved: 0, available: 999, reorderPoint: 0,
      chapters: [
        { id: 'CH-1', title: 'ตอนที่ 1: วิญญาณยุทธ์ขยะ', chapterNumber: 1, price: 0, file: true },
        { id: 'CH-2', title: 'ตอนที่ 2: การทดสอบพลัง', chapterNumber: 2, price: 5, file: true },
        { id: 'CH-3', title: 'ตอนที่ 3: โรงเรียนนั่วติง', chapterNumber: 3, price: 5, file: true }
      ]
    },
    {
      id: 'BK-006', name: '1984', author: 'George Orwell', publisher: 'Classic',
      description: 'นวนิยายดิสโทเปียสุดคลาสสิก', price: 320, cost: 150, sku: 'SKU-008', barcode: '9781234567897',
      type: 'physical', status: 'active', cover: 'https://images.unsplash.com/photo-1629196914282-e5658e0a8115?q=80&w=400&auto=format&fit=crop',
      quantity: 8, reserved: 1, available: 7, reorderPoint: 5
    }
  ];

  const initialPOs = [
    { 
      id: 'PO-2607-001', supplier: 'สำนักพิมพ์ แจ่มใส', created_at: '15/07/2026', created_by: 'Admin', expectedDate: '15/07/2026', status: 'Pending',
      items: [
        { sku: 'SKU-001', name: 'แฮร์รี่ พอตเตอร์ เล่ม 1', ordered: 100, cost: 250, previouslyReceived: 0 }
      ]
    },
    { 
      id: 'PO-2607-002', supplier: 'Se-ed Book Center', created_at: '10/07/2026', created_by: 'Admin', expectedDate: '16/07/2026', status: 'Partial',
      previousReceives: [{ date: '10/07/2026', goodQty: 10 }],
      items: [
        { sku: 'SKU-003', name: 'คิดแบบยิว', ordered: 20, cost: 200, previouslyReceived: 10 }
      ]
    }
  ];

  const initialMovements = [
    { date: '14/07/2026 10:30', type: 'IN', sku: 'SKU-001', qty: 100, ref: 'PO-2606-005', by: 'Admin', balance: 115 },
    { date: '13/07/2026 14:00', type: 'OUT', sku: 'SKU-001', qty: -2, ref: 'ORD-004', by: 'System', balance: 15 }
  ];

  const [products, setProducts] = useState(initialProducts);
  const [pos, setPos] = useState(initialPOs);
  const [movements, setMovements] = useState(initialMovements);

  // --- ACTIONS ---

  const addProduct = (product) => {
    setProducts(prev => [{...product, quantity: 0, reserved: 0, available: 0, reorderPoint: 10}, ...prev]);
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addPO = (po) => {
    setPos(prev => [po, ...prev]);
  };

  const updatePO = (id, updates) => {
    setPos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addMovement = (movement) => {
    setMovements(prev => [movement, ...prev]);
  };

  const receiveStock = (poId, receivedItems, grnNumber, adminName) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH') + ' ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    
    // Process each item
    receivedItems.forEach(item => {
      if (item.goodQty > 0 || item.damagedQty > 0) {
        // Update Product Stock
        setProducts(prev => prev.map(p => {
          if (p.sku === item.sku) {
            const newQty = p.quantity + item.goodQty;
            const newAvailable = newQty - p.reserved;
            
            // Check Auto-Flip Draft to Active
            let newStatus = p.status;
            if (p.status === 'draft' && newQty > 0) {
              if (p.name && p.price && p.cover && p.description) {
                newStatus = 'active'; // Complete info -> Active
              }
            }
            
            // Log IN
            if (item.goodQty > 0) {
              addMovement({ date: dateStr, type: 'IN', sku: p.sku, qty: item.goodQty, ref: `${poId} → ${grnNumber}`, by: adminName, balance: newQty });
            }
            // Log DAMAGED
            if (item.damagedQty > 0) {
              addMovement({ date: dateStr, type: 'DAMAGED', sku: p.sku, qty: item.damagedQty, ref: `${poId} → ${grnNumber}`, by: adminName, balance: newQty });
            }

            return { ...p, quantity: newQty, available: newAvailable, status: newStatus };
          }
          return p;
        }));
      }
    });

    // Update PO Status & Items
    setPos(prev => prev.map(po => {
      if (po.id === poId) {
        const updatedItems = po.items.map(poItem => {
          const recItem = receivedItems.find(r => r.sku === poItem.sku);
          if (recItem) {
            return { ...poItem, previouslyReceived: poItem.previouslyReceived + recItem.goodQty + recItem.damagedQty };
          }
          return poItem;
        });
        
        let stillPending = false;
        updatedItems.forEach(i => {
           if (i.previouslyReceived < i.ordered) stillPending = true;
        });

        return { ...po, status: stillPending ? 'Partial' : 'Completed', items: updatedItems };
      }
      return po;
    }));
  };

  return (
    <MockStoreContext.Provider value={{
      products, addProduct, updateProduct,
      pos, addPO, updatePO,
      movements, addMovement,
      receiveStock
    }}>
      {children}
    </MockStoreContext.Provider>
  );
}

export function useMockStore() {
  return useContext(MockStoreContext);
}
