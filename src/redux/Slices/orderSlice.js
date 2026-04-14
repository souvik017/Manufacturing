// redux/Slices/orderSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  orderDetail: null,
  draftOrder: null,
  total: 0,
  loading: false,
  selectedOrderId: null,
};

const findBom = (state, bomId) =>
  state.orderDetail?.boms?.find(
    (b) => String(b.bom_id) === String(bomId)
  );

const findBomInDraft = (state, bomId) =>
  state.draftOrder?.boms?.find(
    (b) => String(b.bom_id) === String(bomId)
  );

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload?.orders ?? [];
      state.total = action.payload?.total ?? state.orders.length;
    },

    setOrderDetail: (state, action) => {
      const newOrderDetail = action.payload ?? null;
      if (state.orderDetail && newOrderDetail && state.orderDetail.id === newOrderDetail.id) {
        const preservedOrder = JSON.parse(JSON.stringify(newOrderDetail));
        if (state.orderDetail.boms && preservedOrder.boms) {
          preservedOrder.boms.forEach((newBom, bomIndex) => {
            const existingBom = state.orderDetail.boms.find(
              b => String(b.bom_id) === String(newBom.bom_id)
            );
            if (existingBom && existingBom.items) {
              newBom.items.forEach((newItem, itemIndex) => {
                const existingItem = existingBom.items.find(
                  i => String(i.product_id) === String(newItem.product_id)
                );
                if (existingItem) {
                  newItem.deliver = existingItem.deliver || false;
                  if (existingItem.pickQty !== undefined) {
                    newItem.pickQty = existingItem.pickQty;
                  }
                }
              });
            }
          });
        }
        state.orderDetail = preservedOrder;
      } else {
        state.orderDetail = newOrderDetail;
      }
    },

    setDraftOrder: (state, action) => {
      state.draftOrder = action.payload ?? null;
    },

    // 🔹 FIXED: merge BOMs and items instead of replacing
    updateDraftOrder: (state, action) => {
      const newDraftData = action.payload;
      
      if (!state.draftOrder) {
        state.draftOrder = {
          id: "draft",
          requisition_no: newDraftData.requisition_no || "Draft",
          requisition_date: newDraftData.requisition_date,
          project_id: newDraftData.project_id,
          project_name: newDraftData.project_name || "",
          remarks: newDraftData.remarks || [],
          boms: newDraftData.boms || [],
        };
      } else {
        const existingBomMap = new Map(
          (state.draftOrder.boms || []).map(b => [String(b.bom_id), b])
        );
        const newBoms = newDraftData.boms || [];
        
        newBoms.forEach(newBom => {
          const bomId = String(newBom.bom_id);
          const existingBom = existingBomMap.get(bomId);
          
          if (existingBom) {
            // Merge items inside the BOM
            const existingItemMap = new Map(
              (existingBom.items || []).map(i => [String(i.product_id), i])
            );
            (newBom.items || []).forEach(newItem => {
              const productId = String(newItem.product_id);
              const existingItem = existingItemMap.get(productId);
              if (existingItem) {
                Object.assign(existingItem, newItem);
              } else {
                existingItemMap.set(productId, newItem);
              }
            });
            existingBom.items = Array.from(existingItemMap.values());
            // Update BOM metadata
            Object.assign(existingBom, {
              bom_name: newBom.bom_name,
              product_name: newBom.product_name,
              uom_name: newBom.uom_name,
              status: newBom.status,
            });
          } else {
            // Add new BOM
            existingBomMap.set(bomId, { ...newBom });
          }
        });
        
        state.draftOrder.boms = Array.from(existingBomMap.values());
        state.draftOrder.requisition_no = newDraftData.requisition_no || state.draftOrder.requisition_no;
        state.draftOrder.requisition_date = newDraftData.requisition_date || state.draftOrder.requisition_date;
        state.draftOrder.project_id = newDraftData.project_id || state.draftOrder.project_id;
        state.draftOrder.project_name = newDraftData.project_name || state.draftOrder.project_name;
        state.draftOrder.remarks = newDraftData.remarks || state.draftOrder.remarks;
      }
    },

    clearDraftOrder: (state) => {
      state.draftOrder = null;
    },

    setOrdersLoading: (state, action) => {
      state.loading = !!action.payload;
    },

    selectOrder: (state, action) => {
      state.selectedOrderId = action.payload;
    },

    appendOrder: (state, action) => {
      state.orders.unshift(action.payload);
      state.total += 1;
    },

    updateOrderField: (state, action) => {
      const { field, value } = action.payload;
      if (!state.orderDetail) return;
      state.orderDetail[field] = value;
      const index = state.orders.findIndex(
        (o) => o.id === state.orderDetail.id
      );
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], [field]: value };
      }
    },

    addRemark: (state, action) => {
      const { text } = action.payload;
      if (!state.orderDetail) return;
      if (!Array.isArray(state.orderDetail.remarks)) {
        state.orderDetail.remarks = [];
      }
      state.orderDetail.remarks.push({
        text,
        createdAt: new Date().toISOString(),
      });
    },

    removeRemark: (state, action) => {
      const { index } = action.payload;
      if (!state.orderDetail?.remarks) return;
      state.orderDetail.remarks.splice(index, 1);
    },

    updateItemQty: (state, action) => {
      const { bomId, itemId, itemIndex, qty } = action.payload;
      if (!state.orderDetail) return;
      if (typeof qty !== "number" || qty < 0) return;
      const bom = findBom(state, bomId);
      if (!bom) return;
      let item = bom.items?.find(
        (i) => String(i.product_id) === String(itemId)
      );
      if (!item && itemIndex !== undefined) {
        item = bom.items?.[itemIndex];
      }
      if (!item) return;
      item.qty = qty;
    },

    toggleItemDeliver: (state, action) => {
      const { bomId, itemId, itemIndex } = action.payload;
      if (!state.orderDetail) return;
      const bom = findBom(state, bomId);
      if (!bom) return;
      let item = null;
      if (itemId) {
        item = bom.items?.find((i) => String(i.product_id) === String(itemId));
      }
      if (!item && itemIndex !== undefined && bom.items?.[itemIndex]) {
        item = bom.items[itemIndex];
      }
      if (!item) return;
      item.deliver = !item.deliver;
      if (state.orders.length > 0) {
        const orderIndex = state.orders.findIndex(o => o.id === state.orderDetail.id);
        if (orderIndex !== -1) {
          const orderBom = state.orders[orderIndex].boms?.find(b => String(b.bom_id) === String(bomId));
          if (orderBom && orderBom.items) {
            const orderItem = orderBom.items.find(i => String(i.product_id) === String(itemId));
            if (orderItem) {
              orderItem.deliver = item.deliver;
            }
          }
        }
      }
    },

    toggleBumAllDeliver: (state, action) => {
      const { bomId } = action.payload;
      if (!state.orderDetail) return;
      const bom = findBom(state, bomId);
      if (!bom || !Array.isArray(bom.items) || bom.items.length === 0) return;
      const allSelected = bom.items.every((i) => i.deliver);
      const newStatus = !allSelected;
      bom.items.forEach((i) => {
        i.deliver = newStatus;
      });
      if (state.orders.length > 0) {
        const orderIndex = state.orders.findIndex(o => o.id === state.orderDetail.id);
        if (orderIndex !== -1) {
          const orderBom = state.orders[orderIndex].boms?.find(b => String(b.bom_id) === String(bomId));
          if (orderBom && orderBom.items) {
            orderBom.items.forEach((i) => {
              i.deliver = newStatus;
            });
          }
        }
      }
    },

    updatePickupQty: (state, action) => {
      const { bomId, itemId, qty } = action.payload;
      if (!state.orderDetail) return;
      if (typeof qty !== "number" || qty < 0) return;
      const bom = findBom(state, bomId);
      if (!bom) return;
      const item = bom.items?.find(
        (i) => String(i.product_id) === String(itemId)
      );
      if (!item) return;
      item.pickQty = qty;
    },

    updateBumStatus: (state, action) => {
      const { bomId, status } = action.payload;
      if (!state.orderDetail) return;
      const bom = findBom(state, bomId);
      if (!bom) return;
      bom.status = status;
    },

    bulkUpdateDeliverStatus: (state, action) => {
      const { updates } = action.payload;
      if (!state.orderDetail) return;
      updates.forEach(update => {
        const { bomId, itemId, deliver } = update;
        const bom = findBom(state, bomId);
        if (bom && bom.items) {
          const item = bom.items.find(i => String(i.product_id) === String(itemId));
          if (item) {
            item.deliver = deliver;
          }
        }
      });
    },
  },
});

export const {
  setOrders,
  setOrderDetail,
  setDraftOrder,
  updateDraftOrder,
  clearDraftOrder,
  setOrdersLoading,
  selectOrder,
  appendOrder,
  updateOrderField,
  addRemark,
  removeRemark,
  updateItemQty,
  toggleItemDeliver,
  toggleBumAllDeliver,
  updatePickupQty,
  updateBumStatus,
  bulkUpdateDeliverStatus,
} = orderSlice.actions;

export default orderSlice.reducer;