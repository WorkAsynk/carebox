import React from 'react'
import BillingInvoice from './BillingInvoice'

const InvoicePreviewModal = ({ open, invoice, onClose, onDownload }) => {
  if (!open || !invoice) return null

  const safeDate = (d) => {
    try { return d ? new Date(d).toLocaleDateString() : 'N/A' } catch { return 'N/A' }
  }

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 shadow-xl w-[95%] max-w-3xl">
        <BillingInvoice invoice={invoice} />

        {/* Footer actions */}
        {/* <div className="mt-4 flex justify-end gap-2">
          <button onClick={onDownload} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900">Download</button>
          <button onClick={onClose} className="px-4 py-2 border rounded">Close</button>
        </div> */}
      </div>
    </div>
  )
}

export default InvoicePreviewModal


