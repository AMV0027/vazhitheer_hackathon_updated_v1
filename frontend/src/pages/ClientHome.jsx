import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase'; // Import the Firebase configuration
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { GoAlertFill } from "react-icons/go";
import { IoMdInformationCircle } from "react-icons/io";
import { MdDangerous } from "react-icons/md";
import ClientBottomNav from '../components/ClientBottomNav'; // Import the ClientBottomNav component
import NavBar from '../components/NavBar';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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

  const getTypeIcon = (type) => {
    switch (type) {
      case "Info":
        return <IoMdInformationCircle className="h-5 w-5 text-green-500" />;
      case "Alert":
        return <GoAlertFill className="h-5 w-5 text-yellow-500" />;
      default:
        return <MdDangerous className="h-5 w-5 text-red-500" />;
    }
  };

  const getTypeBadge = (type) => {
    const variants = {
      "Info": "default",
      "Alert": "secondary",
      "Danger": "destructive"
    };
    
    const colors = {
      "Info": "bg-green-100 text-green-800 hover:bg-green-200",
      "Alert": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      "Danger": "bg-red-100 text-red-800 hover:bg-red-200"
    };

    return (
      <Badge variant="secondary" className={colors[type] || colors["Info"]}>
        {type}
      </Badge>
    );
  };

  return (
    <div className='h-screen mx-auto flex flex-col justify-between items-center w-full bg-gray-50'>
      <NavBar/>
      
      <ScrollArea className='h-full w-full px-4 pb-24'>
        <div className='flex flex-col justify-start gap-4 items-center mt-4'>
          {filteredPosts.length === 0 ? (
            <Card className="w-full max-w-md">
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No posts available for your current filter.</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map(post => {
              const date = new Date(post.timestamp.seconds * 1000);
              const formattedDate = date.toLocaleString();

              return (
                <Card key={post.id} className='w-full max-w-md shadow-sm hover:shadow-md transition-shadow'>
                  {post.images && post.images.length > 0 && (
                    <div className='p-4 pb-0'>
                      {post.images.map((image, index) => (
                        <img 
                          key={index} 
                          src={image} 
                          alt={`Image ${index}`} 
                          className='w-full h-auto rounded-lg mb-2 object-cover' 
                        />
                      ))}
                    </div>
                  )}
                  
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center gap-2'>
                        {getTypeIcon(post.type)}
                        <div className='flex items-center gap-2'>
                          <span className='text-sm text-gray-600 font-medium'>
                            {post.state}-{post.district}
                          </span>
                          {getTypeBadge(post.type)}
                        </div>
                      </div>
                      <span className='text-xs text-gray-500'>{formattedDate}</span>
                    </div>
                    
                    <Separator className="mb-3" />
                    
                    <p className='text-gray-900 leading-relaxed'>
                      {post.translations[preferredLanguage]}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
      
      <ClientBottomNav selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
    </div>
  );
}

export default ClientHome;
