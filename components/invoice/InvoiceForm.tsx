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
  const [client, setClient] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [creatorCompany, setCreatorCompany] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", qty: 1, price: 0 }]);
  const [notes, setNotes] = useState("Thank you for your business.");
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [logo, setLogo] = useState<string | null>(null);
  const [address, setAddress] = useState("");

  const handleItemChange = (index: number, updatedItem: InvoiceItem) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  const handleAddItem = () => setItems([...items, { description: "", qty: 1, price: 0 }]);
  const handleRemoveItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const total = subtotal - discount - paid;

  useEffect(() => {
    const data: InvoiceData = {
      client,
      clientCompany,
      creatorCompany,
      currency,
      issueDate,
      dueDate,
      items,
      notes,
      subtotal,
      discount,
      paid,
      total,
      logo,
      address,
    };
    onUpdate(data);
  }, [client, clientCompany, creatorCompany, currency, issueDate, dueDate, items, notes, discount, paid, logo, address]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Invoice</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Your Company Name</label>
        <input
          type="text"
          value={creatorCompany}
          onChange={(e) => setCreatorCompany(e.target.value)}
          placeholder="Enter your company name"
          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Upload Company Logo</label>
        <input type="file" accept="image/*" onChange={handleLogoChange} className="mt-1 w-full" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Company Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your company address"
          className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Client Name</label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Enter client name"
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Client Company</label>
          <input
            type="text"
            value={clientCompany}
            onChange={(e) => setClientCompany(e.target.value)}
            placeholder="Enter company name"
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            placeholder="USD"
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Issue Date</label>
          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
      {items.map((item, index) => (
        <InvoiceItemRow key={index} index={index} item={item} onChange={handleItemChange} onRemove={handleRemoveItem} />
      ))}
      <button onClick={handleAddItem} className="mt-2 text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200 transition">
        + Add Item
      </button>

      <InvoiceSummary subtotal={subtotal} discount={discount} setDiscount={setDiscount} paid={paid} setPaid={setPaid} total={total} />

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Notes / Terms</label>
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
