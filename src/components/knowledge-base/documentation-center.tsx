"use client";

import {
  BookOpen,
  Clock3,
  Ellipsis,
  FilePlus,
  FileText,
  Search,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ListPagination, paginateItems } from "@/components/list-pagination";
import { type FilterFacet, FilterMenu } from "@/components/soc/filter-menu";
import {
  ModuleShell,
  ModuleToolbarActions,
  ModuleToolbarSearch,
} from "@/components/soc/module-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/lib/toast";

import { downloadTextFile } from "./download-text-file";
import {
  getDocumentationStats,
  type KbDocCategory,
  kbDocCategoryLabels,
  type KbDocStatus,
  kbDocStatusLabels,
  type KbDocument,
  kbDocuments,
} from "./knowledge-base-data";
import {
  DocCategoryBadge,
  DocStatusBadge,
  EmptyState,
  KbStatsStrip,
  OwnerCell,
  RelatedLinks,
} from "./knowledge-base-primitives";

type DocSort = "updated-desc" | "title-asc" | "read-asc";

const sortLabels: Record<DocSort, string> = {
  "updated-desc": "Recently updated",
  "title-asc": "Title A–Z",
  "read-asc": "Shortest read",
};

const categoryCodePrefix: Record<KbDocCategory, string> = {
  architecture: "ARCH",
  detection: "DET",
  response: "IR",
  integrations: "INT",
  policy: "POL",
  operations: "OPS",
};

function documentMarkdown(document: KbDocument) {
  return [
    `# ${document.title}`,
    "",
    `**Code:** ${document.code}`,
    `**Category:** ${kbDocCategoryLabels[document.category]}`,
    `**Status:** ${kbDocStatusLabels[document.status]}`,
    "",
    "## Summary",
    "",
    document.summary,
    "",
    "## Overview",
    "",
    `${document.title} covers the operating guidance the SOC relies on for ${kbDocCategoryLabels[document.category].toLowerCase()} work.`,
    "",
    document.summary,
    "",
    "Use the related links in the knowledge base to jump to the live queues and systems this document references.",
    "",
  ].join("\n");
}

function documentBodyParagraphs(document: KbDocument) {
  return [
    `${document.title} covers the operating guidance the SOC relies on for ${kbDocCategoryLabels[document.category].toLowerCase()} work.`,
    document.summary,
    "Review ownership, related queues, and the latest revision notes before applying this guidance in an active case. Keep evidence notes aligned with the retention windows defined in policy documents.",
    "Use the related links below to jump to the live queues and systems this document references.",
  ];
}

function DocFilterControl({
  statusFilters,
  categoryFilters,
  sort,
  activeFilterCount,
  onToggleStatus,
  onToggleCategory,
  onSetSort,
  onClearFilters,
}: {
  statusFilters: KbDocStatus[];
  categoryFilters: KbDocCategory[];
  sort: DocSort;
  activeFilterCount: number;
  onToggleStatus: (status: KbDocStatus) => void;
  onToggleCategory: (category: KbDocCategory) => void;
  onSetSort: (sort: DocSort) => void;
  onClearFilters: () => void;
}) {
  const facets: FilterFacet[] = [
    {
      id: "status",
      label: "Status",
      options: (Object.keys(kbDocStatusLabels) as KbDocStatus[]).map(
        (status) => ({ value: status, label: kbDocStatusLabels[status] }),
      ),
      selected: statusFilters,
      onToggle: (value) => onToggleStatus(value as KbDocStatus),
    },
    {
      id: "category",
      label: "Category",
      options: (Object.keys(kbDocCategoryLabels) as KbDocCategory[]).map(
        (category) => ({
          value: category,
          label: kbDocCategoryLabels[category],
        }),
      ),
      selected: categoryFilters,
      onToggle: (value) => onToggleCategory(value as KbDocCategory),
    },
    {
      id: "sort",
      label: "Sort by",
      single: true,
      hideCount: true,
      options: (Object.keys(sortLabels) as DocSort[]).map((option) => ({
        value: option,
        label: sortLabels[option],
      })),
      selected: [sort],
      onToggle: (value) => onSetSort(value as DocSort),
    },
  ];

  return (
    <FilterMenu
      facets={facets}
      activeCount={activeFilterCount}
      onClear={onClearFilters}
    />
  );
}

