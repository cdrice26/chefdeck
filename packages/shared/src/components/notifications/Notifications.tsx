'use client';

import { IoMdClose } from 'react-icons/io';
import { NotificationType } from '@/context/NotificationContext';
import { JSX } from 'react';

/**
 * Notifications
 *
 * Presentational component that renders a stack of dismissible notifications.
 * Each notification is styled according to its `type` property ('error', 'info', or 'success').
 *
 * This component is intentionally presentation-only: it receives the notification
 * data and a `deleteNotification` callback from context or a parent wrapper and
 * does not perform any side-effects itself.
 *
 * Props:
 * - `notifications` (NotificationType[]) — list of notifications to render. Each item
 *   should include at least `{ id, type, message }`.
 * - `deleteNotification` ((id: string) => void) — callback invoked when a notification
 *   should be removed (e.g. when the close button is pressed).
 *
 * @param {{notifications: NotificationType[], deleteNotification: (id: string) => void}} props - Component props
 * @returns {JSX.Element} A positioned container rendering the provided notifications
 *
 * @example
 * // <Notifications notifications={notifications} deleteNotification={removeNotification} />
 */
const Notifications = ({
  notifications,
  deleteNotification
}: {
  notifications: NotificationType[];
  deleteNotification: (id: string) => void;
}): JSX.Element => (
  <div
    className={`fixed top-4 lg:bottom-4 lg:top-auto left-1/2 transform -translate-x-1/2 w-[90dvw] sm:w-[60dvw] lg:w-[600px] flex flex-col items-center gap-4 z-[1000]`}
  >
    {notifications.map(({ type, message, id }) => (
      <div
        key={id}
        className={`p-4 rounded-md ${
          type === 'error'
            ? 'bg-red-500 text-white'
            : type === 'info'
              ? 'bg-blue-500 text-white'
              : 'bg-green-500 text-white'
        } flex flex-row gap-4 shadow-md justify-between w-[90%] sm:w-[60%] lg:w-[600px]`}
      >
        <p>{message}</p>
        <button
          onClick={() => {
            deleteNotification(id);
          }}
        >
          <IoMdClose size={24} color="white" />
        </button>
      </div>
    ))}
  </div>
);

export default Notifications;
