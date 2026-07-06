import { useEffect, useState } from 'react';

/** Brief skeleton pass so pages communicate loading states. */
export function useSimulatedLoading(deps = [], ms = 350) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return loading;
}
