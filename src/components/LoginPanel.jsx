import React, { useState, useEffect } from 'react';
import '../styles/LoginPanel.css';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from '../API_LoginAndOtherFiles/Firebase';
import { FacebookAuthProvider } from 'firebase/auth';
import { updateProfile } from "firebase/auth";

const LoginPanel = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [signUpError, setSignUpError] = useState('');
  const [signInError, setSignInError] = useState('');
  const [user, setUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(true);

  const handleSignUpClick = () => {
    setIsRightPanelActive(true);
    setSignUpError('');
    setSignInError('');
  };

  const handleSignInClick = () => {
    setIsRightPanelActive(false);
    setSignUpError('');
    setSignInError('');
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('Successfully signed in with Google');
      setIsModalVisible(false);
    } catch (error) {
      setSignInError(error.message);
      console.error('Google Sign-In Error:', error);
    }
  };

  const handleFacebookSignIn = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('Successfully signed in with Facebook');
      setIsModalVisible(false);
    } catch (error) {
      setSignInError(error.message);
      console.error('Facebook Sign-In Error:', error);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      console.log('Successfully signed up with email:', email);
      setIsModalVisible(false);
    } catch (error) {
      setSignUpError(error.message);
      console.error('Sign-Up Error:', error);
    }
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Successfully signed in with email:', email);
      setIsModalVisible(false);
    } catch (error) {
      setSignInError(error.message);
      console.error('Sign-In Error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsModalVisible(true);
      setSignUpError('');
      setSignInError('');
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Sign-Out Error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed. Current user:', currentUser ? currentUser.email : 'null');
      setUser(currentUser);
      setIsModalVisible(!currentUser); // Show modal if no user, hide if authenticated
    });
    return () => unsubscribe();
  }, []);

  if (!isModalVisible && user) {
    return (
      <div className="LoginPanel-user-profile-container">
        <img
          src={user.photoURL || '/DefaultProfile.jpg'}
          alt="User"
          className="LoginPanel-user-profile-image"
          onError={() => console.error('Failed to load profile image for:', user.email)}
        />
        <p>Welcome, {user.displayName || user.email}!</p>
        <button
          className="LoginPanel-signout-button"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="LoginPanel-app-container">
      <div
        className={`LoginPanel-container ${
          isRightPanelActive ? 'right-panel-active' : ''
        }`}
      >
        {/* Sign-Up Form */}
        <div className="LoginPanel-form-container LoginPanel-sign-up-container">
          <form className="LoginPanel-form" onSubmit={handleSignUpSubmit}>
            <h1 className="LoginPanel-form-title">Create Account</h1>
            <div className="LoginPanel-social-container">
              <a
                href="#"
                className="LoginPanel-social LoginPanel-social-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleFacebookSignIn();
                }}
              >
                <i className="fab fa-facebook-f LoginPanel-social-icon"></i>
              </a>
              <a
                href="#"
                className="LoginPanel-social LoginPanel-social-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoogleSignIn();
                }}
              >
                <i className="fab fa-google-plus-g LoginPanel-social-icon"></i>
              </a>
            </div>
            <span className="LoginPanel-form-subtitle">
              or use your email for registration
            </span>
            <input type="text" className="LoginPanel-input-field" placeholder="Name" required />
            <input type="email" className="LoginPanel-input-field" placeholder="Email" required />
            <input type="password" className="LoginPanel-input-field" placeholder="Password" required />
            {signUpError && (
              <p className="LoginPanel-error">{signUpError}</p>
            )}
            <button type="submit" className="LoginPanel-submit-button">
              Sign Up
            </button>
          </form>
        </div>

        {/* Sign-In Form */}
        <div className="LoginPanel-form-container LoginPanel-sign-in-container">
          <form className="LoginPanel-form" onSubmit={handleSignInSubmit}>
            <h1 className="LoginPanel-form-title">Sign in</h1>
            <div className="LoginPanel-social-container">
              <a
                href="#"
                className="LoginPanel-social LoginPanel-social-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleFacebookSignIn();
                }}
              >
                <i className="fab fa-facebook-f LoginPanel-social-icon"></i>
              </a>
              <a
                href="#"
                className="LoginPanel-social LoginPanel-social-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoogleSignIn();
                }}
              >
                <i className="fab fa-google-plus-g LoginPanel-social-icon"></i>
              </a>
            </div>
            <span className="LoginPanel-form-subtitle">
              or use your account
            </span>
            <input type="email" className="LoginPanel-input-field" placeholder="Email" required />
            <input type="password" className="LoginPanel-input-field" placeholder="Password" required />
            {signInError && (
              <p className="LoginPanel-error">{signInError}</p>
            )}
            <button type="submit" className="LoginPanel-submit-button">
              Sign In
            </button>
          </form>
        </div>

        {/* Overlay Panels */}
        <div className="LoginPanel-overlay-container">
          <div className="LoginPanel-overlay">
            <div className="LoginPanel-overlay-panel LoginPanel-overlay-left">
              <h1 className="LoginPanel-overlay-title">Welcome Back!</h1>
              <p className="LoginPanel-overlay-text">
                To keep connected with us please login with your personal info
              </p>
              <button
                className="LoginPanel-ghost LoginPanel-overlay-button"
                onClick={handleSignInClick}
              >
                Sign In
              </button>
            </div>
            <div className="LoginPanel-overlay-panel LoginPanel-overlay-right">
              <h1 className="LoginPanel-overlay-title">Hello, Friend!</h1>
              <p className="LoginPanel-overlay-text">
                Enter your personal details and start your journey with us
              </p>
              <button
                className="LoginPanel-ghost LoginPanel-overlay-button"
                onClick={handleSignUpClick}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Display */}
        {user && (
          <div className="LoginPanel-user-profile-container">
            <img
              src={user.photoURL || '/DefaultProfile.jpg'}
              alt="User"
              className="LoginPanel-user-profile-image"
              onError={() => console.error('Failed to load profile image for:', user.email)}
            />
            <p>Welcome, {user.displayName || user.email}!</p>
            <button
              className="LoginPanel-signout-button"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPanel;