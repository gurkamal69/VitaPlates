import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Profile.css';
import DefaultProfile from '/DefaultProfile.jpg';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    height: '',
    weight: '',
    target: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Updating profile with:", { ...formData, profilePic });
    alert("Profile updated successfully!");
    handleCancel();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      username: '',
      age: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
      height: '',
      weight: '',
      target: '',
    });
    setProfilePic(null);
    setPreview(null);
  };

  return (
    <div className="profile-profile-container">
      <h2 className="profile-profile-title">Edit Profile</h2>
      <div className="profile-profile-pic-section">
        <div className="profile-profile-pic-preview">
          {preview ? (
            <img src={preview} alt="Profile Preview" className="profile-profile-pic" />
          ) : (
            <img src={DefaultProfile} alt="Default Profile" className="profile-profile-pic" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="profile-profile-pic-input"
          id="profile-pic"
        />
        <label htmlFor="profile-pic" className="btn">
          Upload Picture
        </label>
      </div>
      <div className="profile-profile-form">
        <div className="profile-form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="profile-form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="profile-form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>
        <div className="profile-form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="profile-form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="profile-form-group">
          <label htmlFor="height">Height (cm)</label>
          <input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>
        <div className="profile-form-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>
        <div className="profile-form-group">
          <label htmlFor="target">Fitness Goal</label>
          <select
            id="target"
            name="target"
            value={formData.target}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Goal</option>
            <option value="gain">Gain Weight</option>
            <option value="loss">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
          </select>
        </div>
        <div className="profile-form-buttons">
          <button type="button" onClick={handleUpdate} className="btn">
            Update
          </button>
          <button type="button" onClick={handleCancel} className="btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;