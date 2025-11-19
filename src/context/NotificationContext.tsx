'use client';

import { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Shape of the notification context.
 */
type NotificationContextType = {
  notifications: NotificationType[];
  addNotification: (
    message: string,
    type: 'error' | 'info' | 'success'
  ) => void;
  deleteNotification: (id: string) => void;
};

/**
 * Represents a single notification shown to the user.
 */
export type NotificationType = {
  id: string;
  message: string;
  type: 'error' | 'info' | 'success';
};

/**
 * React context that holds current notifications and functions to modify them.
 *
 * Default implementations are placeholders used only for initialization.
 */
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  deleteNotification: () => {}
});

/**
 * Provider component that manages notifications and exposes helper actions.
 *
 * Props:
 * - children: React nodes that will have access to the notification context.
 *
 * @param children - React children to render inside the provider.
 * @returns The NotificationContext provider element wrapping the provided children.
 */
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  /**
   * Add a notification that will auto-dismiss after a short timeout.
   *
   * @param message - The message to display.
   * @param type - One of 'error', 'info' or 'success'.
   */
  const addNotification = (
    message: string,
    type: 'error' | 'info' | 'success'
  ) => {
    const id = uuidv4();
    const newNotification = { id, message, type };
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      newNotification
    ]);

    setTimeout(() => {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
    }, 5000);
  };

  /**
   * Remove a notification by id.
   *
   * @param id - The id of the notification to remove.
   */
  const deleteNotification = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, deleteNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook to access notification context values and actions.
 *
 * @returns The notification context value containing:
 * - `notifications`: NotificationType[] — current notifications
 * - `addNotification(message, type)`: function to add a notification
 * - `deleteNotification(id)`: function to remove a notification
 */
export const useNotification = () => useContext(NotificationContext);
