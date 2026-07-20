"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { Lock, Truck, CreditCard, ShieldCheck, RefreshCcw, QrCode, HandCoins, Ticket, Percent, ChevronRight } from "lucide-react";
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

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Modal Coupon States
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [tempSelectedCoupon, setTempSelectedCoupon] = useState<any>(null);
  const [modalCouponCode, setModalCouponCode] = useState("");
  const [modalCouponError, setModalCouponError] = useState("");
  const [modalCouponSuccess, setModalCouponSuccess] = useState("");

  const loadAvailableCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setAvailableCoupons(data.promotions || []);
      }
    } catch (err) {
      console.error("Failed to load coupons", err);
    }
  };

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
    loadAvailableCoupons();
  }, []);

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode.trim()) return;

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode.trim())}`);
      if (res.status === 444) {
        setCouponError("ไม่พบรหัสคูปองนี้");
        setAppliedCoupon(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setCouponError(data.message || "คูปองไม่สามารถใช้งานได้");
        setAppliedCoupon(null);
        return;
      }

      const coupon = await res.json();
      const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (currentSubtotal < Number(coupon.minPurchase)) {
        setCouponError(`ยอดซื้อขั้นต่ำไม่ถึง ฿${Number(coupon.minPurchase)}`);
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(coupon);
      setCouponSuccess(`ประยุกต์ใช้คูปอง "${coupon.name}" สำเร็จ!`);
    } catch (err) {
      setCouponError("เกิดข้อผิดพลาดในการตรวจสอบคูปอง");
      setAppliedCoupon(null);
    }
  };

  const handleSelectCouponConfirm = () => {
    if (tempSelectedCoupon) {
      const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (currentSubtotal < Number(tempSelectedCoupon.minPurchase)) {
        alert(`ยอดซื้อขั้นต่ำไม่ถึง ฿${Number(tempSelectedCoupon.minPurchase)}`);
        return;
      }
      setAppliedCoupon(tempSelectedCoupon);
      setCouponCode(tempSelectedCoupon.code);
      setCouponSuccess(`ประยุกต์ใช้คูปอง "${tempSelectedCoupon.name}" สำเร็จ!`);
      setCouponError("");
    } else {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponSuccess("");
      setCouponError("");
    }
    setShowCouponModal(false);
  };

  const handleModalApplyCoupon = async () => {
    setModalCouponError("");
    setModalCouponSuccess("");
    if (!modalCouponCode.trim()) return;

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(modalCouponCode.trim())}`);
      if (res.status === 444) {
        setModalCouponError("ไม่พบรหัสคูปองนี้");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setModalCouponError(data.message || "คูปองไม่สามารถใช้งานได้");
        return;
      }

      const coupon = await res.json();
      const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (currentSubtotal < Number(coupon.minPurchase)) {
        setModalCouponError(`ยอดซื้อขั้นต่ำไม่ถึง ฿${Number(coupon.minPurchase)}`);
        return;
      }

      setTempSelectedCoupon(coupon);
      if (!availableCoupons.some(c => c.id === coupon.id)) {
        setAvailableCoupons([coupon, ...availableCoupons]);
      }
      setModalCouponSuccess(`เลือกคูปอง "${coupon.name}" สำเร็จ!`);
    } catch (err) {
      setModalCouponError("เกิดข้อผิดพลาดในการตรวจสอบคูปอง");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate discount based on coupon type
  let discountAmount = 0;
  let isFreeShipping = false;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percent") {
      discountAmount = Number((subtotal * (Number(appliedCoupon.value) / 100)).toFixed(2));
    } else if (appliedCoupon.discountType === "fixed") {
      discountAmount = Number(appliedCoupon.value);
    } else if (appliedCoupon.discountType === "freeship") {
      isFreeShipping = true;
    }
  }

  const shippingFee = isFreeShipping ? 0 : (deliveryMethod === "express" ? 12 : 0);
  const taxes = Number((Math.max(0, subtotal - discountAmount) * 0.08).toFixed(2));
  const total = Math.max(0, subtotal - discountAmount + shippingFee + taxes);

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
          couponCode: appliedCoupon?.code || undefined,
          discountAmount: discountAmount || undefined,
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
            couponCode: appliedCoupon?.code || undefined,
            discountAmount: discountAmount || undefined,
          }),
        });
        if (guestResponse.ok) {
          const data = await guestResponse.json();
          localStorage.setItem(LATEST_ORDER_KEY, JSON.stringify(data.order));
          localStorage.removeItem(GUEST_CART_KEY);
          router.push("/tracking");
        } else {
          const data = await guestResponse.json();
          alert(data.error || "เกิดข้อผิดพลาดในการสั่งซื้อ");
        }
        return;
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(LATEST_ORDER_KEY, JSON.stringify(data.order));
        localStorage.removeItem(GUEST_CART_KEY);
        router.push("/tracking");
      } else {
        const data = await response.json();
        alert(data.error || "เกิดข้อผิดพลาดในการสั่งซื้อ");
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
              
              {/* Promo Discount Row */}
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm text-[#bc876e]">
                  <span>ส่วนลดคูปอง ({appliedCoupon?.code})</span>
                  <span className="font-bold">-฿{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Shipping</span>
                <span className="text-stone-800 font-medium">
                  {isFreeShipping ? (
                    <span className="text-[#4a7c59] font-bold">Free (คูปองส่งฟรี)</span>
                  ) : deliveryMethod === "express" ? (
                    "฿12.00"
                  ) : (
                    "Free"
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Taxes</span>
                <span className="text-stone-800 font-medium">฿{taxes.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Code Input Field */}
            <div className="border-t border-stone-200 pt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600">Cheapter Voucher</span>
                <button 
                  onClick={() => {
                    setTempSelectedCoupon(appliedCoupon);
                    setModalCouponCode("");
                    setModalCouponError("");
                    setModalCouponSuccess("");
                    setShowCouponModal(true);
                  }}
                  className="text-xs text-[#8b5a45] hover:text-[#724a38] font-bold flex items-center gap-0.5"
                >
                  เลือกโค้ดส่วนลด <ChevronRight size={14} />
                </button>
              </div>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#fbf9f6] border border-[#e6dbcc] rounded p-2.5">
                  <div className="flex items-center gap-2">
                    <Ticket className="text-[#8b5a45]" size={16} />
                    <span className="text-xs font-bold font-mono text-[#8b5a45] bg-[#fdfbf9] px-1.5 py-0.5 rounded border border-[#e6dbcc]">{appliedCoupon.code}</span>
                    <span className="text-xs text-stone-600 font-medium">{appliedCoupon.name}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode("");
                      setCouponSuccess("");
                      setCouponError("");
                    }}
                    className="text-stone-400 hover:text-stone-600 text-xs font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    setTempSelectedCoupon(null);
                    setModalCouponCode("");
                    setModalCouponError("");
                    setModalCouponSuccess("");
                    setShowCouponModal(true);
                  }}
                  className="border border-dashed border-stone-300 rounded p-3 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Ticket className="text-stone-400" size={16} />
                    <span className="text-xs text-stone-500 font-medium">กดเลือกหรือกรอกโค้ดส่วนลด</span>
                  </div>
                  <ChevronRight size={14} className="text-stone-400" />
                </div>
              )}
              {couponError && <span className="text-xs text-red-500 font-medium">{couponError}</span>}
              {couponSuccess && <span className="text-xs text-green-600 font-medium">{couponSuccess}</span>}
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

      {/* Shopee-like Coupon Selection Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCouponModal(false)}>
          <div className="bg-[#fdfbf9] rounded-[2rem] border border-white/80 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                🎟️ เลือกโค้ดส่วนลดของ Cheapter
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="text-stone-400 hover:text-stone-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-stone-50">
              {/* Add Coupon Code Area */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col gap-2">
                <span className="text-xs font-bold text-stone-700">เพิ่มโค้ด</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={modalCouponCode}
                    onChange={(e) => setModalCouponCode(e.target.value.toUpperCase())}
                    placeholder="เพิ่มโค้ดส่วนลดของ Cheapter"
                    className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#8b5a45] uppercase font-mono bg-white"
                  />
                  <button
                    onClick={handleModalApplyCoupon}
                    className="bg-[#8b5a45] hover:bg-[#724a38] text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors"
                  >
                    ใช้โค้ด
                  </button>
                </div>
                {modalCouponError && <span className="text-xs text-red-500 font-medium">{modalCouponError}</span>}
                {modalCouponSuccess && <span className="text-xs text-green-600 font-medium">{modalCouponSuccess}</span>}
              </div>

              {/* Free Shipping Coupons Group */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-500 block px-1">โค้ดส่งฟรี</span>
                <div className="space-y-3">
                  {availableCoupons.filter(c => c.discountType === 'freeship').length === 0 ? (
                    <div className="text-center py-6 text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">ไม่มีโค้ดส่งฟรีขณะนี้</div>
                  ) : (
                    availableCoupons.filter(c => c.discountType === 'freeship').map((coupon) => {
                      const isSelectable = subtotal >= Number(coupon.minPurchase);
                      const isChecked = tempSelectedCoupon?.id === coupon.id;
                      return (
                        <div 
                          key={coupon.id} 
                          onClick={() => isSelectable && setTempSelectedCoupon(coupon)}
                          className={`flex items-stretch rounded-2xl border overflow-hidden bg-white shadow-sm cursor-pointer transition-all ${isChecked ? 'border-[#8b5a45]' : 'border-stone-200'} ${!isSelectable ? 'opacity-60' : 'hover:border-stone-300'}`}
                        >
                          {/* Badge Left */}
                          <div className="w-24 bg-[#e8f5e9] flex flex-col items-center justify-center border-r border-dashed border-stone-200 p-3">
                            <Truck className="text-[#2e7d32] mb-1" size={24} />
                            <span className="text-[10px] font-bold text-[#2e7d32] uppercase">ส่งฟรี</span>
                          </div>
                          {/* Content Middle */}
                          <div className="flex-1 p-4 flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-stone-800">{coupon.name}</h4>
                            <p className="text-[11px] text-[#2e7d32] font-semibold mt-0.5">โค้ดส่งฟรี</p>
                            <p className="text-xs text-stone-500 mt-1">ขั้นต่ำ ฿{Number(coupon.minPurchase)}</p>
                            <p className="text-[10px] text-stone-400 mt-0.5">ใช้ได้ถึง: {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('th-TH') : 'ไม่มีกำหนด'}</p>
                            {!isSelectable && (
                              <p className="text-[10px] text-red-500 font-medium mt-1">ยอดซื้อขั้นต่ำไม่ถึง ฿{Number(coupon.minPurchase)}</p>
                            )}
                          </div>
                          {/* Radio Check Right */}
                          <div className="flex items-center justify-center px-4">
                            <input 
                              type="radio" 
                              name="selectedCoupon"
                              checked={isChecked}
                              disabled={!isSelectable}
                              onChange={() => {}} 
                              className="accent-[#8b5a45] w-4 h-4 cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Discount Coupons Group */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-500 block px-1">โค้ดส่วนลด</span>
                <div className="space-y-3">
                  {availableCoupons.filter(c => c.discountType !== 'freeship').length === 0 ? (
                    <div className="text-center py-6 text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">ไม่มีโค้ดส่วนลดขณะนี้</div>
                  ) : (
                    availableCoupons.filter(c => c.discountType !== 'freeship').map((coupon) => {
                      const isSelectable = subtotal >= Number(coupon.minPurchase);
                      const isChecked = tempSelectedCoupon?.id === coupon.id;
                      return (
                        <div 
                          key={coupon.id} 
                          onClick={() => isSelectable && setTempSelectedCoupon(coupon)}
                          className={`flex items-stretch rounded-2xl border overflow-hidden bg-white shadow-sm cursor-pointer transition-all ${isChecked ? 'border-[#8b5a45]' : 'border-stone-200'} ${!isSelectable ? 'opacity-60' : 'hover:border-stone-300'}`}
                        >
                          {/* Badge Left */}
                          <div className="w-24 bg-[#fff3e0] flex flex-col items-center justify-center border-r border-dashed border-stone-200 p-3">
                            <Percent className="text-[#e65100] mb-1" size={24} />
                            <span className="text-[10px] font-bold text-[#e65100] uppercase">ส่วนลด</span>
                          </div>
                          {/* Content Middle */}
                          <div className="flex-1 p-4 flex flex-col justify-center">
                            <h4 className="text-sm font-bold text-stone-800">{coupon.name}</h4>
                            <p className="text-[11px] text-[#e65100] font-semibold mt-0.5">
                              {coupon.discountType === 'percent' ? `ส่วนลด ${Number(coupon.value)}%` : `ส่วนลด ฿${Number(coupon.value)}`}
                            </p>
                            <p className="text-xs text-stone-500 mt-1">ขั้นต่ำ ฿{Number(coupon.minPurchase)}</p>
                            <p className="text-[10px] text-stone-400 mt-0.5">ใช้ได้ถึง: {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('th-TH') : 'ไม่มีกำหนด'}</p>
                            {!isSelectable && (
                              <p className="text-[10px] text-red-500 font-medium mt-1">ยอดซื้อขั้นต่ำไม่ถึง ฿{Number(coupon.minPurchase)}</p>
                            )}
                          </div>
                          {/* Radio Check Right */}
                          <div className="flex items-center justify-center px-4">
                            <input 
                              type="radio" 
                              name="selectedCoupon"
                              checked={isChecked}
                              disabled={!isSelectable}
                              onChange={() => {}} 
                              className="accent-[#8b5a45] w-4 h-4 cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-white flex justify-end gap-3">
              <button 
                onClick={() => {
                  setTempSelectedCoupon(null);
                  setShowCouponModal(false);
                }} 
                className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold transition-colors text-xs"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSelectCouponConfirm}
                className="px-6 py-2.5 bg-[#d32f2f] hover:bg-[#b71c1c] text-white rounded-xl font-bold transition-colors text-xs"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
