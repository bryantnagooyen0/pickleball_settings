import React, { useRef, useState, useEffect, useCallback, useId } from 'react';
import { Box, Input, Button, VStack, Text, HStack, IconButton, Select } from '@chakra-ui/react';
import { DeleteIcon, RepeatIcon, EditIcon } from '@chakra-ui/icons';
import {
  PADDLE_PATHS,
  getPaddlePath,
  getForwardArc,
  getDirectionalArcSegments,
  getArcSegments,
} from '../utils/paddleDrawing.js';

const VB_W = 440;
const VB_H = 881;
const VB_PAD = 30;

const buildSamples = (pathEl, count = 500) => {
  const L = pathEl.getTotalLength();
  const pts = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const p = pathEl.getPointAtLength(t * L);
    pts.push({ t, x: p.x, y: p.y });
  }
  return { pts, L };
};

const snapToPath = (samples, svgX, svgY, pathEl, prevT = null) => {
  const { pts, L } = samples;
  const HOOD = 0.25;
  const candidates = prevT !== null
    ? pts.filter(p => {
        const diff = Math.abs(p.t - prevT);
        return Math.min(diff, 1 - diff) <= HOOD;
      })
    : pts;
  const pool = candidates.length > 2 ? candidates : pts;

  let best = pool[0];
  let minD = Infinity;
  for (const p of pool) {
    const d = (p.x - svgX) ** 2 + (p.y - svgY) ** 2;
    if (d < minD) { minD = d; best = p; }
  }

  const step = 1 / pts.length;
  let lo = Math.max(0, best.t - step * 2);
  let hi = Math.min(1, best.t + step * 2);
  for (let i = 0; i < 10; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    const p1 = pathEl.getPointAtLength(m1 * L);
    const p2 = pathEl.getPointAtLength(m2 * L);
    const d1 = (p1.x - svgX) ** 2 + (p1.y - svgY) ** 2;
    const d2 = (p2.x - svgX) ** 2 + (p2.y - svgY) ** 2;
    if (d1 < d2) { hi = m2; best = { t: m1, x: p1.x, y: p1.y }; }
    else { lo = m1; best = { t: m2, x: p2.x, y: p2.y }; }
  }
  return best;
};

const getSVGPoint = (svgEl, clientX, clientY) => {
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svgEl.getScreenCTM().inverse());
};

// Shared popup form used for both new strip and editing an existing strip
const StripDetailsForm = ({
  title, confirmLabel,
  lengthInput, setLengthInput,
  densityPreset, setDensityPreset,
  densityCustom, setDensityCustom,
  weightInput, setWeightInput,
  labelInput, setLabelInput,
  onConfirm, onCancel,
  autoFocus = true,
}) => (
  <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)"
    bg="gray.800" border="1px solid" borderColor="gray.600"
    borderRadius="md" p={3} zIndex={10} minW="180px" boxShadow="lg">
    <VStack spacing={2} align="stretch">
      <Text color="white" fontSize="sm" fontWeight="bold">{title}</Text>
      <Box>
        <Text color="gray.400" fontSize="xs" mb={1}>Length (inches)</Text>
        <Input size="sm" type="number" placeholder="e.g. 4"
          value={lengthInput} onChange={e => setLengthInput(e.target.value)}
          bg="gray.700" color="white" borderColor="gray.500" autoFocus={autoFocus} />
      </Box>
      <Box>
        <Text color="gray.400" fontSize="xs" mb={1}>Density (g/in)</Text>
        <Select size="sm" placeholder="Select density..."
          value={densityPreset} onChange={e => setDensityPreset(e.target.value)}
          bg="gray.700" color="white" borderColor="gray.500"
          sx={{ '> option': { background: '#2D3748' } }}>
          <option value="0.25">0.25 g/in</option>
          <option value="0.5">0.5 g/in</option>
          <option value="1">1 g/in</option>
          <option value="other">Other</option>
        </Select>
        {densityPreset === 'other' && (
          <Input size="sm" type="number" placeholder="e.g. 0.75" mt={1}
            value={densityCustom} onChange={e => setDensityCustom(e.target.value)}
            bg="gray.700" color="white" borderColor="gray.500" />
        )}
      </Box>
      <Box>
        <Text color="gray.400" fontSize="xs" mb={1}>Total Weight (grams)</Text>
        <Input size="sm" type="number" placeholder="e.g. 1.5"
          value={weightInput} onChange={e => setWeightInput(e.target.value)}
          bg="gray.700" color="white" borderColor="gray.500" />
      </Box>
      <Box>
        <Text color="gray.400" fontSize="xs" mb={1}>Position (optional)</Text>
        <Input size="sm" placeholder="e.g. 3 o'clock"
          value={labelInput} onChange={e => setLabelInput(e.target.value)}
          bg="gray.700" color="white" borderColor="gray.500" />
      </Box>
      <HStack>
        <Button size="sm" colorScheme="orange" onClick={onConfirm} flex={1}>{confirmLabel}</Button>
        <Button size="sm" variant="ghost" color="gray.400" onClick={onCancel}>Cancel</Button>
      </HStack>
    </VStack>
  </Box>
);

