'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import useAuthStore from '@/store/useAuthStore';

export default function WriteReview({ productId, onReviewAdded }) {
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isAuthenticated) return (
    <div style={{ background: '#f9fafb', borderRadius: 12, padding: '20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>Please login to write a review</p>
      <a href="/login" className="btn btn-primary btn-sm">Login to Review</a>
    </div>
  );

  if (submitted) return (
    <div style={{ background: '#E8F5E9', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
      <p style={{ fontWeight: 700, color: '#1B5E20', fontSize: 15 }}>Review submitted successfully!</p>
      <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Thank you for your feedback.</p>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/reviews', { productId, rating, title, body });
      toast.success('Review submitted!');
      setSubmitted(true);
      if (onReviewAdded) onReviewAdded(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ background: 'white', border: '2px solid #E8F5E9', borderRadius: 14, padding: '24px' }}>
      <h3 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Write a Review</h3>

      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#374151' }}>
            Your Rating *
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <Star style={{
                  width: 32, height: 32,
                  fill: star <= (hover || rating) ? '#F59E0B' : 'none',
                  color: star <= (hover || rating) ? '#F59E0B' : '#D1D5DB',
                  transition: 'all 0.15s',
                }} />
              </button>
            ))}
            {rating > 0 && (
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, alignSelf: 'center', marginLeft: 8 }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#374151' }}>
            Review Title
          </label>
          <input className="input" placeholder="Summarize your experience..."
            value={title} onChange={e => setTitle(e.target.value)}
            style={{ fontSize: 13 }} />
        </div>

        {/* Body */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#374151' }}>
            Your Review
          </label>
          <textarea className="input" placeholder="Tell others about your experience with this product..."
            value={body} onChange={e => setBody(e.target.value)}
            style={{ minHeight: 100, resize: 'vertical', fontSize: 13 }} />
        </div>

        <button type="submit" disabled={submitting || rating === 0} className="btn btn-primary"
          style={{ opacity: rating === 0 ? 0.6 : 1 }}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}