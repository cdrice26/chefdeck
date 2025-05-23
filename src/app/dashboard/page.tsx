import { requireAuth } from '@/utils/requireAuth';
import { redirect } from 'next/navigation';

const Dashboard = async () => {
  try {
    await requireAuth();
    return (
      <div>
        <h1>Dashboard</h1>
      </div>
    );
  } catch (error) {
    redirect('/login');
  }
};

export default Dashboard;
