"use client";

import React from "react";
import {
  Formik,
  Form,
  Field,
  FieldArray,
  useFormikContext,
  ErrorMessage,
} from "formik";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTimes } from "react-icons/fa";
import { v4 as uuid } from "uuid";
import { LiveCalculation } from "./LiveCalculation";

/* ================= PROPS ================= */

interface InvoiceFormProps {
  onUpdate: (data: InvoiceFormValues) => void;
  setAddColumnModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  columns: InvoiceColumnInput[];
  setColumns: React.Dispatch<React.SetStateAction<InvoiceColumnInput[]>>;
  handleSubmit: () => void;
  loading: boolean;
  initialValues?: InvoiceFormValues | null;
}

/* ================= VALIDATION ================= */

const validationSchema = Yup.object({
  client: Yup.string().required("Client is required"),
  business: Yup.string().required("Business is required"),
  currency: Yup.string().required("Currency is required"),
  issueDate: Yup.string().required("Issue date is required"),
  dueDate: Yup.string().required("Due date is required"),
  items: Yup.array()
    .of(
      Yup.object({
        description: Yup.string().required("Description is required"),
        quantity: Yup.number()
          .typeError("Quantity is required")
          .required("Quantity is required"),
        price: Yup.number()
          .typeError("Price is required")
          .required("Price is required"),
      })
    )
    .min(1, "At least 1 item is required"),
});

/* ================= DND HELPERS ================= */

const getColDndId = (column: InvoiceColumnInput) => (column.id ?? column.fieldKey) as string;

const getRowDndId = (item: InvoiceItem) => `row-${item._rowId ?? ""}`;

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
      className="flex flex-col gap-1 min-w-0 flex-1"
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

const SortableRow = ({
  id,
  children,
}: {
  id: string;
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
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.9 : 1,
      }}
      className="relative"
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute -left-5 top-4 text-gray-400 hover:text-gray-600 cursor-move"
        aria-label="Reorder row"
      >
        ≡
      </button>
      {children}
    </div>
  );
};

const ItemsColumnSync = ({ columns }: { columns: InvoiceColumnInput[] }) => {
  const { values, setFieldValue } = useFormikContext<InvoiceFormValues>();
  const prevColumnsRef = React.useRef<InvoiceColumnInput[]>(columns);

  React.useEffect(() => {
    const prev = prevColumnsRef.current;
    const prevKeys = new Set(prev.map((c) => c.fieldKey));
    const newColumns = columns.filter((c) => !prevKeys.has(c.fieldKey));

    if (newColumns.length) {
      const updatedItems = values.items.map((item) => {
        const next = { ...item };
        newColumns.forEach((col) => {
          if (!(col.fieldKey in next)) {
            next[col.fieldKey] = col.type === "number" ? 0 : "";
          }
        });
        return next;
      });

      setFieldValue("items", updatedItems);
    }

    prevColumnsRef.current = columns;
  }, [columns, setFieldValue, values.items]);

  return null;
};

const FieldError = ({ name }: { name: string }) => (
  <ErrorMessage
    name={name}
    component="div"
    className="text-red-600 text-sm mt-1"
  />
);

/* ================= COMPONENT ================= */

