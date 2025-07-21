import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/legal/privacy-policy.md');
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error('Error loading privacy policy:', error);
        setContent('# Privacy Policy\n\nContent not available.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const renderMarkdown = (markdown: string) => {
    return markdown
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-white mb-6">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold text-white mt-8 mb-4">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-white mt-6 mb-3">{line.substring(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="text-brand-text ml-4 mb-2">{line.substring(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="text-white font-semibold mb-4">{line.substring(2, line.length - 2)}</p>;
        }
        if (line === '---') {
          return <hr key={index} className="border-gray-700 my-6" />;
        }
        if (line.startsWith('*') && line.endsWith('*')) {
          return <p key={index} className="text-brand-textDark italic text-sm mt-6">{line.substring(1, line.length - 1)}</p>;
        }
        if (line.trim() === '') {
          return <div key={index} className="h-2"></div>;
        }
        return <p key={index} className="text-brand-text mb-3 leading-relaxed">{line}</p>;
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mr-3"></div>
            <span className="text-brand-text">Loading privacy policy...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-brand-primary hover:text-brand-light transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-invert max-w-none">
            {renderMarkdown(content)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 