import { NotificationKind } from '@/context/NotificationContext';
import { createRoot } from 'react-dom/client';

/**
 * Render a React component into a new popup window and print it once rendered.
 *
 * This utility opens a new browser window, injects a simple head with the
 * provided `title`, renders the provided React element into a newly created
 * container within that window, and uses a MutationObserver to detect when the
 * DOM has been populated so it can trigger printing and then close the window.
 *
 * Important notes:
 * - Must be executed in a browser environment where `window` and `document` are available.
 * - The function does not return a value; it triggers printing as a side-effect.
 *
 * @param component - The React JSX element to render and print.
 * @param title - The title to set for the print window (used inside the window <title> tag).
 * @returns void
 */
const printComponent = (component: React.ReactNode, title: string): void => {
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
    throw new Error('Failed to open print window');
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

/**
 * A hook to print a React component
 *
 * @param addNotification - Function to add notification
 * @param component - React component to print
 * @returns A function to print the component
 */
const usePrinter =
  (
    addNotification: (message: string, type: NotificationKind) => void,
    component: React.ReactNode
  ) =>
  (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      printComponent(component, 'Print Groceries');
    } catch (e) {
      addNotification(
        "Couldn't print groceries, please try again later.",
        'error'
      );
      return;
    }
  };

export default usePrinter;
