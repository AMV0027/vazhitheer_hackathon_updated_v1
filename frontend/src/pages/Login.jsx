import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

const states = [
  'AndhraPradesh',
  'ArunachalPradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'HimachalPradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'MadhyaPradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'TamilNadu',
  'Telangana',
  'Tripura',
  'UttarPradesh',
  'Uttarakhand',
  'WestBengal',
  'Andaman_and_Nicobar_Islands',
  'Chandigarh',
  'Delhi',
  'Jammu_and_Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    state: '',
    preferredLanguage: '',
    password: '',
  });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isRegister, setIsRegister] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/home'); // Redirect to home after login
      }
    });
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const db = getFirestore();

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Store additional user details in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        state: formData.state,
        preferredLanguage: formData.preferredLanguage,
        createdAt: new Date(),
      });

      alert('User registered successfully!');
      setFormData({ username: '', email: '', mobile: '', state: '', preferredLanguage: '', password: '' });
    } catch (error) {
      console.error('Error registering user:', error);
      alert(error.message);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
    } catch (error) {
      console.error('Error logging in:', error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="IndiSafe Logo" className="h-32 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-800">
            {isRegister ? 'IndiSafe Registration' : 'IndiSafe Login'}
          </CardTitle>
          <CardDescription className="text-yellow-600">
            {isRegister ? 'Create your account to get started' : 'Welcome back! Please sign in'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isRegister ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-yellow-800 font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-yellow-800 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-yellow-800 font-medium">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Enter your mobile number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-yellow-800 font-medium">State</Label>
                <Select name="state" value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                  <SelectTrigger className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredLanguage" className="text-yellow-800 font-medium">Preferred Language</Label>
                <Select name="preferredLanguage" value={formData.preferredLanguage} onValueChange={(value) => setFormData({...formData, preferredLanguage: value})}>
                  <SelectTrigger className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500">
                    <SelectValue placeholder="Select your language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languages).map(([language, code]) => (
                      <SelectItem key={code} value={language}>{language}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-yellow-800 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold py-3">
                Register
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-yellow-800 font-medium">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  required
                  className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-yellow-800 font-medium">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  required
                  className="border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold py-3">
                Login
              </Button>
            </form>
          )}

          <Separator className="my-6" />
          
          <div className="text-center">
            <p className="text-yellow-700 text-sm">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              <Button
                variant="link"
                onClick={() => setIsRegister(!isRegister)}
                className="text-yellow-800 hover:text-yellow-900 font-medium p-0 ml-1"
              >
                {isRegister ? 'Login' : 'Register'}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
