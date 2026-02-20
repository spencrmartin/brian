import { useState, useEffect } from 'react';
import { getApiBaseUrl } from '@/lib/backend';

const ONBOARDING_KEY = 'brian_onboarding_complete';

interface UseOnboardingReturn {
  showOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

/**
 * Hook to manage first-run onboarding state.
 *
 * Shows onboarding when:
 * - localStorage flag is not set AND
 * - The knowledge base has zero items (fresh install)
 *
 * Once the user completes onboarding (or skips it), the flag is set
 * and onboarding never shows again.
 */
export function useOnboarding(): UseOnboardingReturn {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If already completed, skip
    if (localStorage.getItem(ONBOARDING_KEY) === 'true') {
      setShowOnboarding(false);
      setIsLoading(false);
      return;
    }

    // Check if knowledge base is empty
    const checkEmpty = async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/stats`, {
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const stats = await res.json();
          setShowOnboarding(stats.total_items === 0);
        }
      } catch {
        // If we can't reach the backend yet, don't show onboarding
        setShowOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEmpty();
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
  };

  return { showOnboarding, isLoading, completeOnboarding, resetOnboarding };
}

export default useOnboarding;
