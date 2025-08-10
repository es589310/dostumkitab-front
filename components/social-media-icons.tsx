'use client';

import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Send } from 'lucide-react';

interface SocialMediaLink {
  platform: string;
  url: string;
  icon_class: string;
  is_active: boolean;
  order: number;
}

const platformIcons: Record<string, React.ComponentType<any>> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  telegram: Send,
};

const platformNames: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  telegram: 'Telegram',
};

interface SocialMediaIconsProps {
  variant?: 'navbar' | 'footer';
  className?: string;
}

export default function SocialMediaIcons({ variant = 'footer', className = '' }: SocialMediaIconsProps) {
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/contact/social-links/');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSocialLinks(data.links);
          }
        }
      } catch (error) {
        console.error('Sosial media linkləri yüklənərkən xəta:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (socialLinks.length === 0) {
    return null;
  }

  const baseClasses = variant === 'navbar' 
    ? 'flex items-center space-x-3' 
    : 'flex items-center space-x-4';

  const iconClasses = variant === 'navbar'
    ? 'w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors duration-200'
    : 'w-6 h-6 text-gray-400 hover:text-white transition-colors duration-200';

  return (
    <div className={`${baseClasses} ${className}`}>
      {socialLinks.map((link) => {
        const IconComponent = platformIcons[link.platform];
        if (!IconComponent) return null;

        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            aria-label={`${platformNames[link.platform]} səhifəsinə keç`}
            title={platformNames[link.platform]}
          >
            <IconComponent 
              className={`${iconClasses} group-hover:scale-110 transition-transform duration-200`} 
            />
          </a>
        );
      })}
    </div>
  );
} 