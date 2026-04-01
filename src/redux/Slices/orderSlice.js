import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  orderDetail: null,
  total: 0,
  loading: false,
  selectedOrderId: null,
};

// 🔹 helper to find BOM
const findBom = (state, bomId) =>
  state.orderDetail?.boms?.find(
    (b) => String(b.bom_id) === String(bomId)
  );

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {

    // SET ORDERS
    setOrders: (state, action) => {
      state.orders = action.payload?.orders ?? [];
      state.total = action.payload?.total ?? state.orders.length;
    },

    // SET ORDER DETAIL - IMPORTANT: Preserve deliver states when updating
    setOrderDetail: (state, action) => {
      const newOrderDetail = action.payload ?? null;
      
      // If we already have an order detail, preserve the deliver states
      if (state.orderDetail && newOrderDetail && state.orderDetail.id === newOrderDetail.id) {
        // Create a deep copy of the new order detail
        const preservedOrder = JSON.parse(JSON.stringify(newOrderDetail));
        
        // Preserve deliver states from existing order
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
                  // Preserve deliver status
                  newItem.deliver = existingItem.deliver || false;
                  // Preserve pickQty if exists
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

    // LOADING
    setOrdersLoading: (state, action) => {
      state.loading = !!action.payload;
    },

    // SELECT ORDER
    selectOrder: (state, action) => {
      state.selectedOrderId = action.payload;
    },

    // APPEND ORDER
    appendOrder: (state, action) => {
      state.orders.unshift(action.payload);
      state.total += 1;
    },

    // UPDATE TOP-LEVEL FIELD
    updateOrderField: (state, action) => {
      const { field, value } = action.payload;
      if (!state.orderDetail) return;

      state.orderDetail[field] = value;

      // 🔹 sync list
      const index = state.orders.findIndex(
        (o) => o.id === state.orderDetail.id
      );
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], [field]: value };
      }
    },

    // ADD REMARK (structured)
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

    // REMOVE REMARK
    removeRemark: (state, action) => {
      const { index } = action.payload;
      if (!state.orderDetail?.remarks) return;

      state.orderDetail.remarks.splice(index, 1);
    },

    // UPDATE ITEM QTY (with validation)
    updateItemQty: (state, action) => {
      const { bomId, itemId, itemIndex, qty } = action.payload;

      if (!state.orderDetail) return;
      if (typeof qty !== "number" || qty < 0) return;

      const bom = findBom(state, bomId);
      if (!bom) return;

      // 🔹 Prefer ID-based
      let item = bom.items?.find(
        (i) => String(i.product_id) === String(itemId)
      );

      // 🔹 fallback to index (if ID not passed)
      if (!item && itemIndex !== undefined) {
        item = bom.items?.[itemIndex];
      }

      if (!item) return;

      item.qty = qty;
    },

    // TOGGLE SINGLE ITEM - FIXED with proper state update
    toggleItemDeliver: (state, action) => {
      const { bomId, itemId, itemIndex } = action.payload;
      
      if (!state.orderDetail) return;

      const bom = findBom(state, bomId);
      if (!bom) return;

      let item = null;
      
      // Try to find by product_id
      if (itemId) {
        item = bom.items?.find((i) => String(i.product_id) === String(itemId));
      }
      
      // If not found by ID, try by index
      if (!item && itemIndex !== undefined && bom.items?.[itemIndex]) {
        item = bom.items[itemIndex];
      }

      if (!item) return;

      // Toggle the deliver status
      item.deliver = !item.deliver;
      
      // Also update in orders list if exists
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

    // TOGGLE ALL ITEMS IN A BOM
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
      
      // Also update in orders list
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

    // UPDATE PICKUP QTY
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

    // UPDATE BOM STATUS
    updateBumStatus: (state, action) => {
      const { bomId, status } = action.payload;

      if (!state.orderDetail) return;

      const bom = findBom(state, bomId);
      if (!bom) return;

      bom.status = status;
    },

    // BULK UPDATE DELIVER STATUS
    bulkUpdateDeliverStatus: (state, action) => {
      const { updates } = action.payload; // updates: [{ bomId, itemId, deliver }]
      
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