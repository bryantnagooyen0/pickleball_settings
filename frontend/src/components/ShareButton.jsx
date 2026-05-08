import { useState } from 'react';
import { Button } from '@chakra-ui/react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      window.prompt('Copy this link:', window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      borderRadius="full"
      borderColor="var(--color-primary)"
      color="var(--color-primary)"
      fontFamily="var(--font-body)"
      fontWeight={600}
      _hover={{ bg: 'rgba(44,95,124,0.06)' }}
      onClick={handleShare}
    >
      {copied ? 'Copied!' : 'Share'}
    </Button>
  );
}
