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
  Star,
  CheckCircle2,
  Clock,
  Wrench,
  Camera,
  Edit3,
  Save,
  Loader2,
  Award,
  TrendingUp,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { loadCurrentUser, setCurrentUser, normalizeMediaUrl } from "@/lib/auth";
import { repairAlertsApi, profileApi } from "@/lib/repairAlertsApi";
import { toast } from "sonner";

// Star Rating Display
function StarRating({ rating, size = "md" }) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-neutral-700 text-neutral-700"
          }`}
        />
      ))}
    </div>
  );
}

// Stats Card
function StatCard({ icon: Icon, label, value, color = "orange" }) {
  const colorClasses = {
    orange: "bg-orange-500/20 text-orange-400",
    green: "bg-green-500/20 text-green-400",
    blue: "bg-blue-500/20 text-blue-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
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
      setPhotoUrl(result.path || result.url);
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
                    src={normalizeMediaUrl(photoUrl)}
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
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-700 flex items-center justify-center transition-colors"
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
            className="flex-1 bg-orange-600 hover:bg-orange-700"
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

// Main Profile Popover - Works for both Technician and Engineer
export function TechnicianProfilePopover({ className = "" }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const currentUser = loadCurrentUser();
    setUser(currentUser);

    // Fetch stats based on role
    const role = currentUser?.role?.toLowerCase();
    if (role === "technician") {
      fetchTechnicianStats(currentUser);
    } else if (role === "engineer") {
      fetchEngineerStats(currentUser);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTechnicianStats = async (currentUser) => {
    try {
      const { alerts } = await repairAlertsApi.getAll("resolved");
      const myResolved = alerts.filter(a => a.technicianEmail === currentUser.email);
      
      const { alerts: inProgressAlerts } = await repairAlertsApi.getAll("in-progress");
      const myInProgress = inProgressAlerts.filter(a => a.technicianEmail === currentUser.email);

      const ratings = myResolved.filter(a => a.rating).map(a => a.rating);
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;

      setStats({
        type: "technician",
        problemsSolved: myResolved.length,
        problemsInProgress: myInProgress.length,
        totalAccepted: myResolved.length + myInProgress.length,
        averageRating: avgRating,
        totalRatings: ratings.length,
        ratingBreakdown: {
          5: ratings.filter(r => r === 5).length,
          4: ratings.filter(r => r === 4).length,
          3: ratings.filter(r => r === 3).length,
          2: ratings.filter(r => r === 2).length,
          1: ratings.filter(r => r === 1).length,
        },
        recentActivity: myResolved.slice(0, 5),
      });
    } catch (err) {
      console.error("Failed to fetch technician stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngineerStats = async (currentUser) => {
    try {
      const { alerts: resolved } = await repairAlertsApi.getAll("resolved");
      const { alerts: inProgress } = await repairAlertsApi.getAll("in-progress");
      const { alerts: pending } = await repairAlertsApi.getAll("pending");

      // Filter alerts created by this engineer
      const myResolved = resolved.filter(a => a.engineerEmail === currentUser.email);
      const myInProgress = inProgress.filter(a => a.engineerEmail === currentUser.email);
      const myPending = pending.filter(a => a.engineerEmail === currentUser.email);

      setStats({
        type: "engineer",
        issuesReported: myResolved.length + myInProgress.length + myPending.length,
        issuesResolved: myResolved.length,
        issuesPending: myPending.length,
        issuesInProgress: myInProgress.length,
      });
    } catch (err) {
      console.error("Failed to fetch engineer stats:", err);
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
  const displayName = user?.fullName || user?.email || "User";
  const isTechnician = user?.role?.toLowerCase() === "technician";
  const isEngineer = user?.role?.toLowerCase() === "engineer";

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className={`flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer ${className}`}>
            <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden">
              {showPhoto ? (
                <img
                  src={normalizeMediaUrl(photoUrl)}
                  alt="User"
                  className="h-full w-full rounded-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <User className="h-5 w-5 text-neutral-200" />
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
              <div className="w-14 h-14 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center overflow-hidden">
                {showPhoto ? (
                  <img
                    src={normalizeMediaUrl(photoUrl)}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-7 h-7 text-neutral-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{displayName}</h3>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    isTechnician 
                      ? "bg-orange-500/20 text-orange-400" 
                      : isEngineer 
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-neutral-500/20 text-neutral-400"
                  }`}>
                    {user?.role || "User"}
                  </span>
                  {stats?.averageRating && (
                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {stats.averageRating}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section (Technician) */}
          {isTechnician && stats?.type === "technician" && (
            <div className="p-4 border-b border-neutral-800">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                </div>
              ) : stats ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard
                      icon={CheckCircle2}
                      label="Solved"
                      value={stats.problemsSolved}
                      color="green"
                    />
                    <StatCard
                      icon={Clock}
                      label="In Progress"
                      value={stats.problemsInProgress}
                      color="blue"
                    />
                  </div>

                  {/* Rating Display */}
                  <div className="bg-neutral-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-400">Rating</span>
                      {stats.averageRating ? (
                        <div className="flex items-center gap-2">
                          <StarRating rating={Math.round(stats.averageRating)} size="sm" />
                          <span className="text-sm font-semibold text-white">
                            {stats.averageRating}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-500">No ratings yet</span>
                      )}
                    </div>
                    {stats.averageRating ? (
                      <>
                        <p className="text-xs text-neutral-500">
                          Based on {stats.totalRatings} review{stats.totalRatings !== 1 ? "s" : ""}
                        </p>
                        
                        {/* Rating Breakdown */}
                        <div className="mt-2 space-y-1">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = stats.ratingBreakdown[star] || 0;
                            const percentage = stats.totalRatings > 0
                              ? (count / stats.totalRatings) * 100
                              : 0;
                            return (
                              <div key={star} className="flex items-center gap-2 text-xs">
                                <span className="w-3 text-neutral-500">{star}</span>
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-yellow-400 rounded-full"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="w-6 text-right text-neutral-500">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-neutral-500">
                        Complete repairs to receive ratings from engineers
                      </p>
                    )}
                  </div>

                  {/* Achievements/Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {stats.problemsSolved >= 10 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                        <Award className="w-3 h-3" />
                        Pro Fixer
                      </div>
                    )}
                    {stats.averageRating >= 4.5 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        Top Rated
                      </div>
                    )}
                    {stats.problemsSolved >= 5 && stats.problemsSolved < 10 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        Rising Star
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-neutral-500 text-sm py-2">
                  No stats available yet
                </p>
              )}
            </div>
          )}

          {/* Stats Section (Engineer) */}
          {isEngineer && stats?.type === "engineer" && (
            <div className="p-4 border-b border-neutral-800">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                </div>
              ) : stats ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard
                      icon={AlertTriangle}
                      label="Total Reported"
                      value={stats.issuesReported}
                      color="orange"
                    />
                    <StatCard
                      icon={CheckCircle2}
                      label="Resolved"
                      value={stats.issuesResolved}
                      color="green"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard
                      icon={Clock}
                      label="In Progress"
                      value={stats.issuesInProgress}
                      color="blue"
                    />
                    <StatCard
                      icon={Wrench}
                      label="Pending"
                      value={stats.issuesPending}
                      color="yellow"
                    />
                  </div>

                  {/* Engineer Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {stats.issuesReported >= 10 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Active Reporter
                      </div>
                    )}
                    {stats.issuesResolved >= 5 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        Problem Solver
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-neutral-500 text-sm py-2">
                  No stats available yet
                </p>
              )}
            </div>
          )}

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

// Also export as UserProfilePopover for more generic usage
export { TechnicianProfilePopover as UserProfilePopover };
export default TechnicianProfilePopover;
