import { ProfileSystem } from '@/components/profile';
export default function PublicProfilePage({ params }: { params: { id: string } }) { return <ProfileSystem profileId={params.id} />; }
