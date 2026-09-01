import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useParams } from 'react-router-dom';

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Position,
  MarkerType,
  type Node,
  type Edge,
} from 'reactflow';

import 'reactflow/dist/style.css';

import {
  Search,
  Boxes,
  Monitor,
  Server,
  Database,
  Cloud,
  FileCode2,
  Network,
  Loader2,
  AlertCircle,
  RefreshCw,
  Layers3,
  GitBranch,
  Box,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

import {
  Card,
  RiskBadge,
  Input,
  Select,
  Button,
} from '@/components/primitives';

import {
  getRepository,
} from '@/services/repositoryService';

import {
  getArchitecture,
  type ArchitectureNode,
  type ArchitectureEdge,
} from '@/services/architectureService';


/* =========================================================
   ARCHITECTURE TYPE CONFIG
========================================================= */

const architectureTypeConfig = {
  frontend: {
    label: 'Frontend',
    color: '#38bdf8',
    softColor: 'rgba(56,189,248,0.14)',
    border: 'rgba(56,189,248,0.45)',
    icon: Monitor,
  },

  api: {
    label: 'API',
    color: '#a78bfa',
    softColor: 'rgba(167,139,250,0.14)',
    border: 'rgba(167,139,250,0.45)',
    icon: Network,
  },

  service: {
    label: 'Service',
    color: '#facc15',
    softColor: 'rgba(250,204,21,0.14)',
    border: 'rgba(250,204,21,0.45)',
    icon: Server,
  },

  database: {
    label: 'Database',
    color: '#4ade80',
    softColor: 'rgba(74,222,128,0.14)',
    border: 'rgba(74,222,128,0.45)',
    icon: Database,
  },

  external: {
    label: 'External',
    color: '#fb923c',
    softColor: 'rgba(251,146,60,0.14)',
    border: 'rgba(251,146,60,0.45)',
    icon: Cloud,
  },

  file: {
    label: 'File',
    color: '#cbd5e1',
    softColor: 'rgba(203,213,225,0.10)',
    border: 'rgba(203,213,225,0.30)',
    icon: FileCode2,
  },
};


/* =========================================================
   CUSTOM ARCHITECTURE NODE
========================================================= */

function ArchitectureFlowNode({
  data,
}: {
  data: {
    label: string;
    type: keyof typeof architectureTypeConfig;
    selected: boolean;
    connected: boolean;
    dimmed: boolean;
    dependencies?: number;
    dependents?: number;
  };
}) {
  const config = architectureTypeConfig[data.type];
  const Icon = config.icon;

  return (
    <div
      className="group relative w-[230px] rounded-2xl border backdrop-blur-xl transition-all duration-300"
      style={{
        background: data.selected
          ? 'rgba(15,23,42,0.98)'
          : 'rgba(15,23,42,0.94)',

        borderColor: data.selected
          ? config.color
          : data.connected
            ? `${config.color}80`
            : 'rgba(71,85,105,0.65)',

        opacity: data.dimmed ? 0.20 : 1,

        boxShadow: data.selected
          ? `
              0 0 0 2px ${config.color}25,
              0 0 35px ${config.color}25,
              0 18px 45px rgba(0,0,0,0.40)
            `
          : data.connected
            ? `0 0 22px ${config.color}15`
            : '0 12px 30px rgba(0,0,0,0.28)',

        transform: data.selected
          ? 'translateY(-2px)'
          : undefined,
      }}
    >

      {/* TOP ACCENT LINE */}

      <div
        className="absolute left-4 right-4 top-0 h-[2px] rounded-full opacity-80"
        style={{
          background: config.color,
        }}
      />


      {/* NODE CONTENT */}

      <div className="p-4">

        <div className="flex items-start gap-3">

          {/* ICON */}

          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border"
            style={{
              background: config.softColor,
              borderColor: config.border,
              color: config.color,
            }}
          >
            <Icon size={20} />
          </div>


          {/* TITLE */}

          <div className="min-w-0 flex-1">

            <div
              className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em]"
              style={{
                color: config.color,
              }}
            >
              {config.label}
            </div>

            <div
              className="truncate text-sm font-semibold text-heading"
              title={data.label}
            >
              {data.label}
            </div>

          </div>


          {/* STATUS */}

          <div
            className="mt-1 size-2 rounded-full"
            style={{
              background: config.color,
              boxShadow: `0 0 10px ${config.color}`,
            }}
          />

        </div>


        {/* NODE METRICS */}

        <div className="mt-4 flex items-center gap-2">

          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised/70 px-2 py-1">

            <GitBranch
              size={11}
              className="text-muted"
            />

            <span className="text-[10px] text-muted">
              {data.dependencies ?? 0} deps
            </span>

          </div>


          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised/70 px-2 py-1">

            <ArrowUpRight
              size={11}
              className="text-muted"
            />

            <span className="text-[10px] text-muted">
              {data.dependents ?? 0} dependents
            </span>

          </div>

        </div>

      </div>


      {/* SELECTION INDICATOR */}

      {data.selected && (
        <div
          className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border-2 border-surface"
          style={{
            background: config.color,
            color: '#020617',
          }}
        >
          <Zap size={10} fill="currentColor" />
        </div>
      )}

    </div>
  );
}


