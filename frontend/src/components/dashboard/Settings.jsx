import { useState, useEffect } from "react";
import { fetchProfile, updateProfile, changePassword } from "../../api/api";
import { FaUser, FaLock, FaSpinner } from "react-icons/fa";

export default function Settings() {
  const [profile, setProfile] = useState({ username: "", email: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfile({ username: data.username, email: data.email });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);
    try {
      await updateProfile(profile);
      setProfileSuccess("Profile updated.");
    } catch (err) {
      setProfileError(err.detail || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwords.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPasswordSuccess("Password updated.");
      setPasswords({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setPasswordError(
        err.current_password?.[0] || err.detail || "Failed to update password.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col bg-secondary dark:bg-black min-h-full">
      <div className="flex justify-between items-center py-3 px-4 sm:px-8 bg-secondary dark:bg-gray-800 shadow-md sticky top-0 z-10 shrink-0">
        <h1 className="font-medium text-xl text-logo dark:text-white font-poppins">
          Settings
        </h1>
      </div>

      <div className="flex-1 p-4 sm:p-6 flex flex-col gap-6 max-w-xl">
        {/* Profile section */}
        <div className="bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-md p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-logo dark:text-white mb-4">
            <FaUser className="text-accent" size={14} />
            Profile
          </h2>

          {loadingProfile ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <form
              onSubmit={handleProfileSubmit}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-400">
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  required
                  className="border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent bg-transparent text-logo dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-400">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  required
                  className="border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent bg-transparent text-logo dark:text-white"
                />
              </div>

              {profileError && (
                <p className="text-red-500 text-xs">{profileError}</p>
              )}
              {profileSuccess && (
                <p className="text-green-500 text-xs">{profileSuccess}</p>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="self-start flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                {savingProfile && (
                  <FaSpinner className="animate-spin" size={12} />
                )}
                Save changes
              </button>
            </form>
          )}
        </div>

        {/* Password section */}
        <div className="bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-md p-4 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-logo dark:text-white mb-4">
            <FaLock className="text-accent" size={14} />
            Change password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">
                Current password
              </label>
              <input
                type="password"
                value={passwords.current_password}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    current_password: e.target.value,
                  })
                }
                required
                className="border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent bg-transparent text-logo dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">
                New password
              </label>
              <input
                type="password"
                value={passwords.new_password}
                onChange={(e) =>
                  setPasswords({ ...passwords, new_password: e.target.value })
                }
                required
                minLength={8}
                className="border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent bg-transparent text-logo dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">
                Confirm new password
              </label>
              <input
                type="password"
                value={passwords.confirm_password}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirm_password: e.target.value,
                  })
                }
                required
                minLength={8}
                className="border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent bg-transparent text-logo dark:text-white"
              />
            </div>

            {passwordError && (
              <p className="text-red-500 text-xs">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-500 text-xs">{passwordSuccess}</p>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="self-start flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              {savingPassword && (
                <FaSpinner className="animate-spin" size={12} />
              )}
              Update password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}