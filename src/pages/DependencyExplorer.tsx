import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Badge, Select } from '@/components/primitives';
import { Table, Tr, Td } from '@/components/data-display';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/states';
import { getDependencies } from '@/services/dependencyService';
import type {
  DependencyManifest,
  DependencyManifestEntry,
} from '@/types';
import {
  Package,
  Boxes,
  Layers3,
  Filter,
  ArrowUpRight,
} from 'lucide-react';

type Filter = 'all' | string;

export default function DependencyExplorer() {
  const { id } = useParams();

  const [manifests, setManifests] = useState<DependencyManifest[]>([]);
  const [dependencyCount, setDependencyCount] = useState(0);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getDependencies(id);

      if (!result?.ok) {
        throw new Error(
          result?.message || 'Failed to load dependencies',
        );
      }

      setManifests(result.manifests || []);
      setDependencyCount(result.dependencyCount || 0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load dependencies',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const allDependencies = useMemo(
    () =>
      manifests.flatMap((m) =>
        m.dependencies.map((d) => ({
          ...d,
          manifest: m.manifest,
        })),
      ),
    [manifests],
  );

  const ecosystems = useMemo(
    () =>
      Array.from(
        new Set(manifests.map((m) => m.ecosystem)),
      ),
    [manifests],
  );

  const filtered = allDependencies.filter(
    (d) =>
      filter === 'all' ||
      d.ecosystem === filter,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-56 rounded-md bg-surface-raised animate-pulse" />
          <div className="h-4 w-72 rounded-md bg-surface-raised animate-pulse mt-2" />
        </div>

        <Card className="p-8">
          <LoadingState label="Loading dependencies…" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-heading text-2xl font-semibold">
            Dependency Explorer
          </h1>
          <p className="text-muted text-sm mt-1">
            Explore packages detected in this repository.
          </p>
        </div>

        <ErrorState
          title="Could not load dependencies"
          reasons={[error]}
          onRetry={load}
        />
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* ─────────────────────────────────────────
          HEADER
      ───────────────────────────────────────── */}

      <div className="flex items-start justify-between gap-5 flex-wrap">

        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="size-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Package
                size={18}
                className="text-accent-light"
              />
            </div>

            <span className="text-muted text-xs font-mono uppercase tracking-wider">
              Repository Intelligence
            </span>
          </div>

          <h1 className="text-heading text-2xl font-semibold tracking-tight">
            Dependency Explorer
          </h1>

          <p className="text-muted text-sm mt-1.5">
            Inspect packages and dependency sources detected
            from the analyzed repository.
          </p>
        </div>

        {ecosystems.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter
              size={14}
              className="text-muted"
            />

            <Select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
            >
              <option value="all">
                All ecosystems
              </option>

              {ecosystems.map((eco) => (
                <option
                  key={eco}
                  value={eco}
                >
                  {eco}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────
          SUMMARY
      ───────────────────────────────────────── */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        <Card className="p-4 group hover:border-accent/30 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-muted text-xs">
                <Boxes size={14} />
                Detected packages
              </div>

              <div className="text-heading text-2xl font-semibold mt-2">
                {dependencyCount}
              </div>

              <div className="text-muted text-xs mt-1">
                {dependencyCount === 1
                  ? 'package'
                  : 'packages'}{' '}
                detected across the repository
              </div>
            </div>

            <div className="size-8 rounded-md bg-surface-raised flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <ArrowUpRight
                size={15}
                className="text-muted group-hover:text-accent-light transition-colors"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 group hover:border-accent/30 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-muted text-xs">
                <Layers3 size={14} />
                Dependency manifests
              </div>

              <div className="text-heading text-2xl font-semibold mt-2">
                {manifests.length}
              </div>

              <div className="text-muted text-xs mt-1">
                Source manifests detected
              </div>
            </div>

            <div className="size-8 rounded-md bg-surface-raised flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <ArrowUpRight
                size={15}
                className="text-muted group-hover:text-accent-light transition-colors"
              />
            </div>
          </div>
        </Card>

      </div>

      {/* ─────────────────────────────────────────
          DEPENDENCY LIST
      ───────────────────────────────────────── */}

      {allDependencies.length === 0 ? (
        <Card className="p-2">
          <EmptyState
            icon={Package}
            title="No dependencies detected"
            description="The analyzer did not find a recognized dependency manifest (e.g. package.json, requirements.txt) in this repository."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">

          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
            <div>
              <h2 className="text-heading text-sm font-semibold">
                Dependencies
              </h2>

              <p className="text-muted text-xs mt-1">
                Showing {filtered.length} of{' '}
                {allDependencies.length} detected packages
              </p>
            </div>

            {filter !== 'all' && (
              <Badge tone="accent">
                {filter}
              </Badge>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table
              headers={[
                'Package',
                'Version',
                'Type',
                'Ecosystem',
                'Source',
              ]}
            >
              {filtered.map(
                (
                  d: DependencyManifestEntry & {
                    manifest: string;
                  },
                  i,
                ) => (
                  <Tr
                    key={`${d.sourceFile}-${d.name}-${i}`}
                  >
                    <Td className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-md bg-surface-raised border border-border flex items-center justify-center shrink-0 group-hover:border-accent/30 transition-colors">
                          <Package
                            size={13}
                            className="text-muted group-hover:text-accent-light transition-colors"
                          />
                        </div>

                        <span className="text-heading">
                          {d.name}
                        </span>
                      </div>
                    </Td>

                    <Td className="font-mono text-xs">
                      {d.version || '—'}
                    </Td>

                    <Td>
                      {d.type ? (
                        <Badge
                          tone={
                            d.type === 'runtime' ||
                            d.type === 'direct'
                              ? 'accent'
                              : 'neutral'
                          }
                        >
                          {d.type}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </Td>

                    <Td>
                      <span className="text-xs text-body">
                        {d.ecosystem}
                      </span>
                    </Td>

                    <Td>
                      <span className="text-xs font-mono text-muted">
                        {d.sourceFile}
                      </span>
                    </Td>
                  </Tr>
                ),
              )}
            </Table>
          </div>

          {filtered.length === 0 && (
            <div className="px-6 py-10 text-center border-t border-border">
              <Package
                size={22}
                className="mx-auto text-muted mb-2"
              />

              <p className="text-heading text-sm font-medium">
                No dependencies match this filter
              </p>

              <p className="text-muted text-xs mt-1">
                Try selecting a different ecosystem.
              </p>
            </div>
          )}

        </Card>
      )}

    </div>
  );
}