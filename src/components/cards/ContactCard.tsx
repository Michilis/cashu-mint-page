import React, { useState } from 'react';
import { Contact } from '../../types';
import { getContactIcon } from '../../utils/formatters';
import * as LucideIcons from 'lucide-react';
import { Copy, Check } from 'lucide-react';

interface ContactCardProps {
  contacts: Contact[];
}

const ContactCard: React.FC<ContactCardProps> = ({ contacts }) => {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  if (!contacts || contacts.length === 0) {
    return null;
  }

  const handleCopy = async (value: string, index: number) => {
    await navigator.clipboard.writeText(value);
    setCopiedStates(prev => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [index]: false }));
    }, 2000);
  };

  const getContactValue = (contact: Contact) => {
    return contact.value || contact.info || '';
  };

  const getContactLink = (contact: Contact) => {
    const value = getContactValue(contact);
    switch (contact.method.toLowerCase()) {
      case 'email':
        return `mailto:${value}`;
      case 'twitter':
        return `https://twitter.com/${value.replace('@', '')}`;
      case 'nostr':
        return `https://snort.social/p/${value}`;
      case 'website':
        return value.startsWith('http') ? value : `https://${value}`;
      default:
        return undefined;
    }
  };

  const isClickable = (method: string) => {
    return ['email', 'twitter', 'website', 'nostr'].includes(method.toLowerCase());
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg mb-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-4">
        <LucideIcons.Users className="h-5 w-5 text-brand-primary mr-2" />
        <h2 className="text-xl font-bold text-brand-primary">Get in Touch</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {contacts.map((contact, index) => {
          const iconName = getContactIcon(contact.method);
          const Icon = (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
          const value = getContactValue(contact);
          const href = getContactLink(contact);
          
          return (
            <div
              key={index}
              className="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-gray-600 rounded-full p-1.5">
                    {Icon && <Icon className="text-brand-primary h-4 w-4" />}
                  </div>
                  <span className="text-white font-medium capitalize ml-2">
                    {contact.method}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(value, index)}
                  className="text-brand-text hover:text-brand-primary transition-colors p-1 rounded-md hover:bg-gray-600/50"
                  title="Copy to clipboard"
                >
                  {copiedStates[index] ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                {isClickable(contact.method) && href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-text hover:text-brand-primary transition-colors break-all text-sm"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-brand-text break-all text-sm">
                    {value}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactCard;