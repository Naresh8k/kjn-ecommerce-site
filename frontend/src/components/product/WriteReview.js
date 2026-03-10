'use client';
import { useState, useRef, useEffect } from 'react';
import { Star, Camera, X, CheckCircle, ShoppingBag, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function WriteReview({ productId, onReviewAdded, initialRating = 0 }) {
const { isAuthenticated } = useAuthStore();
const [eligibility, setEligibility] = useState(null); // null = checking
const [rating, setRating] = useState(initialRating);
const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !productId) { setEligibility(null); return; }
    api.get(`/reviews/can-review/${productId}`)
      .then(r => setEligibility(r.data))
      .catch(() => setEligibility({ canReview: false, reason: 'error' }));
  }, [isAuthenticated, productId]);

  if (!isAuthenticated) return (
    <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200">
      <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-sm font-bold text-gray-700 mb-1">Login to Rate &amp; Review</p>
      <p className="text-xs text-gray-400 mb-4">Only customers with delivered orders can write reviews.</p>
      <Link href="/login" className="inline-block bg-green-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
        Login
      </Link>
    </div>
  );

  if (eligibility === null) return (
    <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center border border-gray-200 min-h-[80px]">
      <div className="w-6 h-6 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin" />
    </div>
  );

  if (eligibility.reason === 'already_reviewed') return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
      <p className="font-extrabold text-green-800 text-base">You&apos;ve already reviewed this product</p>
      <p className="text-xs text-gray-500 mt-1">Thank you for your feedback!</p>
    </div>
  );

  if (!eligibility.canReview) return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
      <ShoppingBag className="w-12 h-12 text-amber-400 mx-auto mb-3" />
      <p className="font-extrabold text-amber-800 text-base">Purchase Required to Review</p>
      <p className="text-sm text-gray-500 mt-2 mb-4">
        Only customers who have purchased and received this product can leave a review.
      </p>
      <Link href="/products" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors">
        Shop Now
      </Link>
    </div>
  );

  if (submitted) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
      <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-3" />
      <p className="font-extrabold text-green-800 text-lg">Review Submitted!</p>
      <p className="text-sm text-gray-500 mt-1">Your review will appear here after approval.</p>
    </div>
  );

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - images.length;
    if (remaining <= 0) { toast.error('Maximum 5 images allowed'); return; }
    const newImgs = files.slice(0, remaining).map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newImgs]);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImages(prev => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_, i) => i !== idx); });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('productId', productId);
      fd.append('rating', rating);
      if (title) fd.append('title', title);
      if (body) fd.append('body', body);
      images.forEach(img => fd.append('images', img.file));
      const res = await api.post('/reviews', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Review submitted! Pending approval.');
      setSubmitted(true);
      if (onReviewAdded) onReviewAdded(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  const activeRating = hover || rating;

  return (
    <div className="bg-white border-2 border-green-100 rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <h3 className="font-extrabold text-lg text-gray-900">Rate &amp; Review this Product</h3>
        <span className="text-xs bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Verified Purchase
        </span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Your Rating *</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} type="button"
                onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95 p-0.5">
                <Star className="w-10 h-10 transition-all duration-100"
                  style={{ fill: star <= activeRating ? '#F59E0B' : 'none', color: star <= activeRating ? '#F59E0B' : '#D1D5DB' }} />
              </button>
            ))}
            {activeRating > 0 && (
              <span className="ml-3 text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                {LABELS[activeRating]}
              </span>
            )}
          </div>
        </div>
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Review Title</label>
          <input type="text" placeholder="Summarize your experience..."
            value={title} onChange={e => setTitle(e.target.value)} maxLength={120}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:border-green-600 focus:outline-none font-medium text-gray-800 placeholder-gray-400 transition-colors" />
        </div>
        {/* Body */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
          <textarea placeholder="Share your experience — quality, usability, value for money..."
            value={body} onChange={e => setBody(e.target.value)} maxLength={2000} rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:border-green-600 focus:outline-none resize-none font-medium text-gray-800 placeholder-gray-400 transition-colors" />
          <p className="text-xs text-gray-400 mt-1 text-right">{body.length}/2000</p>
        </div>
        {/* Images */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Add Photos <span className="text-gray-400 font-normal text-xs">(optional, up to 5)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 group flex-shrink-0">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 flex flex-col items-center justify-center gap-1 transition-all flex-shrink-0">
                <Camera className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-400 font-semibold">Add Photo</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
          </div>
        </div>
        <button type="submit" disabled={submitting || rating === 0}
          className="px-8 py-3.5 bg-green-800 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl transition-colors shadow-sm">
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
