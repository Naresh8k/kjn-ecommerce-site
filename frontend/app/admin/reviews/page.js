'use client';
import { useEffect, useState } from 'react';
import { Star, CheckCircle, Trash2, Eye, Search, Filter, Image as ImageIcon, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';

function StarRow({ rating, size = 'sm' }) {
  const px = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={px}
          style={{ fill: s <= rating ? '#F59E0B' : 'none', color: s <= rating ? '#F59E0B' : '#D1D5DB' }} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');    
  const [search, setSearch] = useState('');
  const [zoomedImg, setZoomedImg] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [approving, setApproving] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      if (tab === 'pending') {
        const r = await api.get('/reviews/admin/pending');
        setReviews(r.data.data || []);
      } else {
        // fetch all approved reviews for all products  use a broad search
        const r = await api.get('/reviews/admin/pending');
        // We load pending by default; for approved we'd need a separate endpoint.
        // Until one is added, show empty with a note.
        setReviews([]);
      }
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [tab]);

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      await api.put(`/reviews/admin/${id}/approve`);
      toast.success('Review approved and published!');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch { toast.error('Failed to approve'); }
    finally { setApproving(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    setDeleting(id);
    try {
      await api.delete(`/reviews/admin/${id}`);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const filtered = reviews.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.user?.name?.toLowerCase().includes(s) ||
      r.product?.name?.toLowerCase().includes(s) ||
      r.title?.toLowerCase().includes(s) ||
      r.body?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Moderate customer ratings and reviews</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-amber-700">{reviews.length} pending</span>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 self-start">
          {[
            { key: 'pending', label: 'Pending Approval' },
            { key: 'approved', label: 'Approved' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by customer, product, content..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          {tab === 'approved' ? (
            <>
              <CheckCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold text-sm">Approved reviews are visible on product pages.</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold text-sm">No pending reviews - all caught up!</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex gap-4">
                  {/* Product image */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                    {review.product?.image
                      ? <img src={review.product.image} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-300" /></div>}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Product + date */}
                    <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                      <div>
                        <Link href={`/products/${review.product?.slug}`} target="_blank"
                          className="text-xs font-bold text-green-700 hover:underline line-clamp-1">
                          {review.product?.name}
                        </Link>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {tab === 'pending' && (
                          <button onClick={() => handleApprove(review.id)} disabled={approving === review.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-800 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50">
                            <CheckCircle className="w-3.5 h-3.5" />
            {approving === review.id ? 'Approving...' : 'Approve'}
                          </button>
                        )}
                        <button onClick={() => handleDelete(review.id)} disabled={deleting === review.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />
            {deleting === review.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    {/* Reviewer + stars */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0">
                        {review.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{review.user?.name}</span>
                      <StarRow rating={review.rating} />
                      <span className="text-xs font-bold text-gray-400">{review.rating}/5</span>
                      <span className="flex items-center gap-0.5 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                        <CheckCircle className="w-2.5 h-2.5" /> Verified Purchase
                      </span>
                    </div>

                    {/* Review content */}
                    {review.title && (
                      <p className="text-sm font-bold text-gray-800 mb-1">{review.title}</p>
                    )}
                    {review.body && (
                      <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
                    )}

                    {/* Review images */}
                    {review.images?.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {review.images.map((img, idx) => (
                          <button key={idx} onClick={() => setZoomedImg(img.url)}
                            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-green-400 transition-all flex-shrink-0 group">
                            <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomedImg(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
            <X className="w-5 h-5" />
          </button>
          <img src={zoomedImg} alt="Review" className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
