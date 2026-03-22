import { createContext, useContext, useReducer } from "react";
import { INITIAL_ORDERS } from "../data";

const AppContext = createContext(null);

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const initialState = {
  orders: deepClone(INITIAL_ORDERS),
  selectedOrderId: INITIAL_ORDERS[0].id,
};

function reducer(state, action) {
  switch (action.type) {

    case "SELECT_ORDER":
      return { ...state, selectedOrderId: action.id };

    case "UPDATE_ORDER_FIELD": {
      const orders = state.orders.map((o) =>
        o.id === action.orderId ? { ...o, [action.field]: action.value } : o
      );
      return { ...state, orders };
    }

    case "ADD_REMARK": {
      const orders = state.orders.map((o) => {
        if (o.id !== action.orderId) return o;
        return { ...o, remarks: [...o.remarks, action.text] };
      });
      return { ...state, orders };
    }

    case "REMOVE_REMARK": {
      const orders = state.orders.map((o) => {
        if (o.id !== action.orderId) return o;
        return { ...o, remarks: o.remarks.filter((_, i) => i !== action.index) };
      });
      return { ...state, orders };
    }

    // Update quantity of a BUM item
    case "UPDATE_ITEM_QTY": {
      const orders = state.orders.map((o) => {
        if (o.id !== action.orderId) return o;
        const bums = o.bums.map((b) => {
          if (b.id !== action.bumId) return b;
          const items = b.items.map((item) =>
            item.id === action.itemId
              ? { ...item, qty: action.qty }
              : item
          );
          return { ...b, items };
        });
        return { ...o, bums };
      });
      return { ...state, orders };
    }

    // Toggle deliver flag on a BUM item
    case "TOGGLE_ITEM_DELIVER": {
      const orders = state.orders.map((o) => {
        if (o.id !== action.orderId) return o;
        const bums = o.bums.map((b) => {
          if (b.id !== action.bumId) return b;
          const items = b.items.map((item) =>
            item.id === action.itemId
              ? { ...item, deliver: !item.deliver }
              : item
          );
          return { ...b, items };
        });
        return { ...o, bums };
      });
      return { ...state, orders };
    }

    // Toggle ALL items in a BUM for delivery
    case "TOGGLE_BUM_ALL_DELIVER": {
      const orders = state.orders.map((o) => {
        if (o.id !== action.orderId) return o;
        const bums = o.bums.map((b) => {
          if (b.id !== action.bumId) return b;
          const allSelected = b.items.every((i) => i.deliver);
          const items = b.items.map((item) => ({ ...item, deliver: !allSelected }));
          return { ...b, items };
        });
        return { ...o, bums };
      });
      return { ...state, orders };
    }

    // Update item qty from pick list page
    case "UPDATE_PICKUP_QTY": {
      const orders = state.orders.map((o) => {
        if (o.id !== action.orderId) return o;
        const bums = o.bums.map((b) => {
          if (b.id !== action.bumId) return b;
          const items = b.items.map((item) =>
            item.id === action.itemId
              ? { ...item, pickQty: action.qty }
              : item
          );
          return { ...b, items };
        });
        return { ...o, bums };
      });
      return { ...state, orders };
    }

    // Update BUM status
    case "UPDATE_BUM_STATUS": {
      const orders = state.orders.map((o) => {
        if (o.id !== action.orderId) return o;
        const bums = o.bums.map((b) =>
          b.id === action.bumId ? { ...b, status: action.status } : b
        );
        return { ...o, bums };
      });
      return { ...state, orders };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectedOrder = state.orders.find((o) => o.id === state.selectedOrderId);

  return (
    <AppContext.Provider value={{ state, dispatch, selectedOrder }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
