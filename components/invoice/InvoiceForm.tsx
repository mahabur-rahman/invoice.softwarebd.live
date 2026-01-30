"use client";

import React from "react";
import {
  Formik,
  Form,
  Field,
  FieldArray,
  FieldProps,
  useFormikContext,
  ErrorMessage,
} from "formik";
import * as Yup from "yup";
import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useMutation, useQuery } from "@apollo/client/react";
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
  CollisionDetection,
  DndContext,
  DragEndEvent,
  Modifier,
  PointerSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  useDndMonitor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaTimes } from "react-icons/fa";
import { v4 as uuid } from "uuid";
import { LiveCalculation } from "./LiveCalculation";
import { Input, Modal } from "antd";
import {
  INVOICE_CURRENCY_OPTIONS,
  INVOICE_STATUS_OPTIONS,
} from "@/lib/constants/invoice";
import { COUNTRY_OPTIONS } from "@/lib/constants/countries";
import AddBusinessForm from "@/components/business/AddBusinessform";
import AddNewClient from "@/components/client/AddNewClient";
import { RESERVE_INVOICE_NUMBER } from "@/lib/graphql/mutations/invoice.mutations";

/* ================= PROPS ================= */

interface InvoiceFormProps {
  onUpdate: (data: InvoiceFormValues) => void;
  setAddColumnModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  columns: InvoiceColumnInput[];
  setColumns: React.Dispatch<React.SetStateAction<InvoiceColumnInput[]>>;
  handleSubmit: () => void;
  loading: boolean;
  initialValues?: InvoiceFormValues | null;
  editing:boolean;
  defaultInvoiceNumber?: string;
}

type InvoiceFieldProps = FieldProps<string | number, InvoiceFormValues>;

/* ================= VALIDATION ================= */

const validationSchema = Yup.object({
  client: Yup.string().required("Client is required"),
  business: Yup.string().required("Business is required"),
  currency: Yup.string().required("Currency is required"),
  status: Yup.string().required("Status is required"),
  issueDate: Yup.string().required("Issue date is required"),
  dueDate: Yup.string()
    .required("Due date is required")
    .test(
      "due-after-issue",
      "Due date must be on or after issue date",
      function (value) {
        const { issueDate } = this.parent as InvoiceFormValues;
        if (!value || !issueDate) return true;
        const due = new Date(value);
        const issue = new Date(issueDate);
        if (Number.isNaN(due.getTime()) || Number.isNaN(issue.getTime())) {
          return true;
        }
        return due.getTime() >= issue.getTime();
      }
    ),
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

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (value: string, days: number) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return formatDateInput(date);
};

const buildInvoicePreview = (options: {
  prefix?: string | null;
  paddingDigits?: number | null;
  resetYearly?: boolean | null;
  startNumber?: number | null;
  issueDate?: string | null;
}) => {
  const prefix = (options.prefix ?? "INV").trim();
  const digits = Number(options.paddingDigits ?? 6);
  const padded = String(options.startNumber ?? 1).padStart(
    Number.isFinite(digits) && digits > 0 ? digits : 6,
    "0"
  );
  const year =
    options.resetYearly === false
      ? null
      : options.issueDate
      ? new Date(options.issueDate).getFullYear()
      : new Date().getFullYear();

  return [prefix, year, padded].filter(Boolean).join("-");
};

const getColumnWidthClass = (fieldKey: string) => {
  if (fieldKey === "description") return "flex-[2.4]";
  if (fieldKey === "quantity") return "flex-[0.7]";
  if (fieldKey === "price") return "flex-[0.9]";
  if (fieldKey === "total") return "flex-[0.9]";
  return "flex-1";
};

const restrictToHorizontalAxis: Modifier = ({ transform }) => ({
  ...transform,
  y: 0,
});

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0,
});

const columnCollisionDetection: CollisionDetection = (args) => {
  const pointerIntersections = pointerWithin(args);
  if (pointerIntersections.length) return pointerIntersections;
  return rectIntersection(args);
};


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
  const widthClass = getColumnWidthClass(column.fieldKey);
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
    data: { type: "column" },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`flex flex-col gap-1 min-w-0 ${widthClass} ${
        column.hidden ? "opacity-60" : ""
      }`}
    >

      {/* ✅ DRAG HANDLE (LABEL ONLY) */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="w-full cursor-move text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 flex items-center gap-1"
      >
        <span className="text-slate-400">≡</span>
        {label}
      </div>

      {/* inputs stay clean */}
      {children}
    </div>
  );
};

