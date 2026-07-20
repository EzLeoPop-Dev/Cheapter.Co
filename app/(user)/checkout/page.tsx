"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { Lock, Truck, CreditCard, ShieldCheck, RefreshCcw, QrCode, HandCoins } from "lucide-react";
import { useRouter } from "next/navigation";

type CheckoutItem = {
  id: number;
  bookId: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};

const GUEST_CART_KEY = "cheapterCart";
const LATEST_ORDER_KEY = "cheapterLatestOrder";

type Address = {
  id: number;
  name: string;
  phone: string;
  streetAddress: string;
  city: string;
  zipCode: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>('new');
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [newAddress, setNewAddress] = useState({ name: "", phone: "", streetAddress: "", city: "", zipCode: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCheckout() {
      const [profileResponse, cartResponse] = await Promise.all([
        fetch("/api/profile", { cache: "no-store", credentials: "include" }),
        fetch("/api/cart", { cache: "no-store", credentials: "include" }),
      ]);

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        const loadedAddresses = profile.addresses || [];
        setAddresses(loadedAddresses);
        setSelectedAddressId(loadedAddresses[0]?.id ?? "new");
      }

      if (cartResponse.ok) {
        const cart = await cartResponse.json();
        setCartItems(cart.items || []);
        return;
      }

      const rawCart = localStorage.getItem(GUEST_CART_KEY);
      setCartItems(rawCart ? JSON.parse(rawCart) : []);
    }

    loadCheckout();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = deliveryMethod === "express" ? 12 : 0;
  const taxes = Number((subtotal * 0.08).toFixed(2));
  const total = subtotal + shippingFee + taxes;

  const handleCompletePurchase = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingMethod: deliveryMethod,
          paymentMethod,
          addressId: selectedAddressId === "new" ? undefined : selectedAddressId,
          address: selectedAddressId === "new" ? newAddress : undefined,
          items: cartItems,
        }),
      });

      if (response.status === 401) {
        const guestResponse = await fetch("/api/orders/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shippingMethod: deliveryMethod,
            paymentMethod,
            address: selectedAddressId === "new" ? newAddress : addresses.find((address) => address.id === selectedAddressId),
            items: cartItems,
          }),
        });
        if (guestResponse.ok) {
          const data = await guestResponse.json();
          localStorage.setItem(LATEST_ORDER_KEY, JSON.stringify(data.order));
          localStorage.removeItem(GUEST_CART_KEY);
          router.push("/tracking");
        }
        return;
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(LATEST_ORDER_KEY, JSON.stringify(data.order));
        localStorage.removeItem(GUEST_CART_KEY);
        router.push("/tracking");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col font-sans text-stone-800">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-12 flex flex-col lg:flex-row gap-12 lg:gap-16">

        {/* Left Column - Forms */}
        <div className="flex-1 flex flex-col gap-12">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Secure Checkout
          </h1>

          {/* 1 Shipping Address */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#e6dbcc] text-amber-900 flex items-center justify-center text-xs font-bold">1</div>
              <h2 className="text-xl font-serif text-stone-800">Shipping Address</h2>
            </div>

            <div className="flex flex-col gap-4 pl-0 sm:pl-9">
              {addresses.length === 0 ? (
                <div className="p-4 bg-stone-50 rounded border border-stone-200 text-stone-500 text-sm mb-2 text-center">
                  You have no saved addresses. Please fill in your shipping details below.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`flex flex-col gap-1 p-4 rounded border cursor-pointer transition-all ${selectedAddressId === addr.id ? "border-[#8b5a45] bg-[#fbf9f6]" : "border-stone-200 bg-white hover:border-stone-300"}`}
                    >
                      <span className="font-bold text-sm text-stone-800">{addr.name} <span className="font-normal text-stone-500 text-xs ml-2">{addr.phone}</span></span>
                      <span className="text-xs text-stone-500">{addr.streetAddress}</span>
                      <span className="text-xs text-stone-500">{addr.city}, {addr.zipCode}</span>
                    </div>
                  ))}

                  <div
                    onClick={() => setSelectedAddressId('new')}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded border border-dashed cursor-pointer transition-all min-h-[100px] ${selectedAddressId === 'new' ? "border-[#8b5a45] bg-[#fbf9f6] text-[#8b5a45]" : "border-stone-300 bg-stone-50 text-stone-500 hover:border-stone-400 hover:bg-stone-100"}`}
                  >
                    <span className="text-sm font-bold">+ Add New Address</span>
                  </div>
                </div>
              )}

              {(selectedAddressId === 'new' || addresses.length === 0) && (
                <div className="flex flex-col gap-4 p-5 border border-stone-200 rounded bg-white relative">
                  <h3 className="text-sm font-bold text-stone-800 mb-2 border-b border-stone-100 pb-2">New Address Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-stone-500">Full Name</label>
                      <input type="text" value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} placeholder="Jane Doe" className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-stone-500">Phone Number</label>
                      <input type="tel" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value.replace(/[^0-9]/g, '')})} placeholder="08XXXXXXXX" maxLength={10} className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-stone-500">Street Address</label>
                    <input type="text" value={newAddress.streetAddress} onChange={(e) => setNewAddress({...newAddress, streetAddress: e.target.value})} placeholder="123 Paper St, Apt 4B" className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-stone-500">City</label>
                      <input type="text" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} placeholder="Portland" className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-stone-500">ZIP Code</label>
                      <input type="text" value={newAddress.zipCode} onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value.replace(/[^0-9]/g, '')})} placeholder="97204" maxLength={5} className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button onClick={async () => {
                      const response = await fetch("/api/address", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: "Shipping", ...newAddress }) });
                      if (response.ok) {
                        const saved = await response.json();
                        setAddresses([...addresses, saved]);
                        setSelectedAddressId(saved.id);
                      }
                    }} className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-2.5 rounded text-sm font-bold transition-colors">
                      Save Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 2 Delivery Method */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#e6dbcc] text-amber-900 flex items-center justify-center text-xs font-bold">2</div>
              <h2 className="text-xl font-serif text-stone-800">Delivery Method</h2>
            </div>

            <div className="flex flex-col gap-3 pl-0 sm:pl-9">
              <div
                onClick={() => setDeliveryMethod("standard")}
                className={`flex items-center justify-between p-4 rounded border cursor-pointer transition-colors ${deliveryMethod === "standard" ? "border-[#8b5a45] bg-[#fbf9f6]" : "border-stone-200 bg-white"}`}
              >
                <div className="flex items-center gap-4">
                  <Truck className="text-stone-400" size={20} />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-stone-800">Standard Shipping</span>
                    <span className="text-xs text-stone-500">3-5 Business Days</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-stone-800">Free</span>
              </div>

              <div
                onClick={() => setDeliveryMethod("express")}
                className={`flex items-center justify-between p-4 rounded border cursor-pointer transition-colors ${deliveryMethod === "express" ? "border-[#8b5a45] bg-[#fbf9f6]" : "border-stone-200 bg-white"}`}
              >
                <div className="flex items-center gap-4">
                  <Truck className="text-stone-400" size={20} />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-stone-800">Express Delivery</span>
                    <span className="text-xs text-stone-500">1-2 Business Days</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-stone-800">$12.00</span>
              </div>
            </div>
          </section>

          {/* 3 Payment */}
          <section className="flex flex-col gap-6 mb-12 lg:mb-0">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#e6dbcc] text-amber-900 flex items-center justify-center text-xs font-bold">3</div>
              <h2 className="text-xl font-serif text-stone-800">Payment</h2>
            </div>

            <div className="flex flex-col gap-4 pl-0 sm:pl-9">
              {/* Payment Method Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded border cursor-pointer transition-all ${paymentMethod === "card" ? "border-[#8b5a45] bg-[#fbf9f6] text-[#8b5a45]" : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"}`}
                >
                  <CreditCard size={24} />
                  <span className="text-xs font-bold">Credit Card</span>
                </div>
                <div
                  onClick={() => setPaymentMethod("promptpay")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded border cursor-pointer transition-all ${paymentMethod === "promptpay" ? "border-[#8b5a45] bg-[#fbf9f6] text-[#8b5a45]" : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"}`}
                >
                  <QrCode size={24} />
                  <span className="text-xs font-bold">QR PromptPay</span>
                </div>
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded border cursor-pointer transition-all ${paymentMethod === "cod" ? "border-[#8b5a45] bg-[#fbf9f6] text-[#8b5a45]" : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"}`}
                >
                  <HandCoins size={24} />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                </div>
              </div>

              {/* Payment Forms based on selection */}
              {paymentMethod === "card" && (
                <div className="flex flex-col gap-4 bg-white p-6 rounded border border-stone-100 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-stone-500">Name on Card</label>
                    <input type="text" placeholder="Jane Doe" className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                  </div>
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs text-stone-500">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9 ]/g, '') }} className="w-full border border-stone-300 rounded pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-stone-500">Expiry Date</label>
                      <input type="text" placeholder="MM/YY" maxLength={5} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9/]/g, '') }} className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-stone-500">CVC</label>
                      <input type="text" placeholder="123" maxLength={4} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '') }} className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "promptpay" && (
                <div className="flex flex-col items-center justify-center gap-4 bg-white p-8 rounded border border-stone-100 mt-2">
                  <div className="w-40 h-40 bg-stone-100 rounded-lg flex items-center justify-center border-2 border-dashed border-stone-300">
                    <QrCode size={64} className="text-stone-300" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-stone-800">Scan to Pay</h3>
                    <p className="text-sm text-stone-500 mt-1">Please scan the QR code using your mobile banking app to complete the payment.</p>
                  </div>
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="flex items-start gap-4 bg-white p-6 rounded border border-stone-100 mt-2">
                  <div className="p-3 bg-amber-50 rounded-full text-amber-700 shrink-0">
                    <HandCoins size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800">Pay when you receive</h3>
                    <p className="text-sm text-stone-500 mt-1">You can pay in cash to our courier when your order arrives at your doorstep.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-[#fcfbf9] rounded-xl p-6 sm:p-8 flex flex-col gap-6 sticky top-24 border border-stone-100 shadow-sm">
            <h2 className="text-xl font-bold text-stone-800">Order Summary</h2>

            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-stone-200 rounded shrink-0 overflow-hidden shadow-sm">
                    <img src={item.imageUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop"} alt="Book" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-stone-800 leading-tight">{item.title}</h3>
                    <p className="text-xs text-stone-500 font-serif italic mt-1">{item.author}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-stone-500">Qty: {item.quantity}</span>
                      <span className="text-sm font-bold text-stone-800">฿{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-stone-200 my-2"></div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-stone-800 font-medium">฿{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Shipping</span>
                <span className="text-stone-800 font-medium">{deliveryMethod === "express" ? "฿12.00" : "Free"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Taxes</span>
                <span className="text-stone-800 font-medium">฿{taxes.toFixed(2)}</span>
              </div>
            </div>

            <div className="w-full h-px bg-stone-200 my-1"></div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800">Total</span>
              <span className="text-lg font-bold text-stone-900">
                ฿{total.toFixed(2)}
              </span>
            </div>

            <button onClick={handleCompletePurchase} disabled={isSubmitting || cartItems.length === 0} className="w-full bg-[#8b5a45] hover:bg-[#724a38] text-white py-4 rounded font-bold text-sm transition-colors mt-2 shadow-sm disabled:opacity-60">
              {isSubmitting ? "Completing..." : "Complete Purchase"}
            </button>

            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <ShieldCheck size={14} />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <RefreshCcw size={14} />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
