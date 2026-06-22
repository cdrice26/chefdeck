// src/components/LicensesDialog.tsx
import { Button } from 'cookycardz-shared';
import { useState } from 'react';

export function LicensesDialog() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'js' | 'rust'>('js');

  return (
    <div className="w-full flex items-center justify-center pb-10">
      <Button onClick={() => setOpen(true)}>Third-Party Licenses</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex flex-col w-[680px] max-h-[70vh] bg-white text-black rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Third-party licenses</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="flex gap-2 px-4 pt-3">
              <button
                className={tab === 'js' ? 'font-semibold underline' : ''}
                onClick={() => setTab('js')}
              >
                JavaScript
              </button>
              <button
                className={tab === 'rust' ? 'font-semibold underline' : ''}
                onClick={() => setTab('rust')}
              >
                Rust
              </button>
            </div>
            <pre className="overflow-y-auto flex-1 p-4 text-xs whitespace-pre-wrap wrap-break-word">
              {tab === 'js'
                ? __LICENSES_JS__
                : 'This product includes software developed by the OpenSSL Project.\n\n' +
                  __LICENSES_RUST__}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
