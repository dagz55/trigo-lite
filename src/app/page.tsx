
"use client";

import * as React from 'react';
import { redirect } from 'next/navigation';

export default function HomePage() {
  React.useEffect(() => {
    redirect('/sign-in');
  }, []);

  // Render a minimal loading state or null while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <p>Loading...</p>
    </div>
  );
}