const InvoiceForm = ({
  onUpdate,
  setAddColumnModalOpen,
  columns,
  setColumns,
  handleSubmit,
  loading,
  initialValues,
}: InvoiceFormProps) => {
  /* ================= HELPERS ================= */

  const initialRowId = React.useId();

  const createEmptyItem = (rowId?: string): InvoiceItem =>
    columns.reduce((acc, col) => {
      acc[col.fieldKey] = col.type === "number" ? 0 : "";
      return acc;
    }, { _rowId: rowId ?? uuid() } as InvoiceItem);

  /* ================= INITIAL VALUES ================= */

  const fallbackInitialValues: InvoiceFormValues = {
    client: "",
    business: "",
    currency: "BDT",
    issueDate: "",
    dueDate: "",
    items: [createEmptyItem(initialRowId)],
    notes: "Thank you for your business.",
    discount: 0,
    paid: 0,
    subtotal: 0,
    total: 0,
  };

  const formInitialValues = initialValues ?? fallbackInitialValues;


  /* ================= DND CONFIG ================= */

  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    const isColumnDrag = columns.some((c) => getColDndId(c) === id);
    setActiveId(isColumnDrag ? id : null);
  };

  const onDragEnd = (
    event: DragEndEvent,
    items: InvoiceItem[],
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);

    const isColumnDrag =
      columns.some((c) => getColDndId(c) === activeStr) &&
      columns.some((c) => getColDndId(c) === overStr);

    if (isColumnDrag) {
      setColumns((cols) => {
        const oldIndex = cols.findIndex((c) => getColDndId(c) === activeStr);
        const newIndex = cols.findIndex((c) => getColDndId(c) === overStr);
        const reordered = arrayMove(cols, oldIndex, newIndex);
        return reordered.map((c, i) => ({ ...c, order: i + 1 }));
      });
      return;
    }

    const isRowDrag =
      activeStr.startsWith("row-") && overStr.startsWith("row-");

    if (isRowDrag) {
      const oldIndex = items.findIndex((item) => getRowDndId(item) === activeStr);
      const newIndex = items.findIndex((item) => getRowDndId(item) === overStr);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      setFieldValue("items", reorderedItems);
    }
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
      initialValues={formInitialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={Boolean(initialValues)}
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-8">
          <ItemsColumnSync columns={columns} />
          <LiveCalculation columns={columns} onUpdate={onUpdate} />
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
              <FieldError name="business" />
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
              <FieldError name="client" />
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
              <FieldError name="issueDate" />
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
              <FieldError name="dueDate" />
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
              <FieldError name="currency" />
            </div>
          </div>

          {/* ================= ITEMS ================= */}

          <FieldArray name="items">
            {({ push, remove }) => (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={(event) =>
                  onDragEnd(event, values.items, setFieldValue)
                }
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

                  <SortableContext
                    items={values.items.map((item) => getRowDndId(item))}
                    strategy={verticalListSortingStrategy}
                  >
                    {values.items.map((item, i) => {
                      const isFirstRow = i === 0;
                      const rowId = getRowDndId(item);

                      return (
                        <SortableRow key={rowId} id={rowId}>
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex gap-3 w-full items-start relative">
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
                                            column.type === "number" ? "number" : "text"
                                          }
                                          className={`p-2 border rounded-md w-full min-w-0 ${isTotal
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
                                          }
                                        >
                                          {fieldEl}
                                          {column.fieldKey !== "total" && (
                                            <FieldError
                                              name={`items.${i}.${column.fieldKey}`}
                                            />
                                          )}
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
                                        className="flex flex-col gap-1 min-w-0 flex-1"
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
                                            column.type === "number" ? "number" : "text"
                                          }
                                          className={`p-2 border rounded-md ${isTotal
                                            ? "bg-gray-100 text-center font-semibold"
                                            : "bg-white"
                                            } border-gray-300`}
                                        />
                                        {!isTotal && (
                                          <FieldError
                                            name={`items.${i}.${column.fieldKey}`}
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* ✅ NOT INSIDE SortableContext */}
                              {values.items.length !== 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(i)}
                                  className="bg-red-600 p-1 cursor-pointer rounded-full text-white absolute -right-5 -bottom-5 flex items-center justify-center"
                                  disabled={values.items.length === 1}
                                  title={
                                    values.items.length === 1
                                      ? "At least 1 item is required"
                                      : "Remove item"
                                  }
                                >
                                  <FiTrash2 className="text-sm" />
                                </button>
                              )}
                            </div>
                          </div>
                        </SortableRow>
                      );
                    })}
                  </SortableContext>

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

          {/* ================= SUMMARY ================= */}

          <div className="flex justify-end mt-6">
            <div className="w-full max-w-sm space-y-3 bg-white border border-gray-200 rounded-lg p-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">
                  {values.currency} {values.subtotal.toFixed(2)}
                </span>
              </div>

              {/* Discount */}
              <div className="flex justify-between items-center gap-4">
                <label className="text-gray-600">Discount</label>
                <Field
                  name="discount"
                  type="number"
                  className="w-32 p-2 border border-gray-300 rounded-md text-right"
                />
              </div>

              {/* Paid */}
              <div className="flex justify-between items-center gap-4">
                <label className="text-gray-600">Paid</label>
                <Field
                  name="paid"
                  type="number"
                  className="w-32 p-2 border border-gray-300 rounded-md text-right"
                />
              </div>

              <hr />

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>
                  {values.currency} {values.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>


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
