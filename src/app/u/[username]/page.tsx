import { Metadata } from 'next';
import { serverFetch } from '@/lib/server/api';
import ProfilePageClient from './ProfilePageClient';
import type { PublicProfile } from '@/types';

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  try {
    const profile = await serverFetch(`/users/${username}`) as PublicProfile;
    const name = profile.name || profile.username;

    return {
      title: `${name}'s Profile`,
      description:
        profile.bio && profile.bio.length >= 70
          ? profile.bio
          : [profile.bio, `${name} builds with Claude. See their launches, posts and profile on Claude AI Directory.`].filter(Boolean).join(". "),
      alternates: { canonical: `/u/${username}` },
    };
  } catch {
    return {
      title: 'User Not Found',
    };
  }
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await serverFetch(`/users/${username}`).catch(() => null) as PublicProfile | null;

  return <ProfilePageClient initialProfile={profile} />;
}
