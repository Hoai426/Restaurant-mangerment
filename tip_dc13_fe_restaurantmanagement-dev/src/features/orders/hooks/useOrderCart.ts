import { useState, useMemo, useCallback } from "react";
import type { CartItem, OrderCartInitialData } from "@/types/order";
import type { Dish } from "@/types/dish";

export interface UseOrderCartOptions {
  initialTableId?: number | null;
  initialData?: OrderCartInitialData;
}

export interface UseOrderCartReturn {
  items: CartItem[];
  selectedTableId: number | null;
  numberOfGuests: number | undefined;
  orderNote: string;
  totalQuantity: number;
  totalAmount: number;
  isValid: boolean;
  setTable: (tableId: number | null) => void;
  setGuests: (guests: number | undefined) => void;
  setOrderNote: (note: string) => void;
  addItem: (dish: Dish) => void;
  updateQuantity: (dishId: number, delta: number) => void;
  updateItemNote: (dishId: number, note: string) => void;
  removeItem: (dishId: number) => void;
  clearCart: () => void;
  resetWithData: (data: OrderCartInitialData) => void;
  getItemQuantity: (dishId: number) => number;
}

export function useOrderCart(options?: UseOrderCartOptions): UseOrderCartReturn {
  // Precedence Resolution:
  // initialData.tableId > options.initialTableId > null
  const initialTableIdResolved =
    options?.initialData?.tableId !== undefined
      ? options.initialData.tableId
      : (options?.initialTableId ?? null);

  const initialGuestsResolved = options?.initialData?.numberOfGuests ?? undefined;
  const initialNoteResolved = options?.initialData?.orderNote ?? "";
  const initialItemsResolved = options?.initialData?.items ?? [];

  const [selectedTableId, setSelectedTableId] = useState<number | null>(initialTableIdResolved);
  const [numberOfGuests, setNumberOfGuests] = useState<number | undefined>(initialGuestsResolved);
  const [orderNote, setOrderNoteState] = useState<string>(initialNoteResolved);
  const [items, setItems] = useState<CartItem[]>(initialItemsResolved);

  const setTable = useCallback((tableId: number | null) => {
    setSelectedTableId(tableId);
  }, []);

  const setGuests = useCallback((guests: number | undefined) => {
    setNumberOfGuests(guests);
  }, []);

  const setOrderNote = useCallback((note: string) => {
    setOrderNoteState(note);
  }, []);

  const addItem = useCallback((dish: Dish) => {
    if (!dish.isAvailable) return;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.dishId === dish.id);
      if (existingIndex > -1) {
        // Tăng số lượng nếu món đã tồn tại trong giỏ
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      // Thêm món mới vào giỏ
      const newItem: CartItem = {
        dishId: dish.id,
        dishName: dish.name,
        price: dish.price,
        quantity: 1,
        imageUrl: dish.imageUrl,
        isAvailable: dish.isAvailable,
      };
      return [...prevItems, newItem];
    });
  }, []);

  const updateQuantity = useCallback((dishId: number, delta: number) => {
    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.dishId === dishId);
      if (!existing) return prevItems;

      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        // Tự động xóa món nếu số lượng <= 0
        return prevItems.filter((i) => i.dishId !== dishId);
      }

      return prevItems.map((i) =>
        i.dishId === dishId ? { ...i, quantity: newQty } : i
      );
    });
  }, []);

  const updateItemNote = useCallback((dishId: number, note: string) => {
    setItems((prevItems) =>
      prevItems.map((i) => (i.dishId === dishId ? { ...i, note } : i))
    );
  }, []);

  const removeItem = useCallback((dishId: number) => {
    setItems((prevItems) => prevItems.filter((i) => i.dishId !== dishId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setNumberOfGuests(undefined);
    setOrderNoteState("");
  }, []);

  const resetWithData = useCallback((data: OrderCartInitialData) => {
    setSelectedTableId(data.tableId ?? null);
    setNumberOfGuests(data.numberOfGuests ?? undefined);
    setOrderNoteState(data.orderNote ?? "");
    setItems(data.items ?? []);
  }, []);

  // Tính toán số lượng của 1 món cụ thể trong giỏ để hiển thị badge
  const getItemQuantity = useCallback(
    (dishId: number): number => {
      const found = items.find((i) => i.dishId === dishId);
      return found ? found.quantity : 0;
    },
    [items]
  );

  // Derived state: Tính toán tổng số món & tổng tiền thuần túy bằng useMemo (không dùng useEffect)
  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const isValid = useMemo(
    () => selectedTableId !== null && selectedTableId > 0 && items.length > 0,
    [selectedTableId, items.length]
  );

  return {
    items,
    selectedTableId,
    numberOfGuests,
    orderNote,
    totalQuantity,
    totalAmount,
    isValid,
    setTable,
    setGuests,
    setOrderNote,
    addItem,
    updateQuantity,
    updateItemNote,
    removeItem,
    clearCart,
    resetWithData,
    getItemQuantity,
  };
}

export default useOrderCart;
