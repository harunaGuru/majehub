'use client';
import React from 'react';
import { useSeller } from '@/hooks/useSeller';

const GetSeller = () => {
  const { seller } = useSeller();
  return <div>{JSON.stringify(seller)}</div>;
};
export default GetSeller;
