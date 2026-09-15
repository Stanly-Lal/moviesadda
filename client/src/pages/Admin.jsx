import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaDownload,
} from "react-icons/fa";

import { request } from "../services/api";

import Header from "../components/Header.jsx";

import { useAuth } from "../context/AuthContext";

// ============================================================
// STATE LIST FOR USER
// ============================================================

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
  "Foreign User",
];

// ============================================================
// EMPTY VIDEO
// ============================================================

const emptyVideo = {
  title: "",
  posterUrl: "",
  videoUrl: "",

  downloadable: false,

  downloadOnly: false,

  downloadType: "direct",

  downloadUrl: "",
};

// ============================================================
// EMPTY USER
// ============================================================

const emptyUser = {
  firstName: "",
  lastName: "",
  email: "",
  state: "",
  password: "",
  role: "user",
};

export default function Admin() {
  const nav = useNavigate();

  const { logout } = useAuth();

  // ==========================================================
  // VIDEO STATES
  // ==========================================================

  const [items, setItems] = useState([]);

  const [videoSearch, setVideoSearch] = useState("");

  const [form, setForm] = useState(emptyVideo);

  const [edit, setEdit] = useState(null);

  // ==========================================================
  // TOAST STATES
  // ==========================================================

  const [msg, setMsg] = useState("");

  const [error, setError] = useState("");

  // ==========================================================
  // ADMIN STATES
  // ==========================================================

  const [admins, setAdmins] = useState([]);

  const [adminEmail, setAdminEmail] = useState("");

  const [adminPassword, setAdminPassword] = useState("");

  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // ==========================================================
  // USER MANAGEMENT STATES
  // ==========================================================

  const [users, setUsers] = useState([]);

  const [userSearch, setUserSearch] = useState("");

  const [userForm, setUserForm] = useState(emptyUser);

  const [editingUser, setEditingUser] = useState(null);

  const [showUserPassword, setShowUserPassword] = useState(false);

  const [userFormOpen, setUserFormOpen] = useState(false);

  // ==========================================================
  // CURRENT PASSWORD STATES
  // ==========================================================

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  // ==========================================================
  // PASSWORD VISIBILITY
  // ==========================================================

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================================
  // AUTO HIDE TOAST
  // ==========================================================

  useEffect(() => {
    if (!msg && !error) {
      return;
    }

    const timer = setTimeout(() => {
      setMsg("");
      setError("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [msg, error]);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  async function load() {
    try {
      const videos = await request("/api/videos/admin?limit=24");

      const adminData = await request("/api/auth/admins");

      const userData = await request("/api/auth/users");

      setItems(videos.items || []);

      setAdmins(adminData.admins || []);

      setUsers(userData.users || []);
    } catch (e) {
      nav("/admin/login/09");
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ==========================================================
  // VIDEO SAVE
  // ==========================================================

  async function save(e) {
    e.preventDefault();

    setError("");
    setMsg("");

    const videoUrl = form.videoUrl.trim();

    const downloadUrl = form.downloadUrl.trim();

    // ========================================================
    // WATCH URL
    //
    // Required unless Download Only is enabled.
    // ========================================================

    if (!form.downloadOnly && !videoUrl) {
      setError("Please enter a video / watch URL, or select Download Only.");

      return;
    }

    // ========================================================
    // DOWNLOAD URL
    // ========================================================

    if (form.downloadable && !downloadUrl) {
      setError("Please enter a download URL.");

      return;
    }

    // ========================================================
    // DOWNLOAD ONLY
    // ========================================================

    if (form.downloadOnly && !form.downloadable) {
      setError("Download-only mode requires downloads to be enabled.");

      return;
    }

    try {
      await request(edit ? `/api/videos/${edit}` : "/api/videos", {
        method: edit ? "PATCH" : "POST",

        body: JSON.stringify({
          title: form.title.trim(),

          posterUrl: form.posterUrl.trim(),

          videoUrl: form.downloadOnly ? "" : videoUrl,

          downloadable: form.downloadable,

          downloadOnly: form.downloadOnly,

          // IMPORTANT:
          // Preserve direct/page exactly.
          downloadType: form.downloadType,

          downloadUrl: form.downloadable ? downloadUrl : "",
        }),
      });

      const wasEditing = Boolean(edit);

      setForm({
        ...emptyVideo,
      });

      setEdit(null);

      setMsg(
        wasEditing ? "Video updated successfully" : "Video added successfully",
      );

      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  // ==========================================================
  // DELETE VIDEO
  // ==========================================================

  async function delVideo(id) {
    if (!confirm("Delete this video?")) {
      return;
    }

    setError("");
    setMsg("");

    try {
      await request(`/api/videos/${id}`, {
        method: "DELETE",
      });

      setMsg("Video deleted successfully");

      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  // ==========================================================
  // EDIT VIDEO
  // ==========================================================

  function openEditVideo(video) {
    setEdit(video._id);

    // ========================================================
    // LEGACY RECORD
    // ========================================================

    const isLegacyDownloadOnly =
      typeof video.downloadable !== "boolean" && video.downloadOnly === true;

    // ========================================================
    // DOWNLOADABLE
    // ========================================================

    const downloadable =
      typeof video.downloadable === "boolean"
        ? video.downloadable
        : Boolean(video.downloadOnly);

    // ========================================================
    // DOWNLOAD ONLY
    // ========================================================

    const downloadOnly = Boolean(video.downloadOnly) || isLegacyDownloadOnly;

    // ========================================================
    // DOWNLOAD TYPE
    // ========================================================

    const downloadType = video.downloadType === "page" ? "page" : "direct";

    // ========================================================
    // DOWNLOAD URL
    // ========================================================

    const downloadUrl =
      video.downloadUrl || (isLegacyDownloadOnly ? video.videoUrl || "" : "");

    // ========================================================
    // WATCH URL
    // ========================================================

    const videoUrl = downloadOnly ? "" : video.videoUrl || "";

    setForm({
      title: video.title || "",

      posterUrl: video.posterUrl || "",

      videoUrl,

      downloadable,

      downloadOnly,

      downloadType,

      downloadUrl,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================================
  // ADD ADMIN
  // ==========================================================

  async function addAdmin(e) {
    e.preventDefault();

    setError("");
    setMsg("");

    if (adminPassword.length < 10) {
      setError("Admin password must be at least 10 characters");

      return;
    }

    try {
      await request("/api/auth/admins", {
        method: "POST",

        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
        }),
      });

      setAdminEmail("");

      setAdminPassword("");

      setShowAdminPassword(false);

      setMsg("New admin created successfully");

      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  // ==========================================================
  // DELETE ADMIN
  // ==========================================================

  async function deleteAdmin(id) {
    if (!confirm("Are you sure you want to remove this admin?")) {
      return;
    }

    setError("");
    setMsg("");

    try {
      await request(`/api/auth/admins/${id}`, {
        method: "DELETE",
      });

      setMsg("Admin removed successfully");

      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  async function changePassword(e) {
    e.preventDefault();

    setError("");
    setMsg("");

    if (newPassword.length < 10) {
      setError("New password must be at least 10 characters");

      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");

      return;
    }

    try {
      await request("/api/auth/change-password", {
        method: "PATCH",

        body: JSON.stringify({
          currentPassword,

          newPassword,
        }),
      });

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");

      setShowCurrentPassword(false);

      setShowNewPassword(false);

      setShowConfirmPassword(false);

      setMsg("Password changed successfully");
    } catch (e) {
      setError(e.message);
    }
  }

  // ==========================================================
  // OPEN ADD USER
  // ==========================================================

  function openAddUser() {
    setEditingUser(null);

    setUserForm({
      ...emptyUser,
    });

    setShowUserPassword(false);

    setUserFormOpen(true);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  // ==========================================================
  // OPEN EDIT USER
  // ==========================================================

  function openEditUser(user) {
    setEditingUser(user._id);

    setUserForm({
      firstName: user.firstName || "",

      lastName: user.lastName || "",

      email: user.email || "",

      state: user.state || "",

      password: "",

      role: user.role || "user",
    });

    setShowUserPassword(false);

    setUserFormOpen(true);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  // ==========================================================
  // CANCEL USER FORM
  // ==========================================================

  function cancelUserForm() {
    setEditingUser(null);

    setUserForm({
      ...emptyUser,
    });

    setShowUserPassword(false);

    setUserFormOpen(false);
  }

  // ==========================================================
  // USER FORM CHANGE
  // ==========================================================

  function updateUserForm(field, value) {
    setUserForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // ==========================================================
  // SAVE USER
  // ==========================================================

  async function saveUser(e) {
    e.preventDefault();

    setError("");
    setMsg("");

    if (!editingUser) {
      if (userForm.password.length < 10) {
        setError("Password must be at least 10 characters");

        return;
      }
    }

    if (editingUser && userForm.password && userForm.password.length < 10) {
      setError("Password must be at least 10 characters");

      return;
    }

    try {
      const payload = {
        firstName: userForm.firstName,

        lastName: userForm.lastName,

        email: userForm.email,

        state: userForm.state,

        role: userForm.role,
      };

      if (!editingUser || userForm.password) {
        payload.password = userForm.password;
      }

      await request(
        editingUser ? `/api/auth/users/${editingUser}` : "/api/auth/users",
        {
          method: editingUser ? "PATCH" : "POST",

          body: JSON.stringify(payload),
        },
      );

      setMsg(
        editingUser ? "User updated successfully" : "User created successfully",
      );

      cancelUserForm();

      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  // ==========================================================
  // DELETE USER
  // ==========================================================

  async function deleteUser(id) {
    const selectedUser = users.find((user) => user._id === id);

    if (!selectedUser) {
      return;
    }

    const name =
      `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim() ||
      selectedUser.email;

    if (
      !confirm(
        `Are you sure you want to delete ${name}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setError("");
    setMsg("");

    try {
      await request(`/api/auth/users/${id}`, {
        method: "DELETE",
      });

      setMsg("User deleted successfully");

      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  // ==========================================================
  // FILTER VIDEOS
  // ==========================================================

  const filteredVideos = items.filter((video) => {
    const search = videoSearch.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return video.title?.toLowerCase().includes(search);
  });

  // ==========================================================
  // FILTER USERS
  // ==========================================================

  const filteredUsers = users.filter((user) => {
    const search = userSearch.toLowerCase().trim();

    if (!search) {
      return true;
    }

    const fullName = `${user.firstName || ""} ${
      user.lastName || ""
    }`.toLowerCase();

    return (
      fullName.includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search) ||
      user.state?.toLowerCase().includes(search)
    );
  });

  // ==========================================================
  // LOGOUT
  // ==========================================================

  async function handleLogout() {
    await logout();

    nav("/admin/login/09");
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <Header />

      {/* =====================================================
          TOAST
      ===================================================== */}

      {msg && (
        <div className="toast toast-success">
          <span>✓</span>

          <p>{msg}</p>

          <button
            type="button"
            onClick={() => setMsg("")}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="toast toast-error">
          <span>!</span>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <main className="admin container">
        {/* ===================================================
            TOP BAR
        =================================================== */}

        <div className="admin-top">
          <div>
            <p className="eyebrow">MoviesAdda</p>

            <h1>Admin Dashboard</h1>
          </div>

          <button onClick={handleLogout}>Logout</button>
        </div>

        {/* ===================================================
            VIDEO MANAGEMENT
        =================================================== */}

        <section className="admin-grid">
          {/* =================================================
              ADD / EDIT VIDEO
          ================================================= */}

          <form className="panel" onSubmit={save}>
            <h2>{edit ? "Edit video" : "Add new video"}</h2>

            {/* =================================================
                VIDEO NAME
            ================================================= */}

            <label>
              Video name
              <input
                required
                minLength="2"
                maxLength="140"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />
            </label>

            {/* =================================================
                POSTER
            ================================================= */}

            <label>
              Poster URL
              <input
                type="url"
                required
                value={form.posterUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    posterUrl: e.target.value,
                  })
                }
              />
            </label>

            {/* =================================================
                WATCH URL
            ================================================= */}

            <label>
              Video / destination URL
              <input
                type="url"
                required={!form.downloadOnly}
                value={form.videoUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    videoUrl: e.target.value,
                  })
                }
                disabled={form.downloadOnly}
                placeholder={
                  form.downloadOnly
                    ? "Not required for Download Only"
                    : "Video or watch destination URL"
                }
              />
              {form.downloadOnly && (
                <small className="field-help">
                  Watch URL is disabled because this video is Download Only.
                </small>
              )}
            </label>

            {/* =================================================
                DOWNLOAD SETTINGS
            ================================================= */}

            <div className="download-settings">
              {/* ===============================================
                  ENABLE DOWNLOAD
              =============================================== */}

              <label className="download-checkbox">
                <input
                  type="checkbox"
                  checked={form.downloadable}
                  onChange={(e) => {
                    const downloadable = e.target.checked;

                    setForm({
                      ...form,

                      downloadable,

                      downloadOnly: downloadable ? form.downloadOnly : false,
                    });
                  }}
                />

                <span>
                  <span>Enable Download</span>

                  <FaDownload />
                </span>
              </label>

              {/* ===============================================
                  DOWNLOAD OPTIONS
              =============================================== */}

              {form.downloadable && (
                <div className="download-options">
                  {/* =========================================
                      ACCESS TYPE
                  ========================================= */}

                  <div className="download-type-title">Access type</div>

                  <div className="download-type-options">
                    {/* =======================================
                        WATCH + DOWNLOAD
                    ======================================= */}

                    <label className="download-type-option">
                      <input
                        type="radio"
                        name="accessType"
                        checked={!form.downloadOnly}
                        onChange={() =>
                          setForm({
                            ...form,
                            downloadOnly: false,
                          })
                        }
                      />

                      <span>
                        <strong>Watch + Download</strong>

                        <small>
                          Users can watch the movie and download it.
                        </small>
                      </span>
                    </label>

                    {/* =======================================
                        DOWNLOAD ONLY
                    ======================================= */}

                    <label className="download-type-option">
                      <input
                        type="radio"
                        name="accessType"
                        checked={form.downloadOnly}
                        onChange={() =>
                          setForm({
                            ...form,
                            downloadOnly: true,
                            videoUrl: "",
                          })
                        }
                      />

                      <span>
                        <strong>Download Only</strong>

                        <small>Users will only see the Download button.</small>
                      </span>
                    </label>
                  </div>

                  {/* =========================================
                      DOWNLOAD TYPE
                  ========================================= */}

                  <div className="download-type-title">Download type</div>

                  <div className="download-type-options">
                    {/* =======================================
                        DIRECT DOWNLOAD
                    ======================================= */}

                    <label className="download-type-option">
                      <input
                        type="radio"
                        name="downloadType"
                        value="direct"
                        checked={form.downloadType === "direct"}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            downloadType: e.target.value,
                          })
                        }
                      />

                      <span>
                        <strong>Direct Download</strong>

                        <small>Starts the third-party download directly.</small>
                      </span>
                    </label>

                    {/* =======================================
                        DOWNLOAD PAGE
                    ======================================= */}

                    <label className="download-type-option">
                      <input
                        type="radio"
                        name="downloadType"
                        value="page"
                        checked={form.downloadType === "page"}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            downloadType: e.target.value,
                          })
                        }
                      />

                      <span>
                        <strong>Download Page</strong>

                        <small>Opens the third-party download page.</small>
                      </span>
                    </label>
                  </div>

                  {/* =========================================
                      DOWNLOAD URL
                  ========================================= */}

                  <label className="download-url-label">
                    Download URL
                    <input
                      type="url"
                      required={form.downloadable}
                      value={form.downloadUrl}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          downloadUrl: e.target.value,
                        })
                      }
                      placeholder={
                        form.downloadType === "direct"
                          ? "Third-party direct download URL"
                          : "Third-party download page URL"
                      }
                    />
                  </label>
                </div>
              )}

              {/* =============================================
                  HELP TEXT
              ============================================= */}

              <p className="download-help">
                {!form.downloadable
                  ? "Watch only — users can watch the movie and no Download button will be shown."
                  : form.downloadOnly
                    ? form.downloadType === "page"
                      ? "Download only — users will open the third-party download page."
                      : "Download only — users will start a direct third-party download."
                    : form.downloadType === "page"
                      ? "Watch + Download Page — users can watch the movie and open the third-party download page."
                      : "Watch + Direct Download — users can watch the movie and start a direct download."}
              </p>
            </div>

            {/* =================================================
                VIDEO ACTIONS
            ================================================= */}

            <div className="video-form-actions">
              <button className="primary" type="submit">
                {edit ? "Save changes" : "Add video"}
              </button>

              {edit && (
                <button
                  type="button"
                  onClick={() => {
                    setEdit(null);

                    setForm({
                      ...emptyVideo,
                    });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* =================================================
              RECENT VIDEOS
          ================================================= */}

          <section className="panel">
            <div className="recent-videos-header">
              <h2>Recent videos</h2>

              <div className="video-search">
                <FaSearch className="video-search-icon" />

                <input
                  type="search"
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  placeholder="Search videos..."
                />
              </div>
            </div>

            <div className="admin-list">
              {filteredVideos.length === 0 ? (
                <p className="empty">
                  {videoSearch
                    ? "No videos match your search."
                    : "No videos found."}
                </p>
              ) : (
                filteredVideos.map((v) => {
                  const isLegacyDownloadOnly =
                    typeof v.downloadable !== "boolean" &&
                    v.downloadOnly === true;

                  const isDownloadable =
                    typeof v.downloadable === "boolean"
                      ? v.downloadable
                      : Boolean(v.downloadOnly);

                  const isDownloadOnly =
                    Boolean(v.downloadOnly) || isLegacyDownloadOnly;

                  let accessLabel = "Watch";

                  if (isDownloadable) {
                    if (isDownloadOnly) {
                      accessLabel =
                        v.downloadType === "page"
                          ? "Download Only • Page"
                          : "Download Only • Direct";
                    } else {
                      accessLabel =
                        v.downloadType === "page"
                          ? "Watch + Download Page"
                          : "Watch + Direct Download";
                    }
                  }

                  return (
                    <article key={v._id}>
                      {/* ========================================
                            POSTER
                        ======================================== */}

                      <div className="admin-video-poster">
                        <img src={v.posterUrl} alt="" />

                        {isDownloadable && (
                          <span
                            className="admin-download-badge"
                            title={
                              isDownloadOnly
                                ? "Download only"
                                : v.downloadType === "page"
                                  ? "Download page enabled"
                                  : "Direct download enabled"
                            }
                          >
                            <FaDownload />
                          </span>
                        )}
                      </div>

                      {/* ========================================
                            INFO
                        ======================================== */}

                      <div className="admin-video-info">
                        <strong>{v.title}</strong>

                        <small>
                          {accessLabel}
                          {" • "}
                          {new Date(v.createdAt).toLocaleDateString()}
                        </small>
                      </div>

                      {/* ========================================
                            EDIT
                        ======================================== */}

                      <button onClick={() => openEditVideo(v)}>Edit</button>

                      {/* ========================================
                            DELETE
                        ======================================== */}

                      <button
                        className="danger"
                        onClick={() => delVideo(v._id)}
                      >
                        Delete
                      </button>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </section>

        {/* ===================================================
            ADMIN MANAGEMENT
        =================================================== */}

        <section className="admin-management">
          {/* =================================================
              CHANGE PASSWORD
          ================================================= */}

          <form className="panel" onSubmit={changePassword}>
            <h2>Change My Password</h2>

            <p className="panel-description">
              Update the password for your current admin account.
            </p>

            <label>
              Current password
              <div className="password-wrapper">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  minLength="10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={
                    showCurrentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </label>

            <label>
              New password
              <div className="password-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength="10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={
                    showNewPassword ? "Hide new password" : "Show new password"
                  }
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </label>

            <label>
              Confirm new password
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength="10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </label>

            <button className="primary" type="submit">
              Change Password
            </button>
          </form>

          {/* =================================================
              ADD ADMIN
          ================================================= */}

          <form className="panel" onSubmit={addAdmin}>
            <h2>Add New Admin</h2>

            <p className="panel-description">
              Create another account with administrator access.
            </p>

            <label>
              Admin email
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </label>

            <label>
              Temporary password
              <div className="password-input">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  required
                  minLength="10"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowAdminPassword((prev) => !prev)}
                  aria-label={
                    showAdminPassword ? "Hide password" : "Show password"
                  }
                >
                  {showAdminPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </label>

            <button className="primary" type="submit">
              Add Admin
            </button>
          </form>

          {/* =================================================
              ADMIN LIST
          ================================================= */}

          <section className="panel admin-panel">
            <h2>Administrators</h2>

            <p className="panel-description">
              Manage all MoviesAdda admin accounts.
            </p>

            <div className="admin-users">
              {admins.length === 0 ? (
                <p className="empty">No administrators found.</p>
              ) : (
                admins.map((admin) => (
                  <article className="admin-user" key={admin._id}>
                    <div className="admin-user-info">
                      <strong>{admin.email}</strong>

                      <small>
                        Administrator
                        {" • "}
                        Added {new Date(admin.createdAt).toLocaleDateString()}
                      </small>
                    </div>

                    <button
                      className="danger"
                      onClick={() => deleteAdmin(admin._id)}
                    >
                      Remove
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>

        {/* ===================================================
            USER MANAGEMENT
        =================================================== */}

        <section className="panel user-management">
          <div className="user-management-header">
            <div>
              <h2>User Management</h2>

              <p className="panel-description">
                View and manage all MoviesAdda user accounts.
              </p>
            </div>

            <button
              type="button"
              className="primary user-add-button"
              onClick={userFormOpen ? cancelUserForm : openAddUser}
            >
              <FaUserPlus />

              {userFormOpen ? "Close" : "Add User"}
            </button>
          </div>

          {/* =================================================
              ADD / EDIT USER
          ================================================= */}

          {userFormOpen && (
            <form className="user-form" onSubmit={saveUser}>
              <div className="user-form-title">
                <div>
                  <h3>{editingUser ? "Edit User" : "Add New User"}</h3>

                  <p>
                    {editingUser
                      ? "Update account information. Leave password empty to keep the existing password."
                      : "Create a new MoviesAdda account."}
                  </p>
                </div>
              </div>

              <div className="name-fields">
                <label>
                  First name
                  <input
                    type="text"
                    required
                    maxLength="50"
                    value={userForm.firstName}
                    onChange={(e) =>
                      updateUserForm("firstName", e.target.value)
                    }
                  />
                </label>

                <label>
                  Last name
                  <input
                    type="text"
                    maxLength="50"
                    value={userForm.lastName}
                    onChange={(e) => updateUserForm("lastName", e.target.value)}
                  />
                </label>
              </div>

              <label>
                Email
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => updateUserForm("email", e.target.value)}
                  placeholder="user@example.com"
                />
              </label>

              <label>
                State
                <select
                  value={userForm.state}
                  onChange={(e) => updateUserForm("state", e.target.value)}
                >
                  <option value="">Select your state</option>

                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Role
                <select
                  value={userForm.role}
                  onChange={(e) => updateUserForm("role", e.target.value)}
                >
                  <option value="user">User</option>

                  <option value="admin">Administrator</option>
                </select>
              </label>

              <label>
                {editingUser ? "New password (optional)" : "Password"}

                <div className="password-input">
                  <input
                    type={showUserPassword ? "text" : "password"}
                    required={!editingUser}
                    minLength="10"
                    value={userForm.password}
                    onChange={(e) => updateUserForm("password", e.target.value)}
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "Minimum 10 characters"
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowUserPassword((prev) => !prev)}
                    aria-label={
                      showUserPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showUserPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>

              <div className="row user-form-actions">
                <button className="primary" type="submit">
                  {editingUser ? "Save User" : "Create User"}
                </button>

                <button type="button" onClick={cancelUserForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="user-management-toolbar">
            <div className="user-search">
              <FaSearch />

              <input
                type="search"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, state or role..."
              />
            </div>

            <span className="user-count">
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "user" : "users"}
            </span>
          </div>

          {/* =================================================
              USER TABLE
          ================================================= */}

          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>User</th>

                  <th>Email</th>

                  <th>Role</th>

                  <th>State</th>

                  <th>Added</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="user-empty">
                      {userSearch
                        ? "No users match your search."
                        : "No users found."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const fullName = `${user.firstName || ""} ${
                      user.lastName || ""
                    }`.trim();

                    const initial = (user.firstName || user.email || "?")
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <tr key={user._id}>
                        <td>
                          <div className="user-cell">
                            <div
                              className="user-avatar-small"
                              style={{
                                background: user.avatarColor || "var(--accent)",
                              }}
                            >
                              {initial}
                            </div>

                            <div>
                              <strong>{fullName || "Unnamed user"}</strong>

                              <small>{user._id}</small>
                            </div>
                          </div>
                        </td>

                        <td>{user.email}</td>

                        <td>
                          <span
                            className={`role-badge ${
                              user.role === "admin" ? "role-admin" : "role-user"
                            }`}
                          >
                            {user.role === "admin" ? "Administrator" : "User"}
                          </span>
                        </td>

                        <td>{user.state || "—"}</td>

                        <td>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "—"}
                        </td>

                        <td>
                          <div className="user-actions">
                            <button
                              type="button"
                              className="user-edit-button"
                              onClick={() => openEditUser(user)}
                              title="Edit user"
                              aria-label="Edit user"
                            >
                              <FaEdit />
                            </button>

                            <button
                              type="button"
                              className="danger user-delete-button"
                              onClick={() => deleteUser(user._id)}
                              title="Delete user"
                              aria-label="Delete user"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
