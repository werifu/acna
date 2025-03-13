import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the default locale route ('cn' in this case)
  redirect('/cn');
}