const StaticCell = ({
  column,
  label,
  children,
}: {
  column: InvoiceColumnInput;
  label: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div
    className={`flex flex-col gap-1 min-w-0 ${getColumnWidthClass(
      column.fieldKey
    )} ${
      column.hidden ? "opacity-60" : ""
    }`}
  >
    <div className="w-full text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 flex items-center gap-1">
      {label}
    </div>
    {children}
  </div>
);

const ColumnDragOverlay = ({
  columns,
  rowRef,
}: {
  columns: InvoiceColumnInput[];
  rowRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [overlay, setOverlay] = React.useState<{
    id: string;
    label: string;
    startLeft: number;
    top: number;
  } | null>(null);
  const [deltaX, setDeltaX] = React.useState(0);

  useDndMonitor({
    onDragStart: ({ active }) => {
      if (active.data.current?.type !== "column") return;
      const initialRect = active.rect.current?.initial;
      if (!initialRect) return;
      const rowRect = rowRef.current?.getBoundingClientRect();
      const label =
        columns.find((column) => getColDndId(column) === String(active.id))
          ?.label ?? "";
      setOverlay({
        id: String(active.id),
        label,
        startLeft: initialRect.left,
        top: rowRect?.top ?? initialRect.top,
      });
      setDeltaX(0);
    },
    onDragMove: ({ active, delta }) => {
      if (active.data.current?.type !== "column") return;
      setDeltaX(delta.x);
    },
    onDragEnd: ({ active }) => {
      if (active.data.current?.type !== "column") return;
      setOverlay(null);
      setDeltaX(0);
    },
    onDragCancel: ({ active }) => {
      if (active.data.current?.type !== "column") return;
      setOverlay(null);
      setDeltaX(0);
    },
  });

  if (!overlay) return null;

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${overlay.startLeft + deltaX}px, ${overlay.top}px, 0)`,
      }}
    >
      <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-lg">
        <span className="font-medium text-slate-800">{overlay.label}</span>
        <span className="text-slate-500">â‰¡</span>
      </div>
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
    data: { type: "row" },
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
        className="absolute -left-8 top-1/2 z-10 flex h-8 w-5 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-700 cursor-move"
        aria-label="Reorder row"
      >
        <FiChevronUp className="text-xs" />
        <FiChevronDown className="text-xs" />
      </button>
      {children}
    </div>
  );
};

const DateDefaults = () => {
  const { values, setFieldValue } = useFormikContext<InvoiceFormValues>();

  React.useEffect(() => {
    if (values.issueDate) return;
    const today = new Date();
    setFieldValue("issueDate", formatDateInput(today), false);
  }, [setFieldValue, values.issueDate]);

  return null;
};

const DueDateAutoFill = ({ dueDays }: { dueDays: number }) => {
  const { values, setFieldValue } = useFormikContext<InvoiceFormValues>();
  const lastAutoRef = React.useRef<string | null>(null);
  const lastIssueRef = React.useRef<string | null>(null);
  const lastDueDaysRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const issueDate = values.issueDate;
    if (!issueDate) return;
    const nextDue = addDays(issueDate, dueDays);
    if (!nextDue) return;

    const isIssueChanged = lastIssueRef.current !== issueDate;
    const isAutoValue =
      values.dueDate && lastAutoRef.current === values.dueDate;
    const isDueDaysChanged =
      lastDueDaysRef.current !== null && lastDueDaysRef.current !== dueDays;

    if (
      !values.dueDate ||
      (isIssueChanged && isAutoValue) ||
      (isDueDaysChanged && isAutoValue)
    ) {
      setFieldValue("dueDate", nextDue, false);
      lastAutoRef.current = nextDue;
    }
    lastIssueRef.current = issueDate;
    lastDueDaysRef.current = dueDays;
  }, [dueDays, setFieldValue, values.dueDate, values.issueDate]);

  return null;
};

const DefaultBusiness = ({
  businesses,
}: {
  businesses?: GetMyBusinessesQuery["myBusinesses"];
}) => {
  const { values, setFieldValue } = useFormikContext<InvoiceFormValues>();

  React.useEffect(() => {
    if (values.business) return;
    const defaultBusiness = businesses?.find((b) => b.defaultBusiness);
    if (!defaultBusiness?._id) return;
    setFieldValue("business", defaultBusiness._id, false);
  }, [businesses, setFieldValue, values.business]);

  return null;
};

const BusinessCurrencySync = ({
  businesses,
}: {
  businesses?: GetMyBusinessesQuery["myBusinesses"];
}) => {
  const { values, setFieldValue } = useFormikContext<InvoiceFormValues>();
  const lastBusinessRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const businessId = values.business?.trim();
    if (!businessId) return;
    if (lastBusinessRef.current === businessId) return;
    lastBusinessRef.current = businessId;

    const selectedBusiness = businesses?.find(
      (business) => business._id === businessId
    ) as { country?: string | null } | undefined;

    const match = COUNTRY_OPTIONS.find(
      (country) => country.name === selectedBusiness?.country
    );
    if (match?.currency) {
      setFieldValue("currency", match.currency, false);
    }
  }, [businesses, setFieldValue, values.business]);

  return null;
};

const InvoiceNumberAutoFill = ({
  enabled,
  mode,
}: {
  enabled: boolean;
  mode: "auto" | "custom";
}) => {
  const { values, setFieldValue } = useFormikContext<InvoiceFormValues>();
  const [reserveInvoiceNumber] = useMutation<
    { reserveInvoiceNumber: string },
    { businessId: string; issueDate?: string | null }
  >(RESERVE_INVOICE_NUMBER);
  const lastReservedRef = React.useRef<string | null>(null);
  const lastBusinessRef = React.useRef<string | null>(null);
  const lastIssueDateRef = React.useRef<string | null>(null);
  const pendingRef = React.useRef(false);

  React.useEffect(() => {
    if (!enabled) return;
    if (mode !== "auto") return;
    const businessId = values.business?.trim();
    if (!businessId) return;
    if (!values.issueDate) return;

    const current = values.invoiceNumber?.trim() ?? "";
    const lastReserved = lastReservedRef.current ?? "";
    const businessChanged = lastBusinessRef.current !== businessId;
    const issueDateValue = values.issueDate ?? "";
    const issueDateChanged = lastIssueDateRef.current !== issueDateValue;
    const isAutoValue = current && current === lastReserved;

    if (current && !isAutoValue) return;
    if (!current && lastReserved && !businessChanged && !issueDateChanged) {
      setFieldValue("invoiceNumber", lastReserved, false);
      return;
    }
    if (current && isAutoValue && !businessChanged && !issueDateChanged) return;
    if (pendingRef.current) return;

    pendingRef.current = true;
    reserveInvoiceNumber({
      variables: { businessId, issueDate: values.issueDate || null },
    })
      .then(({ data }) => {
        const nextNumber = data?.reserveInvoiceNumber;
        if (nextNumber) {
          setFieldValue("invoiceNumber", nextNumber, false);
          lastReservedRef.current = nextNumber;
          lastBusinessRef.current = businessId;
          lastIssueDateRef.current = issueDateValue;
        }
      })
      .finally(() => {
        pendingRef.current = false;
      });
  }, [
    enabled,
    mode,
    reserveInvoiceNumber,
    setFieldValue,
    values.business,
    values.invoiceNumber,
    values.issueDate,
  ]);

  return null;
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
    className="text-red-600 text-xs mt-1"
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
  editing,
  defaultInvoiceNumber
}: InvoiceFormProps) => {
  /* ================= HELPERS ================= */

  const initialRowId = React.useId();
  const inputBaseClass =
    "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200";
  const selectBaseClass = `${inputBaseClass} pr-8`;
  const cardBaseClass =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

  const createEmptyItem = (rowId?: string): InvoiceItem =>
    columns.reduce((acc, col) => {
      acc[col.fieldKey] = col.type === "number" ? 0 : "";
      return acc;
    }, { _rowId: rowId ?? uuid() } as InvoiceItem);

  const [invoiceNumberMode, setInvoiceNumberMode] = React.useState<
    "auto" | "custom"
  >(() => (editing ? "auto" : "auto"));
  const lastCustomInvoiceRef = React.useRef<string | null>(null);
  const lastAutoInvoiceRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (editing) {
      setInvoiceNumberMode("auto");
    }
  }, [editing]);

  /* ================= INITIAL VALUES ================= */

  const fallbackInitialValues: InvoiceFormValues = {
    client: "",
    business: "",
    currency: "BDT",
    status: "INVOICE",
    issueDate: "",
    dueDate: "",
    invoiceNumber: defaultInvoiceNumber ?? "",
    items: [createEmptyItem(initialRowId)],
    notes: "Thank you for your business.",
    subtotal: 0,
    total: 0,
    paid: 0,
    balanceDue: 0,
    totalsCustom: [],
  };

  const formInitialValues = initialValues ?? fallbackInitialValues;


  /* ================= DND CONFIG ================= */

  const [labelModalOpen, setLabelModalOpen] = React.useState(false);
  const [labelDraft, setLabelDraft] = React.useState("");
  const [labelTargetKey, setLabelTargetKey] = React.useState<string | null>(null);
  const columnRowRef = React.useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const onRowDragEnd = (
    event: DragEndEvent,
    items: InvoiceItem[],
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);
    const oldIndex = items.findIndex((item) => getRowDndId(item) === activeStr);
    const newIndex = items.findIndex((item) => getRowDndId(item) === overStr);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    const reorderedItems = arrayMove(items, oldIndex, newIndex);
    setFieldValue("items", reorderedItems);
  };

  const onColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr = String(over.id);
    setColumns((cols) => {
      const total = cols.find((c) => c.fieldKey === "total");
      const draggable = cols.filter((c) => c.fieldKey !== "total");
      const oldIndex = draggable.findIndex((c) => getColDndId(c) === activeStr);
      const newIndex = draggable.findIndex((c) => getColDndId(c) === overStr);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return cols;
      }
      const reordered = arrayMove(draggable, oldIndex, newIndex);
      const next = total ? [...reordered, total] : reordered;
      return next.map((c, i) => ({ ...c, order: i + 1 }));
    });
  };

  const openLabelModal = (column: InvoiceColumnInput) => {
    setLabelTargetKey(column.fieldKey);
    setLabelDraft(column.label);
    setLabelModalOpen(true);
  };

  const toggleColumnHidden = (column: InvoiceColumnInput) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.fieldKey === column.fieldKey
          ? { ...col, hidden: !col.hidden }
          : col
      )
    );
  };

  const saveLabel = () => {
    if (!labelTargetKey) return;
    const nextLabel = labelDraft.trim();
    if (!nextLabel) {
      setLabelModalOpen(false);
      return;
    }
    setColumns((prev) =>
      prev.map((col) =>
        col.fieldKey === labelTargetKey ? { ...col, label: nextLabel } : col
      )
    );
    setLabelModalOpen(false);
  };

  /* ================= QUERIES ================= */

  const { data: businessData, refetch: refetchBusinesses } =
    useQuery<GetMyBusinessesQuery>(GET_MY_BUSINESSES);
  const { data: clientData, refetch: refetchClients } =
    useQuery<{ findAllClients: ClientType[] }>(GET_ALL_CLIENTS);

  const [businessModalOpen, setBusinessModalOpen] = React.useState(false);
  const [clientModalOpen, setClientModalOpen] = React.useState(false);
  const [clientModalClient, setClientModalClient] = React.useState<ClientType | undefined>(undefined);
  const setFieldValueRef = React.useRef<((field: string, value: any) => void) | null>(null);

  /* ================= RENDER ================= */

  return (
    <>
      <Formik
        initialValues={formInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={Boolean(initialValues)}
      >
        {({ values, setFieldValue }) => {
          setFieldValueRef.current = setFieldValue;
          const defaultBusiness = businessData?.myBusinesses?.find(
            (business) => business.defaultBusiness
          );
          const selectedBusiness = businessData?.myBusinesses?.find(
            (business) => business._id === values.business
          ) as
            | (GetMyBusinessesQuery["myBusinesses"][number] & {
                invoiceDueDays?: number | null;
                invoiceNumberPrefix?: string | null;
                invoiceNumberPaddingDigits?: number | null;
                invoiceNumberResetYearly?: boolean | null;
                invoiceNumberStartNumber?: number | null;
              })
            | undefined;
          const selectedClient = clientData?.findAllClients?.find(
            (client) => client._id === values.client
          );
          const totalColumn = columns.find((column) => column.fieldKey === "total");
          const draggableColumns = columns.filter(
            (column) => column.fieldKey !== "total"
          );
          const displayColumns = totalColumn
            ? [...draggableColumns, totalColumn]
            : draggableColumns;
          const dueDays = Math.max(
            1,
            Number(selectedBusiness?.invoiceDueDays ?? 15) || 15
          );
          const invoicePreview = buildInvoicePreview({
            prefix: selectedBusiness?.invoiceNumberPrefix,
            paddingDigits: selectedBusiness?.invoiceNumberPaddingDigits,
            resetYearly: selectedBusiness?.invoiceNumberResetYearly,
            startNumber: selectedBusiness?.invoiceNumberStartNumber,
            issueDate: values.issueDate,
          });

          React.useEffect(() => {
            if (invoiceNumberMode !== "auto") return;
            const current = String(values.invoiceNumber ?? "").trim();
            if (current) {
              lastAutoInvoiceRef.current = current;
            }
          }, [invoiceNumberMode, values.invoiceNumber]);

          return (
            <Form className="space-y-6">
          <ItemsColumnSync columns={columns} />
          <DateDefaults />
          <DueDateAutoFill dueDays={dueDays} />
          <DefaultBusiness businesses={businessData?.myBusinesses} />
          <BusinessCurrencySync businesses={businessData?.myBusinesses} />
          <InvoiceNumberAutoFill enabled={!editing} mode={invoiceNumberMode} />
          <LiveCalculation columns={columns} onUpdate={onUpdate} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Invoice workspace
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {editing ? "Update" : "Create"} Invoice
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Real-time preview updates as you edit
            </div>
          </div>

          {/* ================= BUSINESS / CLIENT ================= */}

          <section className={cardBaseClass}>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Business and client
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Who is this invoice for?
              </h3>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    Business
                  </label>
                  {defaultBusiness?._id === values.business && (
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Select the business profile to bill from.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Field
                    as="select"
                    name="business"
                    className={selectBaseClass}
                  >
                    <option value="">Select business</option>
                    {businessData?.myBusinesses?.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.companyName}
                      </option>
                    ))}
                  </Field>
                  <button
                    type="button"
                    onClick={() => setBusinessModalOpen(true)}
                    className="mt-1 inline-flex h-[42px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800"
                  >
                    <FiPlus className="text-xs" />
                    New business
                  </button>
                </div>
                {selectedBusiness && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-sm">
                    <div className="flex items-center gap-2">
                      {selectedBusiness.logoUrl && (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                          <img
                            src={selectedBusiness.logoUrl}
                            alt={`${selectedBusiness.companyName} logo`}
                            className="h-6 w-6 object-contain"
                          />
                        </div>
                      )}
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        Business details
                      </p>
                    </div>
                    <div className="mt-2 grid gap-1">
                      <span>
                        Email:{" "}
                        <span className="font-semibold text-slate-900">
                          {selectedBusiness.contactEmail || "—"}
                        </span>
                      </span>
                      <span>
                        Phone:{" "}
                        <span className="font-semibold text-slate-900">
                          {selectedBusiness.phoneNumber || "—"}
                        </span>
                      </span>
                      <span>
                        Address:{" "}
                        <span className="font-semibold text-slate-900">
                          {selectedBusiness.location || "—"}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
                <FieldError name="business" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">
                    Client
                  </label>
                </div>
                <p className="text-xs text-slate-500">
                  Choose who will receive this invoice.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Field
                    as="select"
                    name="client"
                    className={selectBaseClass}
                  >
                    <option value="">Select client</option>
                    {clientData?.findAllClients?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Field>
                  <button
                    type="button"
                    onClick={() => {
                      setClientModalClient(undefined);
                      setClientModalOpen(true);
                    }}
                    className="mt-1 inline-flex h-[42px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800"
                  >
                    <FiPlus className="text-xs" />
                    New client
                  </button>
                </div>
                {selectedClient && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        Client details
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setClientModalClient(selectedClient);
                          setClientModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800"
                      >
                        <FiEdit2 className="text-xs" />
                        Edit
                      </button>
                    </div>
                    <div className="mt-2 grid gap-1">
                      <span>
                        Email:{" "}
                        <span className="font-semibold text-slate-900">
                          {selectedClient.email || "—"}
                        </span>
                      </span>
                      <span>
                        Phone:{" "}
                        <span className="font-semibold text-slate-900">
                          {selectedClient.phone || "—"}
                        </span>
                      </span>
                      <span>
                        Address:{" "}
                        <span className="font-semibold text-slate-900">
                          {selectedClient.address || "—"}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
                <FieldError name="client" />
              </div>
            </div>
          </section>

          {/* ================= DATES & CURRENCY ================= */}

          <section className={cardBaseClass}>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Invoice details
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Dates, currency, status
              </h3>
            </div>

            <div className="mt-5">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Invoice Number
                  </label>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (editing) return;
                        const currentCustom = String(values.invoiceNumber ?? "").trim();
                        if (currentCustom) {
                          lastCustomInvoiceRef.current = currentCustom;
                        }
                        setInvoiceNumberMode("auto");
                        const lastAuto = lastAutoInvoiceRef.current ?? "";
                        setFieldValue("invoiceNumber", lastAuto, false);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        invoiceNumberMode === "auto"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      } ${editing ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      Auto-generate (recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editing) return;
                        const currentAuto = String(values.invoiceNumber ?? "").trim();
                        if (currentAuto) {
                          lastAutoInvoiceRef.current = currentAuto;
                        }
                        setInvoiceNumberMode("custom");
                        const lastCustom = lastCustomInvoiceRef.current ?? "";
                        setFieldValue("invoiceNumber", lastCustom, false);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        invoiceNumberMode === "custom"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      } ${editing ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      Custom
                    </button>
                  </div>

                  {invoiceNumberMode === "custom" && !editing ? (
                    <Field
                      type="text"
                      name="invoiceNumber"
                      className={inputBaseClass}
                      placeholder="Enter custom number"
                    />
                  ) : (
                    <Field name="invoiceNumber">
                      {({ field }: InvoiceFieldProps) => (
                        <input
                          {...field}
                          type="text"
                          readOnly
                          className={`${inputBaseClass} bg-slate-50`}
                          placeholder="Auto-generated on save"
                          value={field.value || invoicePreview}
                        />
                      )}
                    </Field>
                  )}

                  <p className="mt-1 text-xs text-slate-400">
                    {editing
                      ? "Auto-generated numbers are locked after save."
                      : invoiceNumberMode === "auto"
                      ? `Preview: ${values.invoiceNumber || invoicePreview}`
                      : "Enter a custom invoice number."}
                  </p>
                </div>
              </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Issue Date
                </label>
                <Field
                  type="date"
                  name="issueDate"
                  className={inputBaseClass}
                />
                <FieldError name="issueDate" />
              </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Due Date
                  </label>
                  <Field name="dueDate">
                    {({ field }: InvoiceFieldProps) => (
                      <input
                        {...field}
                        type="date"
                        min={values.issueDate || undefined}
                        className={inputBaseClass}
                      />
                    )}
                  </Field>
                  <FieldError name="dueDate" />
                  <p className="mt-1 text-xs text-slate-400">
                    Default due date is {dueDays} days from issue.
                  </p>
                </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Currency
                </label>
                <Field
                  as="select"
                  name="currency"
                  className={selectBaseClass}
                >
                  {INVOICE_CURRENCY_OPTIONS.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Field>
                <FieldError name="currency" />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <Field as="select" name="status" className={selectBaseClass}>
                  {INVOICE_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Field>
                <FieldError name="status" />
              </div>
            </div>
          </section>

          {/* ================= ITEMS ================= */}

          <section className={cardBaseClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                  Line items
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  Add your services
                </h3>
                <p className="text-xs text-slate-500">
                  Drag headers to reorder columns.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddColumnModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-800"
              >
                <FiPlus className="text-xs" />
                Add column
              </button>
            </div>

            <FieldArray name="items">
              {({ push, remove }) => (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragEnd={(event) =>
                    onRowDragEnd(event, values.items, setFieldValue)
                  }
                >
                  <div className="mt-5 space-y-4 pl-8">

                  <SortableContext
                    items={values.items.map((item) => getRowDndId(item))}
                    strategy={verticalListSortingStrategy}
                  >
                    {values.items.map((item, i) => {
                      const isFirstRow = i === 0;
                      const rowId = getRowDndId(item);

                      return (
                        <SortableRow key={rowId} id={rowId}>
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:bg-slate-50/70">
                            <div className="flex gap-3 w-full items-start relative">
                              {/* ✅ ONLY FIRST ROW IS SORTABLE, AND ONLY THE COLUMNS AREA IS IN SortableContext */}
                              {isFirstRow ? (
                                <DndContext
                                  sensors={sensors}
                                  collisionDetection={columnCollisionDetection}
                                  modifiers={[restrictToHorizontalAxis]}
                                  onDragEnd={onColumnDragEnd}
                                >
                                  <SortableContext
                                    items={draggableColumns.map((c) =>
                                      getColDndId(c)
                                    )}
                                    strategy={horizontalListSortingStrategy}
                                  >
                                    <div
                                      ref={columnRowRef}
                                      className="flex gap-3 w-full flex-1"
                                    >
                                      {draggableColumns.map((column) => {
                                      const isTotal = column.fieldKey === "total";

                                      const isHidden = Boolean(column.hidden);
                                      const fieldEl =
                                        column.fieldKey === "price" ||
                                        column.fieldKey === "total" ? (
                                          <Field name={`items.${i}.${column.fieldKey}`}>
                                            {({ field }: InvoiceFieldProps) => (
                                              <input
                                                {...field}
                                                type={isTotal ? "text" : "number"}
                                                inputMode="decimal"
                                                step="0.01"
                                                readOnly={isTotal}
                                                value={
                                                  isTotal
                                                    ? Number(field.value ?? 0).toFixed(2)
                                                    : field.value ?? ""
                                                }
                                                onBlur={(event) => {
                                                  field.onBlur(event);
                                                  if (isTotal) return;
                                                  const raw = event.target.value;
                                                  if (!raw) return;
                                                  const numeric = Number(raw);
                                                  if (Number.isNaN(numeric)) return;
                                                  setFieldValue(
                                                    field.name,
                                                    Number(numeric.toFixed(2))
                                                  );
                                                }}
                                                className={`w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                                                  isTotal
                                                    ? "bg-slate-50 text-center font-semibold"
                                                    : ""
                                                } ${isHidden ? "text-slate-500" : ""}`}
                                              />
                                            )}
                                          </Field>
                                        ) : (
                                          <Field name={`items.${i}.${column.fieldKey}`}>
                                            {({ field }: InvoiceFieldProps) => (
                                              <input
                                                {...field}
                                                readOnly={isTotal}
                                                type={
                                                  column.type === "number"
                                                    ? "number"
                                                    : "text"
                                                }
                                                value={
                                                  field.value ??
                                                  (column.type === "number" ? 0 : "")
                                                }
                                                className={`w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                                                  isTotal
                                                    ? "bg-slate-50 text-center font-semibold"
                                                    : ""
                                                } ${isHidden ? "text-slate-500" : ""}`}
                                              />
                                            )}
                                          </Field>
                                        );

                                      return (
                                        <SortableCell
                                          key={column.fieldKey}
                                          column={column}
                                          label={
                                            <div className="flex justify-between w-full">
                                              <span
                                                className={
                                                  isHidden ? "text-slate-400" : ""
                                                }
                                              >
                                                {column.label}
                                              </span>

                                              <div className="flex items-center gap-2">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleColumnHidden(column);
                                                  }}
                                                  className={`hover:text-slate-700 ${
                                                    isHidden
                                                      ? "text-slate-400"
                                                      : "text-slate-500"
                                                  }`}
                                                  aria-label={`Toggle ${column.label} visibility`}
                                                >
                                                  {isHidden ? (
                                                    <FiEyeOff className="text-xs" />
                                                  ) : (
                                                    <FiEye className="text-xs" />
                                                  )}
                                                </button>
                                                {column.locked && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      openLabelModal(column);
                                                    }}
                                                    className="text-slate-500 hover:text-slate-700"
                                                    aria-label={`Edit ${column.label} label`}
                                                  >
                                                    <FiEdit2 className="text-xs" />
                                                  </button>
                                                )}

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
                                            </div>
                                          }
                                        >
                                          {fieldEl}
                                          <FieldError
                                            name={`items.${i}.${column.fieldKey}`}
                                          />
                                        </SortableCell>
                                      );
                                    })}
                                    {totalColumn && (
                                      <StaticCell
                                        column={totalColumn}
                                        label={
                                          <div className="flex justify-between w-full">
                                            <span
                                              className={
                                                totalColumn.hidden
                                                  ? "text-slate-400"
                                                  : ""
                                              }
                                            >
                                              {totalColumn.label}
                                            </span>

                                            <div className="flex items-center gap-2">
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  toggleColumnHidden(totalColumn);
                                                }}
                                                className={`hover:text-slate-700 ${
                                                  totalColumn.hidden
                                                    ? "text-slate-400"
                                                    : "text-slate-500"
                                                }`}
                                                aria-label={`Toggle ${totalColumn.label} visibility`}
                                              >
                                                {totalColumn.hidden ? (
                                                  <FiEyeOff className="text-xs" />
                                                ) : (
                                                  <FiEye className="text-xs" />
                                                )}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  openLabelModal(totalColumn);
                                                }}
                                                className="text-slate-500 hover:text-slate-700"
                                                aria-label={`Edit ${totalColumn.label} label`}
                                              >
                                                <FiEdit2 className="text-xs" />
                                              </button>
                                            </div>
                                          </div>
                                        }
                                      >
                                        <Field name={`items.${i}.${totalColumn.fieldKey}`}>
                                          {({ field }: InvoiceFieldProps) => (
                                            <input
                                              {...field}
                                              readOnly
                                              type="text"
                                              value={Number(field.value ?? 0).toFixed(2)}
                                              className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 text-center font-semibold shadow-sm"
                                            />
                                          )}
                                        </Field>
                                      </StaticCell>
                                    )}
                                    </div>
                                  </SortableContext>
                                  <ColumnDragOverlay columns={columns} rowRef={columnRowRef} />
                                </DndContext>
                              ) : (
                                <div className="flex gap-3 w-full flex-1">
                                  {displayColumns.map((column) => {
                                    const isTotal = column.fieldKey === "total";

                                    const isHidden = Boolean(column.hidden);
                                    return (
                                      <div
                                        key={column.fieldKey}
                                        className={`flex flex-col gap-1 min-w-0 ${getColumnWidthClass(
                                          column.fieldKey
                                        )} ${isHidden ? "opacity-60" : ""}`}
                                      >
                                        <div className="flex justify-between">
                                          <label
                                            className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                                              isHidden ? "text-slate-400" : "text-slate-500"
                                            }`}
                                          >
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

                                        {column.fieldKey === "price" ||
                                        column.fieldKey === "total" ? (
                                          <Field name={`items.${i}.${column.fieldKey}`}>
                                            {({ field }: InvoiceFieldProps) => (
                                              <input
                                                {...field}
                                                type={isTotal ? "text" : "number"}
                                                inputMode="decimal"
                                                step="0.01"
                                                readOnly={isTotal}
                                                value={
                                                  isTotal
                                                    ? Number(field.value ?? 0).toFixed(2)
                                                    : field.value ?? ""
                                                }
                                                onBlur={(event) => {
                                                  field.onBlur(event);
                                                  if (isTotal) return;
                                                  const raw = event.target.value;
                                                  if (!raw) return;
                                                  const numeric = Number(raw);
                                                  if (Number.isNaN(numeric)) return;
                                                  setFieldValue(
                                                    field.name,
                                                    Number(numeric.toFixed(2))
                                                  );
                                                }}
                                                className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                                                  isTotal
                                                    ? "bg-slate-50 text-center font-semibold"
                                                    : ""
                                                }`}
                                              />
                                            )}
                                          </Field>
                                        ) : (
                                          <Field name={`items.${i}.${column.fieldKey}`}>
                                            {({ field }: InvoiceFieldProps) => (
                                              <input
                                                {...field}
                                                readOnly={isTotal}
                                                type={
                                                  column.type === "number"
                                                    ? "number"
                                                    : "text"
                                                }
                                                value={
                                                  field.value ??
                                                  (column.type === "number" ? 0 : "")
                                                }
                                                className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                                                  isTotal
                                                    ? "bg-slate-50 text-center font-semibold"
                                                    : ""
                                                }`}
                                              />
                                            )}
                                          </Field>
                                        )}
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
                                  className="absolute -right-4 -bottom-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-md"
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

                  <div className="text-xs text-slate-500">
                    Add line items to auto-calculate totals.
                  </div>
                  <button
                    type="button"
                    onClick={() => push(createEmptyItem())}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
                  >
                    <FiPlus /> Add item
                  </button>
                </div>

              </DndContext>
            )}
          </FieldArray>
          </section>

          {/* ================= SUMMARY ================= */}

          <div className="flex justify-end mt-6">
            <div className={`w-full max-w-sm space-y-4 ${cardBaseClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    Summary
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Invoice totals
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {INVOICE_STATUS_OPTIONS.find(
                    (option) => option.value === values.status
                  )?.label ?? values.status ?? "Draft"}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                {/* Subtotal */}
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    {values.currency} {values.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Custom Totals */}
                <FieldArray name="totalsCustom">
                  {({ push, remove }) => (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Adjustments
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            push({
                              key: uuid(),
                              label: "",
                              behavior: "ADD",
                              valueType: "FIXED",
                              value: 0,
                            })
                          }
                          className="text-xs font-semibold text-slate-600 hover:text-slate-800"
                        >
                          + Add
                        </button>
                      </div>

                      {values.totalsCustom?.map((field, index) => (
                        <div
                          key={field.key ?? index}
                          className="rounded-lg border border-slate-100 bg-slate-50 p-2 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <Field
                              name={`totalsCustom.${index}.label`}
                              placeholder="Label"
                              className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-slate-400 hover:text-red-500"
                              aria-label="Remove custom total"
                            >
                              <FaTimes />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Field
                              as="select"
                              name={`totalsCustom.${index}.behavior`}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs"
                            >
                              <option value="ADD">Add</option>
                              <option value="SUBTRACT">Subtract</option>
                              <option value="NONE">None</option>
                            </Field>

                            <Field
                              as="select"
                              name={`totalsCustom.${index}.valueType`}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs"
                            >
                              <option value="FIXED">Fixed</option>
                              <option value="PERCENT">Percent</option>
                            </Field>

                            <Field
                              name={`totalsCustom.${index}.value`}
                              type="number"
                              className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-right text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </FieldArray>

                <div className="border-t border-dashed border-slate-200 pt-3 text-base font-semibold text-slate-900">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span>
                      {values.currency} {values.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Paid</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {values.currency}
                    </span>
                    <Field name="paid">
                      {({ field }: InvoiceFieldProps) => (
                        <input
                          {...field}
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          value={field.value ?? 0}
                          onBlur={(event) => {
                            field.onBlur(event);
                            const raw = event.target.value;
                            if (!raw) return;
                            const numeric = Number(raw);
                            if (Number.isNaN(numeric)) return;
                            setFieldValue(field.name, Number(numeric.toFixed(2)));
                          }}
                          className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-right text-xs text-slate-700"
                        />
                      )}
                    </Field>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 text-base font-semibold text-slate-900">
                  <div className="flex items-center justify-between">
                    <span>Balance Due</span>
                    <span>
                      {values.currency}{" "}
                      {Number(values.balanceDue ?? values.total ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ================= NOTES ================= */}

          <section className={cardBaseClass}>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Notes and terms
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Add a closing note
              </h3>
            </div>
            <Field
              as="textarea"
              name="notes"
              rows={3}
              className={`${inputBaseClass} mt-4`}
            />
          </section>

          {/* ================= SUBMIT ================= */}

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <Spin size="small" />
                Please Wait
              </span>
            ) : editing ? (
              "Update Invoice"
            ) : (
              "Create Invoice"
            )}
          </button>
          </Form>
          );
        }}
      </Formik>
      <Modal
        title="Edit Column Label"
        open={labelModalOpen}
        onOk={saveLabel}
        onCancel={() => setLabelModalOpen(false)}
        okText="Save"
      >
        <Input
          value={labelDraft}
          onChange={(event) => setLabelDraft(event.target.value)}
          placeholder="Column label"
        />
      </Modal>

      <Modal
        title={null}
        open={businessModalOpen}
        onCancel={() => setBusinessModalOpen(false)}
        footer={null}
        destroyOnHidden
        closable={false}
        width={720}
      >
        <AddBusinessForm
          redirectOnSuccess={false}
          variant="modal"
          onSuccess={() => {
            setBusinessModalOpen(false);
            refetchBusinesses();
          }}
        />
      </Modal>

      <Modal
        title={null}
        open={clientModalOpen}
        onCancel={() => {
          setClientModalOpen(false);
          setClientModalClient(undefined);
        }}
        footer={null}
        destroyOnHidden
        closable={false}
        width={720}
      >
        <AddNewClient
          client={clientModalClient}
          redirectOnSuccess={false}
          variant="modal"
          onSuccess={(createdId) => {
            setClientModalOpen(false);
            setClientModalClient(undefined);
            refetchClients().then(() => {
              if (createdId) {
                setFieldValueRef.current?.("client", createdId);
              }
            });
          }}
        />
      </Modal>
    </>
  );
};

export default InvoiceForm;



