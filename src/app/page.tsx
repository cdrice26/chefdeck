import { requireAuth } from '@/utils/requireAuth';
import { redirect } from 'next/navigation';

export default async function Home() {
  try {
    const user = await requireAuth();
    if (user) {
      return redirect('/dashboard');
    }
  } catch (e) {}

  return <div>Cooky</div>;
}
