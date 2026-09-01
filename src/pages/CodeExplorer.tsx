import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Folder,
  FolderOpen,
  FileCode,
  Search,
  Loader2,
  ChevronRight,
  Code2,
  FileText,
  AlignJustify,
} from 'lucide-react';

import { Card, Input, Badge } from '@/components/primitives';
import { LoadingState, EmptyState } from '@/components/states';

import {
  getRepositoryFileTree,
  getRepositoryFileContent,
} from '@/services/repositoryService';

import type { FileNode } from '@/types';
import { cn } from '@/utils/cn';

// Builds a nested FileNode tree from the flat list of real file paths
// returned by GET /api/repositories/:id/files.
function buildTree(paths: { path: string; size: number }[]): FileNode[] {
  const root: FileNode[] = [];

  for (const { path } of paths) {
    const parts = path.split('/');
    let level = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === parts.length - 1;

      let existing = level.find(
        (n) =>
          n.name === part &&
          n.type === (isFile ? 'file' : 'folder')
      );

      if (!existing) {
        existing = {
          id: currentPath,
          name: part,
          type: isFile ? 'file' : 'folder',
          path: currentPath,
          children: isFile ? undefined : [],
        };

        level.push(existing);
      }

      if (!isFile) {
        level = existing.children!;
      }
    });
  }

  return root;
}

