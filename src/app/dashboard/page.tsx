import { requireAuth } from '@/lib/requireAuth';

const Dashboard = async () => {
  try {
    await requireAuth();
    return (
      <div>
        <h1>Dashboard</h1>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <h1>Unauthorized</h1>
      </div>
    );
  }
};

export default Dashboard;
