import { useEffect } from 'react';

interface KeyboardListenerProps {
  onDelete?: (event: any) => void;
  onBackspace?: (event: any) => void;
}

function useKeyboardListener({ onDelete, onBackspace }: KeyboardListenerProps) {
  useEffect(() => {
    // Function to handle key presses
    const handleKeyDown = (event: { key: string; }) => {
      // Check for Delete key (keyCode 46)
      if (event.key === 'Delete') {
        if (onDelete && typeof onDelete === 'function') {
          onDelete(event);
        }
      }

      // Check for Backspace key (keyCode 8)
      if (event.key === 'Backspace') {
        if (onBackspace && typeof onBackspace === 'function') {
          onBackspace(event);
        }
      }
    };

    // Add event listener when the component mounts
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDelete, onBackspace]); // Re-run effect if these functions change
}

export default useKeyboardListener;
