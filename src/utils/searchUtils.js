import { getLocalStorageItem } from "../hooks/useLocalStorage";

/**
 * Search across all flows by name, description, or tags
 */
export function searchFlows(query) {
  if (!query || query.trim().length === 0) return [];

  const searchTerm = query.toLowerCase().trim();
  const allFlows = getLocalStorageItem("flows", []);

  return allFlows
    .filter((flow) => {
      const nameMatch = flow.name?.toLowerCase().includes(searchTerm);
      const descMatch = flow.description?.toLowerCase().includes(searchTerm);
      const tagMatch = flow.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );
      const dnisMatch = flow.dnis?.toLowerCase().includes(searchTerm);

      return nameMatch || descMatch || tagMatch || dnisMatch;
    })
    .map((flow) => ({
      ...flow,
      matchType: flow.name?.toLowerCase().includes(searchTerm)
        ? "name"
        : flow.description?.toLowerCase().includes(searchTerm)
        ? "description"
        : flow.dnis?.toLowerCase().includes(searchTerm)
        ? "dnis"
        : "tag",
    }));
}

/**
 * Search nodes within a specific flow or across all flows
 */
export function searchNodes(query, flowId = null) {
  if (!query || query.trim().length === 0) return [];

  const searchTerm = query.toLowerCase().trim();
  const results = [];

  if (flowId) {
    // Search in specific flow
    const nodes = getLocalStorageItem(`flow_${flowId}_nodes`, []);
    const flowName = getFlowName(flowId);

    nodes.forEach((node) => {
      const matches = getNodeMatches(node, searchTerm);
      if (matches.length > 0) {
        results.push({
          flowId,
          flowName,
          node,
          matches,
        });
      }
    });
  } else {
    // Search across all flows
    const allFlows = getLocalStorageItem("flows", []);

    allFlows.forEach((flow) => {
      const nodes = getLocalStorageItem(`flow_${flow.id}_nodes`, []);

      nodes.forEach((node) => {
        const matches = getNodeMatches(node, searchTerm);
        if (matches.length > 0) {
          results.push({
            flowId: flow.id,
            flowName: flow.name,
            node,
            matches,
          });
        }
      });
    });
  }

  return results;
}

/**
 * Get all matches for a node against search term
 */
function getNodeMatches(node, searchTerm) {
  const matches = [];

  // Check node type
  if (node.type?.toLowerCase().includes(searchTerm)) {
    matches.push({ field: "type", value: node.type });
  }

  // Check node data fields
  if (node.data) {
    const data = node.data;

    if (data.text?.toLowerCase().includes(searchTerm)) {
      matches.push({ field: "text", value: data.text });
    }
    if (data.label?.toLowerCase().includes(searchTerm)) {
      matches.push({ field: "label", value: data.label });
    }
    if (data.promptText?.toLowerCase().includes(searchTerm)) {
      matches.push({ field: "promptText", value: data.promptText });
    }
    if (data.variable?.toLowerCase().includes(searchTerm)) {
      matches.push({ field: "variable", value: data.variable });
    }
    if (data.dtmfValue?.toLowerCase().includes(searchTerm)) {
      matches.push({ field: "dtmfValue", value: data.dtmfValue });
    }
    if (data.mapping?.toLowerCase().includes(searchTerm)) {
      matches.push({ field: "mapping", value: data.mapping });
    }
  }

  return matches;
}

/**
 * Search flows by DNIS
 */
export function searchByDNIS(dnis) {
  if (!dnis || dnis.trim().length === 0) return [];

  const searchTerm = dnis.toLowerCase().trim();
  const allFlows = getLocalStorageItem("flows", []);

  return allFlows.filter((flow) =>
    flow.dnis?.toLowerCase().includes(searchTerm)
  );
}

/**
 * Filter nodes by type in a specific flow
 */
export function filterNodesByType(flowId, nodeType) {
  const nodes = getLocalStorageItem(`flow_${flowId}_nodes`, []);

  if (!nodeType || nodeType === "all") return nodes;

  return nodes.filter((node) => node.type === nodeType);
}

/**
 * Get flow name by ID
 */
function getFlowName(flowId) {
  const allFlows = getLocalStorageItem("flows", []);
  const flow = allFlows.find((f) => f.id === flowId);
  return flow?.name || "Unknown Flow";
}

/**
 * Highlight search term in text
 */
export function highlightSearchTerm(text, searchTerm) {
  if (!text || !searchTerm) return text;

  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Get all unique node types across all flows
 */
export function getAllNodeTypes() {
  const allFlows = getLocalStorageItem("flows", []);
  const nodeTypes = new Set();

  allFlows.forEach((flow) => {
    const nodes = getLocalStorageItem(`flow_${flow.id}_nodes`, []);
    nodes.forEach((node) => {
      if (node.type) nodeTypes.add(node.type);
    });
  });

  return Array.from(nodeTypes).sort();
}

/**
 * Get node statistics for a flow
 */
export function getFlowNodeStats(flowId) {
  const nodes = getLocalStorageItem(`flow_${flowId}_nodes`, []);
  const stats = {};

  nodes.forEach((node) => {
    const type = node.type || "unknown";
    stats[type] = (stats[type] || 0) + 1;
  });

  return {
    total: nodes.length,
    byType: stats,
  };
}

/**
 * Find nodes connected to a specific node
 */
export function findConnectedNodes(flowId, nodeId) {
  const nodes = getLocalStorageItem(`flow_${flowId}_nodes`, []);
  const edges = getLocalStorageItem(`flow_${flowId}_edges`, []);

  const connected = {
    incoming: [],
    outgoing: [],
  };

  edges.forEach((edge) => {
    if (edge.target === nodeId) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode) connected.incoming.push(sourceNode);
    }
    if (edge.source === nodeId) {
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (targetNode) connected.outgoing.push(targetNode);
    }
  });

  return connected;
}
