export type InvoiceTerms =
  | {
      type: "flat";
      items: TermItem[];
    }
  | {
      type: "grouped";
      groups: TermGroup[];
    };

export type TermItem = {
  id: string;
  text: string;
  order: number;
};

export type TermGroup = {
  id: string;
  title: string;
  order: number;
  items: TermItem[];
  collapsed?: boolean;
};

const TERMS_PREFIX = "__TERMS__:";

type StoredTermsPayload = {
  v: 1;
  terms: InvoiceTerms;
};

const normalizeItems = (items: TermItem[]) =>
  items
    .map((item, index) => ({
      ...item,
      text: String(item.text ?? "").trim(),
      order: index + 1,
    }))
    .filter((item) => item.text.length > 0);

export const normalizeTerms = (
  terms?: InvoiceTerms | null
): InvoiceTerms | null => {
  if (!terms) return null;
  if (terms.type === "flat") {
    const items = normalizeItems(terms.items ?? []);
    return items.length ? { type: "flat", items } : null;
  }

  const groups = (terms.groups ?? [])
    .map((group, index) => {
      const title = String(group.title ?? "").trim() || `Group ${index + 1}`;
      const items = normalizeItems(group.items ?? []);
      return {
        ...group,
        title,
        order: index + 1,
        items,
      };
    })
    .filter((group) => group.items.length > 0);

  return groups.length ? { type: "grouped", groups } : null;
};

export const countTerms = (terms?: InvoiceTerms | null) => {
  if (!terms) return 0;
  if (terms.type === "flat") return terms.items?.length ?? 0;
  return (terms.groups ?? []).reduce(
    (sum, group) => sum + (group.items?.length ?? 0),
    0
  );
};

export const serializeTermsToNotes = (
  terms?: InvoiceTerms | null
): string => {
  const normalized = normalizeTerms(terms);
  if (!normalized) return "";
  const payload: StoredTermsPayload = { v: 1, terms: normalized };
  return `${TERMS_PREFIX}${JSON.stringify(payload)}`;
};

export const parseTermsFromNotes = (
  notes?: string | null
): InvoiceTerms | null => {
  const value = String(notes ?? "").trim();
  if (!value) return null;
  if (value.startsWith(TERMS_PREFIX)) {
    try {
      const raw = value.slice(TERMS_PREFIX.length);
      const payload = JSON.parse(raw) as StoredTermsPayload;
      if (!payload || payload.v !== 1 || !payload.terms) return null;
      return normalizeTerms(payload.terms);
    } catch {
      return null;
    }
  }

  return parseTermsFromText(value);
};

export const parseTermsFromText = (text: string): InvoiceTerms | null => {
  const lines = String(text ?? "")
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return null;
  const items = lines.map((line, index) => ({
    id: `legacy-${index + 1}`,
    text: line,
    order: index + 1,
  }));
  return { type: "flat", items };
};

