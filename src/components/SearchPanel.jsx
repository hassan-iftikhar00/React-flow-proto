import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search, Filter, MapPin, FileText, Box, Phone } from "lucide-react";
import {
  searchFlows,
  searchNodes,
  searchByDNIS,
  filterNodesByType,
  getAllNodeTypes,
  getFlowNodeStats,
} from "../utils/searchUtils";
import "./SearchPanel.css";

function SearchPanel({
  isOpen,
  onClose,
  currentFlowId = null,
  onNodeSelect = null, // Callback when node is selected in current flow
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("nodes"); // 'flows', 'nodes', 'dnis'
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedNodeType, setSelectedNodeType] = useState("all");
  const [nodeTypes, setNodeTypes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchScope, setSearchScope] = useState(
    currentFlowId ? "current" : "all"
  ); // 'current' or 'all'

  // Load available node types on mount
  useEffect(() => {
    const types = getAllNodeTypes();
    setNodeTypes(types);
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Debounce search
    const timeout = setTimeout(() => {
      performSearch();
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, activeTab, selectedNodeType, searchScope]);

  const performSearch = () => {
    let results = [];

    switch (activeTab) {
      case "flows":
        results = searchFlows(searchQuery);
        break;

      case "nodes":
        const flowId = searchScope === "current" ? currentFlowId : null;
        results = searchNodes(searchQuery, flowId);

        // Filter by node type if selected
        if (selectedNodeType !== "all") {
          results = results.filter((r) => r.node.type === selectedNodeType);
        }
        break;

      case "dnis":
        results = searchByDNIS(searchQuery);
        break;

      default:
        results = [];
    }

    setSearchResults(results);
  };

  const handleFlowClick = (flowId) => {
    navigate(`/flows/${flowId}`);
    onClose();
  };

  const handleNodeClick = (result) => {
    if (result.flowId === currentFlowId && onNodeSelect) {
      // Same flow - just select the node
      onNodeSelect(result.node);
      onClose();
    } else {
      // Different flow - navigate to it
      navigate(`/flows/${result.flowId}?nodeId=${result.node.id}`);
      onClose();
    }
  };

  const getNodeTypeIcon = (type) => {
    const icons = {
      play: "▶️",
      menu: "📋",
      collect: "⌨️",
      record: "🎙️",
      dtmf: "#️⃣",
      ddtmf: "📊",
      wait: "⏱️",
      tts: "🔊",
      stt: "🎤",
      istt: "🤖",
      terminator: "⭕",
    };
    return icons[type] || "📦";
  };

  const getNodeTypeLabel = (type) => {
    const labels = {
      play: "Play Prompt",
      menu: "Menu",
      collect: "Collect Input",
      record: "Record",
      dtmf: "DTMF",
      ddtmf: "DDTMF",
      wait: "Wait",
      tts: "Text-to-Speech",
      stt: "Speech-to-Text",
      istt: "ISTT",
      terminator: "Terminator",
    };
    return labels[type] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="search-panel-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="search-panel-header">
          <div className="search-panel-title">
            <Search size={20} />
            <h3>Search & Navigation</h3>
          </div>
          <button className="search-panel-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="search-tabs">
          <button
            className={`search-tab ${activeTab === "nodes" ? "active" : ""}`}
            onClick={() => setActiveTab("nodes")}
          >
            <Box size={16} />
            <span>Nodes</span>
          </button>
          <button
            className={`search-tab ${activeTab === "flows" ? "active" : ""}`}
            onClick={() => setActiveTab("flows")}
          >
            <FileText size={16} />
            <span>Flows</span>
          </button>
          <button
            className={`search-tab ${activeTab === "dnis" ? "active" : ""}`}
            onClick={() => setActiveTab("dnis")}
          >
            <Phone size={16} />
            <span>DNIS</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="search-input-container">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder={
              activeTab === "flows"
                ? "Search flows by name, description, or tags..."
                : activeTab === "nodes"
                ? "Search nodes by type or content..."
                : "Search by DNIS number..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        {activeTab === "nodes" && (
          <div className="search-filters">
            {currentFlowId && (
              <div className="search-scope-toggle">
                <button
                  className={`scope-btn ${
                    searchScope === "current" ? "active" : ""
                  }`}
                  onClick={() => setSearchScope("current")}
                >
                  Current Flow
                </button>
                <button
                  className={`scope-btn ${
                    searchScope === "all" ? "active" : ""
                  }`}
                  onClick={() => setSearchScope("all")}
                >
                  All Flows
                </button>
              </div>
            )}

            <div className="node-type-filter">
              <Filter size={14} />
              <select
                value={selectedNodeType}
                onChange={(e) => setSelectedNodeType(e.target.value)}
                className="node-type-select"
              >
                <option value="all">All Types</option>
                {nodeTypes.map((type) => (
                  <option key={type} value={type}>
                    {getNodeTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="search-results">
          {isSearching ? (
            <div className="search-loading">Searching...</div>
          ) : searchQuery.trim().length === 0 ? (
            <div className="search-empty">
              <Search size={48} />
              <p>Enter a search term to begin</p>
              <div className="search-tips">
                <h4>Search Tips:</h4>
                <ul>
                  {activeTab === "nodes" && (
                    <>
                      <li>Search by node type (e.g., "menu", "play")</li>
                      <li>Search by content (e.g., "welcome message")</li>
                      <li>Use filters to narrow results</li>
                    </>
                  )}
                  {activeTab === "flows" && (
                    <>
                      <li>Search by flow name</li>
                      <li>Search by description or tags</li>
                      <li>Search by DNIS number</li>
                    </>
                  )}
                  {activeTab === "dnis" && (
                    <>
                      <li>Enter full or partial DNIS</li>
                      <li>Results show all matching flows</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="search-no-results">
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="search-results-list">
              {activeTab === "flows" &&
                searchResults.map((flow) => (
                  <div
                    key={flow.id}
                    className="search-result-item flow-result"
                    onClick={() => handleFlowClick(flow.id)}
                  >
                    <div className="result-icon">
                      <FileText size={20} />
                    </div>
                    <div className="result-content">
                      <div className="result-title">{flow.name}</div>
                      {flow.description && (
                        <div className="result-subtitle">
                          {flow.description}
                        </div>
                      )}
                      <div className="result-meta">
                        {flow.dnis && (
                          <span className="meta-tag">
                            <Phone size={12} />
                            {flow.dnis}
                          </span>
                        )}
                        <span className="meta-tag match-type">
                          Match: {flow.matchType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {activeTab === "nodes" &&
                searchResults.map((result, index) => (
                  <div
                    key={`${result.flowId}-${result.node.id}-${index}`}
                    className="search-result-item node-result"
                    onClick={() => handleNodeClick(result)}
                  >
                    <div className="result-icon node-icon">
                      <span>{getNodeTypeIcon(result.node.type)}</span>
                    </div>
                    <div className="result-content">
                      <div className="result-title">
                        {getNodeTypeLabel(result.node.type)}
                        <span className="node-id">#{result.node.id}</span>
                      </div>
                      <div className="result-subtitle">{result.flowName}</div>
                      <div className="result-matches">
                        {result.matches.map((match, i) => (
                          <div key={i} className="match-item">
                            <span className="match-field">{match.field}:</span>
                            <span className="match-value">{match.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <MapPin size={16} className="jump-icon" />
                  </div>
                ))}

              {activeTab === "dnis" &&
                searchResults.map((flow) => (
                  <div
                    key={flow.id}
                    className="search-result-item dnis-result"
                    onClick={() => handleFlowClick(flow.id)}
                  >
                    <div className="result-icon">
                      <Phone size={20} />
                    </div>
                    <div className="result-content">
                      <div className="result-title">{flow.dnis}</div>
                      <div className="result-subtitle">{flow.name}</div>
                      {flow.description && (
                        <div className="result-description">
                          {flow.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer with count */}
        {searchResults.length > 0 && (
          <div className="search-panel-footer">
            <span>
              {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""} found
            </span>
            <span className="keyboard-hint">
              Click to navigate • ESC to close
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPanel;
