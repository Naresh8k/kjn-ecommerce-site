'use client';
import { useState } from 'react';
import { Upload, X, Image, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// Paste this into: src/components/admin/ProductImageUploader.js
// Then import into admin/products/page.js when editing a product

export default function ProductImageUploader({ productId, existingImages = [], onImagesUpdated }) {
  const [images, setImages] = useState(existingImages);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);

  // Add image by URL (no Cloudinary needed)
  const handleAddByUrl = async () => {
    if (!urlInput.trim()) { toast.error('Enter image URL'); return; }
    setUploading(true);
    try {
      const res = await api.post(`/products/${productId}/images`, {
        url: urlInput.trim(),
        sortOrder: images.length,
        isDefault: images.length === 0,
      });
      const updated = [...images, res.data.data];
      setImages(updated);
      setUrlInput('');
      toast.success('Image added!');
      if (onImagesUpdated) onImagesUpdated(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add image');
    } finally { setUploading(false); }
  };

  // Upload file (if your backend has /products/:id/images/upload endpoint)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sortOrder', images.length);
      formData.append('isDefault', images.length === 0);

      const res = await api.post(`/products/${productId}/images/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updated = [...images, res.data.data];
      setImages(updated);
      toast.success('Image uploaded!');
      if (onImagesUpdated) onImagesUpdated(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (imgId) => {
    try {
      await api.delete(`/products/${productId}/images/${imgId}`);
      const updated = images.filter(i => i.id !== imgId);
      setImages(updated);
      toast.success('Image removed');
      if (onImagesUpdated) onImagesUpdated(updated);
    } catch { toast.error('Failed to delete image'); }
  };

  const handleSetDefault = async (imgId) => {
    try {
      await api.put(`/products/${productId}/images/${imgId}/default`);
      const updated = images.map(i => ({ ...i, isDefault: i.id === imgId }));
      setImages(updated);
      toast.success('Default image set!');
      if (onImagesUpdated) onImagesUpdated(updated);
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #e5e7eb' }}>
      <h4 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
        Product Images
      </h4>

      {/* Current images */}
      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10, marginBottom: 16 }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: img.isDefault ? '2px solid #1B5E20' : '1px solid #e5e7eb' }}>
              <img src={img.url} alt="Product" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
              {img.isDefault && (
                <div style={{ position: 'absolute', top: 4, left: 4, background: '#1B5E20', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>
                  DEFAULT
                </div>
              )}
              <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
                {!img.isDefault && (
                  <button onClick={() => handleSetDefault(img.id)}
                    style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Set as default">⭐</button>
                )}
                <button onClick={() => handleDelete(img.id)}
                  style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(220,38,38,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X style={{ width: 12, color: 'white' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add by URL */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#374151' }}>
          Add Image by URL
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" style={{ flex: 1, fontSize: 13 }}
            placeholder="https://image.cdn.../product.jpg"
            value={urlInput} onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddByUrl()} />
          <button onClick={handleAddByUrl} disabled={uploading || !urlInput.trim()}
            className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
            {uploading ? '...' : '+ Add'}
          </button>
        </div>
      </div>

      {/* Upload file */}
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#374151' }}>
          Or Upload Image File (max 5MB)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 10, border: '2px dashed #d1d5db', background: '#f9fafb', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseOver={e => e.currentTarget.style.borderColor = '#1B5E20'}
          onMouseOut={e => e.currentTarget.style.borderColor = '#d1d5db'}>
          <Upload style={{ width: 18, color: '#6B7280' }} />
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>
            {uploading ? 'Uploading...' : 'Click to upload or drag & drop'}
          </span>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}