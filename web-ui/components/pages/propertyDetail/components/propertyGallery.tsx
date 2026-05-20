import React, { useState } from 'react';
import Image from 'next/image';
import { PropertyImageResponse } from '@/services/properties/properties.Interface';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PropertyGallery({ images }: { images: PropertyImageResponse[] }) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    if (!images || images.length === 0) return null;
    
    // Sort so primary is first, then by sortOrder
    const sortedImages = [...images].sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return a.sortOrder - b.sortOrder;
    });

    const primaryImage = sortedImages[0];
    const secondaryImages = sortedImages.slice(1, 5);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex + 1) % sortedImages.length);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex - 1 + sortedImages.length) % sortedImages.length);
        }
    };

    return (
        <>
            <div className="flex flex-col md:grid md:grid-cols-4 gap-2 md:gap-4 h-auto md:h-[500px] mb-8">
                <div 
                    className="md:col-span-3 relative h-[300px] sm:h-[400px] md:h-full w-full group cursor-pointer rounded-2xl overflow-hidden shrink-0"
                    onClick={() => setSelectedIndex(0)}
                >
                    <Image 
                        src={primaryImage.imageUrl} 
                        alt="Primary Property Image" 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                {secondaryImages.length > 0 && (
                    <div className="flex flex-row md:flex-col gap-2 md:gap-4 overflow-x-auto md:overflow-visible h-[90px] sm:h-[120px] md:h-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                        {secondaryImages.map((img, idx) => (
                            <div 
                                key={img.imageId} 
                                className="relative h-full aspect-[4/3] md:w-full md:aspect-auto md:flex-1 shrink-0 snap-center group overflow-hidden rounded-xl cursor-pointer"
                                onClick={() => setSelectedIndex(idx + 1)}
                            >
                                <Image 
                                    src={img.imageUrl} 
                                    alt={`Property view ${idx + 2}`} 
                                    fill 
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setSelectedIndex(null)}>
                    <Button 
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                        onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
                    >
                        <X className="w-6 h-6" />
                    </Button>
                    
                    <Button 
                        className="absolute left-4 md:left-8 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                        onClick={handlePrev}
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </Button>

                    <div className="relative w-full max-w-5xl h-[70vh] md:h-[85vh] mx-16">
                        <Image 
                            src={sortedImages[selectedIndex].imageUrl} 
                            alt={`Gallery image ${selectedIndex + 1}`}
                            fill
                            className="object-contain"
                        />
                    </div>

                    <Button 
                        className="absolute right-4 md:right-8 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                        onClick={handleNext}
                    >
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                    
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 font-medium tracking-widest text-sm bg-white/10 backdrop-blur-md px-5 py-2 rounded-full">
                        {selectedIndex + 1} / {sortedImages.length}
                    </div>
                </div>
            )}
        </>
    );
}
