import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  RotateCw,
  Grid3X3,
  Eye,
  EyeOff,
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  Square,
  Circle,
  Triangle,
  Hexagon,
  ArrowRight,
  Tag,
  Minus,
  MoreHorizontal,
  Zap,
  Move,
  CornerUpRight,
  Box,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Paintbrush,
  RectangleHorizontal,
  Sliders,
  Layers,
  Scan,
  Spline,
  ChevronRight,
} from "lucide-react";

export default function Toolbar({
  selectedElement,
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  onToggleGrid,
  onToggleMiniMap,
  onAutoLayout,
  showGrid = true,
  showMiniMap = true,
  canUndo = false,
  canRedo = false,
  onUpdateElement,
  onAddShape,
  onAddLabel,
  onAddArrow,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrollIndicatorStyle, setScrollIndicatorStyle] = useState({});
  const toolbarRef = useRef(null);

  const isNodeSelected = selectedElement && selectedElement.type !== "edge";
  const isEdgeSelected = selectedElement && selectedElement.type === "edge";
  const isLabelSelected =
    selectedElement && selectedElement.elementType === "label";

  // Check for overflow and update scroll indicator
  const checkOverflow = useCallback(() => {
    if (toolbarRef.current) {
      const element = toolbarRef.current;
      const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
      setHasOverflow(hasHorizontalOverflow);

      // Add/remove class for styling
      if (hasHorizontalOverflow) {
        element.classList.add("has-overflow");
      } else {
        element.classList.remove("has-overflow");
      }

      // Update scroll indicator position
      const rect = element.getBoundingClientRect();
      setScrollIndicatorStyle({
        top: rect.top + rect.height / 2,
        right: 8,
        transform: "translateY(-50%)",
      });
    }
  }, []);

  // Check overflow on mount and when content changes
  useEffect(() => {
    checkOverflow();

    // Check on resize and scroll
    const handleResize = () => checkOverflow();
    const handleScroll = () => checkOverflow();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    // Check when content changes (after render)
    const timeoutId = setTimeout(checkOverflow, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [checkOverflow, selectedElement]);

  // Re-check overflow when activeDropdown changes
  useEffect(() => {
    const timeoutId = setTimeout(checkOverflow, 100);
    return () => clearTimeout(timeoutId);
  }, [activeDropdown, checkOverflow]);

  // Handle scroll arrow click
  const handleScrollRight = useCallback(() => {
    if (toolbarRef.current) {
      const scrollAmount = 150; // Pixels to scroll
      toolbarRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  const TooltipButton = ({
    icon: Icon,
    title,
    description,
    onClick,
    className = "",
    active = false,
    disabled = false,
    shortcut,
    category,
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    // Determine context based on selected element
    const getContextInfo = () => {
      if (!selectedElement) {
        return {
          context: "Canvas",
          contextIcon: Grid3X3,
          contextColor: "#6b7280",
        };
      } else if (selectedElement.type === "edge") {
        return {
          context: "Edge",
          contextIcon: CornerUpRight,
          contextColor: "#0ea5e9",
        };
      } else {
        return {
          context: "Node",
          contextIcon: Box,
          contextColor: "#8b5cf6",
        };
      }
    };

    const contextInfo = getContextInfo();
    const ContextIcon = contextInfo.contextIcon;

    const handleMouseEnter = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setTooltipPos({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 15,
        });
        setIsHovered(true);
      }
    };

    return (
      <>
        <button
          ref={buttonRef}
          className={`toolbar-icon-btn ${className} ${active ? "active" : ""} ${
            disabled ? "disabled" : ""
          }`}
          onClick={onClick}
          disabled={disabled}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Icon size={16} />
        </button>
        {isHovered &&
          createPortal(
            <div
              className="enhanced-tooltip-portal"
              style={{
                position: "fixed",
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: "translateX(-50%)",
                background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                color: "#1f2937",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "13px",
                zIndex: 10000,
                pointerEvents: "none",
                minWidth: "280px",
                maxWidth: "400px",
                backdropFilter: "blur(10px)",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                animation: "tooltipFadeIn 0.2s ease-out",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: "11px",
                  fontWeight: "500",
                  color: contextInfo.contextColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <ContextIcon size={12} />
                <span>{contextInfo.context} Controls</span>
              </div>
              <div style={{ padding: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {category || "Tools"}
                  </span>
                  {active && (
                    <span
                      style={{
                        fontSize: "10px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        fontWeight: "500",
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flex: 1,
                    }}
                  >
                    <Icon size={16} />
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "#1f2937",
                          marginBottom: "2px",
                        }}
                      >
                        {title}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          lineHeight: "1.4",
                        }}
                      >
                        {description}
                      </div>
                    </div>
                  </div>
                  {shortcut && (
                    <div
                      style={{
                        fontSize: "10px",
                        background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                        color: "#475569",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        fontFamily: "monospace",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {shortcut}
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}
      </>
    );
  };

  const ColorPicker = ({ value, onChange, title }) => {
    const [showPalette, setShowPalette] = useState(false);
    const paletteRef = useRef(null);

    // Pretty flowchart colors
    const colorPalette = [
      // Blues
      "#3b82f6",
      "#1d4ed8",
      "#1e40af",
      "#60a5fa",
      "#93c5fd",
      // Greens
      "#10b981",
      "#059669",
      "#047857",
      "#34d399",
      "#6ee7b7",
      // Purples
      "#8b5cf6",
      "#7c3aed",
      "#6d28d9",
      "#a78bfa",
      "#c4b5fd",
      // Oranges/Yellows
      "#f59e0b",
      "#d97706",
      "#b45309",
      "#fbbf24",
      "#fcd34d",
      // Reds/Pinks
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#f87171",
      "#fca5a5",
      // Grays
      "#6b7280",
      "#4b5563",
      "#374151",
      "#9ca3af",
      "#d1d5db",
      // Teals
      "#14b8a6",
      "#0d9488",
      "#0f766e",
      "#5eead4",
      "#99f6e4",
      // Indigos
      "#6366f1",
      "#4f46e5",
      "#4338ca",
      "#818cf8",
      "#a5b4fc",
    ];

    // Handle click outside to close palette
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (paletteRef.current && !paletteRef.current.contains(event.target)) {
          setShowPalette(false);
        }
      };

      if (showPalette) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [showPalette]);

    return (
      <div className="color-picker-container" ref={paletteRef}>
        <div
          className="color-picker-wrapper"
          onClick={(e) => {
            e.preventDefault();
            setShowPalette(!showPalette);
          }}
        >
          <div
            className="color-picker-preview"
            style={{ backgroundColor: value || "#000000" }}
            title={title}
          />
        </div>
        {showPalette && (
          <div className="color-palette">
            <div className="color-palette-grid">
              {colorPalette.map((color, index) => (
                <div
                  key={index}
                  className={`color-swatch ${value === color ? "active" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setShowPalette(false);
                  }}
                  title={color}
                />
              ))}
            </div>
            <div className="color-palette-custom">
              <label className="custom-color-label">
                Custom:
                <input
                  type="color"
                  value={value || "#000000"}
                  onChange={(e) => {
                    onChange(e.target.value);
                    setShowPalette(false);
                  }}
                  className="custom-color-picker"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Slider = ({ value, onChange, min, max, title }) => (
    <div className="slider-wrapper">
      <input
        type="range"
        min={min}
        max={max}
        value={value || min}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="toolbar-slider"
        title={title}
      />
      <span className="slider-value">{value || min}</span>
    </div>
  );

  return (
    <div className="flow-toolbar" ref={toolbarRef}>
      {/* Navigation Section */}
      <div className="toolbar-section">
        <div className="toolbar-group">
          <TooltipButton
            icon={ZoomIn}
            title="Zoom In"
            description="Increase canvas zoom level for detailed view"
            onClick={onZoomIn}
            shortcut="Ctrl +"
            category="Navigation"
          />
          <TooltipButton
            icon={ZoomOut}
            title="Zoom Out"
            description="Decrease canvas zoom level for broader view"
            onClick={onZoomOut}
            shortcut="Ctrl -"
            category="Navigation"
          />
          <TooltipButton
            icon={Maximize2}
            title="Fit View"
            description="Automatically fit all flow elements in viewport"
            onClick={onFitView}
            shortcut="Ctrl 0"
            category="Navigation"
          />
        </div>
      </div>

      {/* Edit Section */}
      <div className="toolbar-section">
        <div className="toolbar-group">
          <TooltipButton
            icon={RotateCcw}
            title="Undo"
            description="Reverse the last action performed"
            onClick={onUndo}
            disabled={!canUndo}
            shortcut="Ctrl Z"
            category="Edit"
          />
          <TooltipButton
            icon={RotateCw}
            title="Redo"
            description="Restore the last undone action"
            onClick={onRedo}
            disabled={!canRedo}
            shortcut="Ctrl Y"
            category="Edit"
          />
        </div>
      </div>

      {/* View Section */}
      <div className="toolbar-section">
        <div className="toolbar-group">
          <TooltipButton
            icon={Layers}
            title="Auto Layout"
            description="Automatically arrange nodes in optimal layout"
            onClick={onAutoLayout}
            category="Layout"
          />
          <TooltipButton
            icon={Grid3X3}
            title="Toggle Grid"
            description="Show/hide background grid for alignment"
            onClick={onToggleGrid}
            active={showGrid}
            category="View"
          />
          <TooltipButton
            icon={showMiniMap ? Eye : EyeOff}
            title="Toggle MiniMap"
            description="Show/hide minimap overview"
            onClick={onToggleMiniMap}
            active={showMiniMap}
            category="View"
          />
        </div>
      </div>

      {/* Add Section */}
      <div className="toolbar-section">
        <div className="toolbar-group">
          <div className="dropdown-wrapper">
            <TooltipButton
              icon={Box}
              title="Add Shape"
              description="Add geometric shapes as containers"
              onClick={() =>
                setActiveDropdown(activeDropdown === "shapes" ? null : "shapes")
              }
              active={activeDropdown === "shapes"}
            />
            {activeDropdown === "shapes" && (
              <div className="dropdown-menu">
                <button onClick={() => onAddShape("rectangle")}>
                  <Square size={14} /> Rectangle
                </button>
                <button onClick={() => onAddShape("circle")}>
                  <Circle size={14} /> Circle
                </button>
                <button onClick={() => onAddShape("triangle")}>
                  <Triangle size={14} /> Triangle
                </button>
                <button onClick={() => onAddShape("hexagon")}>
                  <Hexagon size={14} /> Hexagon
                </button>
              </div>
            )}
          </div>

          <TooltipButton
            icon={Tag}
            title="Add Label"
            description="Add text labels and annotations"
            onClick={onAddLabel}
          />

          <TooltipButton
            icon={CornerUpRight}
            title="Add Arrow"
            description="Add pointing arrows for annotations"
            onClick={onAddArrow}
          />
        </div>
      </div>

      {/* Typography Section - Show only when node/label is selected */}
      {(isNodeSelected || isLabelSelected) && (
        <div className="toolbar-section">
          <div className="toolbar-group">
            <div className="toolbar-text-controls">
              <TooltipButton
                icon={Bold}
                title="Bold"
                description="Apply bold font weight to selected node text"
                shortcut="Ctrl B"
                category="Typography"
                onClick={() =>
                  onUpdateElement({
                    fontWeight:
                      selectedElement?.style?.fontWeight === "bold"
                        ? "normal"
                        : "bold",
                  })
                }
                active={
                  selectedElement?.style?.fontWeight === "bold" ||
                  selectedElement?.data?.style?.fontWeight === "bold"
                }
              />
              <TooltipButton
                icon={Italic}
                title="Italic"
                description="Apply italic font style to selected node text"
                shortcut="Ctrl I"
                category="Typography"
                onClick={() =>
                  onUpdateElement({
                    fontStyle:
                      selectedElement?.style?.fontStyle === "italic"
                        ? "normal"
                        : "italic",
                  })
                }
                active={
                  selectedElement?.style?.fontStyle === "italic" ||
                  selectedElement?.data?.style?.fontStyle === "italic"
                }
              />
              <TooltipButton
                icon={Underline}
                title="Underline"
                description="Apply underline decoration to selected node text"
                category="Typography"
                onClick={() =>
                  onUpdateElement({
                    textDecoration:
                      selectedElement?.style?.textDecoration === "underline"
                        ? "none"
                        : "underline",
                  })
                }
                active={
                  selectedElement?.style?.textDecoration === "underline" ||
                  selectedElement?.data?.style?.textDecoration === "underline"
                }
              />
            </div>

            <div className="font-controls">
              <select
                value={
                  selectedElement?.style?.fontFamily ||
                  selectedElement?.data?.style?.fontFamily ||
                  "Inter"
                }
                onChange={(e) =>
                  onUpdateElement({ fontFamily: e.target.value })
                }
                className="font-family-select"
                title="Font Family"
              >
                <option value="Inter">Inter</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times</option>
                <option value="Courier New">Courier</option>
                <option value="Georgia">Georgia</option>
              </select>

              <input
                type="number"
                min="8"
                max="72"
                value={
                  selectedElement?.style?.fontSize ||
                  selectedElement?.data?.style?.fontSize ||
                  14
                }
                onChange={(e) =>
                  onUpdateElement({ fontSize: parseInt(e.target.value) })
                }
                className="font-size-input"
                title="Font Size"
              />
            </div>

            <ColorPicker
              value={
                selectedElement?.style?.color ||
                selectedElement?.data?.style?.color
              }
              onChange={(color) => onUpdateElement({ color })}
              title="Text Color"
            />
          </div>

          <div className="toolbar-alignment-group">
            <TooltipButton
              icon={AlignLeft}
              title="Align Left"
              description="Align text to the left"
              category="Typography"
              onClick={() => onUpdateElement({ textAlign: "left" })}
              active={
                selectedElement?.style?.textAlign === "left" ||
                (!selectedElement?.style?.textAlign &&
                  !selectedElement?.data?.style?.textAlign)
              }
            />
            <TooltipButton
              icon={AlignCenter}
              title="Align Center"
              description="Center align text"
              category="Typography"
              onClick={() => onUpdateElement({ textAlign: "center" })}
              active={
                selectedElement?.style?.textAlign === "center" ||
                selectedElement?.data?.style?.textAlign === "center"
              }
            />
            <TooltipButton
              icon={AlignRight}
              title="Align Right"
              description="Align text to the right"
              category="Typography"
              onClick={() => onUpdateElement({ textAlign: "right" })}
              active={
                selectedElement?.style?.textAlign === "right" ||
                selectedElement?.data?.style?.textAlign === "right"
              }
            />
          </div>
        </div>
      )}

      {/* Node Styling Section - Show only when node is selected */}
      {isNodeSelected && (
        <div className="toolbar-section">
          <div className="toolbar-group">
            <TooltipButton
              icon={Paintbrush}
              title="Background"
              description="Change node background color"
              category="Styling"
            />
            <ColorPicker
              value={
                selectedElement?.style?.backgroundColor ||
                selectedElement?.data?.style?.backgroundColor
              }
              onChange={(backgroundColor) =>
                onUpdateElement({ backgroundColor })
              }
              title="Background Color"
            />

            <TooltipButton
              icon={RectangleHorizontal}
              title="Border"
              description="Change border color and width"
              category="Styling"
            />
            <ColorPicker
              value={
                selectedElement?.style?.borderColor ||
                selectedElement?.data?.style?.borderColor
              }
              onChange={(borderColor) => onUpdateElement({ borderColor })}
              title="Border Color"
            />

            <Slider
              value={
                selectedElement?.style?.borderWidth ||
                selectedElement?.data?.style?.borderWidth ||
                1
              }
              onChange={(borderWidth) => onUpdateElement({ borderWidth })}
              min={0}
              max={10}
              title="Border Width"
            />

            <TooltipButton
              icon={Circle}
              title="Border Radius"
              description="Change corner roundness"
            />
            <Slider
              value={
                selectedElement?.style?.borderRadius ||
                selectedElement?.data?.style?.borderRadius ||
                8
              }
              onChange={(borderRadius) => onUpdateElement({ borderRadius })}
              min={0}
              max={50}
              title="Border Radius"
            />
          </div>

          <div className="toolbar-divider"></div>
          <div className="toolbar-group">
            <TooltipButton
              icon={Move}
              title="Dimensions"
              description="Adjust node width and height"
            />
            <div className="dimension-controls">
              <input
                type="number"
                min="50"
                max="500"
                value={
                  selectedElement?.style?.width ||
                  selectedElement?.data?.style?.width ||
                  150
                }
                onChange={(e) =>
                  onUpdateElement({ width: parseInt(e.target.value) })
                }
                className="dimension-input"
                title="Width"
                placeholder="W"
              />
              <input
                type="number"
                min="30"
                max="300"
                value={
                  selectedElement?.style?.height ||
                  selectedElement?.data?.style?.height ||
                  60
                }
                onChange={(e) =>
                  onUpdateElement({ height: parseInt(e.target.value) })
                }
                className="dimension-input"
                title="Height"
                placeholder="H"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edge Styling Section - Show only when edge is selected */}
      {isEdgeSelected && (
        <div className="toolbar-section">
          <div className="toolbar-group">
            <div className="dropdown-wrapper">
              <TooltipButton
                icon={Spline}
                title="Edge Style"
                description="Change edge line style"
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === "edgeStyle" ? null : "edgeStyle"
                  )
                }
                active={activeDropdown === "edgeStyle"}
              />
              {activeDropdown === "edgeStyle" && (
                <div className="dropdown-menu">
                  <button
                    onClick={() =>
                      onUpdateElement({ strokeDasharray: "", animated: false })
                    }
                  >
                    <Minus size={14} /> Solid
                  </button>
                  <button
                    onClick={() =>
                      onUpdateElement({
                        strokeDasharray: "5,5",
                        animated: false,
                      })
                    }
                  >
                    <MoreHorizontal size={14} /> Dashed
                  </button>
                  <button
                    onClick={() =>
                      onUpdateElement({
                        strokeDasharray: "2,2",
                        animated: false,
                      })
                    }
                  >
                    <Scan size={14} /> Dotted
                  </button>
                  <button
                    onClick={() =>
                      onUpdateElement({
                        animated: !selectedElement?.animated,
                        strokeDasharray: "",
                      })
                    }
                    className={selectedElement?.animated ? "active" : ""}
                  >
                    <Zap size={14} /> Animated
                  </button>
                </div>
              )}
            </div>

            <ColorPicker
              value={selectedElement?.style?.stroke}
              onChange={(stroke) => onUpdateElement({ stroke })}
              title="Edge Color"
            />

            <Slider
              value={selectedElement?.style?.strokeWidth || 2}
              onChange={(strokeWidth) => onUpdateElement({ strokeWidth })}
              min={1}
              max={10}
              title="Edge Width"
            />
          </div>
        </div>
      )}

      {/* Scroll Indicator */}
      <div
        className={`toolbar-scroll-indicator ${hasOverflow ? "visible" : ""}`}
        style={scrollIndicatorStyle}
      >
        <div
          className="scroll-arrow"
          title="Click to scroll right for more tools"
          onClick={handleScrollRight}
        >
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}
