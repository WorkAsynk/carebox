import React from 'react'

// Exact structure and classes aligned to CreateInvoice -> InvoicePreview
const BillingInvoice = ({ invoice = {}, fullOrder = null, packageName = 'Logistics Service' }) => {
  const safe = (v, d='-') => (v === 0 ? 0 : (v || d))
  const invoiceNumber = safe(invoice.invoiceNumber || invoice.awbNumber || fullOrder?.inv_no || fullOrder?.awb_no)
  const total = Number(invoice.totalAmount || invoice.billingAmount || fullOrder?.amount || fullOrder?.total_amount || 0)
  const totalParcel = invoice.totalParcel ?? (Array.isArray(fullOrder?.package_data) ? fullOrder.package_data.length : 0)
  const invoiceDate = invoice.billingDate || (fullOrder?.created_at ? new Date(fullOrder.created_at).toISOString().split('T')[0] : undefined)
  const dueDate = invoice.dueDate || (fullOrder?.created_at ? new Date(fullOrder.created_at).toISOString().split('T')[0] : undefined)
  const franchiseName = invoice.clientName || invoice.franchiseName || fullOrder?.client_name || 'Client'
  const mfNumber = invoice.mfNumber || `MF-${String(fullOrder?.agent_id || '').toString().padStart(3, '0')}` || '-'
  const gstNumber = invoice.gst || fullOrder?.gst || '-'

  // Derived for table
  const services = [
    {
      description: packageName || fullOrder?.package_data?.[0]?.contents_description || 'Logistics Service',
      quantity: totalParcel || 1,
      rate: total / (totalParcel || 1),
      amount: total,
    },
  ]
  const subtotal = total
  const taxRate = 0
  const taxAmount = 0
  const billingAmount = total

  return (
    <div className='p-0 max-w-[1000px] mx-auto'>
      {/* Invoice Document */}
      <div 
        id="invoice-document" 
        className='bg-white rounded-lg shadow-lg border-2 border-red-100 overflow-hidden mb-6 relative'
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg width='250' height='250' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='watermark' x='0' y='0' width='250' height='250' patternUnits='userSpaceOnUse'%3e%3ctext x='30' y='125' font-family='Arial, sans-serif' font-size='22' fill='rgba(255, 0, 0, 0.08)' font-weight='bold' transform='rotate(-45 125 125)'%3eCarebox%3c/text%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23watermark)'/%3e%3c/svg%3e")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '250px 250px'
        }}
      >
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-red-50 to-white p-8 border-b-2 border-red-500 print-header">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">INVOICE</h1>
              <div className="text-red-600 font-semibold">#{invoiceNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600 mb-2">₹{total.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-8 print-body">
          {/* From and To Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print-section print-grid print-compact">
            <div>
              <h3 className="text-lg font-semibold text-black mb-3 border-b-2 border-red-500 pb-1">FROM</h3>
              <div className="space-y-2">
                <div className="font-semibold text-black">Carebox</div>
                <div className="text-gray-700">careboxadmin@gmail.com</div>
                <div className="text-gray-700">+91-0000000000</div>
                <div className="text-gray-700 space-y-1">
                  <div>550/2, Om sai Society</div>
                  <div>Moghul lane Mahim</div>
                  <div>Mumbai</div>
                  <div>Pincode: 400016</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black mb-3 border-b-2 border-red-500 pb-1">TO</h3>
              <div className="space-y-2">
                <div className="font-semibold text-black">{franchiseName}</div>
                <div className="text-gray-700">MF: {mfNumber}</div>
                <div className="text-gray-700">GST: {gstNumber}</div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print-section print-grid print-compact">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600">Invoice Date</div>
              <div className="font-semibold text-black">{invoiceDate ? new Date(invoiceDate).toLocaleDateString() : '-'}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600">Due Date</div>
              <div className="font-semibold text-black">{dueDate ? new Date(dueDate).toLocaleDateString() : '-'}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600">Total Parcels</div>
              <div className="font-semibold text-black">{totalParcel}</div>
            </div>
          </div>

          {/* Services Table */}
          <div className="mb-8 print-section print-compact">
            <h3 className="text-lg font-semibold text-black mb-3 border-b-2 border-red-500 pb-1">SERVICES</h3>
            <div className="overflow-x-auto">
              <table className="w-full print-table">
                <thead>
                  <tr className="bg-black">
                    <th className="text-left py-3 px-4 text-white font-semibold">Description</th>
                    <th className="text-center py-3 px-4 text-white font-semibold">Qty</th>
                    <th className="text-right py-3 px-4 text-white font-semibold">Rate</th>
                    <th className="text-right py-3 px-4 text-white font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-800">{service.description}</td>
                      <td className="py-3 px-4 text-center text-gray-800">{service.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-800">₹{service.rate.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-red-600">₹{service.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8 print-section print-compact">
            <div className="w-full max-w-sm">
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Tax ({taxRate}%):</span>
                  <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-red-500">
                  <span className="text-xl font-bold text-black">TOTAL:</span>
                  <span className="text-xl font-bold text-red-600">₹{total.toFixed(2)}</span>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200 mt-4">
                  <div className="text-sm text-gray-600">Billing Amount</div>
                  <div className="text-lg font-bold text-red-600">₹{billingAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="bg-black text-white p-6 text-center print-footer">
          <p className="text-sm">Thank you for your business!</p>
          <p className="text-xs text-gray-300 mt-2">Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Action Buttons (same div style as CreateInvoice preview) */}
      <div className="flex justify-center gap-4 mb-6 no-print">
        <button 
          onClick={() => window.print()}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg flex items-center gap-2 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Invoice
        </button>
        {/* <button 
          onClick={() => (typeof onDownload === 'function' ? onDownload() : window.print())}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2 transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button> */}
      </div>
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          html, body { width: 210mm; height: 297mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body * { visibility: hidden !important; }
          #invoice-document, #invoice-document * { visibility: visible !important; }
          #invoice-document {
            position: absolute; left: 0; top: 0;
            width: 210mm; margin: 0; box-shadow: none; border: none;
            transform: scale(0.9); transform-origin: top left; /* shrink to fit on one page */
            page-break-inside: avoid; break-inside: avoid;
          }
          /* compact paddings/gaps for print so content fits on one page */
          .print-header { padding: 16px !important; }
          .print-body { padding: 16px !important; }
          .print-section { margin-bottom: 12px !important; }
          .print-grid { gap: 12px !important; }
          .print-table th, .print-table td { padding: 6px 8px !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default BillingInvoice


