import React from 'react'
import NavBar from '../components/NavBar'
import AdminBottomNav from '../components/AdminBottomNav'
import { useState } from 'react';
import ManyLanguageTranslator from '../components/ManyLanguageTranslator';
import GeoTargetMessaging from '../components/GeoTargetMessaging';
import RecentNews from '../components/RecentNews';
import { ScrollArea } from "@/components/ui/scroll-area";

function AdminHome() {
    const [tab, setTab] = useState(0);
    const handleTabChange = (index) => {
        setTab(index);
    }
  return (
    <div className='h-screen mx-auto flex flex-col justify-between items-center w-full bg-gray-50'>
       <NavBar/>
       
       <ScrollArea className='h-full w-full pb-24'>
         <div className='p-4'>
           {tab === 0 ? <RecentNews /> : tab === 1 ? <ManyLanguageTranslator/> : <GeoTargetMessaging />}
         </div>
       </ScrollArea>
       
       <AdminBottomNav currTab={handleTabChange} />
    </div>
  )
}

export default AdminHome
