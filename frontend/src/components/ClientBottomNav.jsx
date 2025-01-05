import React from 'react';
import { FaNewspaper } from "react-icons/fa6";
import { FaLayerGroup } from "react-icons/fa";

function ClientBottomNav({ selectedFilter, setSelectedFilter }) {
  return (
    <div className='absolute bottom-0 -translate-x-2 flex flex-row justify-around w-full sm:w-[80vw] md:w-[65vw] lg:w-[55vw] xl:w-[45vw] ml-4 gap-2 p-2 shadow-2xl text-white bg-transparent backdrop-blur-xl'>
      <button
        onClick={() => setSelectedFilter('Recommended')}
        className='flex flex-row gap-2 justify-center items-center bg-yellow-500 w-full p-2 rounded-md'
      >
        <FaNewspaper />
        <p className='text-sm font-semibold flex flex-row items-center gap-1'>
          Recommended
        </p>
      </button>
      <button
        onClick={() => setSelectedFilter('All')}
        className='flex flex-row gap-2 justify-center items-center bg-yellow-500 w-full p-2 rounded-md'
      >
        <FaLayerGroup />
        <p className='text-sm font-semibold flex flex-row items-center gap-1'>
          All News
        </p>
      </button>
    </div>
  );
}

export default ClientBottomNav;
