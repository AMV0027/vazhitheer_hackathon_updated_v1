import React from 'react'
import NavBar from '../components/NavBar'
import AdminBottomNav from '../components/AdminBottomNav'
import { useState } from 'react';
import ManyLanguageTranslator from '../components/ManyLanguageTranslator';
import GeoTargetMessaging from '../components/GeoTargetMessaging';
import RecentNews from '../components/RecentNews';

function AdminHome() {
    const [tab, setTab] = useState(0);
    const handleTabChange = (index) => {
        setTab(index);
    }
  return (
    <div className='h-screen mx-auto flex flex-col justify-between items-center w-full sm:w-[80vw] md:w-[65vw] lg:w-[55vw] xl:w-[45vw] bg-white'>
       <NavBar/>
       {tab == 0 ? <RecentNews /> : tab == 1 ? <ManyLanguageTranslator/> : <GeoTargetMessaging />}
       
       <AdminBottomNav currTab={handleTabChange} />
    </div>
  )
}

export default AdminHome
