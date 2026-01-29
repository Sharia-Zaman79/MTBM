import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  User,
  X,
  Camera,
  Edit3,
  Save,
  Loader2,
  ChevronRight,
  Shield,
  Users,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { loadCurrentUser, setCurrentUser } from "@/lib/auth";
import { profileApi } from "@/lib/repairAlertsApi";
import { adminApi } from "@/lib/adminApi";
import { toast } from "sonner";

// Stats Card for Admin
function StatCard({ icon: Icon, label, value, color = "orange" }) {
  const colorClasses = {
    orange: "bg-orange-500/20 text-orange-400",
    green: "bg-green-500/20 text-green-400",
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
  };

  return (
    <div className="bg-neutral-800/50 rounded-lg p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-neutral-400">{label}</p>
      </div>
    </div>
  );
}

// Edit Profile Modal
function EditProfileModal({ isOpen, onClose, user, onSave }) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.fullName || "");
      setPhotoUrl(user?.photoUrl || "");
    }
  }, [isOpen, user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setUploading(true);
    try {
      const result = await profileApi.uploadPhoto(file);
      setPhotoUrl(result.url);
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error("Failed to upload photo: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const result = await profileApi.updateProfile({
        fullName: fullName.trim(),
        photoUrl,
      });
      
      // Update local storage
      const currentUser = loadCurrentUser();
      const updatedUser = { ...currentUser, ...result.user };
      setCurrentUser(updatedUser);
      
      toast.success("Profile updated!");
      onSave(result.user);
      onClose();
    } catch (err) {
      toast.error("Failed to update: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
      <div className="bg-neutral-900 rounded-xl w-full max-w-md mx-4 border border-neutral-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-5 space-y-5">
          {/* Photo */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-neutral-500" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Click camera to change photo</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="bg-neutral-800 border-neutral-700 text-white"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email
            </label>
            <Input
              value={user?.email || ""}
              disabled
              className="bg-neutral-800/50 border-neutral-700 text-neutral-400"
            />
            <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-neutral-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Admin Profile Popover
export function AdminProfilePopover({ className = "" }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const currentUser = loadCurrentUser();
    setUser(currentUser);
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const data = await adminApi.getOverviewStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
    setImgError(false);
  };

  const photoUrl = user?.photoUrl || "";
  const showPhoto = Boolean(photoUrl) && !imgError;
  const displayName = user?.fullName || user?.email || "Admin";

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className={`flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer ${className}`}>
            <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-800 border border-purple-500/50 flex items-center justify-center overflow-hidden">
              {showPhoto ? (
                <img
                  src={photoUrl}
                  alt="Admin"
                  className="h-full w-full rounded-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Shield className="h-5 w-5 text-purple-400" />
              )}
            </div>
            <div className="max-w-[180px] truncate text-sm font-semibold text-white">
              {displayName}
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-0 bg-neutral-900 border-neutral-800"
          align="end"
          sideOffset={8}
        >
          {/* Profile Header */}
          <div className="p-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-neutral-800 border-2 border-purple-500/50 flex items-center justify-center overflow-hidden">
                {showPhoto ? (
                  <img
                    src={photoUrl}
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Shield className="w-7 h-7 text-purple-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{displayName}</h3>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-medium capitalize">
                    {user?.role || "Admin"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="p-4 border-b border-neutral-800">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-2">
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={(stats.totalEngineers || 0) + (stats.totalTechnicians || 0)}
                  color="blue"
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Total Alerts"
                  value={stats.totalAlerts || 0}
                  color="orange"
                />
              </div>
            ) : (
              <p className="text-center text-neutral-500 text-sm py-2">
                No stats available
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-left"
            >
              <Edit3 className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-200">Edit Profile</span>
              <ChevronRight className="w-4 h-4 text-neutral-600 ml-auto" />
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={handleProfileUpdate}
      />
    </>
  );
}

export default AdminProfilePopover;
