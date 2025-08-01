import React, { useState } from 'react';
import { IoMdHome } from "react-icons/io";
import { FaUserAlt } from "react-icons/fa";
import { FaGlobe } from "react-icons/fa6";
import { FaBookmark } from "react-icons/fa";
import { HiSpeakerphone } from "react-icons/hi";
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const languages = {
  'English': 'en',
  'Assamese': 'as',
  'Bangla': 'bn',
  'Bodo': 'brx',
  'Dogri': 'doi',
  'Gujarati': 'gu',
  'Hindi': 'hi',
  'Kashmiri': 'ks',
  'Kannada': 'kn',
  'Konkani': 'kok',
  'Maithili': 'mai',
  'Malayalam': 'ml',
  'Manipuri': 'mni',
  'Marathi': 'mr',
  'Nepali': 'ne',
  'Odia': 'or',
  'Punjabi': 'pa',
  'Tamil': 'ta',
  'Telugu': 'te',
  'Santali': 'sat',
  'Sindhi': 'sd',
  'Urdu': 'ur',
  'Konyak': 'knk',
  'Khasi': 'kha',
  'Jaintia': 'jai',
};

function NavBar() {
  const [isLanguagePopupVisible, setIsLanguagePopupVisible] = useState(false);
  const [isLogoutPopupVisible, setIsLogoutPopupVisible] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLanguageChange = async (language) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          preferredLanguage: language,
        });
        alert('Language changed successfully!');
        setIsLanguagePopupVisible(false);
      } catch (error) {
        console.error('Error updating language:', error);
        alert('Error updating language. Please try again.');
      }
    }
  };

  return (
    <div className='w-full h-auto p-4 shadow-md flex flex-row justify-between items-center border-b-2 bg-white/95 backdrop-blur-sm'>
      <div className='flex items-center gap-2'>
        <img src={logo} className='h-8 w-auto' alt="IndiSafe Logo" />
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <h1 className='text-sm font-semibold'>IndiSafe.ai</h1>
        </Badge>
      </div>
      
      <div className='flex flex-row justify-evenly items-center gap-3'>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home')}
          className="text-blue-800 hover:text-blue-600 hover:bg-blue-50"
        >
          <IoMdHome className='h-5 w-5' />
        </Button>
        
        <DropdownMenu open={isLanguagePopupVisible} onOpenChange={setIsLanguagePopupVisible}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-800 hover:text-blue-600 hover:bg-blue-50"
            >
              <FaGlobe className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <h3 className='text-blue-800 font-semibold mb-2 text-sm'>Change Language</h3>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {Object.entries(languages).map(([language, code]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => handleLanguageChange(language)}
                    className="cursor-pointer hover:bg-blue-50"
                  >
                    {language}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Dialog open={isLogoutPopupVisible} onOpenChange={setIsLogoutPopupVisible}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-800 hover:text-blue-600 hover:bg-blue-50"
            >
              <FaUserAlt className='h-5 w-5' />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-blue-800">Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsLogoutPopupVisible(false)}
                className="border-blue-200 text-blue-800 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default NavBar;
