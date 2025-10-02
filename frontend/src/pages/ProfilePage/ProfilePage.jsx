import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Loader2, User, Mail, Phone, MapPin, Building2 } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import InputField from "../../components/ui/InputField";
import TextField from "../../components/ui/TextareaField";

const ProfilePage = () => {
  const { user, loading, updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || "",
        businessName: user?.businessName || "",
        address: user?.address || "",
        phone: user?.phone || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        formData
      );
      console.log(response);
      updateUser(response.data);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 text-sm">
          Manage your personal and business information
        </p>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleUpdateProfile}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
      >
        {/* Email (Read-only) */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={user?.email || ""}
            readOnly
            disabled
            className="w-full mt-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Name */}
        <InputField
          label="Name"
          name="name"
          icon={User}
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your name"
        />

        {/* Business Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Business Information
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            This information will be used to pre-fill the "Bill From" section of
            your invoices.
          </p>
          <div className="space-y-4">
            <InputField
              label="Business Name"
              name="businessName"
              icon={Building2}
              value={formData.businessName}
              onChange={handleInputChange}
              placeholder="Enter your business name"
            />
            <TextField
              label="Address"
              name="address"
              icon={MapPin}
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your business address"
            />
            <InputField
              label="Phone"
              name="phone"
              icon={Phone}
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your business phone number"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
