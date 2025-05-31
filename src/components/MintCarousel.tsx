import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { ExternalLink, Users, Zap } from 'lucide-react';
import { MintInfo } from '../types';

import 'swiper/css';
import 'swiper/css/navigation';

interface MintCarouselProps {
  mints: MintInfo[];
}

const MintCarousel: React.FC<MintCarouselProps> = ({ mints }) => {
  if (mints.length === 0) return null;

  return (
    <div className="relative px-4 py-8">
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="mint-carousel"
      >
        {mints.map((mint, index) => {
          const domain = mint.url?.replace(/^https?:\/\//, '') || 
                        mint.urls?.[0]?.replace(/^https?:\/\//, '');
          
          if (!domain) return null;

          return (
            <SwiperSlide key={index}>
              <Link
                to={`/${domain}`}
                className="block bg-gray-800/50 backdrop-blur rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 border border-gray-700 hover:border-brand-primary group h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-brand-primary">{mint.name}</h3>
                  <ExternalLink className="h-5 w-5 text-brand-text opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                
                <p className="text-brand-text mb-4 line-clamp-2">
                  {mint.description || mint.description_long}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {mint.contact && (
                    <span className="text-xs bg-gray-700/50 text-brand-text px-3 py-1 rounded-full flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Contact
                    </span>
                  )}
                  {mint.nuts?.['4']?.supported && (
                    <span className="text-xs bg-gray-700/50 text-brand-text px-3 py-1 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Lightning
                    </span>
                  )}
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default MintCarousel;