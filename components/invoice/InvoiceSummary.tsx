"use client";

interface InvoiceSummaryProps {
  subtotal: number;
  discount: number;
  setDiscount: (val: number) => void;
  paid: number;
  setPaid: (val: number) => void;
  total: number;
}

const InvoiceSummary = ({ subtotal, discount, setDiscount, paid, setPaid, total }: InvoiceSummaryProps) => (
  <div className="mt-6 border-t border-gray-200 pt-4">
    <div className="flex justify-between mb-2 text-gray-700">
      <span>Subtotal:</span>
      <span>${subtotal.toFixed(2)}</span>
    </div>
    <div className="flex justify-between mb-2 text-gray-700">
      <span>Discount:</span>
      <input
        type="number"
        value={discount}
        onChange={(e) => setDiscount(Number(e.target.value))}
        className="w-24 text-right p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
    <div className="flex justify-between mb-2 text-gray-700">
      <span>Total Paid:</span>
      <input
        type="number"
        value={paid}
        onChange={(e) => setPaid(Number(e.target.value))}
        className="w-24 text-right p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
    <div className="flex justify-between font-bold text-lg mt-2 border-t pt-2">
      <span>Amount Due:</span>
      <span>${total.toFixed(2)}</span>
    </div>
  </div>
);

export default InvoiceSummary;
