import { useCallback, useEffect, useState } from 'react';
import { getSession } from '../services/inventoryService';
import { getErrorMessage } from '../../../utils/errorHandling';

/**
 * Fetch a single inventory session by id (for header/subtitle).
 * @param {string | undefined} sessionId
 * @returns {{ session: import('../services/types').SessionListItem | null; loading: boolean; error: string | null; reload: () => Promise<void> }}
 */
export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getSession(sessionId);
      setSession(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  return { session, loading, error, reload: load };
}
