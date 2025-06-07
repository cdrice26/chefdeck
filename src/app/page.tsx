import createClient from '@/utils/supabase/supabase';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user) {
    redirect('/dashboard');
  } else {
    return <div>Cooky</div>;
  }
}
