import React, { useState, useEffect } from 'react';
import { apiClient } from './config/api';

const VendorMenu = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendorMenu = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/api/food/vendor/menu');
        setFoods(res.data.foodItems || []);
        setError('');
      } catch (err) {
        console.error('Error fetching vendor menu:', err);
        setError(err.response?.data?.message || 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    fetchVendorMenu();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-lime-50 to-lime-100 flex items-center justify-center">
        <p className="text-lg font-semibold text-lime-700">Loading your menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-lime-50 to-lime-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-lime-700 mb-2">
            Your Menu
          </h1>
          <p className="text-gray-600">Manage your food items</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Menu Grid */}
        {foods.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-lg mb-4">
              You haven't added any food items yet.
            </p>
            <p className="text-gray-500">
              Go back to your dashboard and click "Add Dish" to create your first menu item!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <div key={food._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                {/* Food Image */}
                {food.image && (
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                {/* Food Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-lime-700 mb-2">
                    {food.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {food.description || 'No description provided'}
                  </p>
                  
                  {/* Price */}
                  {food.price && (
                    <p className="text-xl font-bold text-lime-700 mb-3">
                      ₹{food.price}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-lime-700 text-white px-3 py-2 rounded-md hover:bg-lime-800 transition text-sm">
                      Edit
                    </button>
                    <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 transition text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMenu;
