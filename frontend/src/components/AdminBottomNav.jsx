import React, { useState } from 'react'
import { RiSpeakAiFill } from "react-icons/ri";
import { GrAnnounce } from "react-icons/gr";
import { FaNewspaper } from "react-icons/fa6";

function AdminBottomNav({currTab}) {
    const [tab, setTab] = useState(0);
    
  return (
    <div className='absolute bottom-0 flex flex-row justify-around w-full sm:w-[80vw] md:w-[65vw] lg:w-[55vw] xl:w-[45vw] gap-2 p-2 shadow-2xl text-white bg-white border-t-2 backdrop-blur-md'>
        <button
        onClick={() => {setTab(0); currTab(0);}}
        className='flex flex-col justify-center items-center bg-blue-800 w-full p-2 rounded-md'>
            <FaNewspaper />
            <p className='text-sm font-semibold flex flex-row items-center gap-1'>
                Recent Updates
            </p>
        </button>
        <button
        onClick={() => {setTab(0); currTab(1);}}
        className='flex flex-col justify-center items-center bg-blue-800 w-full p-2 rounded-md'>
            <RiSpeakAiFill className='text-xl' />
            <p className='text-sm font-semibold flex flex-row items-center gap-1'>
                language Translation
            </p>
        </button>
        <button
        onClick={() => {setTab(1); currTab(2);}}
        className='flex flex-col justify-center items-center bg-blue-800 w-full p-2 rounded-md'>
            <GrAnnounce className='text-xl' />
            <p className='text-sm font-semibold flex flex-row items-center gap-1'>
                Geo Target Messaging
            </p>
        </button>
    </div>
  )
}

export default AdminBottomNav
