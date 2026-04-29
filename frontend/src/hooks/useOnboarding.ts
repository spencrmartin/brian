import { useState, useEffect } from 'react';
import { getApiBaseUrl } from '@/lib/backend';

const ONBOARDING_KEY = 'brian_onboarding_complete';
const USER_NAME_KEY = 'brian_user_name';

interface UseOnboardingReturn {
  showOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

/**
 * Hook to manage first-run onboarding and login state.
 *
 * Shows onboarding when:
 * - No user name is stored (never logged in / logged out), OR
 * - Onboarding flag is not set AND knowledge base is empty (fresh install)
 *
 * After the user completes onboarding, both the name and flag are set
 * and onboarding never shows again until they log out.
 */
export function useOnboarding(): UseOnboardingReturn {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userName = localStorage.getItem(USER_NAME_KEY);
    const onboardingComplete = localStorage.getItem(ONBOARDING_KEY) === 'true';

    // If no user name stored, always show onboarding (login screen)
    if (!userName) {
      setShowOnboarding(true);
      setIsLoading(false);
      return;
    }

    // If user exists and onboarding was completed, skip
    if (onboardingComplete) {
      setShowOnboarding(false);
      setIsLoading(false);
      return;
    }

    // User exists but onboarding not completed — check if KB is empty
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
    localStorage.removeItem(USER_NAME_KEY);
    setShowOnboarding(true);
  };

  return { showOnboarding, isLoading, completeOnboarding, resetOnboarding };
}

export default useOnboarding;
