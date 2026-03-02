'use client';
// ─────────────────────────────────────────────────────────────────────────────
// frontend/src/components/admin/ImageUploader.js
//
// Universal image uploader used in:
//   - Admin Products page   → endpoint="product-image"
//   - Admin Banners page    → endpoint="banner"
//   - Admin Brands page     → endpoint="brand-logo"
//   - Admin Categories page → endpoint="category-image"
//   - Admin Blogs page      → endpoint="blog-cover"
//
// Usage:
//   <ImageUploader
//     endpoint="product-image"         ← which upload route to call
//     value={imageUrl}                 ← current image URL (for edit mode)
//     onChange={(url) => setForm(...)} ← called with new URL after upload
//     label="Product Image"
//     hint="Recommended: 800×800px"
//   />
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '@/lib/api';

export default function ImageUploader({
  endpoint   = 'product-image',
  value      = '',
  onChange,
  label      = 'Image',
  hint       = '',
  required   = false,
  className  = '',
}) {
  const [preview,   setPreview]   = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const inputRef = useRef(null);

  // ── Upload ─────────────────────────────────────────────────
  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    // Validate
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a JPEG, PNG, WebP or GIF image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB');
      return;
    }

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError('');
    setSuccess(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post(`/upload/${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          // progress available if needed
        },
      });

      // Handle base64 response
      const base64Image = res.data.data.image;
      setPreview(base64Image);
      setSuccess(true);
      if (onChange) onChange(base64Image);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try again.');
      setPreview(value || '');
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localUrl);
    }
  }, [endpoint, onChange, value]);

  // ── Drag & Drop ────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  // ── Remove ─────────────────────────────────────────────────
  const handleRemove = () => {
    setPreview('');
    setError('');
    setSuccess(false);
    if (inputRef.current) inputRef.current.value = '';
    if (onChange) onChange('');
  };

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
          {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
          {hint && <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 6 }}>({hint})</span>}
        </label>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#1B5E20' : error ? '#EF4444' : preview ? '#86EFAC' : '#D1D5DB'}`,
          borderRadius: 14,
          padding: preview ? 12 : '28px 20px',
          background: dragOver ? '#F0FDF4' : preview ? '#F9FAFB' : '#FAFAFA',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
          minHeight: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {uploading ? (
          /* Loading state */
          <div style={{ textAlign: 'center' }}>
            <Loader style={{ width: 32, height: 32, color: '#1B5E20', animation: 'spin 1s linear infinite', marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Uploading & optimising...</p>
          </div>
        ) : preview ? (
          /* Preview state */
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
              <img
                src={preview}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setPreview('')}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {success && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <CheckCircle style={{ width: 14, color: '#16A34A' }} />
                  <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 700 }}>Uploaded successfully</span>
                </div>
              )}
              <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>Click to replace image</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', margin: '2px 0 0' }}>or drag a new file here</p>
            </div>
            {/* Remove button */}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); handleRemove(); }}
              style={{ width: 28, height: 28, borderRadius: '50%', background: '#FEE2E2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <X style={{ width: 14, color: '#DC2626' }} />
            </button>
          </div>
        ) : (
          /* Empty state */
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <Upload style={{ width: 20, color: '#1B5E20' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>
              {dragOver ? 'Drop image here' : 'Click to upload or drag & drop'}
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>JPEG, PNG, WebP · Max 10 MB</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <AlertCircle style={{ width: 14, color: '#DC2626', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#DC2626' }}>{error}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={e => handleUpload(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </div>
  );
}