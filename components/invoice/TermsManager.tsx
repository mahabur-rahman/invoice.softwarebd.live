"use client";

import React from "react";
import { Button, Input, Modal, Popconfirm, Tooltip } from "antd";
import {
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { v4 as uuid } from "uuid";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  InvoiceTerms,
  TermGroup,
  TermItem,
  countTerms,
  normalizeTerms,
  parseTermsFromText,
} from "./termsUtils";

const defaultTermsStorageKey = "sellyx:default-terms";

const padIndex = (value: number) => String(value).padStart(2, "0");

const applyItemOrder = (items: TermItem[]) =>
  items.map((item, index) => ({ ...item, order: index + 1 }));

const applyGroupOrder = (groups: TermGroup[]) =>
  groups.map((group, index) => ({ ...group, order: index + 1 }));

const SortableTermRow = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
      }}
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-2 text-slate-400 hover:text-slate-600"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <FiMoreVertical />
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

type TermsManagerProps = {
  value?: InvoiceTerms | null;
  onChange: (next: InvoiceTerms | null) => void;
};

const TermsManager = ({ value, onChange }: TermsManagerProps) => {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<InvoiceTerms>({
    type: "flat",
    items: [],
  });
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const [defaultTermsText, setDefaultTermsText] = React.useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  React.useEffect(() => {
    if (!open) return;
    setDraft(
      value ?? {
        type: "flat",
        items: [],
      }
    );
  }, [open, value]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(defaultTermsStorageKey);
    if (stored) setDefaultTermsText(stored);
  }, []);

  const hasTerms = countTerms(value) > 0;
  const buttonLabel = hasTerms
    ? `Edit Terms & Conditions`
    : `Add Terms & Conditions`;
  const countLabel = hasTerms ? `${countTerms(value)} terms` : "";

  const handleCancel = () => setOpen(false);

  const handleSave = () => {
    const normalized = normalizeTerms(draft);
    onChange(normalized);
    setOpen(false);
  };

  const handleInsertDefault = () => {
    const parsed = parseTermsFromText(defaultTermsText);
    if (parsed) {
      setDraft(parsed);
    }
  };

  const handleAddTerm = (groupId?: string) => {
    const id = uuid();
    if (draft.type === "flat") {
      const items = applyItemOrder([
        ...(draft.items ?? []),
        { id, text: "", order: (draft.items?.length ?? 0) + 1 },
      ]);
      setDraft({ type: "flat", items });
      setFocusId(id);
      return;
    }

    const groups = draft.groups ?? [];
    const targetIndex =
      groupId != null
        ? groups.findIndex((group) => group.id === groupId)
        : groups.length - 1;
    const groupIndex = targetIndex >= 0 ? targetIndex : 0;
    const nextGroups = groups.length
      ? [...groups]
      : [
          {
            id: uuid(),
            title: "Group 1",
            order: 1,
            items: [],
          },
        ];
    const targetGroup = nextGroups[groupIndex] ?? nextGroups[0];
    const items = applyItemOrder([
      ...(targetGroup.items ?? []),
      { id, text: "", order: (targetGroup.items?.length ?? 0) + 1 },
    ]);
    nextGroups[groupIndex] = { ...targetGroup, items };
    setDraft({ type: "grouped", groups: applyGroupOrder(nextGroups) });
    setFocusId(id);
  };

  const handleAddGroup = () => {
    if (draft.type === "grouped") {
      const nextGroups = applyGroupOrder([
        ...(draft.groups ?? []),
        {
          id: uuid(),
          title: `Group ${(draft.groups?.length ?? 0) + 1}`,
          order: (draft.groups?.length ?? 0) + 1,
          items: [],
        },
      ]);
      setDraft({ type: "grouped", groups: nextGroups });
      return;
    }

    const existingItems = draft.items ?? [];
    const nextGroups: TermGroup[] = [
      {
        id: uuid(),
        title: "Group 1",
        order: 1,
        items: existingItems,
      },
    ];
    setDraft({ type: "grouped", groups: nextGroups });
  };

  const updateTermText = (
    text: string,
    termId: string,
    groupId?: string
  ) => {
    if (draft.type === "flat") {
      const items = (draft.items ?? []).map((item) =>
        item.id === termId ? { ...item, text } : item
      );
      setDraft({ type: "flat", items });
      return;
    }

    const groups = (draft.groups ?? []).map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: (group.items ?? []).map((item) =>
          item.id === termId ? { ...item, text } : item
        ),
      };
    });
    setDraft({ type: "grouped", groups });
  };

  const removeTerm = (termId: string, groupId?: string) => {
    if (draft.type === "flat") {
      const items = applyItemOrder(
        (draft.items ?? []).filter((item) => item.id !== termId)
      );
      setDraft({ type: "flat", items });
      return;
    }

    const groups = (draft.groups ?? []).map((group) => {
      if (group.id !== groupId) return group;
      return {
        ...group,
        items: applyItemOrder(
          (group.items ?? []).filter((item) => item.id !== termId)
        ),
      };
    });
    setDraft({ type: "grouped", groups });
  };

  const moveTerm = (direction: "up" | "down", termId: string, groupId?: string) => {
    if (draft.type === "flat") {
      const items = [...(draft.items ?? [])];
      const index = items.findIndex((item) => item.id === termId);
      if (index === -1) return;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= items.length) return;
      const reordered = applyItemOrder(arrayMove(items, index, nextIndex));
      setDraft({ type: "flat", items: reordered });
      return;
    }

    const groups = (draft.groups ?? []).map((group) => {
      if (group.id !== groupId) return group;
      const items = [...(group.items ?? [])];
      const index = items.findIndex((item) => item.id === termId);
      if (index === -1) return group;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= items.length) return group;
      return { ...group, items: applyItemOrder(arrayMove(items, index, nextIndex)) };
    });
    setDraft({ type: "grouped", groups });
  };

  const moveGroup = (direction: "up" | "down", groupId: string) => {
    if (draft.type !== "grouped") return;
    const groups = [...(draft.groups ?? [])];
    const index = groups.findIndex((group) => group.id === groupId);
    if (index === -1) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= groups.length) return;
    const reordered = applyGroupOrder(arrayMove(groups, index, nextIndex));
    setDraft({ type: "grouped", groups: reordered });
  };

  const toggleGroupCollapse = (groupId: string) => {
    if (draft.type !== "grouped") return;
    setDraft({
      type: "grouped",
      groups: (draft.groups ?? []).map((group) =>
        group.id === groupId
          ? { ...group, collapsed: !group.collapsed }
          : group
      ),
    });
  };

  const updateGroupTitle = (groupId: string, title: string) => {
    if (draft.type !== "grouped") return;
    setDraft({
      type: "grouped",
      groups: (draft.groups ?? []).map((group) =>
        group.id === groupId ? { ...group, title } : group
      ),
    });
  };

  const removeGroup = (groupId: string) => {
    if (draft.type !== "grouped") return;
    setDraft({
      type: "grouped",
      groups: applyGroupOrder(
        (draft.groups ?? []).filter((group) => group.id !== groupId)
      ),
    });
  };

  const handleTermKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    termId: string,
    groupId?: string
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleAddTerm(groupId);
    }
    if (event.key === "Backspace") {
      const value = (event.currentTarget.value ?? "").trim();
      if (!value) {
        event.preventDefault();
        removeTerm(termId, groupId);
      }
    }
  };

  const renderTermsList = (
    items: TermItem[],
    groupId?: string
  ) => {
    const itemIds = items.map((item) => item.id);
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over || active.id === over.id) return;
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          if (oldIndex === -1 || newIndex === -1) return;
          const reordered = applyItemOrder(arrayMove(items, oldIndex, newIndex));
          if (draft.type === "flat") {
            setDraft({ type: "flat", items: reordered });
            return;
          }
          const groups = (draft.groups ?? []).map((group) =>
            group.id === groupId ? { ...group, items: reordered } : group
          );
          setDraft({ type: "grouped", groups });
        }}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item, index) => {
              const value = String(item.text ?? "");
              const showWarning = value.length >= 280;
              return (
                <SortableTermRow key={item.id} id={item.id}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-400">
                        {padIndex(index + 1)}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <button
                          type="button"
                          onClick={() => moveTerm("up", item.id, groupId)}
                          className="hover:text-slate-600"
                          aria-label="Move up"
                        >
                          <FiChevronUp />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTerm("down", item.id, groupId)}
                          className="hover:text-slate-600"
                          aria-label="Move down"
                        >
                          <FiChevronDown />
                        </button>
                        <Popconfirm
                          title="Delete term?"
                          okText="Delete"
                          cancelText="Cancel"
                          onConfirm={() => removeTerm(item.id, groupId)}
                        >
                          <button
                            type="button"
                            className="hover:text-red-500"
                            aria-label="Delete term"
                          >
                            <FiTrash2 />
                          </button>
                        </Popconfirm>
                      </div>
                    </div>
                    <Input.TextArea
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      value={value}
                      maxLength={300}
                      placeholder="Enter term"
                      onChange={(event) =>
                        updateTermText(event.target.value, item.id, groupId)
                      }
                      onKeyDown={(event) =>
                        handleTermKeyDown(event, item.id, groupId)
                      }
                      ref={(el) => {
                        if (el && focusId === item.id) {
                          el.focus();
                          setFocusId(null);
                        }
                      }}
                    />
                    {showWarning && (
                      <div className="text-[11px] text-amber-600">
                        {value.length}/300 characters
                      </div>
                    )}
                  </div>
                </SortableTermRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  const renderFlat = () => (
    <div className="space-y-4">
      {renderTermsList(draft.type === "flat" ? draft.items ?? [] : [])}
      <div className="flex items-center justify-between">
        <Button
          type="dashed"
          icon={<FiPlus />}
          onClick={() => handleAddTerm()}
        >
          Add New Term
        </Button>
        <Button type="link" onClick={handleAddGroup}>
          Add New Group
        </Button>
      </div>
    </div>
  );

  const renderGrouped = () => (
    <div className="space-y-5">
      {(draft.type === "grouped" ? draft.groups ?? [] : []).map((group, index) => (
        <div
          key={group.id}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleGroupCollapse(group.id)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Toggle group"
              >
                {group.collapsed ? <FiChevronDown /> : <FiChevronUp />}
              </button>
              <Input
                value={group.title}
                placeholder={`Group ${index + 1}`}
                onChange={(event) =>
                  updateGroupTitle(group.id, event.target.value)
                }
                className="max-w-xs"
              />
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Tooltip title="Move group up">
                <button
                  type="button"
                  onClick={() => moveGroup("up", group.id)}
                  className="hover:text-slate-600"
                >
                  <FiChevronUp />
                </button>
              </Tooltip>
              <Tooltip title="Move group down">
                <button
                  type="button"
                  onClick={() => moveGroup("down", group.id)}
                  className="hover:text-slate-600"
                >
                  <FiChevronDown />
                </button>
              </Tooltip>
              <Popconfirm
                title="Delete group?"
                okText="Delete"
                cancelText="Cancel"
                onConfirm={() => removeGroup(group.id)}
              >
                <button type="button" className="hover:text-red-500">
                  <FiTrash2 />
                </button>
              </Popconfirm>
            </div>
          </div>

          {!group.collapsed && (
            <div className="mt-4 space-y-4">
              {renderTermsList(group.items ?? [], group.id)}
              <Button
                type="dashed"
                icon={<FiPlus />}
                onClick={() => handleAddTerm(group.id)}
              >
                Add New Term
              </Button>
            </div>
          )}
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button type="dashed" icon={<FiPlus />} onClick={() => handleAddTerm()}>
          Add New Term
        </Button>
        <Button type="link" onClick={handleAddGroup}>
          Add New Group
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center gap-3">
        <Button type="primary" onClick={() => setOpen(true)}>
          {buttonLabel}
        </Button>
        {countLabel && (
          <span className="text-xs text-slate-500">({countLabel})</span>
        )}
      </div>

      <Modal
        title="Terms and Conditions"
        open={open}
        onCancel={handleCancel}
        width={720}
        footer={null}
        closeIcon={<span className="text-lg">×</span>}
      >
        <div className="space-y-4">
          {!countTerms(draft) && defaultTermsText && (
            <Button onClick={handleInsertDefault}>Insert default terms</Button>
          )}

          {draft.type === "flat" ? renderFlat() : renderGrouped()}

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TermsManager;
