'use client';

import { useMemo, type DependencyList, useRef } from 'react';
import { isEqual } from 'lodash';

// A custom hook to deeply compare dependencies for React's memoization hooks.
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, useDeepCompareMemoize(deps));
}


function useDeepCompareMemoize(value: any) {
  const ref = useRef();

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}
