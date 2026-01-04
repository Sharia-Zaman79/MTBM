import { useMemo } from "react";
import { User } from "lucide-react";
import { loadCurrentUser } from "@/lib/auth";

const getDisplayName = (user) => {
  const fullName = (user?.fullName ?? "").trim();
  if (fullName) return fullName;

  const email = (user?.email ?? "").trim();
  if (email) return email;

  return "User";
};

const UserBadge = ({ className = "" }) => {
  const user = useMemo(() => {
    if (typeof window === "undefined") return null;
    return loadCurrentUser();
  }, []);

  const displayName = getDisplayName(user);

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
        <User className="h-5 w-5 text-neutral-200" />
      </div>
      <div className="max-w-[180px] truncate text-sm font-semibold text-white">
        {displayName}
      </div>
    </div>
  );
};

export default UserBadge;