function FileTreeItem({
  node,
  activePath,
  onSelect,
  depth = 0,
}: {
  node: FileNode;
  activePath: string;
  onSelect: (n: FileNode) => void;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 1);

  if (node.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'w-full flex items-center gap-1.5',
            'py-1.5 pr-2',
            'text-[12px] font-medium',
            'text-body',
            'rounded-md',
            'hover:bg-surface-raised',
            'hover:text-heading',
            'transition-all duration-150'
          )}
          style={{ paddingLeft: 8 + depth * 14 }}
        >
          <ChevronRight
            size={12}
            className={cn(
              'shrink-0 text-muted transition-transform duration-150',
              open && 'rotate-90'
            )}
          />

          {open ? (
            <FolderOpen
              size={14}
              className="text-accent-light shrink-0"
            />
          ) : (
            <Folder
              size={14}
              className="text-muted shrink-0"
            />
          )}

          <span className="truncate">{node.name}</span>
        </button>

        {open &&
          node.children?.map((c) => (
            <FileTreeItem
              key={c.id}
              node={c}
              activePath={activePath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelect(node)}
      className={cn(
        'group w-full flex items-center gap-2',
        'py-1.5 pr-2',
        'text-[12px]',
        'rounded-md',
        'transition-all duration-150',
        activePath === node.path
          ? [
              'bg-accent/10',
              'text-accent-light',
              'shadow-[inset_2px_0_0_rgba(129,140,248,0.8)]',
            ]
          : [
              'text-body',
              'hover:bg-surface-raised',
              'hover:text-heading',
            ]
      )}
      style={{ paddingLeft: 8 + depth * 14 }}
    >
      <FileCode
        size={14}
        className={cn(
          'shrink-0 transition-colors',
          activePath === node.path
            ? 'text-accent-light'
            : 'text-muted group-hover:text-heading'
        )}
      />

      <span className="truncate">{node.name}</span>
    </button>
  );
}

function filterTree(
  nodes: FileNode[],
  query: string
): FileNode[] {
  if (!query) return nodes;

  const q = query.toLowerCase();

  return nodes
    .map((node) => {
      if (node.type === 'file') {
        return node.path.toLowerCase().includes(q)
          ? node
          : null;
      }

      const children = filterTree(
        node.children || [],
        query
      );

      return children.length
        ? { ...node, children }
        : null;
    })
    .filter(
      (n): n is FileNode => n !== null
    );
}

export default function CodeExplorer() {
  const { id } = useParams();

  const [tree, setTree] = useState<FileNode[]>([]);
  const [loadingTree, setLoadingTree] =
    useState(true);
  const [treeError, setTreeError] =
    useState<string | null>(null);

  const [active, setActive] =
    useState<FileNode | null>(null);
  const [content, setContent] =
    useState<string | null>(null);

  const [meta, setMeta] = useState<{
    language: string;
    lineCount: number;
    size: number;
  } | null>(null);

  const [loadingContent, setLoadingContent] =
    useState(false);

  const [contentError, setContentError] =
    useState<string | null>(null);

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        setLoadingTree(true);
        setTreeError(null);

        const result =
          await getRepositoryFileTree(id);

        if (cancelled) return;

        if (!result.ok) {
          throw new Error(
            result.message ||
              'Failed to load repository files'
          );
        }

        setTree(buildTree(result.files));
      } catch (err) {
        if (!cancelled) {
          setTreeError(
            err instanceof Error
              ? err.message
              : 'Failed to load repository files'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingTree(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function selectFile(node: FileNode) {
    if (!id) return;

    setActive(node);
    setContent(null);
    setMeta(null);
    setContentError(null);
    setLoadingContent(true);

    try {
      const result =
        await getRepositoryFileContent(
          id,
          node.path
        );

      if (!result.ok) {
        throw new Error(
          result.message ||
            'Failed to load file content'
        );
      }

      setContent(result.content);

      setMeta({
        language: result.language,
        lineCount: result.lineCount,
        size: result.size,
      });
    } catch (err) {
      setContentError(
        err instanceof Error
          ? err.message
          : 'Failed to load file content'
      );
    } finally {
      setLoadingContent(false);
    }
  }

  const visibleTree = useMemo(
    () => filterTree(tree, query),
    [tree, query]
  );

  const codeLines = content
    ? content.split('\n')
    : [];

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────
          PAGE HEADER
      ───────────────────────────────────────── */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="size-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Code2
                size={16}
                className="text-accent-light"
              />
            </div>

            <h1 className="text-heading text-2xl font-semibold tracking-tight">
              Code Explorer
            </h1>
          </div>

          <p className="text-muted text-sm">
            Browse the real, analyzed source of this
            repository.
          </p>
        </div>

        {active && (
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface">
            <FileText
              size={14}
              className="text-muted"
            />

            <span className="text-xs font-mono text-body max-w-[280px] truncate">
              {active.path}
            </span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────
          EXPLORER
      ───────────────────────────────────────── */}

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_270px] gap-4 h-[640px]">
        {/* FILE TREE */}

        <Card className="overflow-hidden flex flex-col border-border/80">
          <div className="px-3.5 py-3 border-b border-border bg-surface/60 shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <div className="text-heading text-xs font-semibold uppercase tracking-wider">
                  Explorer
                </div>

                <div className="text-muted text-[11px] mt-0.5">
                  Repository files
                </div>
              </div>

              <div className="size-7 rounded-md bg-surface-raised border border-border flex items-center justify-center">
                <Folder
                  size={14}
                  className="text-muted"
                />
              </div>
            </div>

            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
              />

              <Input
                placeholder="Filter files…"
                value={query}
                onChange={(e) =>
                  setQuery(e.target.value)
                }
                className="pl-7 text-xs py-1.5 bg-base/60"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loadingTree ? (
              <LoadingState label="Loading files…" />
            ) : treeError ? (
              <div className="p-3 rounded-md border border-red-500/20 bg-red-500/5 text-xs text-danger">
                {treeError}
              </div>
            ) : visibleTree.length === 0 ? (
              <div className="p-4 text-center">
                <FileCode
                  size={22}
                  className="mx-auto text-muted mb-2"
                />

                <p className="text-xs text-muted">
                  No files found.
                </p>
              </div>
            ) : (
              visibleTree.map((n) => (
                <FileTreeItem
                  key={n.id}
                  node={n}
                  activePath={
                    active?.path ?? ''
                  }
                  onSelect={selectFile}
                />
              ))
            )}
          </div>
        </Card>

        {/* CODE VIEWER */}

        <Card className="overflow-hidden flex flex-col border-border/80 bg-surface">
          {active ? (
            <div className="border-b border-border bg-surface/70 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-6 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                  <FileCode
                    size={13}
                    className="text-accent-light"
                  />
                </div>

                <span className="font-mono text-xs text-body truncate">
                  {active.path}
                </span>
              </div>

              {meta && (
                <Badge>
                  {meta.language}
                </Badge>
              )}
            </div>
          ) : (
            <div className="h-[45px] border-b border-border bg-surface/50 shrink-0" />
          )}

          <div className="flex-1 overflow-auto font-mono text-[12.5px] leading-6 bg-base/30">
            {!active ? (
              <div className="h-full flex items-center justify-center p-6">
                <EmptyState
                  title="Select a file"
                  description="Choose a file from the tree to view its real source content."
                />
              </div>
            ) : loadingContent ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="size-9 rounded-full bg-accent/10 flex items-center justify-center">
                    <Loader2
                      size={17}
                      className="text-accent-light animate-spin"
                    />
                  </div>

                  <span className="text-muted text-xs">
                    Loading file…
                  </span>
                </div>
              </div>
            ) : contentError ? (
              <div className="p-5">
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <div className="text-danger text-xs">
                    {contentError}
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-w-max py-3">
                {codeLines.map((line, i) => (
                  <div
                    key={i}
                    className="group flex min-h-[24px] hover:bg-surface-raised/60 transition-colors"
                  >
                    <span className="sticky left-0 w-12 shrink-0 text-right pr-4 text-muted/40 select-none border-r border-border/40 bg-base/40 group-hover:bg-surface-raised/60">
                      {i + 1}
                    </span>

                    <span className="pl-4 pr-8 text-body whitespace-pre">
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {active && meta && (
            <div className="h-8 shrink-0 border-t border-border bg-surface/70 px-4 flex items-center justify-between text-[10px] text-muted">
              <span>
                {meta.lineCount.toLocaleString()} lines
              </span>

              <span className="font-mono">
                {meta.size.toLocaleString()} bytes
              </span>
            </div>
          )}
        </Card>

        {/* FILE INFO */}

        <Card className="overflow-hidden flex flex-col border-border/80">
          <div className="px-5 py-3.5 border-b border-border bg-surface/60 shrink-0">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center">
                <FileText
                  size={14}
                  className="text-accent-light"
                />
              </div>

              <div>
                <h3 className="text-heading font-semibold text-sm">
                  File Info
                </h3>

                <p className="text-muted text-[10px] mt-0.5">
                  Source metadata
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {!active ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="size-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center mb-3">
                  <FileCode
                    size={17}
                    className="text-muted"
                  />
                </div>

                <p className="text-muted text-xs">
                  No file selected.
                </p>

                <p className="text-muted/60 text-[10px] mt-1 max-w-[180px] leading-relaxed">
                  Select a file from the repository
                  explorer.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="text-muted text-[10px] uppercase tracking-wider font-medium mb-1.5">
                    File
                  </div>

                  <div className="rounded-md border border-border bg-base/40 px-3 py-2.5">
                    <div className="font-mono text-[11px] text-body break-all leading-relaxed">
                      {active.path}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-muted text-[10px] uppercase tracking-wider font-medium mb-1.5">
                    Language
                  </div>

                  <div className="text-body text-xs font-medium">
                    {meta?.language ??
                      'Not available'}
                  </div>
                </div>

                <div>
                  <div className="text-muted text-[10px] uppercase tracking-wider font-medium mb-1.5">
                    Lines of code
                  </div>

                  <div className="font-mono text-heading text-lg font-semibold">
                    {meta
                      ? meta.lineCount.toLocaleString()
                      : '—'}
                  </div>
                </div>

                <div>
                  <div className="text-muted text-[10px] uppercase tracking-wider font-medium mb-1.5">
                    File size
                  </div>

                  <div className="font-mono text-heading text-sm">
                    {meta
                      ? `${(
                          meta.size / 1024
                        ).toFixed(1)} KB`
                      : '—'}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-1.5 rounded-full bg-accent" />

                    <span className="text-heading text-[10px] uppercase tracking-wider font-semibold">
                      Analysis availability
                    </span>
                  </div>

                  <p className="text-muted text-[11px] leading-relaxed">
                    Per-function AI intelligence
                    (complexity, blast radius,
                    natural-language explanation) is
                    not yet computed by the analyzer
                    for individual files, so it isn't
                    shown here to avoid displaying
                    invented data.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}