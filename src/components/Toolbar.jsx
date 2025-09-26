import React, { useState, useEffect, useRef } from "react";
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
  const [showTooltip, setShowTooltip] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const toolbarRef = useRef(null);

  const isNodeSelected = selectedElement && selectedElement.type !== "edge";
  const isEdgeSelected = selectedElement && selectedElement.type === "edge";
  const isLabelSelected =
    selectedElement && selectedElement.elementType === "label";

  // Document-level mouse tracking to ensure tooltips hide properly
  useEffect(() => {
    const handleDocumentMouseMove = (e) => {
      if (!toolbarRef.current) return;

      const toolbarRect = toolbarRef.current.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const isMouseOverToolbar =
        mouseX >= toolbarRect.left &&
        mouseX <= toolbarRect.right &&
        mouseY >= toolbarRect.top &&
        mouseY <= toolbarRect.bottom + 60; // Extra space for tooltips

      if (!isMouseOverToolbar) {
        setShowTooltip(null);
      }
    };

    document.addEventListener("mousemove", handleDocumentMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleDocumentMouseMove);
    };
  }, []);

  const handleMouseEnter = (title, description) => {
    setShowTooltip({ title, description });
  };

  const handleMouseLeave = () => {
    // Let the document mouse move handler take care of hiding
  };

  const TooltipButton = ({
    icon: Icon,
    title,
    description,
    onClick,
    className = "",
    active = false,
    disabled = false,
  }) => (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => handleMouseEnter(title, description)}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`toolbar-icon-btn ${className} ${active ? "active" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={onClick}
        disabled={disabled}
      >
        <Icon size={16} />
      </button>
      {showTooltip && showTooltip.title === title && (
        <div className="toolbar-tooltip">
          <div className="tooltip-header">
            <Icon size={14} />
            <span>{title}</span>
          </div>
          <div className="tooltip-desc">{description}</div>
        </div>
      )}
    </div>
  );

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
      {/* Zoom & View Controls */}
      <div className="toolbar-group">
        <TooltipButton
          icon={ZoomIn}
          title="Zoom In"
          description="Increase canvas zoom level"
          onClick={onZoomIn}
        />
        <TooltipButton
          icon={ZoomOut}
          title="Zoom Out"
          description="Decrease canvas zoom level"
          onClick={onZoomOut}
        />
        <TooltipButton
          icon={Maximize2}
          title="Fit View"
          description="Fit entire flow in viewport"
          onClick={onFitView}
        />
      </div>

      <div className="toolbar-divider"></div>

      {/* History Controls */}
      <div className="toolbar-group">
        <TooltipButton
          icon={RotateCcw}
          title="Undo"
          description="Undo last action"
          onClick={onUndo}
          disabled={!canUndo}
        />
        <TooltipButton
          icon={RotateCw}
          title="Redo"
          description="Redo last undone action"
          onClick={onRedo}
          disabled={!canRedo}
        />
      </div>

      <div className="toolbar-divider"></div>

      {/* Layout & Display */}
      <div className="toolbar-group">
        <TooltipButton
          icon={Layers}
          title="Auto Layout"
          description="Automatically arrange nodes in optimal layout"
          onClick={onAutoLayout}
        />
        <TooltipButton
          icon={Grid3X3}
          title="Toggle Grid"
          description="Show/hide background grid for alignment"
          onClick={onToggleGrid}
          active={showGrid}
        />
        <TooltipButton
          icon={showMiniMap ? Eye : EyeOff}
          title="Toggle MiniMap"
          description="Show/hide minimap overview"
          onClick={onToggleMiniMap}
          active={showMiniMap}
        />
      </div>

      <div className="toolbar-divider"></div>

      {/* Add Elements */}
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

      {/* Text Formatting - Show only when node/label is selected */}
      {(isNodeSelected || isLabelSelected) && (
        <>
          <div className="toolbar-divider"></div>
          <div className="toolbar-group">
            <TooltipButton
              icon={Bold}
              title="Bold"
              description="Make selected text bold"
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
              description="Make selected text italic"
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
              description="Underline selected text"
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
        </>
      )}

      {/* Node Styling - Show only when node is selected */}
      {isNodeSelected && (
        <>
          <div className="toolbar-divider"></div>
          <div className="toolbar-group">
            <TooltipButton
              icon={Paintbrush}
              title="Background"
              description="Change node background color"
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
        </>
      )}

      {/* Edge Styling - Show only when edge is selected */}
      {isEdgeSelected && (
        <>
          <div className="toolbar-divider"></div>
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
        </>
      )}
    </div>
  );
}
