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
import { FaTimes } from "react-icons/fa";

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
  (column.id ?? column.fieldKey) as string;

/* ================= SORTABLE CELL (FIRST ROW ONLY) ================= */

const SortableCell = ({
  column,
  label,
  children,
}: {
  column: InvoiceColumnInput;
  label: React.ReactNode;
  children: React.ReactNode;
}) => {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getColDndId(column),
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex flex-col gap-1"
    >
      {/* ✅ DRAG HANDLE (LABEL ONLY) */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="cursor-move text-sm font-medium text-gray-700 flex items-center gap-1"
      >
        <span className="text-gray-400">≡</span>
        {label}
      </div>

      {/* inputs stay clean */}
      {children}
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
      activationConstraint: { distance: 6 },
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

          {/* ================= ITEMS ================= */}

          <FieldArray name="items">
            {({ push, remove }) => (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">Items</h3>
                    <button
                      type="button"
                      onClick={() => setAddColumnModalOpen(true)}
                      className="cursor-pointer flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm border border-gray-300"
                    >
                      <FiPlus /> Add Column
                    </button>
                  </div>

                  {values.items.map((_, i) => {
                    const isFirstRow = i === 0;

                    return (
                      <div
                        key={i}
                        className="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex gap-3 w-full items-start">
                          {/* ✅ ONLY FIRST ROW IS SORTABLE, AND ONLY THE COLUMNS AREA IS IN SortableContext */}
                          {isFirstRow ? (
                            <SortableContext
                              items={columns
                                .filter((c) => !c.locked)
                                .map((c) => getColDndId(c))}
                              strategy={rectSortingStrategy}
                            >
                              <div className="flex gap-3 w-full flex-1">
                                {columns.map((column) => {
                                  const isTotal = column.fieldKey === "total";

                                  const fieldEl = (
                                    <Field
                                      name={`items.${i}.${column.fieldKey}`}
                                      readOnly={isTotal}
                                      type={
                                        column.type === "number"
                                          ? "number"
                                          : "text"
                                      }
                                      className={`p-2 border rounded-md ${
                                        isTotal
                                          ? "bg-gray-100 text-center font-semibold"
                                          : "bg-white"
                                      } border-gray-300`}
                                    />
                                  );

                                  return (
                                    <SortableCell
                                      key={column.fieldKey}
                                      column={column}
                                      label={
                                        <div className="flex justify-between w-full">
                                          <span>{column.label}</span>

                                          {!column.locked && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();

                                                setColumns((prev) =>
                                                  prev.filter(
                                                    (c) =>
                                                      c.fieldKey !==
                                                      column.fieldKey
                                                  )
                                                );

                                                setFieldValue(
                                                  "items",
                                                  values.items.map((item) => {
                                                    const {
                                                      [column.fieldKey]: __,
                                                      ...rest
                                                    } = item;
                                                    return rest;
                                                  })
                                                );
                                              }}
                                              className="text-white text-xs cursor-pointer bg-red-500 h-4 w-4 rounded-full flex items-center justify-center"
                                            >
                                              <FaTimes />
                                            </button>
                                          )}
                                        </div>
                                      }
                                    >
                                      {fieldEl}
                                    </SortableCell>
                                  );
                                })}
                              </div>
                            </SortableContext>
                          ) : (
                            <div className="flex gap-3 w-full flex-1">
                              {columns.map((column) => {
                                const isTotal = column.fieldKey === "total";

                                return (
                                  <div
                                    key={column.fieldKey}
                                    className="flex flex-col gap-1"
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
                                                (c) =>
                                                  c.fieldKey !== column.fieldKey
                                              )
                                            );

                                            setFieldValue(
                                              "items",
                                              values.items.map((item) => {
                                                const {
                                                  [column.fieldKey]: __,
                                                  ...rest
                                                } = item;
                                                return rest;
                                              })
                                            );
                                          }}
                                          className="text-white text-xs cursor-pointer bg-red-500 h-4 w-4 rounded-full flex items-center justify-center"
                                        >
                                          <FaTimes />
                                        </button>
                                      )}
                                    </div>

                                    <Field
                                      name={`items.${i}.${column.fieldKey}`}
                                      readOnly={isTotal}
                                      type={
                                        column.type === "number"
                                          ? "number"
                                          : "text"
                                      }
                                      className={`p-2 border rounded-md ${
                                        isTotal
                                          ? "bg-gray-100 text-center font-semibold"
                                          : "bg-white"
                                      } border-gray-300`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* ✅ NOT INSIDE SortableContext */}
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="flex items-center justify-center text-red-500"
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
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => push(createEmptyItem())}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm border border-gray-300"
                  >
                    <FiPlus /> Add Item
                  </button>
                </div>

                <DragOverlay>
                  {activeColumn ? (
                    <div className="pointer-events-none">
                      <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-lg">
                        <span className="font-medium text-gray-800">
                          {activeColumn.label}
                        </span>
                        <span className="text-gray-500">≡</span>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
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
