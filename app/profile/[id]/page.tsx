import { ProfileSystem } from '@/components/profile';
export default async function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <ProfileSystem profileId={params.id} />;
}