function DocumentCard({
  document,
  onOpen,
  onDownload,
}: {
  document: KbDocument;
  onOpen: (document: KbDocument) => void;
  onDownload: (document: KbDocument) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(document)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(document);
        }
      }}
      className="border-border/70 bg-card group flex cursor-pointer flex-col overflow-hidden rounded-xl border shadow-none transition-colors hover:border-foreground/20 dark:hover:border-white/16"
    >
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
            <FileText className="size-4" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={(event) => event.stopPropagation()}
                aria-label="Document actions"
              >
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(document);
                }}
              >
                Open document
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onDownload(document);
                }}
              >
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {document.related.slice(0, 2).map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} onClick={(e) => e.stopPropagation()}>
                    Go to {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground font-mono text-xs tracking-wide">
            {document.code}
          </p>
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold">
            {document.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
            {document.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DocCategoryBadge category={document.category} />
          <DocStatusBadge status={document.status} />
        </div>

        <RelatedLinks links={document.related} />
      </div>

      <div className="border-border/70 mt-auto flex items-center justify-between gap-3 border-t px-4 py-3">
        <OwnerCell
          userId={document.ownerId}
          href={`/administration/users/${document.ownerId}`}
        />
        <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 text-xs">
          <Clock3 className="size-3" />
          {document.readMinutes} min
        </span>
      </div>
    </article>
  );
}

export function DocumentationCenter() {
  const [documents, setDocuments] = useState<KbDocument[]>(() => [
    ...kbDocuments,
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<KbDocStatus[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<KbDocCategory[]>([]);
  const [sort, setSort] = useState<DocSort>("updated-desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selected, setSelected] = useState<KbDocument | null>(null);
  const [reading, setReading] = useState(false);
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<KbDocCategory>("operations");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const activeFilterCount =
    statusFilters.length +
    categoryFilters.length +
    (sort !== "updated-desc" ? 1 : 0);

  const toggleStatus = (status: KbDocStatus) => {
    setStatusFilters((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status],
    );
  };

  const toggleCategory = (category: KbDocCategory) => {
    setCategoryFilters((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilters([]);
    setCategoryFilters([]);
    setSort("updated-desc");
  };

  const openDocument = (document: KbDocument) => {
    setReading(false);
    setSelected(document);
  };

  const downloadDocument = (document: KbDocument) => {
    downloadTextFile({
      filename: `${document.code}.md`,
      content: documentMarkdown(document),
      mimeType: "text/markdown;charset=utf-8",
    });
    toast({
      title: "Downloaded",
      description: `${document.code}.md`,
    });
  };

  const createDraftDocument = ({
    title,
    category,
    summary,
  }: {
    title: string;
    category: KbDocCategory;
    summary?: string;
  }) => {
    const stamp = Date.now();
    const seq = String(documents.length + 1).padStart(2, "0");
    const draft: KbDocument = {
      id: `doc-${stamp}`,
      code: `DOC-${categoryCodePrefix[category]}-${seq}`,
      title,
      summary:
        summary ??
        `Draft notes for ${title}. Expand with runbooks, diagrams, and owner sign-off before publishing.`,
      category,
      status: "draft",
      ownerId: "riya-sharma",
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedLabel: "Just now",
      readMinutes: 5,
      tags: ["draft"],
      related: [
        { label: "Documentation", href: "/knowledge-base/documentation" },
        { label: "Users", href: "/administration/users" },
      ],
    };
    setDocuments((current) => [draft, ...current]);
    setReading(false);
    setSelected(draft);
    return draft;
  };

  const submitNewDocument = () => {
    const title = newTitle.trim();
    if (!title) {
      toast({
        title: "Title required",
        description: "Enter a document title to create a draft.",
      });
      return;
    }
    const draft = createDraftDocument({ title, category: newCategory });
    setNewDocOpen(false);
    setNewTitle("");
    setNewCategory("operations");
    toast({
      title: "Draft created",
      description: `${draft.code} is open in the document sheet.`,
    });
  };

  const submitUpload = () => {
    if (!uploadFile) {
      toast({
        title: "Choose a file",
        description: "Select a markdown or text file to upload.",
      });
      return;
    }
    const baseName = uploadFile.name.replace(/\.[^.]+$/, "").trim();
    const title = baseName || "Uploaded document";
    const draft = createDraftDocument({
      title,
      category: "operations",
      summary: `Uploaded from ${uploadFile.name}. Review and publish when content is ready.`,
    });
    setUploadOpen(false);
    setUploadFile(null);
    toast({
      title: "Upload imported",
      description: `${draft.code} created from ${uploadFile.name}.`,
    });
  };

  const visibleDocuments = useMemo(() => {
    const normalized = deferredSearchQuery.trim().toLowerCase();

    return documents
      .filter((document) => {
        if (
          statusFilters.length > 0 &&
          !statusFilters.includes(document.status)
        ) {
          return false;
        }
        if (
          categoryFilters.length > 0 &&
          !categoryFilters.includes(document.category)
        ) {
          return false;
        }
        if (!normalized) return true;

        return [
          document.code,
          document.title,
          document.summary,
          document.tags.join(" "),
          kbDocCategoryLabels[document.category],
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .sort((a, b) => {
        if (sort === "title-asc") return a.title.localeCompare(b.title);
        if (sort === "read-asc") return a.readMinutes - b.readMinutes;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [categoryFilters, deferredSearchQuery, documents, sort, statusFilters]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearchQuery, statusFilters, categoryFilters, sort, pageSize]);

  const pageCount = Math.max(1, Math.ceil(visibleDocuments.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedDocuments = paginateItems(visibleDocuments, safePage, pageSize);
  const stats = getDocumentationStats();

  return (
    <ModuleShell
      toolbar={
        <>
          <ModuleToolbarSearch>
            <InputGroup className="h-9 w-full">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder="Search documentation..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </ModuleToolbarSearch>

          <ModuleToolbarActions>
            <DocFilterControl
              statusFilters={statusFilters}
              categoryFilters={categoryFilters}
              sort={sort}
              activeFilterCount={activeFilterCount}
              onToggleStatus={toggleStatus}
              onToggleCategory={toggleCategory}
              onSetSort={setSort}
              onClearFilters={resetFilters}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="size-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setNewDocOpen(true)}
            >
              <FilePlus className="size-3.5" />
              <span className="hidden sm:inline">New document</span>
              <span className="sm:hidden">New</span>
            </Button>
          </ModuleToolbarActions>
        </>
      }
    >
      <KbStatsStrip stats={stats} />

      {pagedDocuments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No documents match"
          description="Try clearing filters or searching a different code, tag, or owner."
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pagedDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onOpen={openDocument}
              onDownload={downloadDocument}
            />
          ))}
        </div>
      )}

      {visibleDocuments.length > 0 ? (
        <ListPagination
          page={safePage}
          pageSize={pageSize}
          total={visibleDocuments.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[12, 24, 48]}
        />
      ) : null}

      <Dialog
        open={newDocOpen}
        onOpenChange={(open) => {
          setNewDocOpen(open);
          if (!open) {
            setNewTitle("");
            setNewCategory("operations");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New document</DialogTitle>
            <DialogDescription>
              Create a draft in the documentation vault and open it in the
              detail sheet.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="doc-title">Title</Label>
              <Input
                id="doc-title"
                value={newTitle}
                placeholder="e.g. Shift escalation checklist"
                onChange={(event) => setNewTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitNewDocument();
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doc-category">Category</Label>
              <Select
                value={newCategory}
                onValueChange={(value) =>
                  setNewCategory(value as KbDocCategory)
                }
              >
                <SelectTrigger id="doc-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(kbDocCategoryLabels) as KbDocCategory[]).map(
                    (category) => (
                      <SelectItem key={category} value={category}>
                        {kbDocCategoryLabels[category]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDocOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitNewDocument}>Create draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open);
          if (!open) setUploadFile(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>
              Import a file as a draft document. The filename becomes the draft
              title.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="doc-upload">File</Label>
            <Input
              id="doc-upload"
              type="file"
              accept=".md,.txt,.pdf,.doc,.docx"
              onChange={(event) =>
                setUploadFile(event.target.files?.[0] ?? null)
              }
            />
            {uploadFile ? (
              <p className="text-muted-foreground text-xs">{uploadFile.name}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitUpload}>Import draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setReading(false);
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="pr-8">{selected.title}</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {selected.code}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {selected.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  <DocCategoryBadge category={selected.category} />
                  <DocStatusBadge status={selected.status} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-caption font-medium">
                    Owner
                  </p>
                  <OwnerCell
                    userId={selected.ownerId}
                    href={`/administration/users/${selected.ownerId}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-caption font-medium">
                    Updated
                  </p>
                  <p className="text-sm">{selected.updatedLabel}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-caption font-medium">
                    Related
                  </p>
                  <RelatedLinks links={selected.related} />
                </div>

                {reading ? (
                  <div className="border-border/70 max-h-72 space-y-3 overflow-y-auto rounded-lg border p-3">
                    <p className="text-muted-foreground text-caption font-medium">
                      Document body
                    </p>
                    {documentBodyParagraphs(selected).map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      setReading(true);
                      toast({
                        title: "Reading",
                        description: selected.code,
                      });
                    }}
                  >
                    <BookOpen className="size-3.5" />
                    Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => downloadDocument(selected)}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </ModuleShell>
  );
}
