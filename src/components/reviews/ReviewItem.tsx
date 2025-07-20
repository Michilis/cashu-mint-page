import React, { useState, useEffect } from 'react';
import { User, Calendar, Shield, Copy, ExternalLink } from 'lucide-react';
import { NDKUser } from '@nostr-dev-kit/ndk';
import { MintReview } from '../../types';
import { formatDate } from '../../utils/reviewHelpers';
import { getSharedNDK } from '../../utils/ndk';
import { formatPubkey, copyToClipboard, formatRelativeTime } from '../../utils/nostr';
import { cleanReviewContent } from '../../utils/reviewHelpers';
import StarRating from './StarRating';

interface ReviewItemProps {
  review: MintReview;
}

interface UserProfile {
  name?: string;
  displayName?: string;
  image?: string;
  banner?: string;
  about?: string;
  nip05?: string;
  lud06?: string;
  lud16?: string;
  website?: string;
}

// Simple profile cache to avoid re-fetching
const profileCache = new Map<string, UserProfile | null>();
const fetchingProfiles = new Set<string>();

// Import the shared profile cache from useReviews
import { profileCache as sharedProfileCache } from '../../hooks/useReviews';

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Copy pubkey to clipboard
  const handleCopyPubkey = async () => {
    if (!review.pubkey) return;
    
    const success = await copyToClipboard(review.pubkey);
    if (success) {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  // Fetch user profile with improved logic and caching
  useEffect(() => {
    const fetchProfile = async () => {
      if (!review.pubkey) {
        setLoadingProfile(false);
        return;
      }

      // Check shared cache first (from useReviews)
      if (sharedProfileCache.has(review.pubkey)) {
        const cachedProfile = sharedProfileCache.get(review.pubkey);
        if (cachedProfile) {
          setProfile({
            name: cachedProfile.name,
            displayName: cachedProfile.displayName,
            image: cachedProfile.image
          });
        } else {
          setProfile(null);
        }
        setLoadingProfile(false);
        console.log('📋 Using shared cached profile for:', review.pubkey.substring(0, 16) + '...');
        return;
      }

      // Check local cache second
      if (profileCache.has(review.pubkey)) {
        const cachedProfile = profileCache.get(review.pubkey) || null;
        setProfile(cachedProfile);
        setLoadingProfile(false);
        console.log('📋 Using local cached profile for:', review.pubkey.substring(0, 16) + '...');
        return;
      }

      // Check if already fetching this profile
      if (fetchingProfiles.has(review.pubkey)) {
        console.log('⏳ Profile fetch already in progress for:', review.pubkey.substring(0, 16) + '...');
        // Wait for the ongoing fetch
        const checkCache = setInterval(() => {
          if (sharedProfileCache.has(review.pubkey) || profileCache.has(review.pubkey)) {
            const cachedProfile = sharedProfileCache.get(review.pubkey) || profileCache.get(review.pubkey) || null;
            if (cachedProfile) {
              setProfile({
                name: cachedProfile.name,
                displayName: cachedProfile.displayName,
                image: cachedProfile.image
              });
            } else {
              setProfile(null);
            }
            setLoadingProfile(false);
            clearInterval(checkCache);
          }
        }, 500);
        
        // Timeout after 15 seconds
        setTimeout(() => {
          clearInterval(checkCache);
          if (!sharedProfileCache.has(review.pubkey) && !profileCache.has(review.pubkey)) {
            setLoadingProfile(false);
          }
        }, 15000);
        return;
      }

      // Mark as being fetched
      fetchingProfiles.add(review.pubkey);

      console.log('🔍 Fetching profile for pubkey:', review.pubkey.substring(0, 16) + '...');

      try {
        // Use shared NDK instance
        const ndk = await getSharedNDK();
        
        // Get user and attempt to fetch profile
        const user = ndk.getUser({ pubkey: review.pubkey });
        
        console.log('👤 Attempting to fetch profile from relays...');
        
        // Try to fetch profile with timeout
        const profilePromise = user.fetchProfile();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
        );
        
        const userProfile = await Promise.race([profilePromise, timeoutPromise]) as any;
        
        if (userProfile) {
          console.log('✅ Profile fetched successfully:', {
            name: userProfile.name,
            displayName: userProfile.displayName,
            hasImage: !!userProfile.image,
            nip05: userProfile.nip05
          });
          
          const profileData = {
            name: userProfile.name,
            displayName: userProfile.displayName,
            image: userProfile.image,
            banner: userProfile.banner,
            about: userProfile.about,
            nip05: userProfile.nip05,
            lud06: userProfile.lud06,
            lud16: userProfile.lud16,
            website: userProfile.website
          };
          
          // Store in both caches
          sharedProfileCache.set(review.pubkey, {
            name: userProfile.name,
            displayName: userProfile.displayName,
            image: userProfile.image
          });
          profileCache.set(review.pubkey, profileData);
          setProfile(profileData);
        } else {
          console.log('⚠️ No profile found for user');
          sharedProfileCache.set(review.pubkey, null);
          profileCache.set(review.pubkey, null);
          setProfile(null);
        }
      } catch (error) {
        console.warn('❌ Failed to fetch user profile:', error);
        
        // Try alternative approach with direct kind:0 event fetch
        try {
          console.log('🔄 Trying alternative profile fetch method...');
          const ndk = await getSharedNDK();
          
          const profileEvents = await ndk.fetchEvents({
            kinds: [0], // Kind 0 is user metadata
            authors: [review.pubkey],
            limit: 1
          });
          
          if (profileEvents.size > 0) {
            const profileEvent = Array.from(profileEvents)[0];
            const profileData = JSON.parse(profileEvent.content);
            
            console.log('✅ Profile fetched via alternative method:', {
              name: profileData.name,
              displayName: profileData.display_name,
              hasImage: !!profileData.picture
            });
            
            const fetchedProfile = {
              name: profileData.name,
              displayName: profileData.display_name,
              image: profileData.picture,
              banner: profileData.banner,
              about: profileData.about,
              nip05: profileData.nip05,
              lud06: profileData.lud06,
              lud16: profileData.lud16,
              website: profileData.website
            };
            
            // Store in both caches
            sharedProfileCache.set(review.pubkey, {
              name: profileData.name,
              displayName: profileData.display_name,
              image: profileData.picture
            });
            profileCache.set(review.pubkey, fetchedProfile);
            setProfile(fetchedProfile);
          } else {
            console.log('⚠️ No profile events found');
            sharedProfileCache.set(review.pubkey, null);
            profileCache.set(review.pubkey, null);
            setProfile(null);
          }
        } catch (altError) {
          console.warn('❌ Alternative profile fetch also failed:', altError);
          sharedProfileCache.set(review.pubkey, null);
          profileCache.set(review.pubkey, null);
          setProfile(null);
        }
      } finally {
        fetchingProfiles.delete(review.pubkey);
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [review.pubkey]);

  // Get display name with fallbacks
  const getDisplayName = (): string => {
    if (profile?.displayName) return profile.displayName;
    if (profile?.name) return profile.name;
    if (review.author && review.author !== 'Anonymous') return review.author;
    return 'Anonymous';
  };

  // Get profile image with fallback
  const getProfileImage = (): string | null => {
    return profile?.image || null;
  };

  return (
    <div className="bg-gray-700/50 rounded-2xl p-4 hover:bg-gray-700/70 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          {/* Profile Picture */}
          <div className="relative flex-shrink-0">
            {loadingProfile ? (
              <div className="w-10 h-10 bg-gray-600 rounded-full animate-pulse" />
            ) : getProfileImage() ? (
              <img
                src={getProfileImage()!}
                alt={`${getDisplayName()}'s avatar`}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 hover:border-gray-500 transition-colors"
                onError={(e) => {
                  // Fallback to default avatar on image load error
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const fallback = img.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Default avatar fallback */}
            <div 
              className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center"
              style={{ display: (!loadingProfile && !getProfileImage()) ? 'flex' : 'none' }}
            >
              <User className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1 flex-wrap">
              <span className="font-medium text-white truncate">
                {loadingProfile ? (
                  <div className="h-4 w-20 bg-gray-600 rounded animate-pulse" />
                ) : (
                  getDisplayName()
                )}
              </span>
              {review.verified && (
                <span title="Verified user">
                  <Shield className="h-3 w-3 text-green-400 flex-shrink-0" />
                </span>
              )}
              {profile?.nip05 && (
                <div className="flex items-center text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                  <Shield className="h-3 w-3 mr-1" />
                  <span className="truncate">{profile.nip05}</span>
                </div>
              )}
            </div>

            {/* Npub (clickable to copy) */}
            {review.pubkey && (
              <button
                onClick={handleCopyPubkey}
                className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-300 transition-colors group mb-2 p-1 -ml-1 rounded hover:bg-gray-600/50"
                title="Click to copy pubkey"
              >
                <span className="font-mono">{formatPubkey(review.pubkey, 'npub')}</span>
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                {copyStatus === 'copied' && (
                  <span className="text-green-400 text-xs ml-1">Copied!</span>
                )}
              </button>
            )}

            {/* Rating and Date */}
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <StarRating rating={review.rating} showLabel={false} />
                <span className="text-gray-400 ml-1">({review.rating}/5)</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                <span title={formatDate(review.created_at)}>
                  {formatRelativeTime(review.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Link */}
        {profile?.website && (
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0 ml-2"
            title="Visit profile website"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
      
      {/* Review Content */}
      <p className="text-gray-300 text-sm leading-relaxed mb-3">{cleanReviewContent(review.content)}</p>

      {/* Additional Profile Info */}
      <div className="flex flex-wrap gap-4 text-xs">
        {/* Profile Bio (if available and short) */}
        {profile?.about && profile.about.length < 100 && (
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 italic truncate">"{profile.about}"</p>
          </div>
        )}

        {/* Lightning Address (if available) */}
        {(profile?.lud16 || profile?.lud06) && (
          <div className="flex items-center space-x-1 bg-yellow-400/10 px-2 py-1 rounded">
            <span className="text-yellow-400">⚡</span>
            <span className="text-gray-400 font-mono text-xs">
              {profile.lud16 || profile.lud06}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewItem; 