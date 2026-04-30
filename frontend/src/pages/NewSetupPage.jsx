import React, { useState, useEffect } from 'react';
import {
  Box, Container, VStack, HStack, Text, Heading, Button, Input,
  Textarea, Select, FormControl, FormLabel, useToast, Spinner,
  Center, Progress, NumberInput, NumberInputField, Image,
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

  return (
    <Container maxW="600px" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color="white">Share Your Setup</Heading>

        <Progress value={((step + 1) / STEPS.length) * 100} colorScheme="orange" borderRadius="full" />
        <HStack justify="space-between">
          {STEPS.map((s, i) => (
            <Text key={s} fontSize="xs" color={i === step ? 'orange.400' : 'gray.500'} fontWeight={i === step ? 'bold' : 'normal'}>
              {s}
            </Text>
          ))}
        </HStack>

        {/* Step 0: Select Paddle */}
        {step === 0 && (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel color="gray.300">Search for your paddle</FormLabel>
              <Input
                placeholder="Type paddle name or brand..."
                value={paddleSearch}
                onChange={(e) => setPaddleSearch(e.target.value)}
                bg="gray.700" color="white" borderColor="gray.600"
              />
            </FormControl>
            <Box maxH="300px" overflowY="auto" borderRadius="md" border="1px solid" borderColor="gray.600">
              {filteredPaddles.length === 0 && (
                <Text color="gray.500" p={4} textAlign="center">No paddles found</Text>
              )}
              {filteredPaddles.map(p => (
                <Box
                  key={p._id}
                  p={3}
                  cursor="pointer"
                  bg={selectedPaddleId === p._id ? 'orange.900' : 'gray.800'}
                  borderLeft="3px solid"
                  borderColor={selectedPaddleId === p._id ? 'orange.400' : 'transparent'}
                  _hover={{ bg: 'gray.700' }}
                  onClick={() => setSelectedPaddleId(p._id)}
                >
                  <Text color="white" fontWeight="bold" fontSize="sm">{p.name}</Text>
                  <HStack spacing={2}>
                    <Text color="gray.400" fontSize="xs">{p.brand}</Text>
                    {p.shape && <Text color="orange.300" fontSize="xs">· {p.shape}</Text>}
                  </HStack>
                </Box>
              ))}
            </Box>
          </VStack>
        )}

        {/* Step 1: Lead Tape Canvas */}
        {step === 1 && (
          <VStack spacing={4} align="stretch">
            <Text color="gray.300" fontSize="sm">
              Click and drag on the paddle to place lead tape strips. Click the × on a strip to remove it.
            </Text>
            <Center>
              <SetupCanvas strips={leadTapeStrips} onChange={setLeadTapeStrips} width={220} paddleShape={paddles.find(p => p._id === selectedPaddleId)?.shape} />
            </Center>
            {leadTapeStrips.length > 0 && leadTapeTotalGrams > 0 && (
              <Box bg="gray.800" p={3} borderRadius="md">
                <Text color="orange.400" fontWeight="bold" fontSize="sm">
                  Total lead tape: {leadTapeTotalGrams.toFixed(2)}g ({leadTapeStrips.length} strip{leadTapeStrips.length !== 1 ? 's' : ''})
                </Text>
              </Box>
            )}
            {leadTapeStrips.length === 0 && (
              <Text color="gray.500" fontSize="xs" textAlign="center">No lead tape added — that's fine if you run stock!</Text>
            )}
          </VStack>
        )}

        {/* Step 2: Other Mods */}
        {step === 2 && (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">Overgrip Brand / Type</FormLabel>
              <Input
                placeholder="e.g. Cookiegrips Doughy grips"
                value={overgrip.brand}
                onChange={(e) => setOvergrip(g => ({ ...g, brand: e.target.value }))}
                bg="gray.700" color="white" borderColor="gray.600"
              />
            </FormControl>
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">Number of Overgrips</FormLabel>
              <Input
                type="number" placeholder="e.g. 1"
                value={overgrip.count}
                onChange={(e) => setOvergrip(g => ({ ...g, count: e.target.value }))}
                bg="gray.700" color="white" borderColor="gray.600"
              />
            </FormControl>
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">Undergrip</FormLabel>
              <Input
                placeholder="e.g. Hesacore, Stock grip"
                value={undergrip}
                onChange={(e) => setUndergrip(e.target.value)}
                bg="gray.700" color="white" borderColor="gray.600"
              />
            </FormControl>
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">Edge Guard Tape / Type</FormLabel>
              <Input
                placeholder="e.g. Electrical tape, Hockey Tape, etc."
                value={edgeGuard.brand}
                onChange={(e) => setEdgeGuard(g => ({ ...g, brand: e.target.value }))}
                bg="gray.700" color="white" borderColor="gray.600"
              />
            </FormControl>
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">Total Weight After Mods (ounces)</FormLabel>
              <Input
                type="number" placeholder="e.g. 8.6 oz"
                value={totalWeightGrams}
                onChange={(e) => setTotalWeightGrams(e.target.value)}
                bg="gray.700" color="white" borderColor="gray.600"
              />
            </FormControl>
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">Why this setup?</FormLabel>
              <Textarea
                placeholder="Share your reasoning — what problem were you solving, what do you like about it, and what would you tell someone thinking about copying it?"
                value={setupReasoning}
                onChange={(e) => setSetupReasoning(e.target.value)}
                bg="gray.700" color="white" borderColor="gray.600"
                rows={4}
              />
            </FormControl>
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">Other Notes</FormLabel>
              <Textarea
                placeholder="Any other details about your setup..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                bg="gray.700" color="white" borderColor="gray.600"
                rows={3}
              />
            </FormControl>
          </VStack>
        )}

        {/* Step 3: Photo & Submit */}
        {step === 3 && (
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">Photo of your setup (optional)</FormLabel>
              <Input
                type="file" accept="image/*"
                onChange={handlePhotoChange}
                bg="gray.700" color="white" borderColor="gray.600"
                p={1}
              />
            </FormControl>
            {photoPreview && (
              <Image src={photoPreview} borderRadius="md" maxH="200px" objectFit="cover" />
            )}
            <Box bg="gray.800" p={4} borderRadius="md">
              <Text color="gray.300" fontWeight="bold" fontSize="sm" mb={2}>Setup Summary</Text>
              <Text color="gray.400" fontSize="xs">Paddle: {paddles.find(p => p._id === selectedPaddleId)?.name}</Text>
              <Text color="gray.400" fontSize="xs">Lead tape: {leadTapeTotalGrams.toFixed(2)}g ({leadTapeStrips.length} strips)</Text>
              {overgrip.brand && <Text color="gray.400" fontSize="xs">Overgrip: {overgrip.brand}</Text>}
              {edgeGuard.brand && <Text color="gray.400" fontSize="xs">Edge guard: {edgeGuard.brand}</Text>}
              {totalWeightGrams && <Text color="gray.400" fontSize="xs">Total weight: {totalWeightGrams}g</Text>}
            </Box>
          </VStack>
        )}

        {/* Navigation */}
        <HStack justify="space-between" pt={2}>
          <Button
            variant="ghost" color="gray.400"
            onClick={() => step === 0 ? navigate('/community') : setStep(s => s - 1)}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              colorScheme="orange" isDisabled={!canAdvance()}
              onClick={() => setStep(s => s + 1)}
            >
              Next
            </Button>
          ) : (
            <Button colorScheme="orange" onClick={handleSubmit} isLoading={submitting}>
              Share Setup
            </Button>
          )}
        </HStack>
      </VStack>
    </Container>
  );
};

export default NewSetupPage;
