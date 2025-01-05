import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase'; // Import the Firebase configuration
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { GoAlertFill } from "react-icons/go";
import { IoMdInformationCircle } from "react-icons/io";
import { MdDangerous } from "react-icons/md";
import ClientBottomNav from '../components/ClientBottomNav'; // Import the ClientBottomNav component
import NavBar from '../components/NavBar';

function ClientHome() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [preferredLanguage, setPreferredLanguage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Recommended');
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

  return (
    <div className='h-screen mx-auto  flex flex-col justify-between items-center w-full sm:w-[80vw] md:w-[65vw] lg:w-[55vw] xl:w-[45vw] bg-white'>
      <NavBar/>
      <div className='h-full overflow-y-scroll p-2 w-full pb-32 bg-zinc-100'>
        <div className='h-auto flex flex-col justify-start gap-4 items-center mt-2'>
          {filteredPosts.map(post => {
            const date = new Date(post.timestamp.seconds * 1000);
            const formattedDate = date.toLocaleString(); // This will format the date and time without the timezone

            return (
              <div key={post.id} className='w-full max-w-md flex flex-col bg-white rounded-md'>
                {post.images && post.images.length > 0 && (
                  <div className=''>
                    {post.images.map((image, index) => (
                      <img key={index} src={image} alt={`Image ${index}`} className='w-full h-auto rounded-md mb-2' />
                    ))}
                  </div>
                )}
                <div className='pl-2 pr-2 pt-2 font-inter'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-sm text-gray-500 flex items-center gap-1'>
                      <span className='text-md'>
                        {post.type === "Info" ? <IoMdInformationCircle className='text-green-500' /> :
                         post.type === "Alert" ? <GoAlertFill className='text-yellow-500' /> :
                         <MdDangerous className='text-red-500' />}
                      </span>
                      {post.state}-{post.district}
                    </p>
                    <span className='text-sm text-gray-500'>{formattedDate}</span>
                  </div>
                  <p className='text-gray-900 mb-4'>{post.translations[preferredLanguage]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ClientBottomNav selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
    </div>
  );
}

export default ClientHome;
