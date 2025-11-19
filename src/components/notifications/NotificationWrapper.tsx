'use client';

import { useNotification } from '@/context/NotificationContext';
import Notifications from '@/components/notifications/Notifications';

/**
 * NotificationWrapper component.
 *
 * Connects the notification context to the presentational `Notifications` component.
 * Subscribes to the current notifications and provides the `deleteNotification`
 * handler from context to the child component.
 *
 * This wrapper keeps the context usage isolated from the UI component so that
 * `Notifications` can remain a pure/presentational component.
 *
 * @component
 * @returns {JSX.Element} The `Notifications` component populated with context data.
 *
 * @example
 * // Renders the notifications using context-provided data and handlers:
 * // <NotificationWrapper />
 */
const NotificationWrapper: React.FC = () => {
  const { notifications, deleteNotification } = useNotification();
  return (
    <Notifications
      notifications={notifications}
      deleteNotification={deleteNotification}
    />
  );
};

export default NotificationWrapper;
