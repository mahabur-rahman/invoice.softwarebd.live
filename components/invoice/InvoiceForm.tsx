"use client";

import React from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useQuery } from "@apollo/client/react";
import { GET_MY_BUSINESSES } from "@/lib/graphql/queries";
import { GET_ALL_CLIENTS } from "@/lib/graphql/queries/invoice.queries";
import {
  InvoiceColumnInput,
  InvoiceFormValues,
  InvoiceItem,
} from "@/app/(dashboard)/(invoice)/generate-invoice/page";
import { ClientType, GetMyBusinessesQuery } from "@/lib/graphql/generated-types";
import { Spin } from "antd";

// ✅ dnd-kit
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ================= PROPS ================= */

interface InvoiceFormProps {
  onUpdate: (data: InvoiceFormValues) => void;
  setAddColumnModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  columns: InvoiceColumnInput[];
  setColumns: React.Dispatch<React.SetStateAction<InvoiceColumnInput[]>>;
  handleSubmit: () => void;
  loading: boolean;
}

/* ================= VALIDATION ================= */

const validationSchema = Yup.object({
  client: Yup.string().required("Client is required"),
  business: Yup.string().required("Business is required"),
  currency: Yup.string().required("Currency is required"),
});

/* ================= DND HELPERS ================= */

const getColDndId = (column: InvoiceColumnInput) =>
  // ✅ Always stable even if some column accidentally has no id
  (column.id ?? column.fieldKey) as string;

/* ================= SORTABLE PILL ================= */

const SortablePill = ({
  column,
  active,
}: {
  column: InvoiceColumnInput;
  active?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getColDndId(column),
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "touch-none select-none",
        "inline-flex items-center",
        "rounded-full border border-gray-200 px-4 py-2",
        "bg-white shadow-sm text-sm whitespace-nowrap",
        active ? "ring-2 ring-gray-300" : "",
      ].join(" ")}
    >
      {/* ✅ LABEL IS DRAG HANDLE */}
      <span
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="font-medium text-gray-800 cursor-grab active:cursor-grabbing"
      >
        {column.label}
      </span>
    </div>
  );
};




/* ================= COMPONENT ================= */

