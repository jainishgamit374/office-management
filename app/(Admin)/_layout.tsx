// app/(admin)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // we use custom headers
      }}
    />
  );
}