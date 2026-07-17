"use client";

import { useState } from "react";
import { Navbar } from "../../components/Navbar";
import { Lock, Truck, CreditCard, ShieldCheck, RefreshCcw, QrCode, HandCoins } from "lucide-react";

export default function CheckoutPage() {
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [addresses, setAddresses] = useState([
    { id: 1, name: "Jane Doe", phone: "0812345678", street: "123 Paper St, Apt 4B", city: "Portland", zip: "97204" },
    { id: 2, name: "John Smith", phone: "0898765432", street: "456 Office Rd, Floor 2", city: "Seattle", zip: "98101" }
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>(1);

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
                      <span className="text-xs text-stone-500">{addr.street}</span>
                      <span className="text-xs text-stone-500">{addr.city}, {addr.zip}</span>
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
                      <input type="text" placeholder="Jane Doe" className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-stone-500">Phone Number</label>
                      <input type="tel" placeholder="08XXXXXXXX" maxLength={10} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '') }} className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-stone-500">Street Address</label>
                    <input type="text" placeholder="123 Paper St, Apt 4B" className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-stone-500">City</label>
                      <input type="text" placeholder="Portland" className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-stone-500">ZIP Code</label>
                      <input type="text" placeholder="97204" maxLength={5} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '') }} className="w-full border border-stone-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#8b5a45] bg-white" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button className="bg-stone-800 hover:bg-stone-900 text-white px-6 py-2.5 rounded text-sm font-bold transition-colors">
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
              {/* Item 1 */}
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-stone-200 rounded shrink-0 overflow-hidden shadow-sm">
                  <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop" alt="Book" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-stone-800 leading-tight">The Architecture of Silence</h3>
                  <p className="text-xs text-stone-500 font-serif italic mt-1">Elena Rostova</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-stone-500">Qty: 1</span>
                    <span className="text-sm font-bold text-stone-800">$24.00</span>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-stone-200 rounded shrink-0 overflow-hidden shadow-sm">
                  <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200&auto=format&fit=crop" alt="Book" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-stone-800 leading-tight">Notes on Wabi-Sabi</h3>
                  <p className="text-xs text-stone-500 font-serif italic mt-1">Kenji Sato</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-stone-500">Qty: 1</span>
                    <span className="text-sm font-bold text-stone-800">$18.50</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-stone-200 my-2"></div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Subtotal</span>
                <span className="text-stone-800 font-medium">$42.50</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Shipping</span>
                <span className="text-stone-800 font-medium">{deliveryMethod === "express" ? "$12.00" : "Free"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Taxes</span>
                <span className="text-stone-800 font-medium">$3.40</span>
              </div>
            </div>

            <div className="w-full h-px bg-stone-200 my-1"></div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800">Total</span>
              <span className="text-lg font-bold text-stone-900">
                ${(42.50 + 3.40 + (deliveryMethod === "express" ? 12.00 : 0)).toFixed(2)}
              </span>
            </div>

            <button className="w-full bg-[#8b5a45] hover:bg-[#724a38] text-white py-4 rounded font-bold text-sm transition-colors mt-2 shadow-sm">
              Complete Purchase
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