const InvoiceForm = ({
  onUpdate,
  setAddColumnModalOpen,
  columns,
  setColumns,
  handleSubmit,
  loading,
}: InvoiceFormProps) => {
  /* ================= HELPERS ================= */

  const createEmptyItem = (): InvoiceItem =>
    columns.reduce((acc, col) => {
      acc[col.fieldKey] = col.type === "number" ? 0 : "";
      return acc;
    }, {} as InvoiceItem);

  /* ================= INITIAL VALUES ================= */

  const initialValues: InvoiceFormValues = {
    client: "",
    business: "",
    currency: "BDT",
    issueDate: "",
    dueDate: "",
    items: [createEmptyItem()],
    notes: "Thank you for your business.",
    discount: 0,
    paid: 0,
    subtotal: 0,
    total: 0,
  };

  /* ================= LIVE CALCULATION ================= */

  const handleLiveUpdate = (values: InvoiceFormValues) => {
    let subtotal = 0;

    values.items.forEach((item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.price || 0);

      let itemTotal = qty * price;

      columns.forEach((column) => {
        if (column.type !== "number") return;

        if (
          column.fieldKey === "quantity" ||
          column.fieldKey === "price" ||
          column.fieldKey === "total"
        ) {
          return;
        }

        const value = Number(item[column.fieldKey] || 0);

        if (column.behavior === "ADD") itemTotal += value;
        if (column.behavior === "SUBTRACT") itemTotal -= value;
      });

      item.total = itemTotal;
      subtotal += itemTotal;
    });

    const total =
      subtotal - Number(values.discount || 0) - Number(values.paid || 0);

    onUpdate({
      ...values,
      subtotal,
      total,
    });

    return {};
  };

  /* ================= DND CONFIG ================= */

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6, // ✅ prevents accidental drags when clicking
      },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);

    setColumns((cols) => {
      const oldIndex = cols.findIndex((c) => getColDndId(c) === activeStr);
      const newIndex = cols.findIndex((c) => getColDndId(c) === overStr);
      const reordered = arrayMove(cols, oldIndex, newIndex);
      return reordered.map((c, i) => ({ ...c, order: i + 1 }));
    });
  };

  const activeColumn = React.useMemo(() => {
    if (!activeId) return null;
    return columns.find((c) => getColDndId(c) === activeId) ?? null;
  }, [activeId, columns]);

  /* ================= QUERIES ================= */

  const { data: businessData } =
    useQuery<GetMyBusinessesQuery>(GET_MY_BUSINESSES);
  const { data: clientData } =
    useQuery<{ findAllClients: ClientType[] }>(GET_ALL_CLIENTS);

  /* ================= RENDER ================= */

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      validate={handleLiveUpdate}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-800">Create Invoice</h2>

          {/* ================= BUSINESS / CLIENT ================= */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Select Business
              </label>
              <Field
                as="select"
                name="business"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Select business</option>
                {businessData?.myBusinesses?.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.companyName}
                  </option>
                ))}
              </Field>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Select Client
              </label>
              <Field
                as="select"
                name="client"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Select client</option>
                {clientData?.findAllClients?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Field>
            </div>
          </div>

          {/* ================= DATES & CURRENCY ================= */}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Issue Date
              </label>
              <Field
                type="date"
                name="issueDate"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Due Date
              </label>
              <Field
                type="date"
                name="dueDate"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Currency
              </label>
              <Field
                as="select"
                name="currency"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="BDT">BDT</option>
              </Field>
            </div>
          </div>

          {/* ================= DRAGGABLE COLUMNS ================= */}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Columns</h3>
              <p className="text-xs text-gray-500">
                Drag to reorder
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={columns
                    .filter((c) => !c.locked)
                    .map((c) => getColDndId(c))}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {columns.map((column) => (
                      <SortablePill
                        key={getColDndId(column)}
                        column={column}
                        active={activeId === getColDndId(column)}
                      />
                    ))}
                  </div>
                </SortableContext>

                {/* ✅ nicer drag ghost */}
                <DragOverlay>
                  {activeColumn ? (
                    <div className="pointer-events-none">
                      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-lg">
                        <span className="font-medium text-gray-800">
                          {activeColumn.label}
                        </span>
                        <span className="text-gray-500">≡</span>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>

          {/* ================= ITEMS ================= */}

          <FieldArray name="items">
            {({ push, remove }) => (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Items</h3>
                  <button
                    type="button"
                    onClick={() => setAddColumnModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm border border-gray-300"
                  >
                    <FiPlus /> Add Column
                  </button>
                </div>

                {values.items.map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 bg-white border border-gray-200 rounded-lg p-3"
                  >
                    {columns.map((column) => {
                      const isDescription = column.fieldKey === "description";
                      const isTotal = column.fieldKey === "total";

                      return (
                        <div
                          key={column.fieldKey}
                          className={`flex flex-col gap-1 ${isDescription ? "col-span-6" : "col-span-2"
                            }`}
                        >
                          <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-700">
                              {column.label}
                            </label>

                            {!column.locked && (
                              <button
                                type="button"
                                onClick={() => {
                                  setColumns((prev) =>
                                    prev.filter(
                                      (c) => c.fieldKey !== column.fieldKey
                                    )
                                  );

                                  setFieldValue(
                                    "items",
                                    values.items.map((item) => {
                                      const { [column.fieldKey]: _, ...rest } =
                                        item;
                                      return rest;
                                    })
                                  );
                                }}
                                className="text-red-500 text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <Field
                            name={`items.${i}.${column.fieldKey}`}
                            readOnly={isTotal}
                            type={column.type === "number" ? "number" : "text"}
                            className={`p-2 border rounded-md ${isTotal
                              ? "bg-gray-100 text-center font-semibold"
                              : "bg-white"
                              } border-gray-300`}
                          />
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="col-span-1 flex items-center justify-center text-red-500"
                      // optional safety: keep at least 1 row
                      disabled={values.items.length === 1}
                      title={
                        values.items.length === 1
                          ? "At least 1 item is required"
                          : "Remove item"
                      }
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => push(createEmptyItem())}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm border border-gray-300"
                >
                  <FiPlus /> Add Item
                </button>
              </div>
            )}
          </FieldArray>

          {/* ================= NOTES ================= */}

          <div>
            <label className="text-sm font-medium text-gray-700">
              Notes / Terms
            </label>
            <Field
              as="textarea"
              name="notes"
              rows={3}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
            />
          </div>

          {/* ================= SUBMIT ================= */}

          <button
            type="submit"
            className="bg-gray-800 cursor-pointer text-white px-4 py-2 rounded-md hover:bg-gray-900 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-4">
                <Spin size="small" />
                Please Wait
              </span>
            ) : (
              "Create Invoice"
            )}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default InvoiceForm;
