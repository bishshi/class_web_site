// components/Footer.tsx
'use client';

import packageJson from '../package.json';

export default function Footer() {

  return (
    <footer className="bg-gray-50 text-center py-8 text-gray-400 text-sm mt-10">
      <div className="space-y-1">
        <p>© 2026 Class 612 Website. Powered by Next.js & Strapi.</p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>Version: v{packageJson.version}</span>
        </div>
      </div>
    </footer>
  );
}