const nodeTypes = {
  architectureNode: ArchitectureFlowNode,
};


/* =========================================================
   COMPONENT
========================================================= */

export default function ArchitectureExplorer() {

  const { id } = useParams();


  /* =======================================================
     STATE
  ======================================================= */

  const [repositoryName, setRepositoryName] =
    useState('');

  const [architectureNodes, setArchitectureNodes] =
    useState<ArchitectureNode[]>([]);

  const [architectureEdges, setArchitectureEdges] =
    useState<ArchitectureEdge[]>([]);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [query, setQuery] =
    useState('');

  const [layerFilter, setLayerFilter] =
    useState('all');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  /* =======================================================
     LOAD ARCHITECTURE
  ======================================================= */

  const loadArchitecture = useCallback(async () => {

    if (!id) return;

    try {

      setLoading(true);
      setError(null);


      const repositoryResult =
        await getRepository(id);


      if (
        repositoryResult?.ok &&
        repositoryResult.repository
      ) {

        setRepositoryName(
          repositoryResult.repository.name,
        );

      }


      const architectureResult =
        await getArchitecture(id);


      if (!architectureResult?.ok) {

        throw new Error(
          architectureResult?.message ||
          'Failed to load architecture',
        );

      }


      const nodes =
        architectureResult.architecture?.nodes || [];

      const edges =
        architectureResult.architecture?.edges || [];


      setArchitectureNodes(nodes);
      setArchitectureEdges(edges);


      if (nodes.length > 0) {
        setSelectedId(nodes[0].id);
      }

    } catch (err) {

      console.error(
        'Architecture loading error:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load architecture',
      );

    } finally {

      setLoading(false);

    }

  }, [id]);


  useEffect(() => {
    loadArchitecture();
  }, [loadArchitecture]);


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredNodes = useMemo(() => {

    const normalizedQuery =
      query.trim().toLowerCase();

    return architectureNodes.filter((node) => {

      const matchesSearch =
        !normalizedQuery ||
        node.label
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesLayer =
        layerFilter === 'all' ||
        String(node.layer) === layerFilter;

      return matchesSearch && matchesLayer;

    });

  }, [
    architectureNodes,
    query,
    layerFilter,
  ]);


  const visibleIds = useMemo(
    () =>
      new Set(
        filteredNodes.map(
          (node) => node.id,
        ),
      ),
    [filteredNodes],
  );


  /* =======================================================
     CONNECTED NODE IDS
  ======================================================= */

  const connectedIds = useMemo(() => {

    const result = new Set<string>();

    if (!selectedId) {
      return result;
    }

    architectureEdges.forEach((edge) => {

      if (edge.source === selectedId) {
        result.add(edge.target);
      }

      if (edge.target === selectedId) {
        result.add(edge.source);
      }

    });

    return result;

  }, [
    selectedId,
    architectureEdges,
  ]);


  /* =======================================================
     FLOW NODES
  ======================================================= */

  const flowNodes: Node[] = useMemo(() => {

    /*
     * Group nodes by layer internally.
     *
     * Layer numbers are NOT displayed to the user.
     */

    const nodesByLayer:
      Record<number, ArchitectureNode[]> = {};


    architectureNodes.forEach((node) => {

      if (!nodesByLayer[node.layer]) {
        nodesByLayer[node.layer] = [];
      }

      nodesByLayer[node.layer].push(node);

    });


    const result: Node[] = [];


    Object.entries(nodesByLayer).forEach(
      ([layer, nodes]) => {

        const layerNumber =
          Number(layer);

        nodes.forEach((node, index) => {

          const spacing = 285;

          const totalWidth =
            (nodes.length - 1) * spacing;

          const x =
            index * spacing -
            totalWidth / 2;


          const y =
            layerNumber * 210;


          const isVisible =
            visibleIds.has(node.id);

          const isConnected =
            connectedIds.has(node.id);


          result.push({

            id: node.id,

            type: 'architectureNode',

            position: {
              x,
              y,
            },

            sourcePosition:
              Position.Bottom,

            targetPosition:
              Position.Top,


            data: {

              label:
                node.label,

              type:
                node.type,

              selected:
                node.id === selectedId,

              connected:
                isConnected,

              dimmed:
                query.length > 0 &&
                !isVisible,

              dependencies:
                node.dependencies,

              dependents:
                node.dependents,

            },

          });

        });

      },
    );


    return result;

  }, [
    architectureNodes,
    selectedId,
    visibleIds,
    connectedIds,
    query,
  ]);


  /* =======================================================
     FLOW EDGES
  ======================================================= */

  const flowEdges: Edge[] = useMemo(() => {

    return architectureEdges.map(
      (edge) => {

        const isSelectedConnection =
          selectedId === edge.source ||
          selectedId === edge.target;


        return {

          id:
            `${edge.source}-${edge.target}`,

          source:
            edge.source,

          target:
            edge.target,


          animated:
            edge.kind === 'calls' ||
            isSelectedConnection,


          label:
            isSelectedConnection
              ? edge.kind
              : undefined,


          labelStyle: {

            fill:
              '#94a3b8',

            fontSize:
              10,

            fontWeight:
              500,

          },


          labelBgStyle: {

            fill:
              '#0f172a',

            fillOpacity:
              0.95,

          },


          style: {

            stroke:
              isSelectedConnection
                ? '#64748b'
                : '#334155',

            strokeWidth:
              isSelectedConnection
                ? 2
                : 1.5,

            opacity:
              selectedId
                ? isSelectedConnection
                  ? 1
                  : 0.28
                : 0.72,

          },


          markerEnd: {

            type:
              MarkerType.ArrowClosed,

            color:
              isSelectedConnection
                ? '#94a3b8'
                : '#475569',

          },

        };

      },
    );

  }, [
    architectureEdges,
    selectedId,
  ]);


  /* =======================================================
     SELECTED NODE
  ======================================================= */

  const selectedNode =
    architectureNodes.find(
      (node) =>
        node.id === selectedId,
    );


  /* =======================================================
     STATS
  ======================================================= */

  const architectureStats =
    useMemo(() => {

      return {

        nodes:
          architectureNodes.length,

        connections:
          architectureEdges.length,

        layers:
          new Set(
            architectureNodes.map(
              (node) => node.layer,
            ),
          ).size,

      };

    }, [
      architectureNodes,
      architectureEdges,
    ]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="flex min-h-[650px] items-center justify-center">

        <div className="text-center">

          <div className="relative mx-auto mb-5 flex size-16 items-center justify-center">

            <div className="absolute inset-0 animate-ping rounded-full bg-accent/10" />

            <div className="relative flex size-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">

              <Boxes
                size={25}
                className="text-accent-light"
              />

            </div>

          </div>


          <Loader2
            size={22}
            className="mx-auto mb-3 animate-spin text-accent"
          />


          <p className="text-heading font-medium">
            Mapping architecture
          </p>


          <p className="mt-1 text-sm text-muted">
            Analyzing repository structure…
          </p>

        </div>

      </div>

    );

  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {

    return (

      <div className="mx-auto flex min-h-[600px] max-w-xl items-center justify-center">

        <Card className="w-full p-8 text-center">

          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-danger/10 text-danger">

            <AlertCircle size={22} />

          </div>


          <h2 className="text-lg font-semibold text-heading">
            Architecture unavailable
          </h2>


          <p className="mt-2 text-sm text-muted">
            {error}
          </p>


          <Button
            className="mt-5"
            variant="secondary"
            onClick={loadArchitecture}
          >

            <RefreshCw size={14} />

            Try again

          </Button>

        </Card>

      </div>

    );

  }


  /* =======================================================
     EMPTY
  ======================================================= */

  if (architectureNodes.length === 0) {

    return (

      <div className="space-y-6">

        <div>

          <h1 className="text-heading text-2xl font-semibold">
            Architecture Explorer
          </h1>

          <p className="mt-1 text-sm text-muted">
            Visual intelligence map for{' '}
            <span className="text-body">
              {repositoryName || 'your repository'}
            </span>
          </p>

        </div>


        <Card className="flex min-h-[520px] items-center justify-center">

          <div className="max-w-md px-6 text-center">

            <div className="relative mx-auto mb-6 flex size-20 items-center justify-center">

              <div className="absolute inset-0 rounded-3xl bg-accent/10 blur-xl" />

              <div className="relative flex size-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10">

                <Network
                  size={28}
                  className="text-accent-light"
                />

              </div>

            </div>


            <h2 className="text-lg font-semibold text-heading">
              Architecture map is not available yet
            </h2>


            <p className="mt-3 text-sm leading-relaxed text-muted">
              This repository has been analyzed, but
              architecture relationships are not yet
              generated by the backend analyzer.
            </p>


            <div className="mt-6 rounded-xl border border-border bg-surface-raised p-4 text-left">

              <div className="flex gap-3">

                <Layers3
                  size={17}
                  className="mt-0.5 text-accent-light"
                />

                <div>

                  <div className="text-sm font-medium text-heading">
                    Waiting for architecture analysis
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Once architecture analysis is enabled,
                    Decode.ic will visualize components,
                    services, APIs, databases and their
                    relationships here.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </Card>

      </div>

    );

  }


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (

    <div className="flex h-full flex-col space-y-5">


      {/* ===================================================
         HEADER
      =================================================== */}

      <div className="flex flex-wrap items-start justify-between gap-5">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex size-12 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10">

              <Network
                size={21}
                className="text-accent-light"
              />

            </div>


            <div>

              <h1 className="text-heading text-2xl font-semibold">
                Architecture Explorer
              </h1>


              <p className="mt-1 text-sm text-muted">

                Interactive system topology for{' '}

                <span className="font-medium text-body">
                  {repositoryName}
                </span>

              </p>

            </div>

          </div>

        </div>


        {/* STATS */}

        <div className="flex gap-2">

          {[
            ['Nodes', architectureStats.nodes],
            ['Connections', architectureStats.connections],
            ['Layers', architectureStats.layers],
          ].map(([label, value]) => (

            <div
              key={label}
              className="min-w-[78px] rounded-xl border border-border bg-surface px-3 py-2.5 text-center"
            >

              <div className="font-mono text-sm font-semibold text-heading">
                {value}
              </div>

              <div className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-muted">
                {label}
              </div>

            </div>

          ))}

        </div>

      </div>


      {/* ===================================================
         TOOLBAR
      =================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/70 p-3 backdrop-blur">

        {/* LEGEND */}

        <div className="flex flex-wrap items-center gap-3">

          {Object.entries(
            architectureTypeConfig,
          ).map(([type, config]) => {

            const Icon = config.icon;

            return (

              <div
                key={type}
                className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 text-xs text-muted transition-colors hover:border-border hover:bg-surface-raised"
              >

                <div
                  className="flex size-6 items-center justify-center rounded-md"
                  style={{
                    background:
                      config.softColor,

                    color:
                      config.color,

                    border:
                      `1px solid ${config.border}`,
                  }}
                >

                  <Icon size={12} />

                </div>

                {config.label}

              </div>

            );

          })}

        </div>


        {/* CONTROLS */}

        <div className="flex items-center gap-2">

          <div className="relative">

            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />

            <Input
              placeholder="Find component…"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              className="w-52 pl-9"
            />

          </div>


          <Select
            value={layerFilter}
            onChange={(event) =>
              setLayerFilter(event.target.value)
            }
          >

            <option value="all">
              All layers
            </option>

            {[...new Set(
              architectureNodes.map(
                (node) => node.layer,
              ),
            )]
              .sort()
              .map((layer) => (

                <option
                  key={layer}
                  value={String(layer)}
                >
                  Layer {layer}
                </option>

              ))}

          </Select>


          <button
            onClick={loadArchitecture}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-muted transition-all hover:border-accent/50 hover:bg-accent/5 hover:text-accent-light"
            title="Refresh architecture"
          >

            <RefreshCw size={15} />

          </button>

        </div>

      </div>


      {/* ===================================================
         MAIN AREA
      =================================================== */}

      <div className="grid min-h-[680px] flex-1 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">


        {/* =================================================
           CANVAS
        ================================================= */}

        <Card className="relative min-h-[680px] overflow-hidden border-border/80 bg-[#070d18]">


          {/* SUBTLE TOP GRADIENT */}

          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-32"
            style={{
              background:
                'linear-gradient(to bottom, rgba(56,189,248,0.035), transparent)',
            }}
          />


          {/* CANVAS TITLE */}

          <div className="pointer-events-none absolute left-5 top-5 z-10">

            <div className="rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2.5 shadow-lg backdrop-blur-xl">

              <div className="flex items-center gap-2.5">

                <div className="flex size-7 items-center justify-center rounded-lg bg-accent/10">

                  <GitBranch
                    size={14}
                    className="text-accent-light"
                  />

                </div>

                <div>

                  <div className="text-xs font-semibold text-heading">
                    System topology
                  </div>

                  <div className="text-[10px] text-muted">
                    Component relationships
                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* REACT FLOW */}

          <ReactFlow

            nodes={flowNodes}

            edges={flowEdges}

            nodeTypes={nodeTypes}

            onNodeClick={(_, node) =>
              setSelectedId(node.id)
            }

            fitView

            fitViewOptions={{
              padding: 0.32,
              minZoom: 0.55,
              maxZoom: 1.15,
            }}

            minZoom={0.35}
            maxZoom={1.5}

            proOptions={{
              hideAttribution: true,
            }}

          >

            <Background
              color="#172033"
              gap={28}
              size={1}
            />


            <Controls
              showInteractive={false}
              position="bottom-right"
            />


            <MiniMap

              nodeColor={(node) => {

                const type =
                  node.data?.type;

                return type &&
                  type in architectureTypeConfig
                  ? architectureTypeConfig[
                    type as keyof typeof architectureTypeConfig
                  ].color
                  : '#475569';

              }}

              maskColor="rgba(2,6,23,0.82)"

              style={{
                background:
                  '#0b1220',

                border:
                  '1px solid #273449',

                borderRadius:
                  '12px',

                overflow:
                  'hidden',

                margin:
                  '12px',

              }}

            />

          </ReactFlow>


          {/* CANVAS FOOTER */}

          <div className="pointer-events-none absolute bottom-4 left-4 z-10">

            <div className="rounded-xl border border-border/80 bg-surface/90 px-3.5 py-2.5 text-[11px] text-muted shadow-lg backdrop-blur-xl">

              <span className="text-heading">
                Click
              </span>{' '}
              a component to inspect its architecture

            </div>

          </div>

        </Card>


        {/* =================================================
           INSPECTOR
        ================================================= */}

        <Card className="overflow-hidden border-border/80">

          {selectedNode ? (

            <div className="flex h-full flex-col">


              {/* INSPECTOR HEADER */}

              <div className="border-b border-border p-5">

                <div className="mb-5 flex items-start justify-between">

                  {(() => {

                    const config =
                      architectureTypeConfig[
                      selectedNode.type
                      ];

                    const Icon =
                      config.icon;

                    return (

                      <div
                        className="flex size-12 items-center justify-center rounded-2xl border"
                        style={{
                          background:
                            config.softColor,

                          borderColor:
                            config.border,

                          color:
                            config.color,
                        }}
                      >

                        <Icon size={22} />

                      </div>

                    );

                  })()}


                  <RiskBadge
                    level={
                      selectedNode.risk
                    }
                  />

                </div>


                <div
                  className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
                  style={{
                    color:
                      architectureTypeConfig[
                        selectedNode.type
                      ].color,
                  }}
                >

                  {
                    architectureTypeConfig[
                      selectedNode.type
                    ].label
                  }

                </div>


                <h2 className="break-words text-lg font-semibold leading-snug text-heading">

                  {selectedNode.label}

                </h2>


                <p className="mt-2 text-xs leading-relaxed text-muted">

                  {selectedNode.description ||
                    'No additional description is available for this component.'}

                </p>

              </div>


              {/* INTELLIGENCE */}

              <div className="p-5">

                <div className="mb-4 flex items-center gap-2">

                  <div className="flex size-7 items-center justify-center rounded-lg bg-accent/10">

                    <Box
                      size={14}
                      className="text-accent-light"
                    />

                  </div>

                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Component intelligence
                  </span>

                </div>


                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl border border-border bg-surface-raised p-3.5">

                    <div className="text-[10px] uppercase tracking-wide text-muted">
                      Complexity
                    </div>

                    <div className="mt-1.5 text-sm font-medium capitalize text-heading">
                      {selectedNode.complexity || 'Unknown'}
                    </div>

                  </div>


                  <div className="rounded-xl border border-border bg-surface-raised p-3.5">

                    <div className="text-[10px] uppercase tracking-wide text-muted">
                      Layer
                    </div>

                    <div className="mt-1.5 font-mono text-sm font-medium text-heading">
                      {selectedNode.layer}
                    </div>

                  </div>


                  <div className="rounded-xl border border-border bg-surface-raised p-3.5">

                    <div className="text-[10px] uppercase tracking-wide text-muted">
                      Dependencies
                    </div>

                    <div className="mt-1.5 font-mono text-sm font-medium text-heading">
                      {selectedNode.dependencies ?? 0}
                    </div>

                  </div>


                  <div className="rounded-xl border border-border bg-surface-raised p-3.5">

                    <div className="text-[10px] uppercase tracking-wide text-muted">
                      Dependents
                    </div>

                    <div className="mt-1.5 font-mono text-sm font-medium text-heading">
                      {selectedNode.dependents ?? 0}
                    </div>

                  </div>

                </div>

              </div>


              {/* RELATIONSHIPS */}

              <div className="border-t border-border p-5">

                <div className="mb-4 flex items-center justify-between">

                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Relationships
                  </span>

                  <span className="rounded-full bg-accent/10 px-2 py-1 font-mono text-[10px] text-accent-light">

                    {
                      architectureEdges.filter(
                        (edge) =>
                          edge.source === selectedNode.id ||
                          edge.target === selectedNode.id,
                      ).length
                    }

                  </span>

                </div>


                <div className="space-y-2">

                  {architectureEdges
                    .filter(
                      (edge) =>
                        edge.source === selectedNode.id ||
                        edge.target === selectedNode.id,
                    )
                    .slice(0, 5)
                    .map((edge) => {

                      const otherId =
                        edge.source === selectedNode.id
                          ? edge.target
                          : edge.source;


                      const otherNode =
                        architectureNodes.find(
                          (node) =>
                            node.id === otherId,
                        );


                      return (

                        <button
                          key={`${edge.source}-${edge.target}`}
                          onClick={() =>
                            setSelectedId(otherId)
                          }
                          className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-raised p-3 text-left transition-all hover:border-accent/30 hover:bg-accent/5"
                        >

                          <div className="min-w-0">

                            <div className="truncate text-xs font-medium text-heading">
                              {otherNode?.label || otherId}
                            </div>

                            <div className="mt-1 text-[10px] capitalize text-muted">
                              {edge.kind}
                            </div>

                          </div>


                          <ArrowUpRight
                            size={14}
                            className="shrink-0 text-muted"
                          />

                        </button>

                      );

                    })}

                </div>

              </div>


              {/* BOTTOM INSIGHT */}

              <div className="mt-auto border-t border-border bg-surface-raised/40 p-5">

                <div className="flex gap-3">

                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">

                    <Zap
                      size={14}
                      className="text-accent-light"
                    />

                  </div>


                  <div>

                    <div className="text-xs font-medium text-heading">
                      Architecture insight
                    </div>

                    <p className="mt-1.5 text-[11px] leading-relaxed text-muted">

                      This component participates in{' '}

                      <span className="font-mono text-body">
                        {
                          architectureEdges.filter(
                            (edge) =>
                              edge.source === selectedNode.id ||
                              edge.target === selectedNode.id,
                          ).length
                        }
                      </span>{' '}

                      known architectural connections.

                    </p>

                  </div>

                </div>

              </div>

            </div>

          ) : (

            <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-center">

              <div>

                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-accent/10">

                  <Layers3
                    size={21}
                    className="text-accent-light"
                  />

                </div>


                <p className="text-sm font-medium text-heading">
                  Select a component
                </p>


                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Click any node in the architecture map
                  to inspect its role and relationships.
                </p>

              </div>

            </div>

          )}

        </Card>

      </div>

    </div>

  );
}