'use client';
import React from 'react';
import { useSeller } from '@/hooks/useSeller';

const GetSeller = () => {
  const { seller } = useSeller();
  console.log(seller);
  return <div>{JSON.stringify(seller)}</div>;
};
export default GetSeller;
