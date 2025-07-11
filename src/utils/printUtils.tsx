import { JSX } from 'react';
import { createRoot } from 'react-dom/client';

const printComponent = (component: JSX.Element, title: string) => {
  const printWindow = window.open('', '_blank');

  if (printWindow)
    printWindow.document.head.innerHTML = `
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; }
        </style>
      `;

  const printDiv = document.createElement('div');
  printWindow?.document.body.appendChild(printDiv);

  const printRoot = createRoot(printDiv);
  printRoot.render(component);

  if (printWindow === null || printWindow === undefined) {
    throw new Error();
  }

  // Use MutationObserver to detect when the content is rendered
  const observer = new MutationObserver(() => {
    // Check if the printDiv has child nodes
    if (printDiv.childNodes.length > 0) {
      printWindow.print(); // Call the print function
      printWindow.close(); // Close the print window after printing
      observer.disconnect(); // Stop observing
    }
  });

  // Start observing the printDiv for child nodes
  observer.observe(printDiv, { childList: true, subtree: true });
};

export default printComponent;
