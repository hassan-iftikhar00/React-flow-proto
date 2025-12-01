import React, { useState, useEffect, useRef } from "react";
import { X, Search as SearchIcon } from "lucide-react";
import { searchNodes } from "../utils/searchUtils";
import "./InlineSearch.css";

function InlineSearch({ currentFlowId, onNodeSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      const results = searchNodes(searchQuery, currentFlowId);
      setSearchResults(results);
      setSelectedIndex(0);
    }, 200);

    return () => clearTimeout(timeout);
  }, [searchQuery, currentFlowId]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && searchResults[selectedIndex]) {
      handleSelect(searchResults[selectedIndex]);
    }
  };

  const handleSelect = (result) => {
    onNodeSelect(result.node);
    onClose();
  };

  const getNodeTypeLabel = (type) => {
    const labels = {
      play: "Play",
      menu: "Menu",
      collect: "Collect",
      record: "Record",
      dtmf: "DTMF",
      ddtmf: "DDTMF",
      wait: "Wait",
      tts: "TTS",
      stt: "STT",
      istt: "ISTT",
      terminator: "End",
    };
    return labels[type] || type;
  };

  return (
    <div className="inline-search">
      <div className="inline-search-input-wrapper">
        <SearchIcon size={16} className="inline-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="inline-search-input"
          placeholder="Search nodes in flow..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="inline-search-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="inline-search-results">
          {searchResults.slice(0, 8).map((result, index) => (
            <div
              key={`${result.node.id}-${index}`}
              className={`inline-search-result-item ${
                index === selectedIndex ? "selected" : ""
              }`}
              onClick={() => handleSelect(result)}
            >
              <div className="result-node-type">
                {getNodeTypeLabel(result.node.type)}
              </div>
              <div className="result-node-content">
                {result.matches[0]?.value || result.node.id}
              </div>
            </div>
          ))}
          {searchResults.length > 8 && (
            <div className="inline-search-more">
              +{searchResults.length - 8} more results
            </div>
          )}
        </div>
      )}

      {searchQuery.trim().length > 0 && searchResults.length === 0 && (
        <div className="inline-search-no-results">No nodes found</div>
      )}
    </div>
  );
}

export default InlineSearch;
