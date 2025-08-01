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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const handleStateChange = (value) => {
    setSelectedState(value);
    setDistricts(stateDistrictMap[value] || []);
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
  };

  const handlePostTypeChange = (value) => {
    setPostType(value);
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
        culturalContext,
        images,
        userId: user.uid,
        timestamp: new Date(),
      };

      await addDoc(collection(db, "posts"), postData);

      setPostMessage("");
      setSelectedState("");
      setSelectedDistrict("");
      setImages([]);
      setPostType("Info");
      setCulturalContext(0.5);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const editPost = async () => {
    if (!currentEditPost) return;

    setLoading(true);

    try {
      const translations = await translatePost(currentEditPost.message);

      await updateDoc(doc(db, "posts", currentEditPost.id), {
        message: currentEditPost.message,
        translations,
        state: currentEditPost.state,
        district: currentEditPost.district,
        culturalContext: currentEditPost.culturalContext,
      });

      setIsEditModalOpen(false);
      setCurrentEditPost(null);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error updating post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", postId));
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Error deleting post. Please try again.");
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (postView === 0 && user) {
      fetchPosts();
    }
  }, [postView, user]);

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
    <div className="space-y-6">
      <Tabs value={postView.toString()} onValueChange={(value) => setPostView(parseInt(value))} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="0">Your Posts</TabsTrigger>
          <TabsTrigger value="1">Create Post</TabsTrigger>
        </TabsList>
        
        <TabsContent value="0" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-blue-800">Your Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No posts found. Create your first post!</p>
                    </div>
                  ) : (
                    posts.map(post => {
                      const date = new Date(post.timestamp.seconds * 1000);
                      const formattedDate = date.toLocaleString();

                      return (
                        <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
                          {post.images && post.images.length > 0 && (
                            <div className="p-4 pb-0">
                              {post.images.map((image, index) => (
                                <img 
                                  key={index} 
                                  src={image} 
                                  alt={`Image ${index}`} 
                                  className="w-full h-auto rounded-lg mb-2 object-cover" 
                                />
                              ))}
                            </div>
                          )}
                          
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(post.type)}
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 font-medium">
                                    {post.state}-{post.district}
                                  </span>
                                  {getTypeBadge(post.type)}
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">{formattedDate}</span>
                            </div>
                            
                            <Separator className="mb-3" />
                            
                            <p className="text-gray-800 leading-relaxed mb-4">{post.message}</p>
                            
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCurrentEditPost(post);
                                  setIsEditModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <FaEdit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deletePost(post.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <MdDelete className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-blue-800">Create Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="postMessage" className="text-sm font-medium text-gray-700">Post Message</Label>
                <Textarea
                  id="postMessage"
                  placeholder="Your post message..."
                  value={postMessage}
                  onChange={handlePostMessageChange}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Cultural Context: {culturalContext}
                </Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={culturalContext}
                  onChange={handleCulturalContextChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postType" className="text-sm font-medium text-gray-700">Post Type</Label>
                  <Select value={postType} onValueChange={handlePostTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Info">Info</SelectItem>
                      <SelectItem value="Alert">Alert</SelectItem>
                      <SelectItem value="Danger">Danger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                  <Select value={selectedState} onValueChange={handleStateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(stateDistrictMap).map((state, index) => (
                        <SelectItem key={index} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-medium text-gray-700">District</Label>
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={!selectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district, index) => (
                        <SelectItem key={index} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images" className="text-sm font-medium text-gray-700">Images (Optional)</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
              </div>

              <Button
                onClick={createPost}
                disabled={loading || !postMessage.trim() || !selectedState || !selectedDistrict}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <IoMdSend className="mr-2 h-4 w-4" />
                    Create Post
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editMessage" className="text-sm font-medium text-gray-700">Message</Label>
              <Textarea
                id="editMessage"
                value={currentEditPost?.message || ""}
                onChange={(e) => setCurrentEditPost({ ...currentEditPost, message: e.target.value })}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editState" className="text-sm font-medium text-gray-700">State</Label>
                <Select 
                  value={currentEditPost?.state || ""} 
                  onValueChange={(value) => setCurrentEditPost({ ...currentEditPost, state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(stateDistrictMap).map((state, index) => (
                      <SelectItem key={index} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDistrict" className="text-sm font-medium text-gray-700">District</Label>
                <Select 
                  value={currentEditPost?.district || ""} 
                  onValueChange={(value) => setCurrentEditPost({ ...currentEditPost, district: value })}
                  disabled={!currentEditPost?.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {(stateDistrictMap[currentEditPost?.state] || []).map((district, index) => (
                      <SelectItem key={index} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Cultural Context: {currentEditPost?.culturalContext || 0.5}
              </Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentEditPost?.culturalContext || 0.5}
                onChange={(e) => setCurrentEditPost({ ...currentEditPost, culturalContext: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editPost} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GeoTargetMessaging;
