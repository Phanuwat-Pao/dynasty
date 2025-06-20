"use client";
import { Dictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { drawLabel } from "@/lib/draw";
import {
  ControlsContainer,
  FullScreenControl,
  SigmaContainer,
  ZoomControl,
} from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import type { GraphSearchOption } from "@react-sigma/graph-search";
import { GraphSearch } from "@react-sigma/graph-search";
import "@react-sigma/graph-search/lib/style.css";
import EdgeCurveProgram from "@sigma/edge-curve";
import { createNodeImageProgram } from "@sigma/node-image";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EdgeArrowProgram } from "sigma/rendering";
import FocusOnNode from "./focus-on-node";
import ForceAtlas2Layout from "./force-atlas-2-layout";
import LoadRelationshipGraph from "./load-relationship-graph";

export type NetworkVisualizationProps = Parameters<
  typeof NetworkVisualizationInner
>[0];

// Component that display the graph
export default function NetworkVisualizationInner({
  locale,
  relationshipTypes,
}: {
  locale: Locale;
  relationshipTypes: Dictionary["relationshipTypes"];
}) {
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [focusNode, setFocusNode] = useState<string | null>(null);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const onFocus = useCallback((value: GraphSearchOption | null) => {
    if (value === null) setFocusNode(null);
    else if (value.type === "nodes") setFocusNode(value.id);
  }, []);

  const onChange = useCallback((value: GraphSearchOption | null) => {
    if (value === null) setSelectedNode(null);
    else if (value.type === "nodes") setSelectedNode(value.id);
  }, []);

  const postSearchResult = useCallback(
    (options: GraphSearchOption[]): GraphSearchOption[] => {
      return options.length <= 10
        ? options
        : [
          ...options.slice(0, 10),
          {
            type: "message",
            message: (
              <span className="text-center text-muted">
                And {options.length - 10} others
              </span>
            ),
          },
        ];
    },
    [],
  );

  // Sigma settings
  const settings = useMemo(
    () =>
      ({
        allowInvalidContainer: true,
        renderEdgeLabels: true,
        defaultDrawNodeLabel: drawLabel,
        defaultNodeType: "image",
        nodeProgramClasses: {
          image: createNodeImageProgram(),
        },
        defaultEdgeType: "straight",
        edgeProgramClasses: {
          straight: EdgeArrowProgram,
          curved: EdgeCurveProgram,
        },
        edgeLabelColor: {
          color: resolvedTheme === "dark" ? "white" : "black",
        },
      }) satisfies Parameters<typeof SigmaContainer>[0]["settings"],
    [resolvedTheme],
  );

  return (
    <>
      {isClient ? (
        <SigmaContainer
          style={{
            backgroundColor: "var(--background)",
            height: "90dvh",
            width: "100%",
          }}
          settings={settings}
        >
          <LoadRelationshipGraph
            locale={locale}
            relationshipTypes={relationshipTypes}
          />
          <ForceAtlas2Layout />
          <FocusOnNode
            node={focusNode ?? selectedNode}
            move={focusNode ? false : true}
          />
          <ControlsContainer position={"bottom-right"}>
            <ZoomControl />
            <FullScreenControl />
          </ControlsContainer>
          <ControlsContainer position={"top-right"}>
            <GraphSearch
              type="nodes"
              value={selectedNode ? { type: "nodes", id: selectedNode } : null}
              onFocus={onFocus}
              onChange={onChange}
              postSearchResult={postSearchResult}
            />
          </ControlsContainer>
        </SigmaContainer>
      ) : (
        <div>NOT AVAILABLE</div>
      )}
    </>
  );
}
