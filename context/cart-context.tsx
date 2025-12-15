import { CartProductType } from "@/app/product/[productId]/product-details";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

type CartContextType = {
  cartTotalQuantity: number;
  cartTotalAmount: number; // includes DMC for backward compatibility
  cartSubtotal: number; // excludes DMC
  cartTotalDmc: number;
  cartProducts: CartProductType[] | null;
  paymentIntent: string | null;
  handleAddProductToCart: (product: CartProductType) => void;
  handleRemoveProductFromCart: (product: CartProductType) => void;
  handleCartQuantityIncrease: (product: CartProductType) => void;
  handleCartQuantityDecrease: (product: CartProductType) => void;
  handleClearCart: () => void;
  handleSetPaymentIntent: (value: string | null) => void;
  handleRemovePaymentIntent: () => void;
};

interface Props {
  [propName: string]: any;
}

export const CartContext = createContext<CartContextType | null>(null);

export const CartContextProvider = (props: Props) => {
  const [cartTotalQuantity, setCartTotalQuantity] = useState(0);
  const [cartTotalAmount, setCartTotalAmount] = useState(0);
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(null);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartTotalDmc, setCartTotalDmc] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);

  useEffect(() => {
    const storage: any = localStorage.getItem("cartItems");
    const storageCartProducts: CartProductType[] | null = JSON.parse(storage);
    const shopPaymentIntent: any = localStorage.getItem("paymentIntent");
    const paymentIntent: string | null = JSON.parse(shopPaymentIntent);

    // Migrate old cart items to include DMC field (default to 0 if missing)
    if (storageCartProducts) {
      const migratedCart = storageCartProducts.map(item => ({
        ...item,
        dmc: item.dmc ?? 0
      }));
      setCartProducts(migratedCart);
      localStorage.setItem("cartItems", JSON.stringify(migratedCart));
    } else {
      setCartProducts(storageCartProducts);
    }
    
    setPaymentIntent(paymentIntent);
  }, []);

  useEffect(() => {
    const getTotals = () => {
      if (cartProducts) {
        let subtotal = 0;
        let dmcTotal = 0;
        let quantity = 0;
        cartProducts.forEach(item => {
          subtotal += item.price * item.quantity;
          dmcTotal += (item.dmc || 0) * item.quantity;
          quantity += item.quantity;
        });
        setCartSubtotal(subtotal);
        setCartTotalDmc(dmcTotal);
        setCartTotalQuantity(quantity);
        setCartTotalAmount(subtotal + dmcTotal); // for backward compatibility
      }
    };
    getTotals();
  }, [cartProducts]);

  const handleAddProductToCart = useCallback((product: CartProductType) => {
    // Ensure we don't add more than available stock
    const available = product.remainingStock ?? (product as any).stock ?? undefined;
    let toAdd = { ...product };
    if (available !== undefined && toAdd.quantity > available) {
      toAdd.quantity = available;
      toast.error(`Only ${available} left in stock. Quantity adjusted.`);
    }

    setCartProducts((prev) => {
      let updatedCart;

      if (prev) {
        updatedCart = [...prev, toAdd];
      } else {
        updatedCart = [toAdd];
      }

      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      return updatedCart;
    });
  }, []);

  const handleRemoveProductFromCart = useCallback(
    (product: CartProductType) => {
      if (cartProducts) {
        const filteredProducts = cartProducts.filter((item) => {
          return item.id !== product.id;
        });

        setCartProducts(filteredProducts);
        localStorage.setItem("cartItems", JSON.stringify(filteredProducts));
      }
    },
    [cartProducts]
  );

  const handleCartQuantityIncrease = useCallback(
    (product: CartProductType) => {
      let updatedCart;
      if (product.quantity === 99) {
        return toast.error("Oops! Maximun reached.");
      }

      const available = product.remainingStock ?? (product as any).stock ?? undefined;
      if (available !== undefined && product.quantity >= available) {
        return toast.error(`Only ${available} left in stock`);
      }

      if (cartProducts) {
        updatedCart = [...cartProducts];

        const productIndex = cartProducts.findIndex(
          (item) => item.id === product.id
        );
        if (productIndex > -1) {
          updatedCart[productIndex].quantity =
            updatedCart[productIndex].quantity + 1;
        }
        setCartProducts(updatedCart);
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      }
    },
    [cartProducts]
  );

  const handleCartQuantityDecrease = useCallback(
    (product: CartProductType) => {
      let updatedCart;

      if (product.quantity === 1) {
        return toast.error("Oops! Minimum reached.");
      }

      if (cartProducts) {
        updatedCart = [...cartProducts];

        const productIndex = cartProducts.findIndex(
          (item) => item.id === product.id
        );
        if (productIndex > -1) {
          updatedCart[productIndex].quantity =
            updatedCart[productIndex].quantity - 1;
        }
        setCartProducts(updatedCart);
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      }
    },
    [cartProducts]
  );

  const handleClearCart = useCallback(() => {
    setCartProducts(null);
    setCartTotalQuantity(0);
    localStorage.setItem("cartItems", JSON.stringify(null));
  }, [cartProducts]);

  const handleSetPaymentIntent = useCallback(
    (value: string | null) => {
      setPaymentIntent(value);
      localStorage.setItem("paymentIntent", JSON.stringify(value));
    },
    [paymentIntent]
  );

  const handleRemovePaymentIntent = useCallback(() => {
    localStorage.removeItem("paymentIntent");
    setPaymentIntent(null);
  }, [paymentIntent]);

  const value = {
    cartTotalQuantity,
    cartTotalAmount,
    cartSubtotal,
    cartTotalDmc,
    cartProducts,
    paymentIntent,
    handleAddProductToCart,
    handleRemoveProductFromCart,
    handleCartQuantityIncrease,
    handleCartQuantityDecrease,
    handleClearCart,
    handleSetPaymentIntent,
    handleRemovePaymentIntent,
  };
  return <CartContext.Provider value={value} {...props} />;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error("useCart must be used within a CartContextProvider");
  }

  return context;
};
