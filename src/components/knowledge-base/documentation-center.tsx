"use client";

import {
  BookOpen,
  CheckIcon,
  ChevronRight,
  Clock3,
  Ellipsis,
  FilePlus,
  FileText,
  ListFilter,
  Search,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ListPagination, paginateItems } from "@/components/list-pagination";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";

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
  mutedControlClassName,
  OwnerCell,
  RelatedLinks,
} from "./knowledge-base-primitives";

type FilterPanel = "status" | "category";

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

function FilterPanelHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center border-b p-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={onBack}
      >
        <ChevronRight className="size-3.5 rotate-180" />
        {title}
      </Button>
    </div>
  );
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
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<FilterPanel | "sort" | null>(null);
  const closePanel = () => setPanel(null);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPanel(null);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("relative h-9 gap-1.5 px-2.5", mutedControlClassName)}
        >
          <ListFilter className="size-3.5" />
          Filter
          {activeFilterCount > 0 ? (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-xs font-semibold">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="end">
        {panel === null ? (
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => setPanel("status")}
                  className="flex items-center justify-between"
                >
                  <span>Status</span>
                  <div className="flex items-center">
                    {statusFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {statusFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("category")}
                  className="flex items-center justify-between"
                >
                  <span>Category</span>
                  <div className="flex items-center">
                    {categoryFilters.length > 0 ? (
                      <span className="mr-1 text-xs text-zinc-500">
                        {categoryFilters.length}
                      </span>
                    ) : null}
                    <ChevronRight className="size-4" />
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => setPanel("sort")}
                  className="flex items-center justify-between"
                >
                  <span>Sort by</span>
                  <ChevronRight className="size-4" />
                </CommandItem>
              </CommandGroup>
              {activeFilterCount > 0 ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={onClearFilters}>
                      Clear all filters
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        ) : panel === "status" ? (
          <Command>
            <FilterPanelHeader title="Status" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(Object.keys(kbDocStatusLabels) as KbDocStatus[]).map(
                  (status) => (
                    <CommandItem
                      key={status}
                      onSelect={() => onToggleStatus(status)}
                      className="flex items-center justify-between"
                    >
                      {kbDocStatusLabels[status]}
                      {statusFilters.includes(status) ? (
                        <CheckIcon className="size-4" />
                      ) : null}
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : panel === "category" ? (
          <Command>
            <FilterPanelHeader title="Category" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(Object.keys(kbDocCategoryLabels) as KbDocCategory[]).map(
                  (category) => (
                    <CommandItem
                      key={category}
                      onSelect={() => onToggleCategory(category)}
                      className="flex items-center justify-between"
                    >
                      {kbDocCategoryLabels[category]}
                      {categoryFilters.includes(category) ? (
                        <CheckIcon className="size-4" />
                      ) : null}
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <Command>
            <FilterPanelHeader title="Sort by" onBack={closePanel} />
            <CommandList>
              <CommandGroup>
                {(Object.keys(sortLabels) as DocSort[]).map((option) => (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      onSetSort(option);
                      closePanel();
                    }}
                    className="flex items-center justify-between"
                  >
                    {sortLabels[option]}
                    {sort === option ? <CheckIcon className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
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
      className="border-border/70 bg-card group flex cursor-pointer flex-col overflow-hidden rounded-xl border shadow-none transition-colors hover:border-zinc-300 dark:hover:border-white/16"
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
  const [newCategory, setNewCategory] =
    useState<KbDocCategory>("operations");
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
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="bg-background shrink-0 border-b">
        <div className="flex flex-col gap-2 px-4 py-3 sm:px-6 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-2">
          <div className="min-w-0 flex-1">
            <InputGroup className="h-9 w-full lg:max-w-sm">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                placeholder="Search documentation..."
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </InputGroup>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
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
              className={cn("h-9 gap-1.5", mutedControlClassName)}
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
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full flex-col gap-4">
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
        </div>
      </div>

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
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Owner
                  </p>
                  <OwnerCell
                    userId={selected.ownerId}
                    href={`/administration/users/${selected.ownerId}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Updated
                  </p>
                  <p className="text-sm">{selected.updatedLabel}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Related
                  </p>
                  <RelatedLinks links={selected.related} />
                </div>

                {reading ? (
                  <div className="border-border/70 max-h-72 space-y-3 overflow-y-auto rounded-lg border p-3">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Document body
                    </p>
                    {documentBodyParagraphs(selected).map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-sm leading-relaxed"
                      >
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
                    className={cn("gap-1.5", mutedControlClassName)}
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
    </main>
  );
}
