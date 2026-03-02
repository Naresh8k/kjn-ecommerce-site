'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Plus, CreditCard, Truck, ChevronRight,
  CheckCircle, Lock, ShoppingBag, Package,
  X, Home, User, Phone,
  ArrowRight, Shield, RotateCcw, Zap, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';

const RS = String.fromCharCode(8377);
function fmt(n) { return Number(n).toLocaleString('en-IN'); }

const STEPS = ['Cart', 'Delivery', 'Payment', 'Confirm'];

const ADDRESS_FIELDS = [
  { key: 'name',    label: 'Full Name',          placeholder: 'Recipient name',   type: 'text', half: true,  req: true  },
  { key: 'phone',   label: 'Phone Number',        placeholder: '10-digit number',  type: 'tel',  half: true,  req: true  },
  { key: 'line1',   label: 'Address Line 1',      placeholder: 'House no, Street', type: 'text', half: false, req: true  },
  { key: 'line2',   label: 'Landmark (Optional)', placeholder: 'Area, Landmark',   type: 'text', half: false, req: false },
  { key: 'city',    label: 'City',                placeholder: 'City',             type: 'text', half: true,  req: true  },
  { key: 'state',   label: 'State',               placeholder: 'State',            type: 'text', half: true,  req: true  },
  { key: 'pincode', label: 'Pincode',             placeholder: '6-digit pincode',  type: 'text', half: true,  req: true  },
];

