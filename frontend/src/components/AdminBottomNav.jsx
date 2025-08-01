import React, { useState } from 'react'
import { RiSpeakAiFill } from "react-icons/ri";
import { GrAnnounce } from "react-icons/gr";
import { FaNewspaper } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function AdminBottomNav({currTab}) {
    const [tab, setTab] = useState(0);
    
  return (
    <div className='fixed bottom-0 left-0 right-0 flex flex-row justify-around w-full gap-2 p-4 shadow-2xl bg-white/95 backdrop-blur-xl border-t border-gray-200'>
        <Button
        onClick={() => {setTab(0); currTab(0);}}
        variant={tab === 0 ? 'default' : 'outline'}
        className={`flex flex-col justify-center items-center w-full py-3 ${
          tab === 0 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'border-blue-300 text-blue-700 hover:bg-blue-50'
        }`}>
            <FaNewspaper className="h-4 w-4 mb-1" />
            <span className='text-xs font-semibold text-center'>
                Recent Updates
            </span>
        </Button>
        
        <Button
        onClick={() => {setTab(1); currTab(1);}}
        variant={tab === 1 ? 'default' : 'outline'}
        className={`flex flex-col justify-center items-center w-full py-3 ${
          tab === 1 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'border-blue-300 text-blue-700 hover:bg-blue-50'
        }`}>
            <RiSpeakAiFill className='h-4 w-4 mb-1' />
            <span className='text-xs font-semibold text-center'>
                Language Translation
            </span>
        </Button>
        
        <Button
        onClick={() => {setTab(2); currTab(2);}}
        variant={tab === 2 ? 'default' : 'outline'}
        className={`flex flex-col justify-center items-center w-full py-3 ${
          tab === 2 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'border-blue-300 text-blue-700 hover:bg-blue-50'
        }`}>
            <GrAnnounce className='h-4 w-4 mb-1' />
            <span className='text-xs font-semibold text-center'>
                Geo Target Messaging
            </span>
        </Button>
    </div>
  )
}

export default AdminBottomNav
