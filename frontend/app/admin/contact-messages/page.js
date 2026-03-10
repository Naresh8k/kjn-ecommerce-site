'use client';
import { useEffect, useState } from 'react';
import { MessageSquare, Phone, Mail, Clock, Trash2, CheckCheck, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const STATUS_META = {
  UNREAD:   { label: 'Unread',    bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  READ:     { label: 'Read',      bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  REPLIED:  { label: 'Replied',   bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  ARCHIVED: { label: 'Archived',  bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400'   },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.UNREAD;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${m.bg} ${m.text} ${m.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function MessageModal({ msg, onClose, onUpdate, onDelete }) {
  const [status, setStatus] = useState(msg.status);
  const [adminNote, setAdminNote] = useState(msg.adminNote || '');
  const [adminReply, setAdminReply] = useState(msg.adminReply || '');
  const [saving, setSaving] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(msg.id, { status, adminNote });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async () => {
    if (!adminReply.trim()) return;
    setSendingReply(true);
    try {
      const result = await onUpdate(msg.id, { adminReply: adminReply.trim() });
      if (result?.emailSent) {
        toast.success('Reply sent to ' + msg.email);
      } else if (!msg.email) {
        toast.success('Reply saved. No email - contact via phone: ' + msg.phone);
      } else {
        toast.success('Reply saved.');
      }
      onClose();
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900">{msg.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(msg.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Contact info */}
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${msg.phone}`} className="inline-flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded-xl hover:bg-green-100 transition-colors">
              <Phone className="w-3.5 h-3.5" /> {msg.phone}
            </a>
            {msg.email && (
              <a href={`mailto:${msg.email}`} className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                <Mail className="w-3.5 h-3.5" /> {msg.email}
              </a>
            )}
            {!msg.email && (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl">
                <Mail className="w-3.5 h-3.5" /> No email provided
              </span>
            )}
          </div>

          {/* Original message */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Message</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          </div>

          {/* Reply section */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Reply to Customer</p>
              {msg.email ? (
                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Email will be sent to {msg.email}</span>
              ) : (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">No email - reply saved only</span>
              )}
            </div>
            {msg.adminReply && (
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Previous Reply {msg.repliedAt ? `(${new Date(msg.repliedAt).toLocaleDateString('en-IN')})` : ''}</p>
                <p className="text-xs text-gray-600 whitespace-pre-wrap">{msg.adminReply}</p>
              </div>
            )}
            <textarea
              rows={4}
              value={adminReply}
              onChange={e => setAdminReply(e.target.value)}
              placeholder="Type your reply here... it will be emailed to the customer."
              className="w-full px-3 py-2.5 text-sm border-2 border-green-200 rounded-xl focus:border-green-600 focus:outline-none resize-none bg-white"
            />
            <button
              onClick={handleSendReply}
              disabled={sendingReply || !adminReply.trim()}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {sendingReply ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
              ) : (
                <><Mail className="w-4 h-4" /> {msg.email ? 'Send Reply via Email' : 'Save Reply'}</>
              )}
            </button>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(STATUS_META).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    status === s ? 'bg-gray-900 text-white border-gray-900 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Private admin note */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Private Note (admin only)</p>
            <textarea
              rows={2}
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Add a private note (visible only to admins)..."
              className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-900 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-primary-900 hover:bg-primary-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors"
            >
              {saving ? 'Saving...' : 'Save Status & Note'}
            </button>
            <button
              onClick={() => { onDelete(msg.id); onClose(); }}
              className="w-11 h-11 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [selected, setSelected] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      const r = await api.get(`/admin/contact-messages?${params}`);
      setMessages(r.data.data || []);
      setUnreadCount(r.data.unreadCount ?? 0);
      setPagination(r.data.pagination || { total: 0, totalPages: 1 });
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [page, statusFilter]);

  const handleOpen = async (msg) => {
    setSelected(msg);
    if (msg.status === 'UNREAD') {
      try {
        await api.patch(`/admin/contact-messages/${msg.id}`, { status: 'READ' });
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'READ' } : m));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch { /* silent */ }
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const r = await api.patch(`/admin/contact-messages/${id}`, data);
      const updated = r.data.data;
      setMessages(prev => prev.map(m => m.id === id ? updated : m));
      if (data.status && messages.find(m => m.id === id)?.status === 'UNREAD' && data.status !== 'UNREAD') {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      if (!data.adminReply) toast.success('Updated');
      return r.data;
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/admin/contact-messages/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const TABS = [
    { value: '', label: 'All' },
    { value: 'UNREAD', label: 'Unread' },
    { value: 'READ', label: 'Read' },
    { value: 'REPLIED', label: 'Replied' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-gray-900">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Messages submitted via the Contact Us form</p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full">
            <MessageSquare className="w-4 h-4" /> {unreadCount} unread
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const m = tab.value ? STATUS_META[tab.value] : null;
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                isActive
                  ? (m ? `${m.bg} ${m.text} ${m.border} shadow-sm` : 'bg-gray-900 text-white border-gray-900 shadow-sm')
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {m && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? m.dot : 'bg-gray-300'}`} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">From</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-8 bg-gray-100 rounded-lg animate-pulse" /></td></tr>
                ))
              ) : messages.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No messages found</td></tr>
              ) : (
                messages.map(msg => (
                  <tr
                    key={msg.id}
                    className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${msg.status === 'UNREAD' ? 'bg-amber-50/30' : ''}`}
                    onClick={() => handleOpen(msg)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-700">{msg.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <p className={`text-sm ${msg.status === 'UNREAD' ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-700'}`}>{msg.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600"><Phone className="w-3 h-3 text-gray-400" />{msg.phone}</div>
                        {msg.email && <div className="flex items-center gap-1.5 text-xs text-gray-400"><Mail className="w-3 h-3" />{msg.email}</div>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-xs text-gray-600 truncate">{msg.message}</p>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={msg.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpen(msg)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => { handleUpdate(msg.id, { status: 'REPLIED' }); }}
                          className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center transition-colors"
                          title="Mark as Replied"
                        >
                          <CheckCheck className="w-3.5 h-3.5 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {pagination.totalPages} . {pagination.total} messages</p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" /></button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" /></button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <MessageModal
          msg={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
