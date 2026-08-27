import React, { useState, useMemo } from 'react';
import {
  Package,
  MapPin,
  ChevronDown,
  ShoppingBag,
  Phone,
  MessageSquare,
  Trash2,
  AlertTriangle,
  Loader2,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  ReceiptText,
  FileText,
  Download
} from 'lucide-react';
import { Order } from '../types';
import { getOrderWhatsAppUrl } from '../services/emailService';
import { deleteFirestoreOrder, clearAllUserOrders } from '../services/supabaseService';
import { OrderTrackingTimeline } from './OrderTrackingTimeline';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';

interface OrderHistoryViewProps {
  orders: Order[];
  onOpenOrderModal?: (order: Order) => void;
  onOpenShop: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  onOpenShop
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const handleDirectDownloadPDF = async (order: Order) => {
    try {
      setDownloadingInvoiceId(order.id);
      await downloadInvoicePDF(order);
    } catch (err) {
      console.error('Error generating PDF invoice:', err);
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      const isDelivered = order.status === 'delivered';
      const isCancelled = order.status === 'cancelled';
      const isActive = !isDelivered && !isCancelled;

      if (filterTab === 'active' && !isActive) return false;
      if (filterTab === 'delivered' && !isDelivered) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = String(order.id).toLowerCase().includes(query);
        const matchesItems = order.items.some((item) =>
          (item.product?.name || '').toLowerCase().includes(query) ||
          (item.product?.brand || '').toLowerCase().includes(query)
        );
        const matchesArea = (order.area || '').toLowerCase().includes(query);
        return matchesId || matchesItems || matchesArea;
      }

      return true;
    });
  }, [orders, filterTab, searchQuery]);

  const activeCount = useMemo(
    () => orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length,
    [orders]
  );
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === 'delivered').length,
    [orders]
  );

  const handleDeleteSingleOrder = async (order: Order) => {
    try {
      setDeletingOrderId(order.id);
      await deleteFirestoreOrder(order.id);
      setOrderToDelete(null);
      if (expandedOrderId === order.id) {
        setExpandedOrderId(null);
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Failed to delete the order. Please try again.');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleClearAllOrders = async () => {
    try {
      setIsClearingAll(true);
      await clearAllUserOrders();
      setConfirmClearAll(false);
      setExpandedOrderId(null);
    } catch (err) {
      console.error('Failed to clear order history:', err);
      alert('Failed to clear order history. Please try again.');
    } finally {
      setIsClearingAll(false);
    }
  };

  const printOrderInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
            <strong>${item.product?.name || 'Electrical Item'}</strong><br/>
            <span style="color: #64748b; font-size: 11px;">Brand: ${item.product?.brand || 'Giriraj Power'} ${item.selectedColor ? ' | Color: ' + item.selectedColor : ''}</span>
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px;">₹${(item.product?.price || 0).toLocaleString('en-IN')}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; font-weight: bold;">₹${((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}</td>
        </tr>
      `
      )
      .join('');

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.id} - Giriraj Power & Construction</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; }
          .container { max-width: 720px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; }
          .badge { display: inline-block; background: #fef08a; color: #713f12; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f8fafc; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .totals { margin-left: auto; width: 280px; font-size: 13px; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
          .totals-total { font-size: 16px; font-weight: 900; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 8px; }
          .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 16px; }
          @media print { body { padding: 0; } .container { border: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1 class="title">GIRIRAJ POWER & CONSTRUCTION</h1>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Kolkata Electrical Depot & Fast Dispatch Hub</div>
              <div style="font-size: 11px; color: #94a3b8;">GSTIN: 19ABCDE1234F1Z5 • Support: +91 87774 00280</div>
            </div>
            <div style="text-align: right;">
              <span class="badge">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
              <div style="font-size: 14px; font-weight: bold; margin-top: 6px;">Tax Invoice #${order.id}</div>
              <div style="font-size: 11px; color: #64748b;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <strong>Billed To:</strong><br/>
              ${order.customerName}<br/>
              ${order.address}<br/>
              ${order.area}, Kolkata – ${order.pincode}<br/>
              Phone: ${order.phone}
            </div>
            <div style="text-align: right;">
              <strong>Delivery Partner:</strong> Giriraj Express Logistics<br/>
              <strong>Status:</strong> ${order.status.toUpperCase()}<br/>
              <strong>Payment Status:</strong> ${order.paymentStatus || 'Completed'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>₹${(order.subtotal || order.itemTotal || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="totals-row">
              <span>Delivery Fee:</span>
              <span>${order.deliveryFee === 0 ? 'FREE' : '₹' + order.deliveryFee}</span>
            </div>
            ${order.discount ? `
            <div class="totals-row" style="color: #16a34a;">
              <span>Discount:</span>
              <span>-₹${order.discount.toLocaleString('en-IN')}</span>
            </div>` : ''}
            <div class="totals-row totals-total">
              <span>Total Amount:</span>
              <span>₹${order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="footer">
            Thank you for your business! All electrical products are covered under manufacturer guarantee.<br/>
            For support or warranty claims, contact support@girirajpower.com or WhatsApp +91 87774 00280
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Header Card */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              My Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
              {orders.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track order status, view 3-step delivery timeline, and download invoices
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {orders.length > 0 && (
            <button
              onClick={() => setConfirmClearAll(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 font-bold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer"
              title="Delete all order history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
          <button
            onClick={onOpenShop}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop Electricals</span>
          </button>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'active'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {activeCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              <span>In-Transit ({activeCount})</span>
            </button>
            <button
              onClick={() => setFilterTab('delivered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'delivered'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delivered ({deliveredCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, item, area..."
              className="w-full pl-8 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
            />
          </div>
        </div>
      )}

      {/* Orders List Container */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
            No orders found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
            Your placed orders and 60-minute express delivery tracking will appear right here.
          </p>

          <button
            onClick={onOpenShop}
            className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No matching orders</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            No orders found matching your current filter or search criteria.
          </p>
          <button
            onClick={() => {
              setFilterTab('all');
              setSearchQuery('');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Unified Stack Container with Dropdown Accordion Rows */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isDelivered = order.status === 'delivered';
            const isOutForDelivery = order.status === 'out_for_delivery';
            const isPacking = order.status === 'packing';
            const isCancelled = order.status === 'cancelled';
            const isDeleting = deletingOrderId === order.id;

            const itemsSummary = order.items.map((i) => i.product?.name || 'Item').join(', ');
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className={`transition-colors ${isDeleting ? 'opacity-40 pointer-events-none' : ''} ${
                  isExpanded ? 'bg-slate-50/40' : 'hover:bg-slate-50/70'
                }`}
              >
                {/* Accordion Row Header - Clickable Dropdown Trigger */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(order.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  {/* Left Column: Icon + Order ID + Timestamp + Status */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isDelivered
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : isOutForDelivery
                          ? 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse'
                          : isPacking
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : isCancelled
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {isDelivered ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isOutForDelivery ? (
                        <Truck className="w-5 h-5" />
                      ) : (
                        <Package className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-black text-slate-900">
                          #{order.id}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isOutForDelivery
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : isPacking
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : isCancelled
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {order.status === 'out_for_delivery'
                            ? 'Out for Delivery'
                            : order.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formattedDate}</span>
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[200px] sm:max-w-xs text-slate-600 font-medium">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} ({itemsSummary})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount + Payment Pill + Expand Chevron */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-13 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div className="text-sm sm:text-base font-black text-slate-950">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 justify-start sm:justify-end">
                        {order.paymentMethod === 'cod' ? (
                          <>
                            <Banknote className="w-3 h-3 text-slate-400" />
                            <span>Cash on Delivery</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3 h-3 text-emerald-600" />
                            <span>Paid Online</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={downloadingInvoiceId === order.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectDownloadPDF(order);
                        }}
                        className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Download official Invoice PDF directly"
                        aria-label={`Download Invoice for order #${order.id}`}
                      >
                        {downloadingInvoiceId === order.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-amber-700" />
                            <span>Invoice</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrderToDelete(order);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-red-200"
                        title="Delete this order"
                        aria-label={`Delete order #${order.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <span className="hidden sm:inline-block text-xs font-bold text-slate-500">
                        {isExpanded ? 'Hide' : 'Details'}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 bg-slate-200 text-slate-900' : ''
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Content Area */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in fade-in duration-200">
                    {/* 1. Live 3-Step Order Tracking Timeline */}
                    <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs">
                      <div className="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-600" />
                        <span>Delivery Status &amp; Milestone Timeline</span>
                      </div>
                      <OrderTrackingTimeline order={order} />
                    </div>

                    {/* 2. Items Breakdown List */}
                    <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-slate-900 pb-1 border-b border-slate-100">
                        <span>Purchased Items ({order.items.length})</span>
                        <span>Item Subtotal</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {order.items.map((item, idx) => {
                          const color = item.selectedColor || item.product?.selectedColor;
                          const price = item.product?.price || 0;
                          const lineTotal = price * item.quantity;

                          return (
                            <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.product?.image ? (
                                  <img
                                    src={item.product.image}
                                    alt=""
                                    className="w-10 h-10 object-contain bg-white rounded-lg border border-slate-200 p-1 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate">
                                    {item.product?.name || 'Item'}
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span>Brand: {item.product?.brand || 'Giriraj'}</span>
                                    <span>•</span>
                                    <span>Qty: <strong className="text-slate-800 font-black">{item.quantity}</strong></span>
                                    <span>•</span>
                                    <span>₹{price.toLocaleString('en-IN')} / unit</span>
                                    {color && (
                                      <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                        Color: {color}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="font-black text-slate-900 text-right shrink-0">
                                ₹{lineTotal.toLocaleString('en-IN')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Delivery & Price Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Delivery Address */}
                      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs space-y-1.5">
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>Delivery Address &amp; Contact</span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                          <p className="font-bold text-slate-900">
                            {order.customerName} ({order.phone})
                          </p>
                          <p>{order.address}</p>
                          {order.landmark && <p className="text-slate-500">Landmark: {order.landmark}</p>}
                          <p className="font-semibold text-slate-800">
                            {order.area}, Kolkata – {order.pincode}
                          </p>
                          {order.notes && (
                            <p className="text-[11px] text-slate-500 italic pt-1">
                              Note: {order.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payment & Invoice Summary */}
                      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs space-y-1.5">
                        <div className="text-xs font-black text-slate-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ReceiptText className="w-3.5 h-3.5 text-slate-500" />
                            <span>Payment Summary</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            GST Tax Invoice
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1 pt-1">
                          <div className="flex justify-between">
                            <span>Item Subtotal:</span>
                            <span className="font-medium text-slate-800">
                              ₹{(order.subtotal || order.itemTotal || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Fee:</span>
                            <span className="font-medium text-slate-800">
                              {order.deliveryFee === 0 ? (
                                <span className="text-emerald-600 font-bold">FREE</span>
                              ) : (
                                `₹${order.deliveryFee}`
                              )}
                            </span>
                          </div>
                          {order.discount ? (
                            <div className="flex justify-between text-emerald-600 font-medium">
                              <span>Coupon / Discount:</span>
                              <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                            </div>
                          ) : null}
                          <div className="flex justify-between pt-1.5 border-t border-slate-100 font-black text-slate-950 text-sm">
                            <span>Total Paid:</span>
                            <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={getOrderWhatsAppUrl(order, '918777400280')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Support</span>
                        </a>

                        <a
                          href="tel:+918777400280"
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-600" />
                          <span>Call Dispatch Hub</span>
                        </a>

                        <button
                          type="button"
                          disabled={downloadingInvoiceId === order.id}
                          onClick={() => handleDirectDownloadPDF(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                          title="Download official A4 PDF invoice directly"
                        >
                          {downloadingInvoiceId === order.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Downloading PDF...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF Invoice</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order)}
                          className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal: Delete Single Order */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                Delete Order #{orderToDelete.id}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete this order from your history? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={Boolean(deletingOrderId)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSingleOrder(orderToDelete)}
                disabled={Boolean(deletingOrderId)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {deletingOrderId === orderToDelete.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All Orders */}
      {confirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">Clear All Order History?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will permanently remove all {orders.length} order record
                {orders.length > 1 ? 's' : ''} from your account history.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                disabled={isClearingAll}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllOrders}
                disabled={isClearingAll}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isClearingAll ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <span>Clear All</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
