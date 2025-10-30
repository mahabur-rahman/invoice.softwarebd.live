"use client";

import { FiTrash2 } from "react-icons/fi";

export interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}

interface ItemRowProps {
  index: number;
  item: InvoiceItem;
  onChange: (index: number, item: InvoiceItem) => void;
  onRemove: (index: number) => void;
}

const InvoiceItemRow = ({ index, item, onChange, onRemove }: ItemRowProps) => {
  return (
    <div className="grid grid-cols-12 gap-2 items-center mb-2">
      {/* Description */}
      <input
        type="text"
        placeholder="Description"
        value={item.description}
        onChange={(e) =>
          onChange(index, { ...item, description: e.target.value })
        }
        className="col-span-5 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      {/* Quantity */}
      <input
        type="number"
        min={1}
        value={item.qty}
        onChange={(e) =>
          onChange(index, { ...item, qty: Number(e.target.value) })
        }
        className="col-span-2 p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      {/* Price */}
      <input
        type="number"
        min={0}
        value={item.price}
        onChange={(e) =>
          onChange(index, { ...item, price: Number(e.target.value) })
        }
        className="col-span-2 p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      {/* Total */}
      <div className="col-span-2 text-right font-semibold text-gray-700">
        ${(item.qty * item.price).toFixed(2)}
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(index)}
        className="text-red-500 hover:text-red-600"
        aria-label="Remove item"
      >
        <FiTrash2 size={18} />
      </button>
    </div>
  );
};

export default InvoiceItemRow;
