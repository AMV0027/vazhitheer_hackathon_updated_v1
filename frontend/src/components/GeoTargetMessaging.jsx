import React, { useState, useEffect } from 'react';
import { IoMdSend } from "react-icons/io";
import { db, auth } from '../config/firebase'; // Import the Firebase configuration
import { collection, addDoc, getDocs, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import axios from 'axios';
import { GoAlertFill } from "react-icons/go";
import { IoMdInformationCircle } from "react-icons/io";
import { MdDangerous } from "react-icons/md";
import stateDistrictMap from './stateDistrictMap'; // Import the stateDistrictMap
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function GeoTargetMessaging() {
  const [postView, setPostView] = useState(0);
  const [selectedState, setSelectedState] = useState("");
  const [districts, setDistricts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postMessage, setPostMessage] = useState("");
  const [postType, setPostType] = useState("Info");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [culturalContext, setCulturalContext] = useState(0.5);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditPost, setCurrentEditPost] = useState(null);

  const handleStateChange = (event) => {
    const state = event.target.value;
    setSelectedState(state);
    setDistricts(stateDistrictMap[state] || []);
  };

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
  };

  const handlePostTypeChange = (event) => {
    setPostType(event.target.value);
  };

  const handlePostMessageChange = (event) => {
    setPostMessage(event.target.value);
  };

  const handleCulturalContextChange = (event) => {
    setCulturalContext(parseFloat(event.target.value));
  };

  const handleImageChange = (event) => {
    const files = event.target.files;
    const imagePromises = Array.from(files).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(base64Images => {
      setImages(base64Images);
    });
  };

  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), where("userId", "==", user.uid));
    onSnapshot(q, (querySnapshot) => {
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });
  };

  const translatePost = async (text) => {
    try {
      const response = await axios.post('http://localhost:8000/translate/all', {
        text,
        cultural_context: culturalContext
      });
      return response.data.translations;
    } catch (error) {
      console.error("Translation error:", error);
      throw error;
    }
  };

  const createPost = async () => {
    if (postMessage.trim() === "") return;

    setLoading(true);

    try {
      const translations = await translatePost(postMessage);

      const postData = {
        message: postMessage,
        translations,
        type: postType,
        state: selectedState,
        district: selectedDistrict,
        images,
        userId: user.uid,
        timestamp: new Date()
      };

      await addDoc(collection(db, "posts"), postData);
      setPostMessage("");
      setPostType("Info");
      setSelectedState("");
      setSelectedDistrict("");
      setImages([]);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  const editPost = async () => {
    if (!currentEditPost) return;
    const postRef = doc(db, "posts", currentEditPost.id);
    const translations = await translatePost(currentEditPost.message);

    await updateDoc(postRef, {
      message: currentEditPost.message,
      translations,
      state: currentEditPost.state,
      district: currentEditPost.district,
      culturalContext: currentEditPost.culturalContext,
    });
    setIsEditModalOpen(false);
    setCurrentEditPost(null);
  };

  const deletePost = async (postId) => {
    await deleteDoc(doc(db, "posts", postId));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchPosts();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (postView === 0 && user) {
      fetchPosts();
    }
  }, [postView, user]);

  return (
    <div className='h-full w-full overflow-y-scroll p-2 shadow-md pb-32 bg-zinc-100'>
      <div className='flex flex-row justify-between gap-2'>
        <button className={`w-full text-center p-2 text-white rounded-md ${postView === 0 ? "bg-blue-800" : "bg-gray-400"}`} onClick={() => setPostView(0)}>
          Your Posts
        </button>
        <button className={`w-full text-center p-2 text-white rounded-md ${postView !== 0 ? "bg-blue-800" : "bg-gray-400"}`} onClick={() => setPostView(1)}>
          Create Post
        </button>
      </div>
      <hr className="mb-1 mt-1" />
      <h1 className="text-xl font-semibold font-poppins text-yellow-500">
        {postView === 0 ? "Your Posts" : "Create Post"}
      </h1>
      <hr className=" mb-1 border-black" />
      {postView === 0 ? (
        <div className='h-auto flex flex-col justify-start gap-4 items-center mt-2'>
          {posts.map(post => {
            const date = new Date(post.timestamp.seconds * 1000);
            const formattedDate = date.toLocaleString();

            return (
              <div key={post.id} className='w-full max-w-md flex flex-col flex-start bg-white rounded-md'>
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
                        {post.type === "Info" ? <IoMdInformationCircle className='text-green-500' /> : post.type === "Alert" ? <GoAlertFill className='text-yellow-500' /> : <MdDangerous className='text-red-500' />}
                      </span>
                      {post.state}-{post.district}
                    </p>
                    <span className='text-sm text-gray-500'>{formattedDate}</span>
                  </div>

                  <p className='text-gray-900 mb-4'>{post.message}</p>
                  <div className='flex justify-end gap-2 pb-2 text-xl'>
                    <button className='text-blue-500' onClick={() => {
                      setCurrentEditPost(post);
                      setIsEditModalOpen(true);
                    }}><FaEdit /></button>
                    <button className='text-red-500' onClick={() => deletePost(post.id)}><MdDelete /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <textarea
            name="postMessage"
            rows={15}
            className='w-full h-auto p-2 border-2 border-zinc-500 text-sm rounded-md mt-2'
            placeholder='Your post message...'
            value={postMessage}
            onChange={handlePostMessageChange}
          ></textarea>
          <div className="bg-zinc-500 text-white p-2 rounded-md flex flex-row justify-between gap-2 items-center mt-1 mb-2">
            <label htmlFor="culturalContext" className=' w-auto'>Cultural Context</label>
            <div className='flex w-full gap-2'>
              <input
                type="range"
                id="culturalContext"
                name="culturalContext"
                min="0"
                max="1"
                step="0.1"
                value={culturalContext}
                onChange={handleCulturalContextChange}
                className="w-full accent-gray-300"
              />
              <span>{culturalContext}</span>
            </div>
          </div>
          <div className='flex flex-row justify-between gap-2'>
            <select
              name="postType"
              value={postType}
              onChange={handlePostTypeChange}
              className='w-full p-2 border border-gray-400 rounded-md'
            >
              <option value="Info">Info</option>
              <option value="Alert">Alert</option>
              <option value="Danger">Danger</option>
            </select>
            <select
              name="state"
              value={selectedState}
              onChange={handleStateChange}
              className='w-full p-2 border border-gray-400 rounded-md'
            >
              <option value="">Select State</option>
              {Object.keys(stateDistrictMap).map((state, index) => (
                <option key={index} value={state}>{state}</option>
              ))}
            </select>
            <select
              name="district"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              className='w-full p-2 border border-gray-400 rounded-md'
              disabled={!selectedState}
            >
              <option value="">Select District</option>
              {districts.map((district, index) => (
                <option key={index} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full mt-2 text-gray-400 font-semibold text-sm bg-white border cursor-pointer file:cursor-pointer file:border-0 file:py-3 file:px-4 file:mr-4 file:bg-zinc-500 file:hover:bg-gray-200 file:text-white rounded-md"

          />
          <button
            className='bg-blue-800 w-full flex flex-row items-center justify-center gap-2 text-white p-2 rounded-md mt-2'
            onClick={createPost}
            disabled={loading}
          >
            {loading ? "Posting..." : "Create Post"} <IoMdSend />
          </button>
        </>
      )}
      {isEditModalOpen && (
        <div className="absolute top-0 left-0 bg-zinc-100 bg-opacity-35 backdrop-blur-sm w-screen flex justify-center items-center h-screen">
          <div className="bg-white p-6 rounded-md shadow-md w-[80vw]">
            <h2 className="text-lg font-bold mb-4">Edit Post</h2>
            <textarea
              name="editPostMessage"
              rows={10}
              className='w-full h-auto p-2 border-2 border-zinc-500 text-sm rounded-md mt-2 mb-4'
              value={currentEditPost.message}
              onChange={(e) => setCurrentEditPost({ ...currentEditPost, message: e.target.value })}
            ></textarea>
            <div className='flex flex-col gap-4'>
              <label>
                State:
                <select
                  value={currentEditPost.state}
                  onChange={(e) => setCurrentEditPost({ ...currentEditPost, state: e.target.value })}
                  className='w-full p-2 border border-gray-400 rounded-md'
                >
                  <option value="">Select State</option>
                  {Object.keys(stateDistrictMap).map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </select>
              </label>
              <label>
                District:
                <select
                  value={currentEditPost.district}
                  onChange={(e) => setCurrentEditPost({ ...currentEditPost, district: e.target.value })}
                  className='w-full p-2 border border-gray-400 rounded-md'
                >
                  <option value="">Select District</option>
                  {(stateDistrictMap[currentEditPost.state] || []).map((district, index) => (
                    <option key={index} value={district}>{district}</option>
                  ))}
                </select>
              </label>
              <label>
                Cultural Context:
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentEditPost.culturalContext}
                  onChange={(e) => setCurrentEditPost({ ...currentEditPost, culturalContext: parseFloat(e.target.value) })}
                  className="w-full accent-gray-300"
                />
                <span>{currentEditPost.culturalContext}</span>
              </label>
            </div>
            <div className='flex justify-end gap-4 mt-4'>
              <button
                className='bg-green-500 text-white p-2 rounded-md'
                onClick={editPost}
              >
                Save
              </button>
              <button
                className='bg-red-500 text-white p-2 rounded-md'
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeoTargetMessaging;
