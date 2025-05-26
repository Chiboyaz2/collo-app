// app/set-password/page.tsx
'use client';

import { Suspense } from 'react';
import UpdatePasswordPage from '../../components/set-password/UpdatePasswordForm';

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePasswordPage />
    </Suspense>
  );
}