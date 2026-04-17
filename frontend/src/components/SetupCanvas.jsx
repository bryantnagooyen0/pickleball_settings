import React, { useRef, useState, useCallback } from 'react';
import {
  Box, Popover, PopoverTrigger, PopoverContent, PopoverBody,
  PopoverArrow, Input, Button, VStack, Text, NumberInput,
  NumberInputField, HStack, IconButton, Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

// SVG coordinate constants
const VB_W = 200;
const VB_H = 360;
// Paddle bounding box within the SVG
const PB = { x: 10, y: 10, w: 180, h: 340 };

// Convert SVG point to percentage within the paddle bounding box
const toPercent = (svgX, svgY) => ({
  x: ((svgX - PB.x) / PB.w) * 100,
  y: ((svgY - PB.y) / PB.h) * 100,
});

// Convert percentage back to SVG coordinates
const fromPercent = (px, py, pw, ph) => ({
  x: PB.x + (px / 100) * PB.w,
  y: PB.y + (py / 100) * PB.h,
  w: (pw / 100) * PB.w,
  h: (ph / 100) * PB.h,
});

const getSVGPoint = (svgEl, clientX, clientY) => {
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svgEl.getScreenCTM().inverse());
};

const PaddleOutline = () => (
  <>
    {/* Handle */}
    <rect x="80" y="268" width="40" height="80" rx="6" fill="#2D3748" stroke="#4A5568" strokeWidth="2" />
    {/* Head */}
    <ellipse cx="100" cy="148" rx="88" ry="130" fill="#2D3748" stroke="#4A5568" strokeWidth="2" />
    {/* Center line decoration */}
    <line x1="100" y1="40" x2="100" y2="256" stroke="#4A5568" strokeWidth="0.5" strokeDasharray="4 4" />
    {/* Face text */}
    <text x="100" y="155" textAnchor="middle" fill="#4A5568" fontSize="10" fontFamily="sans-serif">FACE</text>
  </>
);

const TapeStrip = ({ strip, index, readOnly, onDelete }) => {
  const { x, y, w, h } = fromPercent(strip.x, strip.y, strip.width, strip.height);
  return (
    <g>
      <rect
        x={x} y={y} width={Math.max(w, 3)} height={Math.max(h, 3)}
        fill="#FF6B35" opacity="0.85" rx="2"
        style={readOnly ? {} : { cursor: 'pointer' }}
      />
      {!readOnly && (
        <g onClick={() => onDelete(index)} style={{ cursor: 'pointer' }}>
          <circle cx={x + Math.max(w, 3)} cy={y} r="6" fill="#E53E3E" />
          <text x={x + Math.max(w, 3)} y={y + 4} textAnchor="middle" fill="white" fontSize="8">×</text>
        </g>
      )}
      {strip.weightGrams > 0 && (
        <text x={x + Math.max(w, 3) / 2} y={y + Math.max(h, 3) / 2 + 4}
          textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
          {strip.weightGrams}g
        </text>
      )}
    </g>
  );
};

