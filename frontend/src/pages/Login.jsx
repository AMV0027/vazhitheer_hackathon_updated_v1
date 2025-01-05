import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'

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
    <div className="flex items-center justify-center min-h-screen bg-yellow-500">
      {isRegister ? (
        <form
          onSubmit={handleRegisterSubmit}
          className="w-full max-w-md p-8 border rounded-lg shadow-lg bg-white border-yellow-400 mb-24 mt-12"
        >
          <img src={logo} className='h-44 mx-auto' />
          <h2 className="text-2xl font-bold text-center text-yellow-800 mb-6">IndiSafe Registration</h2>

          <label className="block text-yellow-800">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full  text-yellow-800 p-1 border border-yellow-400 rounded-md focus:ring focus:ring-yellow-300"
          />

          <label className="block text-yellow-800 mt-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full text-yellow-800 p-1 border border-yellow-400 rounded-md focus:ring focus:ring-yellow-300"
          />

          <label className="block text-yellow-800 mt-2">Mobile Number</label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            required
            className="w-full text-yellow-800 p-1 border border-yellow-400 rounded-md focus:ring focus:ring-yellow-300"
          />

          <label className="block text-yellow-800 mt-2">State</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            required
            className="w-full text-yellow-800 p-1 border border-yellow-400 rounded-md focus:ring focus:ring-yellow-300"
          >
            <option value="" disabled>Select your state</option>
            {states.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <label className="block text-yellow-800 mt-2">Preferred Language</label>
          <select
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleInputChange}
            required
            className="w-full text-yellow-800 p-1 border border-yellow-400 rounded-md focus:ring focus:ring-yellow-300"
          >
            <option value="" disabled>Select your language</option>
            {Object.entries(languages).map(([language, code]) => (
              <option key={code} value={language}>{language}</option>
            ))}
          </select>

          <label className="block text-yellow-800 mt-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full text-yellow-800 p-1 border border-yellow-400 rounded-md focus:ring focus:ring-yellow-300"
          />

          <button
            type="submit"
            className="w-full py-2 font-bold text-white bg-gradient-to-r from-yellow-800 via-yellow-500 to-yellow-800 rounded-md mt-4"
          >
            Register
          </button>
          <p className="text-center text-yellow-800">
            Already have an account? <button onClick={() => setIsRegister(false)} className="text-yellow-800 underline">Login</button>
          </p>
        </form>
      ) : (
        <form
          onSubmit={handleLoginSubmit}
          className="w-full max-w-md p-8 space-y-4 border rounded-lg shadow-lg bg-white border-yellow-400"
        >
          <img src={logo} className='h-44 mx-auto' />
          <h2 className="text-2xl font-bold text-center text-yellow-800">IndiSafe Login</h2>

          <label className="block text-yellow-800">Email</label>
          <input
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleLoginInputChange}
            required
            className="w-full text-yellow-800 p-1 border border-yellow-400 rounded-md focus:ring focus:ring-yellow-300"
          />

          <label className="block text-yellow-800">Password</label>
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleLoginInputChange}
            required
            className="w-full text-yellow-800 p-1 border border-yellow-400 rounded-md focus:ring focus:ring-yellow-300"
          />

          <button
            type="submit"
            className="w-full py-2 font-bold text-white bg-gradient-to-r from-yellow-800 via-yellow-500 to-yellow-800 rounded-md"
          >
            Login
          </button>
          <p className="text-center text-yellow-500  mt-4">
            Don't have an account? <button onClick={() => setIsRegister(true)} className="text-yellow-500 underline">Register</button>
          </p>
        </form>
      )}
    </div>
  );
};

export default Login;
