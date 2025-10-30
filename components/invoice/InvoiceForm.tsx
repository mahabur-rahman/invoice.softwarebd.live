"use client";

import { useState, useEffect } from "react";
import InvoiceItemRow from "./InvoiceItemRow";
import InvoiceSummary from "./InvoiceSummary";
import { InvoiceData } from "@/app/(dashboard)/generate-invoice/page";

interface InvoiceFormProps {
  onUpdate: (data: InvoiceData) => void;
}

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}

const InvoiceForm = ({ onUpdate }: InvoiceFormProps) => {
  const [client, setClient] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const [issueDate, setIssueDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", qty: 1, price: 0 },
  ]);
  const [notes, setNotes] = useState<string>("Thank you for your business.");
  const [discount, setDiscount] = useState<number>(0);
  const [paid, setPaid] = useState<number>(0);

  const handleItemChange = (index: number, updatedItem: InvoiceItem) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  const handleAddItem = () =>
    setItems([...items, { description: "", qty: 1, price: 0 }]);

  const handleRemoveItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.qty) * Number(i.price),
    0
  );
  const total = subtotal - discount - paid;

  useEffect(() => {
    const data: InvoiceData = {
      client,
      currency,
      issueDate,
      dueDate,
      items,
      notes,
      subtotal,
      discount,
      paid,
      total,
    };
    onUpdate(data);
  }, [client, currency, issueDate, dueDate, items, notes, discount, paid, total, onUpdate, subtotal]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Create New Invoice
      </h2>

      {/* Client & Currency */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Enter client name"
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            placeholder="USD"
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Issue Date
          </label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Items */}
      <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
      {items.map((item, index) => (
        <InvoiceItemRow
          key={index}
          index={index}
          item={item}
          onChange={handleItemChange}
          onRemove={handleRemoveItem}
        />
      ))}
      <button
        onClick={handleAddItem}
        className="mt-2 text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200 transition"
      >
        + Add Item
      </button>

      {/* Summary */}
      <InvoiceSummary
        subtotal={subtotal}
        discount={discount}
        setDiscount={setDiscount}
        paid={paid}
        setPaid={setPaid}
        total={total}
      />

      {/* Notes */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Notes / Terms
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default InvoiceForm;
