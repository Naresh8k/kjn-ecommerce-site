'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Plus, CreditCard, Truck, ChevronRight, CheckCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const init = async () => {
      await fetchCart();
      const res = await api.get('/user/addresses');
      const addrs = res.data.data || [];
      setAddresses(addrs);
      const def = addrs.find(a => a.isDefault) || addrs[0];
      if (def) setSelectedAddress(def.id);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await api.post('/user/addresses', { ...newAddress, isDefault: addresses.length === 0 });
      const updated = [...addresses, res.data.data];
      setAddresses(updated);
      setSelectedAddress(res.data.data.id);
      setShowAddAddress(false);
      setNewAddress({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
      toast.success('Address saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally { setSavingAddress(false); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setPlacing(true);
    try {
      const res = await api.post('/orders', {
        shippingAddressId: selectedAddress,
        paymentMethod,
        notes: '',
      });
      const order = res.data.data;

      if (paymentMethod === 'COD') {
        toast.success('Order placed successfully! 🎉');
        clearCart();
        router.push(`/orders/${order.orderId}`);
        return;
      }

      // Razorpay flow
      const payRes = await api.post('/payments/create-order', { orderId: order.orderId });
      const { razorpayOrderId, amount, key, orderNumber } = payRes.data.data;

      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'KJN Shop',
        description: `Order #${orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.orderId,
            });
            toast.success('Payment successful! Order confirmed 🎉');
            clearCart();
            router.push(`/orders/${order.orderId}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: user?.name, contact: user?.phone },
        theme: { color: '#1B5E20' },
        modal: { ondismiss: () => { setPlacing(false); toast.error('Payment cancelled'); } },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error('Payment gateway not loaded. Please refresh.');
        setPlacing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setPlacing(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #E8F5E9', borderTop: '4px solid #1B5E20', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!cart || cart.items?.length === 0) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 64 }}>🛒</div>
      <h2 style={{ fontFamily: 'Sora', fontWeight: 800 }}>Your cart is empty</h2>
      <Link href="/" className="btn btn-primary">Continue Shopping</Link>
    </div>
  );

  return (
    <>
      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px 0 80px' }}>
        <div className="container">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
            <Link href="/cart" style={{ color: '#1B5E20', fontWeight: 600 }}>Cart</Link>
            <ChevronRight style={{ width: 14 }} />
            <span style={{ fontWeight: 700, color: '#1F2937' }}>Checkout</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>

            {/* LEFT — Address + Payment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Delivery Address */}
              <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: '#E8F5E9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin style={{ width: 18, color: '#1B5E20' }} />
                    </div>
                    <h2 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>Delivery Address</h2>
                  </div>
                  <button onClick={() => setShowAddAddress(!showAddAddress)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, border: '2px solid #1B5E20', background: 'transparent', color: '#1B5E20', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    <Plus style={{ width: 14 }} /> Add New
                  </button>
                </div>

                {/* Add Address Form */}
                {showAddAddress && (
                  <form onSubmit={handleSaveAddress} style={{ background: '#f9fafb', borderRadius: 12, padding: '20px', marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>New Address</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        { key: 'name', label: 'Full Name', placeholder: 'Recipient name' },
                        { key: 'phone', label: 'Phone', placeholder: '10-digit number' },
                        { key: 'line1', label: 'Address Line 1', placeholder: 'House/Street', full: true },
                        { key: 'line2', label: 'Line 2 (Optional)', placeholder: 'Area/Landmark', full: true },
                        { key: 'city', label: 'City', placeholder: 'City' },
                        { key: 'state', label: 'State', placeholder: 'State' },
                        { key: 'pincode', label: 'Pincode', placeholder: '6-digit pincode' },
                      ].map(({ key, label, placeholder, full }) => (
                        <div key={key} style={{ gridColumn: full ? 'span 2' : 'span 1' }}>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{label}</label>
                          <input className="input" placeholder={placeholder}
                            value={newAddress[key]}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (key === 'phone') val = val.replace(/\D/g, '').slice(0, 10);
                              if (key === 'pincode') val = val.replace(/\D/g, '').slice(0, 6);
                              setNewAddress({ ...newAddress, [key]: val });
                            }}
                            required={key !== 'line2'}
                            style={{ fontSize: 13 }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <button type="submit" disabled={savingAddress} className="btn btn-primary btn-sm">
                        {savingAddress ? 'Saving...' : 'Save Address'}
                      </button>
                      <button type="button" onClick={() => setShowAddAddress(false)} className="btn btn-outline btn-sm">Cancel</button>
                    </div>
                  </form>
                )}

                {/* Address List */}
                {addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>
                    <MapPin style={{ width: 40, height: 40, margin: '0 auto 8px', color: '#e5e7eb' }} />
                    <p style={{ fontSize: 14 }}>No addresses saved. Add one above.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {addresses.map((addr) => (
                      <div key={addr.id} onClick={() => setSelectedAddress(addr.id)}
                        style={{
                          padding: '16px', borderRadius: 12, border: `2px solid ${selectedAddress === addr.id ? '#1B5E20' : '#e5e7eb'}`,
                          background: selectedAddress === addr.id ? '#E8F5E9' : 'white',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedAddress === addr.id ? '#1B5E20' : '#d1d5db'}`, background: selectedAddress === addr.id ? '#1B5E20' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                            {selectedAddress === addr.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: 14 }}>{addr.name}</span>
                              <span style={{ fontSize: 13, color: '#6B7280' }}>{addr.phone}</span>
                              {addr.isDefault && <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>Default</span>}
                            </div>
                            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                              {addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}, {addr.city}, {addr.state} – {addr.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, background: '#E8F5E9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard style={{ width: 18, color: '#1B5E20' }} />
                  </div>
                  <h2 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16 }}>Payment Method</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { id: 'ONLINE', label: 'Pay Online', sub: 'UPI, Cards, Net Banking — Get 1.5% extra discount!', icon: '💳', badge: '1.5% OFF' },
                    { id: 'COD', label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: '💵', badge: null },
                  ].map(({ id, label, sub, icon, badge }) => (
                    <div key={id} onClick={() => setPaymentMethod(id)}
                      style={{
                        padding: '16px', borderRadius: 12, border: `2px solid ${paymentMethod === id ? '#1B5E20' : '#e5e7eb'}`,
                        background: paymentMethod === id ? '#E8F5E9' : 'white',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${paymentMethod === id ? '#1B5E20' : '#d1d5db'}`, background: paymentMethod === id ? '#1B5E20' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {paymentMethod === id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <span style={{ fontSize: 22 }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
                          {badge && <span style={{ background: '#FF6F00', color: 'white', padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>{badge}</span>}
                        </div>
                        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Order Summary */}
            <div style={{ background: 'white', borderRadius: 16, padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: 'fit-content' }}>
              <h2 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Order Summary</h2>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {cart.items?.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={item.image || '/placeholder.jpg'} alt={item.name}
                        style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                      <span style={{ position: 'absolute', top: -6, right: -6, background: '#1B5E20', color: 'white', width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</p>
                      {item.variant && <p style={{ fontSize: 11, color: '#9CA3AF' }}>{item.variant}</p>}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#1B5E20', flexShrink: 0 }}>₹{item.totalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Subtotal', value: `₹${cart.subtotal?.toLocaleString('en-IN')}` },
                  { label: 'Discount', value: cart.couponDiscount > 0 ? `-₹${cart.couponDiscount}` : '₹0', green: cart.couponDiscount > 0 },
                  ...(paymentMethod === 'ONLINE' ? [{ label: 'Prepaid Discount (1.5%)', value: `-₹${(cart.subtotal * 0.015).toFixed(0)}`, green: true }] : []),
                  { label: 'Shipping', value: cart.shippingCharge === 0 ? 'FREE' : `₹${cart.shippingCharge}`, green: cart.shippingCharge === 0 },
                ].map(({ label, value, green }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: green ? '#16A34A' : '#1F2937' }}>{value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 15 }}>Total Payable</span>
                  <span style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 20, color: '#1B5E20' }}>
                    ₹{paymentMethod === 'ONLINE'
                      ? Math.round(cart.totalAmount - cart.subtotal * 0.015).toLocaleString('en-IN')
                      : cart.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button onClick={handlePlaceOrder}
                disabled={placing || !selectedAddress}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 20, fontSize: 15, opacity: (!selectedAddress) ? 0.6 : 1 }}>
                {placing ? 'Processing...' : (
                  <>
                    <Lock style={{ width: 16 }} />
                    {paymentMethod === 'COD' ? 'Place Order' : 'Pay & Place Order'}
                  </>
                )}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 10 }}>
                🔒 Secured by 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}