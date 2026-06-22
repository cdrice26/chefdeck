import { NotificationKind } from 'cookycardz-shared';
import { createRoot } from 'react-dom/client';

const printComponent = (component: React.ReactNode, title: string): void => {
  const prevTitle = document.title;
  document.title = title;

  // Create or reuse a dedicated print container at the top of body
  let printDiv = document.getElementById('print-root');
  if (!printDiv) {
    printDiv = document.createElement('div');
    printDiv.id = 'print-root';
    const testElm = document.createElement('div');
    testElm.style.backgroundColor = 'white';
    testElm.style.color = 'black';
    testElm.innerText = 'HELLO PRINT';
    printDiv.appendChild(testElm);
    document.body.appendChild(printDiv);
  }

  const root = createRoot(printDiv);
  root.render(component);

  const observer = new MutationObserver(() => {
    if (printDiv!.childNodes.length > 0) {
      observer.disconnect();
      setTimeout(() => {
        window.print();
      }, 300);
    }
  });

  observer.observe(printDiv, { childList: true, subtree: true });
};

const usePrinter =
  (
    addNotification: (message: string, type: NotificationKind) => void,
    component: React.ReactNode,
    title: string
  ) =>
  (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      printComponent(component, title);
    } catch (e) {
      addNotification("Couldn't print, please try again later.", 'error');
    }
  };

export default usePrinter;
