import React, { useState } from "react";
import { apiClient } from './config/api';

const AddFood = () => {
  const [foodName, setFoodName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // FormData for backend submission
    const formData = new FormData();
    formData.append("foodName", foodName);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", image);
    setLoading(true);
    setMessage('');
    apiClient.post('/api/food/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
      setMessage('Food added successfully');
      setFoodName('');
      setDescription('');
      setPrice('');
      setImage(null);
    }).catch(err => {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to add food');
    }).finally(()=> setLoading(false));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-green-50"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md border border-green-200"
      >
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          Add New Food Item
        </h2>

        {/* Food Name */}
        <label className="block mb-2 text-green-700">Food Name</label>
        <input
          type="text"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          className="w-full p-2 mb-4 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Enter food name"
          required
        />

        {/* Food Description */}
        <label className="block mb-2 text-green-700">Food Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 border border-green-300 rounded h-24 focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Enter description"
          required
        ></textarea>

        {/* Food Price */}
        <label className="block mb-2 text-green-700">Food Price (₹)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 mb-4 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Enter price"
          required
        />

        {/* Food Image Upload */}
        <label className="block mb-2 text-green-700">Upload Food Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full p-2 mb-4 border border-green-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Food'}
        </button>
        {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
      </form>
    </div>
  );
};

export default AddFood;
