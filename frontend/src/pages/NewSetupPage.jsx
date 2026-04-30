import React, { useState, useEffect } from 'react';
import {
  Box, Container, VStack, HStack, Text, Heading, Button, Input,
  Textarea, FormControl, FormLabel, useToast, Spinner,
  Center, Progress, Image,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePaddleStore } from '../store/paddle';
import { useSetupStore } from '../store/setup';
import SetupCanvas from '../components/SetupCanvas';

const STEPS = ['Select Paddle', 'Lead Tape', 'Other Mods', 'Photo & Submit'];

const NewSetupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { paddles, fetchPaddles } = usePaddleStore();
  const { createSetup } = useSetupStore();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedPaddleId, setSelectedPaddleId] = useState(searchParams.get('paddleId') || '');
  const [paddleSearch, setPaddleSearch] = useState('');
  const [leadTapeStrips, setLeadTapeStrips] = useState([]);
  const [overgrip, setOvergrip] = useState({ brand: '', count: '', notes: '' });
  const [undergrip, setUndergrip] = useState('');
  const [edgeGuard, setEdgeGuard] = useState({ brand: '', notes: '' });
  const [totalWeightGrams, setTotalWeightGrams] = useState('');
  const [notes, setNotes] = useState('');
  const [setupReasoning, setSetupReasoning] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => { fetchPaddles(); }, []);

  const leadTapeTotalGrams = leadTapeStrips.reduce((sum, s) => sum + (s.weightGrams || 0), 0);

  const filteredPaddles = paddles.filter(p =>
    p.name.toLowerCase().includes(paddleSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(paddleSearch.toLowerCase())
  );

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedPaddleId) {
      toast({ title: 'Please select a paddle', status: 'error' });
      return;
    }
    setSubmitting(true);
    const result = await createSetup({
      paddle: selectedPaddleId,
      leadTapeStrips,
      leadTapeTotalGrams,
      overgrip,
      undergrip,
      edgeGuard,
      totalWeightGrams: parseFloat(totalWeightGrams) || 0,
      notes,
      setupReasoning,
      photoUrl: photoPreview || '',
    });
    setSubmitting(false);
    if (result.success) {
      toast({ title: 'Setup shared!', status: 'success' });
      navigate(`/setup/${result.data._id}`);
    } else {
      toast({ title: result.message || 'Failed to submit setup', status: 'error' });
    }
  };

  const canAdvance = () => {
    if (step === 0) return !!selectedPaddleId;
    return true;
  };

  const inputStyles = {
    bg: 'white',
    color: 'var(--color-text-primary)',
    borderColor: 'gray.300',
    fontFamily: 'var(--font-body)',
    _focus: { borderColor: 'var(--color-primary)', boxShadow: '0 0 0 1px var(--color-primary)' },
    _placeholder: { color: 'var(--color-text-secondary)' },
  };

  return (
    <Box
      minH="100vh"
      sx={{
        background: 'radial-gradient(circle at 20% 50%, rgba(44,95,124,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212,165,116,0.03) 0%, transparent 50%), var(--color-bg)',
        '--color-primary': '#2C5F7C',
        '--color-secondary': '#D4A574',
        '--color-accent': '#8B9DC3',
        '--color-bg': '#FAF9F6',
        '--color-text-primary': '#1A1A1A',
        '--color-text-secondary': '#666666',
        '--font-display': '"Merriweather", serif',
        '--font-body': '"Inter", sans-serif',
      }}
    >
      <Container maxW="600px" py={{ base: 8, md: 12 }}>
        <VStack spacing={6} align="stretch">

          <Box>
            <Heading
              size="lg"
              color="var(--color-text-primary)"
              fontFamily="var(--font-display)"
              letterSpacing="-0.02em"
            >
              Share Your Setup
            </Heading>
            <Box w="48px" h="3px" bg="var(--color-secondary)" mt={2} mb={1} />
          </Box>

          <Progress
            value={((step + 1) / STEPS.length) * 100}
            borderRadius="full"
            sx={{ '& > div': { background: 'var(--color-primary) !important' } }}
          />
          <HStack justify="space-between">
            {STEPS.map((s, i) => (
              <Text
                key={s}
                fontSize="xs"
                color={i === step ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                fontWeight={i === step ? 'bold' : 'normal'}
                fontFamily="var(--font-body)"
              >
                {s}
              </Text>
            ))}
          </HStack>

          {/* Step 0: Select Paddle */}
          {step === 0 && (
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel
                  color="var(--color-text-primary)"
                  fontWeight={600}
                  fontSize="sm"
                  fontFamily="var(--font-body)"
                >
                  Search for your paddle
                </FormLabel>
                <Input
                  placeholder="Type paddle name or brand..."
                  value={paddleSearch}
                  onChange={(e) => setPaddleSearch(e.target.value)}
                  {...inputStyles}
                />
              </FormControl>
              <Box maxH="300px" overflowY="auto" border="1px solid" borderColor="gray.300">
                {filteredPaddles.length === 0 && (
                  <Text color="var(--color-text-secondary)" p={4} textAlign="center"
                    fontFamily="var(--font-body)" fontSize="sm">
                    No paddles found
                  </Text>
                )}
                {filteredPaddles.map(p => (
                  <Box
                    key={p._id}
                    p={3}
                    cursor="pointer"
                    bg={selectedPaddleId === p._id ? 'rgba(44,95,124,0.07)' : 'white'}
                    borderLeft="3px solid"
                    borderColor={selectedPaddleId === p._id ? 'var(--color-primary)' : 'transparent'}
                    borderBottom="1px solid"
                    borderBottomColor="rgba(0,0,0,0.05)"
                    _hover={{ bg: selectedPaddleId === p._id ? 'rgba(44,95,124,0.07)' : 'rgba(0,0,0,0.03)' }}
                    onClick={() => setSelectedPaddleId(p._id)}
                  >
                    <Text color="var(--color-text-primary)" fontWeight="bold" fontSize="sm"
                      fontFamily="var(--font-body)">{p.name}</Text>
                    <HStack spacing={2}>
                      <Text color="var(--color-text-secondary)" fontSize="xs"
                        fontFamily="var(--font-body)">{p.brand}</Text>
                      {p.shape && (
                        <Text color="var(--color-primary)" fontSize="xs"
                          fontFamily="var(--font-body)">· {p.shape}</Text>
                      )}
                    </HStack>
                  </Box>
                ))}
              </Box>
            </VStack>
          )}

          {/* Step 1: Lead Tape Canvas */}
          {step === 1 && (
            <VStack spacing={4} align="stretch">
              <Text color="var(--color-text-secondary)" fontSize="sm"
                fontFamily="var(--font-body)">
                Click and drag on the paddle to place lead tape strips. Click the × on a strip to remove it.
              </Text>
              <Center
                bg="white"
                boxShadow="0 4px 20px rgba(0,0,0,0.08)"
                borderRadius={0}
                p={4}
              >
                <SetupCanvas
                  strips={leadTapeStrips}
                  onChange={setLeadTapeStrips}
                  width={220}
                  paddleShape={paddles.find(p => p._id === selectedPaddleId)?.shape}
                />
              </Center>
              {leadTapeStrips.length > 0 && leadTapeTotalGrams > 0 && (
                <Box
                  bg="white"
                  borderLeft="3px solid var(--color-primary)"
                  boxShadow="0 2px 12px rgba(0,0,0,0.06)"
                  borderRadius={0}
                  p={3}
                >
                  <Text color="var(--color-primary)" fontWeight="bold" fontSize="sm"
                    fontFamily="var(--font-body)">
                    Total lead tape: {leadTapeTotalGrams.toFixed(2)}g ({leadTapeStrips.length} strip{leadTapeStrips.length !== 1 ? 's' : ''})
                  </Text>
                </Box>
              )}
              {leadTapeStrips.length === 0 && (
                <Text color="var(--color-text-secondary)" fontSize="xs" textAlign="center"
                  fontFamily="var(--font-body)">
                  No lead tape added — that's fine if you run stock!
                </Text>
              )}
            </VStack>
          )}

          {/* Step 2: Other Mods */}
          {step === 2 && (
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel color="var(--color-text-primary)" fontWeight={600} fontSize="sm"
                  fontFamily="var(--font-body)">Overgrip Brand / Type</FormLabel>
                <Input
                  placeholder="e.g. Cookiegrips Doughy grips"
                  value={overgrip.brand}
                  onChange={(e) => setOvergrip(g => ({ ...g, brand: e.target.value }))}
                  {...inputStyles}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="var(--color-text-primary)" fontWeight={600} fontSize="sm"
                  fontFamily="var(--font-body)">Number of Overgrips</FormLabel>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={overgrip.count}
                  onChange={(e) => setOvergrip(g => ({ ...g, count: e.target.value }))}
                  {...inputStyles}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="var(--color-text-primary)" fontWeight={600} fontSize="sm"
                  fontFamily="var(--font-body)">Undergrip</FormLabel>
                <Input
                  placeholder="e.g. Hesacore, Stock grip"
                  value={undergrip}
                  onChange={(e) => setUndergrip(e.target.value)}
                  {...inputStyles}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="var(--color-text-primary)" fontWeight={600} fontSize="sm"
                  fontFamily="var(--font-body)">Edge Guard Tape / Type</FormLabel>
                <Input
                  placeholder="e.g. Electrical tape, Hockey Tape, etc."
                  value={edgeGuard.brand}
                  onChange={(e) => setEdgeGuard(g => ({ ...g, brand: e.target.value }))}
                  {...inputStyles}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="var(--color-text-primary)" fontWeight={600} fontSize="sm"
                  fontFamily="var(--font-body)">Total Weight After Mods (ounces)</FormLabel>
                <Input
                  type="number"
                  placeholder="e.g. 8.6 oz"
                  value={totalWeightGrams}
                  onChange={(e) => setTotalWeightGrams(e.target.value)}
                  {...inputStyles}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="var(--color-text-primary)" fontWeight={600} fontSize="sm"
                  fontFamily="var(--font-body)">Why this setup?</FormLabel>
                <Textarea
                  placeholder="Share your reasoning — what problem were you solving, what do you like about it, and what would you tell someone thinking about copying it?"
                  value={setupReasoning}
                  onChange={(e) => setSetupReasoning(e.target.value)}
                  rows={4}
                  {...inputStyles}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="var(--color-text-primary)" fontWeight={600} fontSize="sm"
                  fontFamily="var(--font-body)">Other Notes</FormLabel>
                <Textarea
                  placeholder="Any other details about your setup..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  {...inputStyles}
                />
              </FormControl>
            </VStack>
          )}

          {/* Step 3: Photo & Submit */}
          {step === 3 && (
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel color="var(--color-text-primary)" fontWeight={600} fontSize="sm"
                  fontFamily="var(--font-body)">
                  Photo of your setup (optional)
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  bg="white"
                  color="var(--color-text-primary)"
                  borderColor="gray.300"
                  p={1}
                />
              </FormControl>
              {photoPreview && (
                <Image src={photoPreview} borderRadius={0} maxH="200px" objectFit="cover" />
              )}
              <Box
                bg="white"
                borderLeft="3px solid var(--color-primary)"
                boxShadow="0 4px 20px rgba(0,0,0,0.08)"
                borderRadius={0}
                p={4}
              >
                <Text color="var(--color-text-primary)" fontWeight="bold" fontSize="sm" mb={2}
                  fontFamily="var(--font-body)">Setup Summary</Text>
                <Text color="var(--color-text-secondary)" fontSize="xs" fontFamily="var(--font-body)">
                  Paddle: {paddles.find(p => p._id === selectedPaddleId)?.name}
                </Text>
                <Text color="var(--color-text-secondary)" fontSize="xs" fontFamily="var(--font-body)">
                  Lead tape: {leadTapeTotalGrams.toFixed(2)}g ({leadTapeStrips.length} strips)
                </Text>
                {overgrip.brand && (
                  <Text color="var(--color-text-secondary)" fontSize="xs" fontFamily="var(--font-body)">
                    Overgrip: {overgrip.brand}
                  </Text>
                )}
                {edgeGuard.brand && (
                  <Text color="var(--color-text-secondary)" fontSize="xs" fontFamily="var(--font-body)">
                    Edge guard: {edgeGuard.brand}
                  </Text>
                )}
                {totalWeightGrams && (
                  <Text color="var(--color-text-secondary)" fontSize="xs" fontFamily="var(--font-body)">
                    Total weight: {totalWeightGrams}g
                  </Text>
                )}
              </Box>
            </VStack>
          )}

          {/* Navigation */}
          <HStack justify="space-between" pt={2}>
            <Button
              variant="ghost"
              color="var(--color-text-secondary)"
              borderRadius="full"
              fontFamily="var(--font-body)"
              _hover={{ bg: 'rgba(0,0,0,0.05)' }}
              onClick={() => step === 0 ? navigate('/community') : setStep(s => s - 1)}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                bg="var(--color-primary)"
                color="white"
                borderRadius="full"
                fontFamily="var(--font-body)"
                fontWeight={600}
                isDisabled={!canAdvance()}
                _hover={{ bg: '#1e4a61' }}
                onClick={() => setStep(s => s + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                bg="var(--color-primary)"
                color="white"
                borderRadius="full"
                fontFamily="var(--font-body)"
                fontWeight={600}
                _hover={{ bg: '#1e4a61' }}
                onClick={handleSubmit}
                isLoading={submitting}
              >
                Share Setup
              </Button>
            )}
          </HStack>

        </VStack>
      </Container>
    </Box>
  );
};

export default NewSetupPage;
