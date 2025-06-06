'use client';

import { useNotification } from '@/context/NotificationContext';
import Notifications from '@/components/notifications/Notifications';

const NotificationWrapper = () => {
  const { notifications, deleteNotification } = useNotification();
  return (
    <Notifications
      notifications={notifications}
      deleteNotification={deleteNotification}
    />
  );
};

export default NotificationWrapper;
