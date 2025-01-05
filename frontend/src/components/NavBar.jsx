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
    <div className='w-full h-auto p-4 shadow-md flex flex-row justify-between border-b-2'>
      <div className='flex items-center gap-1'>
        <img src={logo} className='h-8' />
        <h1 className='text-md font-semibold text-yellow-600'>
        IndiSafe.ai
        </h1>
      </div>
      <div className='flex flex-row justify-evenly items-center gap-4 text-xl text-blue-800'>
        <IoMdHome className='text-2xl cursor-pointer' onClick={() => navigate('/home')} />
        <FaGlobe className='cursor-pointer' onClick={() => setIsLanguagePopupVisible(!isLanguagePopupVisible)} />
        <FaUserAlt className='cursor-pointer' onClick={() => setIsLogoutPopupVisible(!isLogoutPopupVisible)} />
      </div>
      {isLanguagePopupVisible && (
        <div className='absolute top-16 right-4 bg-white border rounded shadow-lg p-4 z-10'>
          <h3 className='text-blue-800 font-semibold mb-2'>Change Language</h3>
          <ul>
            {Object.entries(languages).map(([language, code]) => (
              <li
                key={code}
                className='cursor-pointer hover:text-blue-600'
                onClick={() => handleLanguageChange(language)}
              >
                {language}
              </li>
            ))}
          </ul>
        </div>
      )}
      {isLogoutPopupVisible && (
        <div className='absolute top-16 right-4 bg-white border rounded shadow-lg p-4 z-10'>
          <h3 className='text-blue-800 font-semibold mb-2'>Logout</h3>
          <p className='mb-4'>Are you sure you want to log out?</p>
          <div className='flex justify-end gap-2'>
            <button className='text-blue-800 hover:text-blue-600' onClick={() => setIsLogoutPopupVisible(false)}>Cancel</button>
            <button className='text-red-600 hover:text-red-800' onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NavBar;
