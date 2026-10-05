'use client';

import { useEffect } from 'react';

export default function PrintOnLoad() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 600);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