const SetupCanvas = ({ strips = [], onChange, readOnly = false, width = 200, paddleShape = 'hybrid', showLabels = true }) => {
  const uid = useId();
  const clipId = `pc-${uid}`.replace(/:/g, '');
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const samplesRef = useRef(null);
  const hoverTRef = useRef(null);
  const firstDotRef = useRef(null);
  const previewAccRef = useRef(0);

  const [totalLength, setTotalLength] = useState(0);
  const [firstDot, setFirstDot] = useState(null);
  const [hoverPt, setHoverPt] = useState(null);
  const [pendingStrip, setPendingStrip] = useState(null);

  // New-strip form state
  const [weightInput, setWeightInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [lengthInput, setLengthInput] = useState('');
  const [densityPreset, setDensityPreset] = useState('');
  const [densityCustom, setDensityCustom] = useState('');

  // Edit-strip form state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editLength, setEditLength] = useState('');
  const [editDensityPreset, setEditDensityPreset] = useState('');
  const [editDensityCustom, setEditDensityCustom] = useState('');

  const pathD = getPaddlePath(paddleShape);

  const defaultVB = `${-VB_PAD} ${-VB_PAD} ${VB_W + VB_PAD * 2} ${VB_H + VB_PAD * 2}`;
  const [svgViewBox, setSvgViewBox] = useState(defaultVB);
  const [svgHeight, setSvgHeight] = useState((width / VB_W) * VB_H);
  const svgVBRef = useRef({ x: -VB_PAD, y: -VB_PAD, w: VB_W + VB_PAD * 2, h: VB_H + VB_PAD * 2 });

  // Auto-calc weight for new strip
  useEffect(() => {
    const len = parseFloat(lengthInput);
    const density = densityPreset === 'other'
      ? parseFloat(densityCustom)
      : parseFloat(densityPreset);
    if (len > 0 && density > 0) {
      setWeightInput(String(Math.round(len * density * 100) / 100));
    }
  }, [lengthInput, densityPreset, densityCustom]);

  // Auto-calc weight for edit popup
  useEffect(() => {
    if (editingIndex === null) return;
    const len = parseFloat(editLength);
    const density = editDensityPreset === 'other'
      ? parseFloat(editDensityCustom)
      : parseFloat(editDensityPreset);
    if (len > 0 && density > 0) {
      setEditWeight(String(Math.round(len * density * 100) / 100));
    }
  }, [editLength, editDensityPreset, editDensityCustom, editingIndex]);

  useEffect(() => { firstDotRef.current = firstDot; }, [firstDot]);

  useEffect(() => {
    if (!pathRef.current) return;
    const s = buildSamples(pathRef.current, 500);
    samplesRef.current = s;
    setTotalLength(s.L);
    setFirstDot(null);
    setHoverPt(null);
    hoverTRef.current = null;
    previewAccRef.current = 0;

    const bb = pathRef.current.getBBox();
    const vbX = bb.x - VB_PAD;
    const vbY = bb.y - VB_PAD;
    const vbW = bb.width + 2 * VB_PAD;
    const vbH = bb.height + 2 * VB_PAD;
    svgVBRef.current = { x: vbX, y: vbY, w: vbW, h: vbH };
    setSvgViewBox(`${vbX} ${vbY} ${vbW} ${vbH}`);
    setSvgHeight(width * vbH / vbW);
  }, [paddleShape, width]);

  const snap = useCallback((svgX, svgY) => {
    if (!samplesRef.current || !pathRef.current) return null;
    return snapToPath(samplesRef.current, svgX, svgY, pathRef.current, hoverTRef.current);
  }, []);

  const openEdit = useCallback((originalIndex) => {
    const strip = strips[originalIndex];
    if (!strip) return;
    setEditingIndex(originalIndex);
    setEditWeight(strip.weightGrams > 0 ? String(strip.weightGrams) : '');
    setEditLabel(strip.label || '');
    setEditLength(strip.lengthInches > 0 ? String(strip.lengthInches) : '');
    const d = strip.densityGramsPerInch;
    if (!d || d === 0) {
      setEditDensityPreset('');
      setEditDensityCustom('');
    } else if (d === 0.25 || d === 0.5 || d === 1) {
      setEditDensityPreset(String(d));
      setEditDensityCustom('');
    } else {
      setEditDensityPreset('other');
      setEditDensityCustom(String(d));
    }
  }, [strips]);

  const saveEdit = () => {
    if (editingIndex === null) return;
    const density = editDensityPreset === 'other'
      ? (parseFloat(editDensityCustom) || 0)
      : (parseFloat(editDensityPreset) || 0);
    onChange(strips.map((s, i) => i === editingIndex ? {
      ...s,
      weightGrams: parseFloat(editWeight) || 0,
      label: editLabel || '',
      lengthInches: parseFloat(editLength) || 0,
      densityGramsPerInch: density,
    } : s));
    setEditingIndex(null);
  };

  const cancelEdit = () => setEditingIndex(null);

  const handleMouseMove = useCallback((e) => {
    if (readOnly || !svgRef.current) return;
    const pt = getSVGPoint(svgRef.current, e.clientX, e.clientY);
    const snapped = snap(pt.x, pt.y);
    if (snapped) {
      if (firstDotRef.current !== null && hoverTRef.current !== null) {
        let delta = snapped.t - hoverTRef.current;
        if (delta > 0.5) delta -= 1;
        if (delta < -0.5) delta += 1;
        previewAccRef.current += delta;
      }
      hoverTRef.current = snapped.t;
      setHoverPt(snapped);
    }
  }, [readOnly, snap]);

  const doClick = useCallback((snapped) => {
    setFirstDot(prev => {
      if (!prev) {
        previewAccRef.current = 0;
        return snapped;
      }
      setPendingStrip({ t1: prev.t, t2: snapped.t, arcFraction: previewAccRef.current });
      setWeightInput('');
      setLabelInput('');
      setLengthInput('');
      setDensityPreset('');
      setDensityCustom('');
      return null;
    });
  }, []);

  const handleClick = useCallback(() => {
    if (readOnly || !hoverPt || editingIndex !== null) return;
    doClick(hoverPt);
  }, [readOnly, hoverPt, doClick, editingIndex]);

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (readOnly || !svgRef.current) return;
    const touch = e.touches[0];
    const pt = getSVGPoint(svgRef.current, touch.clientX, touch.clientY);
    const snapped = snap(pt.x, pt.y);
    if (snapped) {
      if (firstDotRef.current !== null && hoverTRef.current !== null) {
        let delta = snapped.t - hoverTRef.current;
        if (delta > 0.5) delta -= 1;
        if (delta < -0.5) delta += 1;
        previewAccRef.current += delta;
      }
      hoverTRef.current = snapped.t;
      setHoverPt(snapped);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (readOnly || !hoverPt || editingIndex !== null) return;
    doClick(hoverPt);
  };

  const confirmStrip = () => {
    if (!pendingStrip) return;
    const density = densityPreset === 'other'
      ? (parseFloat(densityCustom) || 0)
      : (parseFloat(densityPreset) || 0);
    onChange([...strips, {
      ...pendingStrip,
      weightGrams: parseFloat(weightInput) || 0,
      label: labelInput || '',
      lengthInches: parseFloat(lengthInput) || 0,
      densityGramsPerInch: density,
    }]);
    setPendingStrip(null);
  };

  const cancelStrip = () => {
    setPendingStrip(null);
    setFirstDot(null);
    previewAccRef.current = 0;
  };

  const deleteStrip = (strip) => onChange(strips.filter(s => s !== strip));

  const mirrorStrip = (strip) => {
    if (!samplesRef.current || !pathRef.current || totalLength === 0) return;
    const L = totalLength;
    // Reflect across the paddle's vertical center line in path coordinate space
    const cx = svgVBRef.current.x + svgVBRef.current.w / 2;
    const pt1 = pathRef.current.getPointAtLength(strip.t1 * L);
    const m1 = snapToPath(samplesRef.current, 2 * cx - pt1.x, pt1.y, pathRef.current, null);
    let m2t = strip.t2;
    if (strip.t2 != null) {
      const pt2 = pathRef.current.getPointAtLength(strip.t2 * L);
      const m2 = snapToPath(samplesRef.current, 2 * cx - pt2.x, pt2.y, pathRef.current, null);
      m2t = m2.t;
    }
    onChange([...strips, {
      ...strip,
      t1: m1.t,
      t2: m2t,
      arcFraction: strip.arcFraction != null ? -strip.arcFraction : null,
      label: '',
    }]);
  };

  // Preserve original indices so edits and deletes target the right strip
  const indexedStrips = strips
    .map((strip, originalIndex) => ({ strip, originalIndex }))
    .filter(({ strip }) => strip.t1 != null && strip.t2 != null);

  const getStripCorner = useCallback((strip) => {
    if (!pathRef.current || totalLength === 0) return 'top-left';
    let midT;
    if (strip.arcFraction != null) {
      midT = ((strip.t1 + strip.arcFraction / 2) % 1 + 1) % 1;
    } else {
      midT = (strip.t1 + strip.t2) / 2;
    }
    const pt = pathRef.current.getPointAtLength(midT * totalLength);
    const { x: vbX, y: vbY, w: vbW, h: vbH } = svgVBRef.current;
    const cx = vbX + vbW / 2;
    const cy = vbY + vbH / 2;
    return `${pt.y < cy ? 'top' : 'bottom'}-${pt.x < cx ? 'left' : 'right'}`;
  }, [totalLength]);

  const getMidDomPoint = (strip, offset = 70) => {
    if (!pathRef.current || totalLength === 0) return null;
    let midT;
    if (strip.arcFraction != null) {
      midT = ((strip.t1 + strip.arcFraction / 2) % 1 + 1) % 1;
    } else {
      midT = (strip.t1 + strip.t2) / 2;
    }
    const L = totalLength;
    const pt = pathRef.current.getPointAtLength(midT * L);

    const delta = 0.005;
    const ptA = pathRef.current.getPointAtLength(((midT - delta + 1) % 1) * L);
    const ptB = pathRef.current.getPointAtLength(((midT + delta) % 1) * L);
    const tx = ptB.x - ptA.x;
    const ty = ptB.y - ptA.y;
    const n1 = { x: -ty, y: tx };
    const n2 = { x: ty, y: -tx };
    const { x: vbX, y: vbY, w: vbW, h: vbH } = svgVBRef.current;
    const paddleCx = vbX + vbW / 2;
    const paddleCy = vbY + vbH / 2;
    const toCx = paddleCx - pt.x;
    const toCy = paddleCy - pt.y;
    const outward = (n1.x * toCx + n1.y * toCy) < 0 ? n1 : n2;
    const mag = Math.sqrt(outward.x ** 2 + outward.y ** 2);
    const nx = outward.x / mag;
    const ny = outward.y / mag;

    const scaleX = width / vbW;
    const scaleY = svgHeight / vbH;
    return {
      x: (pt.x + nx * offset - vbX) * scaleX,
      y: (pt.y + ny * offset - vbY) * scaleY,
    };
  };

  const popupOpen = pendingStrip !== null || editingIndex !== null;

  // Group strips by quadrant for the dedicated label rows
  const quadrantStrips = { 'top-left': [], 'top-right': [], 'bottom-left': [], 'bottom-right': [] };
  if (!readOnly && !popupOpen && !firstDot) {
    indexedStrips.forEach(({ strip, originalIndex }) => {
      const corner = getStripCorner(strip);
      quadrantStrips[corner].push({ strip, originalIndex });
    });
  }

  const renderLabelChip = ({ strip, originalIndex }) => {
    const isEditing = editingIndex === originalIndex;
    return (
      <HStack
        key={originalIndex}
        bg={isEditing ? 'gray.600' : 'gray.700'}
        px={2} py={1}
        borderRadius="md"
        spacing={1}
        zIndex={6}
        boxShadow="0 2px 8px rgba(0,0,0,0.45)"
        outline={isEditing ? '1px solid' : 'none'}
        outlineColor="orange.400"
        cursor="pointer"
        onClick={(e) => { e.stopPropagation(); openEdit(originalIndex); }}
        whiteSpace="nowrap"
      >
        <Box w="8px" h="8px" bg={isEditing ? '#FFB347' : '#FF3B30'} borderRadius="sm" flexShrink={0} />
        <Text color="gray.200" fontSize="10px" fontWeight="medium">
          {strip.label || `Strip ${originalIndex + 1}`}
          {strip.weightGrams > 0 && ` · ${strip.weightGrams}g`}
        </Text>
        <HStack spacing={0} onClick={e => e.stopPropagation()}>
          <IconButton size="xs" icon={<EditIcon boxSize="9px" />} variant="ghost" colorScheme="orange"
            aria-label="Edit strip" minW="18px" h="18px"
            onClick={() => openEdit(originalIndex)} />
          <IconButton size="xs" icon={<RepeatIcon boxSize="9px" />} variant="ghost" colorScheme="blue"
            aria-label="Mirror strip" minW="18px" h="18px"
            onClick={() => mirrorStrip(strip)} />
          <IconButton size="xs" icon={<DeleteIcon boxSize="9px" />} variant="ghost" colorScheme="red"
            aria-label="Remove strip" minW="18px" h="18px"
            onClick={() => deleteStrip(strip)} />
        </HStack>
      </HStack>
    );
  };

  const hasTopLabels = quadrantStrips['top-left'].length > 0 || quadrantStrips['top-right'].length > 0;
  const hasBottomLabels = quadrantStrips['bottom-left'].length > 0 || quadrantStrips['bottom-right'].length > 0;

  return (
    <Box userSelect="none" width="100%">

      {/* Top label row — left and right quadrants side by side, never overlaps paddle */}
      {hasTopLabels && (
        <HStack justify="space-between" align="flex-start" width="100%" mb={2} px={1}>
          <VStack align="flex-start" spacing="3px">
            {quadrantStrips['top-left'].map(renderLabelChip)}
          </VStack>
          <VStack align="flex-end" spacing="3px">
            {quadrantStrips['top-right'].map(renderLabelChip)}
          </VStack>
        </HStack>
      )}

      {/* Inner box: SVG-sized, centered */}
      <Box position="relative" width={`${width}px`} mx="auto">
        <svg
          ref={svgRef}
          viewBox={svgViewBox}
          width={width}
          height={svgHeight}
          style={{ display: 'block', touchAction: 'none', cursor: readOnly ? 'default' : 'none' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { if (!readOnly) setHoverPt(null); }}
          onClick={handleClick}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <path ref={pathRef} d={pathD} fill="none" stroke="none" style={{ pointerEvents: 'none' }} />
          <path d={pathD} fill="#1A202C" stroke="#2D3748" strokeWidth="8" strokeMiterlimit="10" />

          {/* Confirmed tape strips */}
          {totalLength > 0 && indexedStrips.map(({ strip, originalIndex }) => {
            const segs = strip.arcFraction != null
              ? getDirectionalArcSegments(strip.t1, strip.arcFraction, totalLength)
              : getArcSegments(strip.t1, strip.t2, totalLength);
            const isEditing = editingIndex === originalIndex;
            return segs.map((seg, j) => (
              <React.Fragment key={`${originalIndex}-${j}`}>
                <path d={pathD}
                  stroke={isEditing ? '#FFB347' : '#FF3B30'} strokeWidth="16" fill="none" strokeLinecap="butt"
                  strokeDasharray={seg.dasharray} strokeDashoffset={seg.dashoffset} />
                {!readOnly && (
                  <path d={pathD}
                    stroke="transparent" strokeWidth="32" fill="none" strokeLinecap="butt"
                    strokeDasharray={seg.dasharray} strokeDashoffset={seg.dashoffset}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); openEdit(originalIndex); }} />
                )}
              </React.Fragment>
            ));
          })}

          {/* Live preview arc */}
          {firstDot && hoverPt && totalLength > 0 &&
            getDirectionalArcSegments(firstDot.t, previewAccRef.current, totalLength).map((seg, j) => (
              <path key={`preview-${j}`} d={pathD}
                stroke="#FF6B35" strokeWidth="16" fill="none" strokeLinecap="butt" opacity="0.55"
                strokeDasharray={seg.dasharray} strokeDashoffset={seg.dashoffset} />
            ))
          }

          {firstDot && (
            <circle cx={firstDot.x} cy={firstDot.y} r="24" fill="white" stroke="#FF3B30" strokeWidth="6" />
          )}

          {!readOnly && hoverPt && (
            <circle cx={hoverPt.x} cy={hoverPt.y} r="20"
              fill={firstDot ? '#FF6B35' : '#FF3B30'}
              stroke="white" strokeWidth="6"
              style={{ pointerEvents: 'none' }} />
          )}

          {!readOnly && indexedStrips.length === 0 && !firstDot && (
            <text x="514" y="1160" textAnchor="middle" fill="#718096" fontSize="46" fontFamily="sans-serif">
              Click edge to start strip
            </text>
          )}
          {!readOnly && firstDot && (
            <text x="514" y="1160" textAnchor="middle" fill="#FF6B35" fontSize="46" fontFamily="sans-serif">
              Click second point
            </text>
          )}
        </svg>

        {/* Read-only strip labels */}
        {readOnly && showLabels && indexedStrips.map(({ strip, originalIndex }) => {
          const mid = getMidDomPoint(strip, 70);
          if (!mid) return null;
          const label = strip.label || `#${originalIndex + 1}`;
          return (
            <Box
              key={originalIndex}
              position="absolute"
              left={`${mid.x}px`}
              top={`${mid.y}px`}
              transform="translate(-50%, -50%)"
              bg="rgba(44,95,124,0.92)"
              color="white"
              borderRadius="full"
              fontSize="10px"
              fontWeight="bold"
              letterSpacing="0.03em"
              px={2}
              py="2px"
              pointerEvents="none"
              zIndex={5}
              boxShadow="0 1px 4px rgba(0,0,0,0.4)"
              whiteSpace="nowrap"
            >
              {label}
            </Box>
          );
        })}

        {/* Popups centered within the SVG canvas */}
        {pendingStrip && (
          <StripDetailsForm
            title="Tape Strip Details"
            confirmLabel="Add"
            lengthInput={lengthInput} setLengthInput={setLengthInput}
            densityPreset={densityPreset} setDensityPreset={setDensityPreset}
            densityCustom={densityCustom} setDensityCustom={setDensityCustom}
            weightInput={weightInput} setWeightInput={setWeightInput}
            labelInput={labelInput} setLabelInput={setLabelInput}
            onConfirm={confirmStrip}
            onCancel={cancelStrip}
          />
        )}

        {editingIndex !== null && (
          <StripDetailsForm
            title={`Edit Strip ${editingIndex + 1}`}
            confirmLabel="Save"
            lengthInput={editLength} setLengthInput={setEditLength}
            densityPreset={editDensityPreset} setDensityPreset={setEditDensityPreset}
            densityCustom={editDensityCustom} setDensityCustom={setEditDensityCustom}
            weightInput={editWeight} setWeightInput={setEditWeight}
            labelInput={editLabel} setLabelInput={setEditLabel}
            onConfirm={saveEdit}
            onCancel={cancelEdit}
          />
        )}
        {!readOnly && (
          <Text color="gray.500" fontSize="xs" mt={1} textAlign="center">
            Click two points on the paddle edge to place a tape strip
          </Text>
        )}
      </Box>

      {/* Bottom label row — visually shifted up to sit near the strips, layout unaffected */}
      {hasBottomLabels && (() => {
        const allBottom = [...quadrantStrips['bottom-left'], ...quadrantStrips['bottom-right']];
        const mids = allBottom.map(({ strip }) => getMidDomPoint(strip, 80)).filter(Boolean);
        const maxStripY = mids.length > 0 ? Math.max(...mids.map(m => m.y)) : svgHeight * 0.65;
        const translateUp = svgHeight - maxStripY - 8;
        return (
          <HStack justify="space-between" align="flex-end" width="100%"
            mt={2} px={1}
            style={{ transform: `translateY(-${translateUp}px)` }}>
            <VStack align="flex-start" spacing="3px">
              {quadrantStrips['bottom-left'].map(renderLabelChip)}
            </VStack>
            <VStack align="flex-end" spacing="3px">
              {quadrantStrips['bottom-right'].map(renderLabelChip)}
            </VStack>
          </HStack>
        );
      })()}
    </Box>
  );
};

export default SetupCanvas;
