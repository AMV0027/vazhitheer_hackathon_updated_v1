import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase'; // Import the Firebase configuration
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { GoAlertFill } from "react-icons/go";
import { IoMdInformationCircle } from "react-icons/io";
import { MdDangerous } from "react-icons/md";

function RecentNews() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [preferredLanguage, setPreferredLanguage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Recommended');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userState, setUserState] = useState(null);

  const fetchUserPreferredLanguage = async (userId) => {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setPreferredLanguage(userDocSnap.data().preferredLanguage);
      setUserState(userDocSnap.data().state); // Assuming the user's state is stored in the 'state' field
    }
  };

  const fetchPosts = async () => {
    const postsCollection = collection(db, "posts");
    const postsSnapshot = await getDocs(postsCollection);
    const postsList = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPosts(postsList);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserPreferredLanguage(currentUser.uid);
        fetchPosts();
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredPosts = posts.filter(post =>
    post.translations &&
    post.translations[preferredLanguage] &&
    (selectedFilter === 'Recommended' ? post.state === userState : true)
  );

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
  };

  return (
    <div className='h-full overflow-y-scroll p-2 w-full pb-32 bg-zinc-100'>
      <div className='flex flex-row justify-start gap-2 mt-1 mb-2 font-inter text-sm'>
        <div className='relative w-full max-w-md mx-auto'>
          <button
            className='bg-yellow-500 w-full text-white rounded-md pl-2 p-1 pr-2 flex items-center justify-between'
            onClick={toggleDropdown}
          >
            {selectedFilter}
            <svg
              className={`w-4 h-4 ml-2 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className='absolute mt-2 w-full bg-white border rounded-md shadow-lg z-10'>
              <button
                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                onClick={() => handleFilterChange('Recommended')}
              >
                Recommended
              </button>
              <button
                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                onClick={() => handleFilterChange('All')}
              >
                All
              </button>
            </div>
          )}
        </div>
      </div>
      <div className='h-auto flex flex-col justify-start gap-4 items-center mt-2'>
        {filteredPosts.map(post => {
          const date = new Date(post.timestamp.seconds * 1000);
          const formattedDate = date.toLocaleString(); // This will format the date and time without the timezone

          return (
            <div key={post.id} className='w-full max-w-md flex flex-col bg-white shadow-xs rounded-md'>
              <div className={`w-full p-1 flex gap-2 items-center rounded-t-md ${post.type === "Info" ? "bg-green-200" : post.type === "Alert" ? "bg-yellow-200" : "bg-red-200"}`}>
                <span className='text-md'>
                  {post.type === "Info" ? <IoMdInformationCircle className='text-green-500' /> :
                    post.type === "Alert" ? <GoAlertFill className='text-yellow-500' /> :
                    <MdDangerous className='text-red-500' />}
                </span>
                <p className={`text-xs font-normal font-poppins ${post.type === "Info" ? "text-green-600" : post.type === "Alert" ? "text-yellow-600" : "text-red-600"}`}>
                  {post.type}
                </p>
              </div>
              {post.images && post.images.length > 0 && (
                <div className=''>
                  {post.images.map((image, index) => (
                    <img key={index} src={image} alt={`Image ${index}`} className='w-full h-auto mb-2' />
                  ))}
                </div>
              )}
              <div className='pl-2 pr-2 mt-2 font-inter text-xs'>
                <div className='flex items-center justify-between mb-2 '>
                  <p className='text-gray-500 flex items-center gap-1'>
                    {post.state}-{post.district}
                  </p>
                  <span className=' text-gray-500'>{formattedDate}</span>
                </div>
                <p className='text-base text-gray-900 mb-4'>{post.translations[preferredLanguage]}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentNews;
