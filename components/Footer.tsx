// components/Footer.tsx
'use client';

import { useRevalidateTime } from '@/contexts/RevalidateContext';
import packageJson from '../package.json';

export default function Footer() {
  const serverRevalidateTime = useRevalidateTime();

  return (
    <footer className="bg-gray-50 text-center py-8 text-gray-400 text-sm mt-10">
      <div className="space-y-1">
        <p>© 2026 Class 612 Website. Powered by BI. Using Next.js & Strapi.</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>Version: v{packageJson.version}</span>
          {serverRevalidateTime && (
            <>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1">
                <span className="text-green-500">●</span>
                <span>Last Revalidate: {serverRevalidateTime}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}