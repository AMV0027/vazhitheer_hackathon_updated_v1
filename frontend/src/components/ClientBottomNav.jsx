import React from 'react';
import { FaNewspaper } from "react-icons/fa6";
import { FaLayerGroup } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function ClientBottomNav({ selectedFilter, setSelectedFilter }) {
  return (
    <div className='fixed bottom-0 left-0 right-0 flex flex-row justify-around w-full gap-2 p-4 shadow-2xl bg-white/95 backdrop-blur-xl border-t border-gray-200'>
      <Button
        onClick={() => setSelectedFilter('Recommended')}
        variant={selectedFilter === 'Recommended' ? 'default' : 'outline'}
        className={`flex flex-row gap-2 justify-center items-center w-full py-3 ${
          selectedFilter === 'Recommended' 
            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
            : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
        }`}
      >
        <FaNewspaper className="h-4 w-4" />
        <span className='text-sm font-semibold'>Recommended</span>
      </Button>
      
      <Button
        onClick={() => setSelectedFilter('All')}
        variant={selectedFilter === 'All' ? 'default' : 'outline'}
        className={`flex flex-row gap-2 justify-center items-center w-full py-3 ${
          selectedFilter === 'All' 
            ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
            : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
        }`}
      >
        <FaLayerGroup className="h-4 w-4" />
        <span className='text-sm font-semibold'>All News</span>
      </Button>
    </div>
  );
}

export default ClientBottomNav;
