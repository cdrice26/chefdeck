import licenses from '../../../licenses.json';

export default function LicensesPage() {
  return (
    <div className='w-full h-full overflow-y-auto'>
      {Object.entries(licenses).map(([name, license]) => (
        <div key={name} className='p-4 border-b border-gray-200'>
          <h2 className='text-xl font-semibold'>{name}</h2>
          <pre className='mt-2 whitespace-pre-wrap break-words'>
            {(license as { licenseText: string })?.licenseText ??
              'No license text available.'}
          </pre>
        </div>
      ))}
      <div className='p-4 border-b border-gray-200'>
        <h2 className='text-xl font-semibold'>Ionicons (from react-icons)</h2>
        <pre className='mt-2 whitespace-pre-wrap break-words'>
          The MIT License (MIT) Copyright (c) 2015-present Ionic
          (http://ionic.io/) Permission is hereby granted, free of charge, to
          any person obtaining a copy of this software and associated
          documentation files (the "Software"), to deal in the Software without
          restriction, including without limitation the rights to use, copy,
          modify, merge, publish, distribute, sublicense, and/or sell copies of
          the Software, and to permit persons to whom the Software is furnished
          to do so, subject to the following conditions: The above copyright
          notice and this permission notice shall be included in all copies or
          substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS
          IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
          NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
          OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
          LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
          ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
          OTHER DEALINGS IN THE SOFTWARE.
        </pre>
      </div>
    </div>
  );
}