const PAYMENT_OPTIONS = [
  {
    id: 'ONLINE',
    label: 'Pay Online',
    sub: 'UPI, Cards, Net Banking',
    badge: '1.5% OFF',
    badgeColor: 'bg-orange-500',
    Icon: CreditCard,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'COD',
    label: 'Cash on Delivery',
    sub: 'Pay when your order arrives',
    badge: null,
    Icon: Package,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

const TRUST = [
  { Icon: Shield,    text: '100% Secure Payments' },
  { Icon: RotateCcw, text: '7-Day Easy Returns'    },
  { Icon: Zap,       text: 'Fast Order Processing' },
];

function StepBar({ current }) {
  return (
    <div className="hidden sm:flex items-center justify-center mb-8">
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ' + (
                done   ? 'bg-primary-900 text-white' :
                active ? 'bg-primary-900 text-white ring-4 ring-primary-900/20' :
                         'bg-gray-200 text-gray-400'
              )}>
                {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={'text-[10px] font-bold mt-1 ' + (active || done ? 'text-primary-900' : 'text-gray-400')}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={'h-0.5 w-16 sm:w-20 mx-1 mb-4 rounded-full transition-all ' + (done ? 'bg-primary-900' : 'bg-gray-200')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ number, title, Icon, children, complete, summary }) {
  return (
    <div className={'bg-white rounded-2xl border transition-all ' + (complete ? 'border-primary-900/30' : 'border-gray-100')}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
        <div className={'w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ' + (complete ? 'bg-primary-900 text-white' : 'bg-gray-100 text-gray-500')}>
          {complete ? <CheckCircle className="w-3.5 h-3.5" /> : number}
        </div>
        <div className="flex-1 flex items-center gap-1.5">
          <Icon className={'w-3.5 h-3.5 ' + (complete ? 'text-primary-900' : 'text-gray-400')} />
          <h2 className={'font-heading font-extrabold text-sm ' + (complete ? 'text-primary-900' : 'text-gray-900')}>
            {title}
          </h2>
        </div>
        {complete && summary && (
          <span className="text-xs text-gray-400 font-semibold hidden sm:block truncate max-w-[160px]">{summary}</span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart, clearCart } = useCartStore();
  const { isAuthenticated, user }      = useAuthStore();

  const [addresses,       setAddresses]       = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod,   setPaymentMethod]   = useState('ONLINE');
  const [loading,         setLoading]         = useState(true);
  const [placing,         setPlacing]         = useState(false);
  const [showAddForm,     setShowAddForm]     = useState(false);
  const [savingAddr,      setSavingAddr]      = useState(false);
  const [newAddress,      setNewAddress]      = useState({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: ''
  });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const init = async () => {
      await fetchCart();
      const res   = await api.get('/user/addresses');
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
    setSavingAddr(true);
    try {
      const res     = await api.post('/user/addresses', { ...newAddress, isDefault: addresses.length === 0 });
      const updated = [...addresses, res.data.data];
      setAddresses(updated);
      setSelectedAddress(res.data.data.id);
      setShowAddForm(false);
      setNewAddress({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
      toast.success('Address saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddr(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setPlacing(true);
    try {
      const res   = await api.post('/orders', { shippingAddressId: selectedAddress, paymentMethod, notes: '' });
      const order = res.data.data;

      if (paymentMethod === 'COD') {
        toast.success('Order placed successfully!');
        clearCart();
        router.push('/orders/' + order.orderId);
        return;
      }

      const payRes = await api.post('/payments/create-order', { orderId: order.orderId });
      const { razorpayOrderId, amount, key, orderNumber } = payRes.data.data;

      const options = {
        key,
        amount,
        currency: 'INR',
        name: 'KJN Shop',
        description: 'Order #' + orderNumber,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId: order.orderId,
            });
            toast.success('Payment successful! Order confirmed.');
            clearCart();
            router.push('/orders/' + order.orderId);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: user?.name, contact: user?.phone },
        theme:   { color: '#1B5E20' },
        modal:   { ondismiss: () => { setPlacing(false); toast.error('Payment cancelled'); } },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        new window.Razorpay(options).open();
      } else {
        toast.error('Payment gateway not loaded. Please refresh.');
        setPlacing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setPlacing(false);
    }
  };

  const selectedAddr  = addresses.find(a => a.id === selectedAddress);
  const prepaidSaving = paymentMethod === 'ONLINE' ? Math.round((cart?.subtotal || 0) * 0.015) : 0;
  const finalTotal    = Math.round((cart?.totalAmount || 0) - prepaidSaving);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-900 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading checkout...</p>
      </div>
    </div>
  );

  if (!cart || cart.items?.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
      </div>
      <div className="text-center">
        <h2 className="font-heading font-extrabold text-xl text-gray-900 mb-1">Your cart is empty</h2>
        <p className="text-sm text-gray-500">Add items to your cart before checking out.</p>
      </div>
      <Link href="/products"
        className="flex items-center gap-2 px-6 py-3 bg-primary-900 hover:bg-primary-800 text-white font-bold rounded-xl transition-colors">
        <ShoppingBag className="w-4 h-4" /> Browse Products
      </Link>
    </div>
  );

  const addrSummary = selectedAddr ? selectedAddr.line1 + ', ' + selectedAddr.city : null;

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="min-h-screen bg-gray-50 pb-32 md:pb-10">

        {/* ?? Top bar ?? */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Link href="/cart" className="hover:text-primary-900 font-semibold transition-colors flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" /> Cart
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="font-bold text-gray-800">Checkout</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
              <Lock className="w-3 h-3 text-green-500" />
              Secure Checkout
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pt-6">
          <StepBar current={1} />

          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ???????????? LEFT COLUMN ???????????? */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* ?? 1. Delivery Address ?? */}
              <SectionCard
                number={1}
                title="Delivery Address"
                Icon={MapPin}
                complete={!!selectedAddress}
                summary={addrSummary}
              >
                {/* Add address toggle */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 font-semibold">
                    {addresses.length === 0
                      ? 'No saved addresses'
                      : addresses.length + ' address' + (addresses.length > 1 ? 'es' : '') + ' saved'}
                  </p>
                  <button
                    onClick={() => setShowAddForm(v => !v)}
                    className={'flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border-2 transition-all ' + (
                      showAddForm
                        ? 'border-red-200 text-red-500 bg-red-50'
                        : 'border-primary-900 text-primary-900 hover:bg-primary-50'
                    )}
                  >
                    {showAddForm
                      ? <><X className="w-3 h-3" /> Cancel</>
                      : <><Plus className="w-3 h-3" /> Add Address</>}
                  </button>
                </div>

                {/* Add address form */}
                {showAddForm && (
                  <form
                    onSubmit={handleSaveAddress}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-3.5 mb-3 space-y-3"
                  >
                    <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5 text-primary-900" /> New Delivery Address
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {ADDRESS_FIELDS.map(({ key, label, placeholder, type, half, req }) => (
                        <div key={key} className={half ? 'col-span-1' : 'col-span-2'}>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                            {label}{req && <span className="text-red-400 ml-0.5">*</span>}
                          </label>
                          <input
                            type={type}
                            placeholder={placeholder}
                            value={newAddress[key]}
                            onChange={e => {
                              let v = e.target.value;
                              if (key === 'phone')   v = v.replace(/\D/g, '').slice(0, 10);
                              if (key === 'pincode') v = v.replace(/\D/g, '').slice(0, 6);
                              setNewAddress({ ...newAddress, [key]: v });
                            }}
                            required={req}
                            className="w-full px-2.5 py-2 text-xs border-2 border-gray-200 rounded-lg focus:border-primary-900 focus:outline-none transition-colors bg-white font-medium"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={savingAddr}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary-900 hover:bg-primary-800 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        {savingAddr
                          ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                          : <><CheckCircle className="w-3 h-3" /> Save Address</>}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 border-2 border-gray-200 hover:border-gray-300 text-xs font-bold text-gray-600 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Address list */}
                {addresses.length === 0 && !showAddForm ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-semibold">No saved addresses yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add a new address to continue</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => {
                      const selected = selectedAddress === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr.id)}
                          className={'flex items-start gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ' + (
                            selected
                              ? 'border-primary-900 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          )}
                        >
                          {/* Radio dot */}
                          <div className={'mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ' + (
                            selected ? 'border-primary-900 bg-primary-900' : 'border-gray-300'
                          )}>
                            {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-xs text-gray-900">{addr.name}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">{addr.phone}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-extrabold bg-primary-900 text-white px-1.5 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium leading-snug mt-0.5">
                              {addr.line1}{addr.line2 ? ', ' + addr.line2 : ''},{' '}
                              {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              {/* ?? 2. Payment Method ?? */}
              <SectionCard
                number={2}
                title="Payment Method"
                Icon={CreditCard}
                complete={true}
                summary={paymentMethod === 'ONLINE' ? 'Pay Online (1.5% off)' : 'Cash on Delivery'}
              >
                <div className="space-y-2">
                  {PAYMENT_OPTIONS.map(({ id, label, sub, badge, badgeColor, Icon: PIcon, iconBg, iconColor }) => {
                    const active = paymentMethod === id;
                    return (
                      <div
                        key={id}
                        onClick={() => setPaymentMethod(id)}
                        className={'flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all ' + (
                          active
                            ? 'border-primary-900 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        )}
                      >
                        {/* Radio */}
                        <div className={'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ' + (
                          active ? 'border-primary-900 bg-primary-900' : 'border-gray-300'
                        )}>
                          {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        {/* Icon */}
                        <div className={'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ' + iconBg}>
                          <PIcon className={'w-4 h-4 ' + iconColor} />
                        </div>
                        {/* Label */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-gray-900">{label}</span>
                            {badge && (
                              <span className={'text-[10px] font-extrabold text-white px-1.5 py-0.5 rounded-full ' + badgeColor}>
                                {badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium">{sub}</p>
                          {id === 'ONLINE' && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {['UPI', 'Visa', 'Mastercard', 'NetBanking'].map(m => (
                                <span key={m} className="text-[10px] font-bold bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {paymentMethod === 'ONLINE' && (
                  <div className="mt-2.5 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <Zap className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <p className="text-xs font-bold text-green-700">
                      You save {RS}{fmt(prepaidSaving)} extra with online payment!
                    </p>
                  </div>
                )}
              </SectionCard>
            </div>

          
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 lg:sticky lg:top-[72px] space-y-4">

              {/* Summary card */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gray-400" />
                  <h2 className="font-heading font-extrabold text-base text-gray-900">
                    Order Summary
                  </h2>
                  <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.totalItems} items
                  </span>
                </div>

                {/* Coupon applied chip */}
                {cart.couponCode && (
                  <div className="mx-5 mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <Tag className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-green-600 font-semibold">Coupon applied</p>
                      <p className="text-xs font-extrabold text-green-700 tracking-wide">{cart.couponCode}</p>
                    </div>
                    <span className="text-xs font-extrabold text-green-700">
                      -{RS}{fmt(cart.couponDiscount)}
                    </span>
                  </div>
                )}

                {/* Items list */}
                <div className="px-5 py-4 space-y-3 max-h-56 overflow-y-auto">
                  {cart.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.image || ''}
                          alt={item.name}
                          onError={e => { e.target.style.display = 'none'; }}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                        />
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-900 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                        {item.variant && <p className="text-[10px] text-gray-400 mt-0.5">{item.variant}</p>}
                      </div>
                      <span className="text-sm font-extrabold text-gray-900 flex-shrink-0">
                        {RS}{fmt(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div className="px-5 pb-5 pt-3 border-t border-gray-100 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-semibold">Subtotal</span>
                    <span className="font-bold text-gray-900">{RS}{fmt(cart.subtotal)}</span>
                  </div>

                  {cart.couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        Coupon ({cart.couponCode})
                      </span>
                      <span className="font-bold text-green-600">-{RS}{fmt(cart.couponDiscount)}</span>
                    </div>
                  )}

                  {prepaidSaving > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-semibold">Prepaid Discount (1.5%)</span>
                      <span className="font-bold text-green-600">-{RS}{fmt(prepaidSaving)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-semibold">Delivery</span>
                    <span className={'font-bold ' + (cart.shippingCharge === 0 ? 'text-green-600' : 'text-gray-900')}>
                      {cart.shippingCharge === 0 ? 'FREE' : RS + cart.shippingCharge}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-semibold">GST (included)</span>
                    <span className="text-gray-400 font-semibold">{RS}{Number(cart.gstAmount || 0).toFixed(2)}</span>
                  </div>

                  <div className="border-t-2 border-gray-100 pt-3 flex justify-between items-center">
                    <span className="font-heading font-extrabold text-base text-gray-900">Total Payable</span>
                    <span className="font-heading font-extrabold text-xl text-primary-900">
                      {RS}{fmt(finalTotal)}
                    </span>
                  </div>

                  {(cart.couponDiscount > 0 || prepaidSaving > 0) && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-center">
                      <p className="text-xs font-extrabold text-green-700">
                        You save {RS}{fmt((cart.couponDiscount || 0) + prepaidSaving)} on this order!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Place order button */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing || !selectedAddress}
                  className={'w-full py-4 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ' + (
                    !selectedAddress
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : placing
                      ? 'bg-primary-900 text-white opacity-70 cursor-wait'
                      : 'bg-primary-900 hover:bg-primary-800 text-white shadow-sm hover:shadow-md'
                  )}
                >
                  {placing ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {paymentMethod === 'COD' ? 'Place Order' : 'Pay ' + RS + fmt(finalTotal) + ' Securely'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {!selectedAddress && (
                  <p className="text-xs text-center text-orange-500 font-semibold">
                    Please select or add a delivery address to continue
                  </p>
                )}

                {/* Trust badges */}
                <div className="space-y-2">
                  {TRUST.map(({ Icon: TIcon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-xs text-gray-500 font-semibold">
                      <TIcon className="w-3.5 h-3.5 text-primary-900 flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>

                <p className="text-center text-[10px] text-gray-400 font-semibold">
                  Protected by 256-bit SSL encryption
                </p>
              </div>

              {/* Delivery address preview */}
              {selectedAddr && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-primary-900" />
                    <p className="text-xs font-extrabold text-gray-800">Delivering to</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{selectedAddr.name}</p>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                    {selectedAddr.line1}{selectedAddr.line2 ? ', ' + selectedAddr.line2 : ''},{' '}
                    {selectedAddr.city}, {selectedAddr.state} - {selectedAddr.pincode}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold mt-1">{selectedAddr.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 lg:hidden z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Total Payable</p>
            <p className="font-heading font-extrabold text-lg text-primary-900">{RS}{fmt(finalTotal)}</p>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={placing || !selectedAddress}
            className={'flex-1 py-3.5 font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ' + (
              !selectedAddress || placing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-900 hover:bg-primary-800 text-white'
            )}
          >
            {placing
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing...</>
              : <><Lock className="w-3.5 h-3.5" /> {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}</>
            }
          </button>
        </div>
      </div>
    </>
  );
}