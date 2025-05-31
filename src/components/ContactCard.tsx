import React from 'react';
import { Contact } from '../types';
import { getContactIcon } from '../utils/formatters';
import * as LucideIcons from 'lucide-react';

interface ContactCardProps {
  contacts: Contact[];
}

const ContactCard: React.FC<ContactCardProps> = ({ contacts }) => {
  if (!contacts || contacts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-6">
        <LucideIcons.Users className="h-6 w-6 text-brand-primary mr-3" />
        <h2 className="text-2xl font-bold text-brand-primary">Get in Touch</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {contacts.map((contact, index) => {
          const iconName = getContactIcon(contact.method);
          const Icon = (LucideIcons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
          
          const isClickable = ['email', 'twitter', 'website'].includes(contact.method.toLowerCase());
          const href = contact.method.toLowerCase() === 'email' 
            ? `mailto:${contact.value}`
            : contact.method.toLowerCase() === 'twitter'
            ? `https://twitter.com/${contact.value.replace('@', '')}`
            : contact.method.toLowerCase() === 'website'
            ? (contact.value.startsWith('http') ? contact.value : `https://${contact.value}`)
            : undefined;

          const ContactWrapper = isClickable 
            ? ({ children }: { children: React.ReactNode }) => (
                <a 
                  href={href}
                  target={contact.method.toLowerCase() !== 'email' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transform hover:-translate-y-1 transition-all duration-300"
                >
                  {children}
                </a>
              )
            : ({ children }: { children: React.ReactNode }) => (
                <div className="bg-gray-700 rounded-lg p-4">
                  {children}
                </div>
              );

          return (
            <ContactWrapper key={index}>
              <div className="flex items-start space-x-3">
                <div className="bg-gray-600 rounded-full p-2">
                  {Icon && <Icon className="text-brand-primary h-5 w-5" />}
                </div>
                <div>
                  <p className="text-white font-semibold capitalize mb-1">
                    {contact.method}
                  </p>
                  <p className="text-brand-text text-sm break-all">
                    {contact.value}
                  </p>
                </div>
              </div>
            </ContactWrapper>
          );
        })}
      </div>
    </div>
  );
};

export default ContactCard;