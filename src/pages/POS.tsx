import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard,
  DollarSign,
  Smartphone,
  Calculator
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

const sampleProducts: Product[] = [
  { id: "1", name: "Coffee", price: 4.50, category: "Beverages", stock: 50 },
  { id: "2", name: "Sandwich", price: 8.99, category: "Food", stock: 25 },
  { id: "3", name: "Juice", price: 3.25, category: "Beverages", stock: 30 },
  { id: "4", name: "Salad", price: 12.50, category: "Food", stock: 15 },
  { id: "5", name: "Tea", price: 3.75, category: "Beverages", stock: 40 },
  { id: "6", name: "Pastry", price: 5.99, category: "Food", stock: 20 },
  { id: "7", name: "Smoothie", price: 6.25, category: "Beverages", stock: 22 },
  { id: "8", name: "Burger", price: 15.99, category: "Food", stock: 18 },
];

const categories = ["All", "Food", "Beverages"];

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash");

  const filteredProducts = selectedCategory === "All" 
    ? sampleProducts 
    : sampleProducts.filter(product => product.category === selectedCategory);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category
      }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTax = () => {
    return getTotal() * 0.1; // 10% tax
  };

  const getFinalTotal = () => {
    return getTotal() + getTax();
  };

  const clearCart = () => {
    setCart([]);
  };

  const processPayment = () => {
    if (cart.length === 0) return;
    
    // Here you would integrate with payment processing
    alert(`Payment of $${getFinalTotal().toFixed(2)} processed via ${paymentMethod}`);
    clearCart();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Products Section */}
      <div className="flex-1 p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Point of Sale</h1>
            <p className="text-muted-foreground">Select products to add to cart</p>
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-foreground">{product.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {product.stock}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <p className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 border-l border-border bg-card">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Current Order</h2>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Cart Items */}
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No items in cart
              </p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-foreground">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <>
              <Separator />
              
              {/* Order Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Tax (10%):</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total:</span>
                  <span>${getFinalTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Payment Method</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Cash
                  </Button>
                  <Button
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Card
                  </Button>
                  <Button
                    variant={paymentMethod === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaymentMethod("mobile")}
                  >
                    <Smartphone className="h-4 w-4 mr-1" />
                    Mobile
                  </Button>
                </div>
              </div>

              {/* Checkout Button */}
              <Button 
                className="w-full h-12 text-lg bg-pos-total text-pos-total-foreground hover:bg-pos-total/90"
                onClick={processPayment}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Process Payment
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}