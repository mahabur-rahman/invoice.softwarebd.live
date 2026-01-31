"use client";

import React from "react";
import {
  InvoiceTerms,
  parseTermsFromNotes,
} from "@/components/invoice/termsUtils";

type TermsBlockProps = {
  terms?: InvoiceTerms | null;
  notes?: string | null;
  headingClassName?: string;
  listClassName?: string;
  itemClassName?: string;
};

const padIndex = (value: number) => String(value).padStart(2, "0");

const TermsBlock = ({
  terms,
  notes,
  headingClassName,
  listClassName,
  itemClassName,
}: TermsBlockProps) => {
  const resolvedTerms = terms ?? parseTermsFromNotes(notes ?? "");
  if (!resolvedTerms) return null;

  if (resolvedTerms.type === "flat") {
    const items = resolvedTerms.items ?? [];
    if (!items.length) return null;
    return (
      <div>
        <p
          className={
            headingClassName ??
            "text-xs uppercase tracking-[0.3em] text-slate-400"
          }
        >
          Terms & Conditions
        </p>
        <ol className={listClassName ?? "mt-3 space-y-2 text-sm text-slate-600"}>
          {items.map((item, index) => (
            <li key={item.id} className="flex gap-3">
              <span className="text-xs font-semibold text-slate-400">
                {padIndex(index + 1)}
              </span>
              <span className={itemClassName ?? "whitespace-pre-line"}>
                {item.text}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  const groups = resolvedTerms.groups ?? [];
  if (!groups.length) return null;
  return (
    <div className="space-y-4">
      <p
        className={
          headingClassName ??
          "text-xs uppercase tracking-[0.3em] text-slate-400"
        }
      >
        Terms & Conditions
      </p>
      {groups.map((group) => (
        <div key={group.id} className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">
            {group.title}
          </div>
          <ol className={listClassName ?? "space-y-2 text-sm text-slate-600"}>
            {(group.items ?? []).map((item, index) => (
              <li key={item.id} className="flex gap-3">
                <span className="text-xs font-semibold text-slate-400">
                  {padIndex(index + 1)}
                </span>
                <span className={itemClassName ?? "whitespace-pre-line"}>
                  {item.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
};

export default TermsBlock;