const SetupCanvas = ({ strips = [], onChange, readOnly = false, width = 200 }) => {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null); // { startX, startY }
  const [draft, setDraft] = useState(null);        // { x, y, width, height } in %
  const [pendingStrip, setPendingStrip] = useState(null); // strip to confirm weight/label
  const [weightInput, setWeightInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const popoverRef = useRef(null);

  const getPoint = useCallback((e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return getSVGPoint(svgRef.current, clientX, clientY);
  }, []);

  const handleMouseDown = (e) => {
    if (readOnly) return;
    e.preventDefault();
    const pt = getPoint(e);
    setDragging({ startX: pt.x, startY: pt.y });
    setDraft(null);
  };

  const handleMouseMove = (e) => {
    if (!dragging || readOnly) return;
    const pt = getPoint(e);
    const x = Math.min(dragging.startX, pt.x);
    const y = Math.min(dragging.startY, pt.y);
    const w = Math.abs(pt.x - dragging.startX);
    const h = Math.abs(pt.y - dragging.startY);
    const pct = toPercent(x, y);
    setDraft({
      x: pct.x,
      y: pct.y,
      width: (w / PB.w) * 100,
      height: (h / PB.h) * 100,
    });
  };

  const handleMouseUp = () => {
    if (!dragging || readOnly) return;
    setDragging(null);
    if (draft && draft.width > 1 && draft.height > 1) {
      setPendingStrip(draft);
      setWeightInput('');
      setLabelInput('');
    }
    setDraft(null);
  };

  const confirmStrip = () => {
    if (!pendingStrip) return;
    const newStrip = {
      ...pendingStrip,
      weightGrams: parseFloat(weightInput) || 0,
      label: labelInput || '',
    };
    onChange([...strips, newStrip]);
    setPendingStrip(null);
  };

  const cancelStrip = () => setPendingStrip(null);

  const deleteStrip = (index) => {
    onChange(strips.filter((_, i) => i !== index));
  };

  const svgHeight = (width / VB_W) * VB_H;

  return (
    <Box position="relative" userSelect="none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        width={width}
        height={svgHeight}
        style={{ display: 'block', touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <defs>
          <clipPath id="paddleClip">
            <ellipse cx="100" cy="148" rx="88" ry="130" />
            <rect x="80" y="268" width="40" height="80" rx="6" />
          </clipPath>
        </defs>

        <PaddleOutline />

        {/* Saved strips */}
        <g clipPath="url(#paddleClip)">
          {strips.map((strip, i) => (
            <TapeStrip key={i} strip={strip} index={i} readOnly={readOnly} onDelete={deleteStrip} />
          ))}
          {/* Draft strip while dragging */}
          {draft && (
            <rect
              x={PB.x + (draft.x / 100) * PB.w}
              y={PB.y + (draft.y / 100) * PB.h}
              width={Math.max((draft.width / 100) * PB.w, 3)}
              height={Math.max((draft.height / 100) * PB.h, 3)}
              fill="#FF6B35" opacity="0.5" rx="2"
            />
          )}
        </g>

        {!readOnly && strips.length === 0 && !dragging && (
          <text x="100" y="320" textAnchor="middle" fill="#4A5568" fontSize="9" fontFamily="sans-serif">
            Click &amp; drag to place lead tape
          </text>
        )}
      </svg>

      {/* Weight/Label popover after drag */}
      {pendingStrip && (
        <Box
          position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)"
          bg="gray.800" border="1px solid" borderColor="gray.600"
          borderRadius="md" p={3} zIndex={10} minW="180px" boxShadow="lg"
        >
          <VStack spacing={2} align="stretch">
            <Text color="white" fontSize="sm" fontWeight="bold">Tape Strip Details</Text>
            <Box>
              <Text color="gray.400" fontSize="xs" mb={1}>Weight (grams)</Text>
              <Input
                size="sm" type="number" placeholder="e.g. 1.5"
                value={weightInput} onChange={(e) => setWeightInput(e.target.value)}
                bg="gray.700" color="white" borderColor="gray.500"
                autoFocus
              />
            </Box>
            <Box>
              <Text color="gray.400" fontSize="xs" mb={1}>Label (optional)</Text>
              <Input
                size="sm" placeholder="e.g. 12 o'clock"
                value={labelInput} onChange={(e) => setLabelInput(e.target.value)}
                bg="gray.700" color="white" borderColor="gray.500"
              />
            </Box>
            <HStack>
              <Button size="sm" colorScheme="orange" onClick={confirmStrip} flex={1}>Add</Button>
              <Button size="sm" variant="ghost" color="gray.400" onClick={cancelStrip}>Cancel</Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {!readOnly && (
        <Text color="gray.500" fontSize="xs" mt={1} textAlign="center">
          Click &amp; drag on the paddle to place tape strips
        </Text>
      )}
    </Box>
  );
};

export default SetupCanvas;
