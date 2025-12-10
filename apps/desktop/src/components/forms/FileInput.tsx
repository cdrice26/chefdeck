import { open } from '@tauri-apps/plugin-dialog';
import { Button } from 'chefdeck-shared';
import { useState } from 'react';

export default function FileInput() {
  const [filePath, setFilePath] = useState<string | null>(null);

  const handleClick = async () => {
    const result = await open({
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
      multiple: false
    });
    if (result) {
      setFilePath(result);
    }
  };

  return (
    <>
      <Button onClick={handleClick}>Choose Image</Button>
      <input type="hidden" name="filePath" value={filePath ?? ''} />
    </>
  );
}
