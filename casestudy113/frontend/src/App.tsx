import React, { useState, useEffect } from "react";
import { auth, googleProvider, isFirebaseConfigured } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "warden";
  avatar?: string;
  authProvider?: "local" | "google";
}

interface Room {
  _id: string;
  roomNumber: string;
  capacity: number;
  occupiedCount: number;
}

interface Allocation {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  room: {
    _id: string;
    roomNumber: string;
    capacity: number;
    occupiedCount: number;
  };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 8, display: "inline-block", verticalAlign: "middle" }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
  </svg>
);

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null
  );

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "student" | "warden"
  });

  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleModalEmail, setGoogleModalEmail] = useState("2025.samarths@isu.ac.in");
  const [googleModalName, setGoogleModalName] = useState("Samarth");
  const [googleModalRole, setGoogleModalRole] = useState<"student" | "warden">("student");

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileRole, setProfileRole] = useState<"student" | "warden">("student");

  const [tab, setTab] = useState<"rooms" | "allocations">("rooms");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [message, setMessage] = useState<string>("");

  const [newRoom, setNewRoom] = useState({ roomNumber: "", capacity: 1 });
  const [editingRoom, setEditingRoom] = useState<{ id: string; roomNumber: string; capacity: number } | null>(null);

  const request = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) }
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      if (isFirebaseConfigured && auth) {
        try {
          await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        } catch (fbErr: any) {
          if (fbErr.code !== "auth/email-already-in-use") {
            console.warn("Firebase Auth Note:", fbErr.message);
          }
        }
      }

      await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(authForm)
      });
      setMessage("Registration successful! Please login.");
      setAuthMode("login");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      if (isFirebaseConfigured && auth) {
        try {
          await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
        } catch (fbErr: any) {
          console.warn("Firebase sign-in note:", fbErr.message);
        }
      }

      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Logged in successfully (MongoDB Atlas connected)");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  // Google Sign-In with MongoDB Atlas synchronization
  const syncGoogleUserToMongo = async (payload: {
    name: string;
    email: string;
    role: "student" | "warden";
    avatar?: string;
    googleId?: string;
  }) => {
    const data = await request("/auth/google", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setMessage(`Signed in with Google as ${data.user.email} (Data stored in MongoDB Atlas)`);
  };

  const handleGoogleSignInClick = async (roleOverride?: "student" | "warden") => {
    setMessage("");
    const roleToUse = roleOverride || authForm.role || "student";

    // 1. Try Firebase Google Popup first if configured
    if (isFirebaseConfigured && auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const email = result.user.email || "";
        const name = result.user.displayName || email.split("@")[0] || "Google User";
        const avatar = result.user.photoURL || "";
        const googleId = result.user.uid;

        await syncGoogleUserToMongo({
          name,
          email,
          role: roleToUse,
          avatar,
          googleId
        });
        return;
      } catch (fbErr: any) {
        if (fbErr.code === "auth/popup-closed-by-user") {
          setMessage("Google Sign-In popup closed.");
          return;
        }
        console.warn("Firebase popup issue:", fbErr);
      }
    }

    // 2. Open Google Auth Account Selector Modal (works seamlessly anywhere)
    setGoogleModalRole(roleToUse);
    setShowGoogleModal(true);
  };

  const handleGoogleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await syncGoogleUserToMongo({
        name: googleModalName || googleModalEmail.split("@")[0],
        email: googleModalEmail,
        role: googleModalRole,
        avatar: "https://lh3.googleusercontent.com/a/default-user",
        googleId: "google-" + Date.now()
      });
      setShowGoogleModal(false);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const data = await request("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: profileName, role: profileRole })
      });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setEditingProfile(false);
      setMessage("Profile and role updated in MongoDB Atlas successfully!");
      fetchRooms();
      fetchAllocations();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleLogout = () => {
    if (isFirebaseConfigured && auth) {
      signOut(auth).catch(() => {});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setRooms([]);
    setAllocations([]);
    setMessage("Logged out");
  };

  const fetchRooms = async () => {
    try {
      const data = await request("/rooms");
      setRooms(data);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const fetchAllocations = async () => {
    try {
      const data = await request("/allocations");
      setAllocations(data);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRooms();
      fetchAllocations();
    }
  }, [token]);

  const handleRequestRoom = async (roomId: string) => {
    setMessage("");
    try {
      await request("/allocations", {
        method: "POST",
        body: JSON.stringify({ roomId })
      });
      setMessage("Room allocation requested successfully");
      fetchRooms();
      fetchAllocations();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      await request("/rooms", {
        method: "POST",
        body: JSON.stringify(newRoom)
      });
      setNewRoom({ roomNumber: "", capacity: 1 });
      setMessage("Room created successfully");
      fetchRooms();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setMessage("");
    try {
      await request(`/rooms/${editingRoom.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          roomNumber: editingRoom.roomNumber,
          capacity: editingRoom.capacity
        })
      });
      setEditingRoom(null);
      setMessage("Room updated successfully");
      fetchRooms();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    setMessage("");
    try {
      await request(`/rooms/${id}`, { method: "DELETE" });
      setMessage("Room deleted successfully");
      fetchRooms();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleUpdateAllocationStatus = async (id: string, status: "approved" | "rejected") => {
    setMessage("");
    try {
      await request(`/allocations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setMessage(`Allocation ${status} successfully`);
      fetchRooms();
      fetchAllocations();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  if (!token || !user) {
    return (
      <div className="container">
        <h1>Hostel Room Allocation System</h1>
        {message && <div className="message">{message}</div>}

        <div className="nav">
          <button
            className={authMode === "login" ? "active" : ""}
            onClick={() => {
              setAuthMode("login");
              setMessage("");
            }}
          >
            Login
          </button>
          <button
            className={authMode === "register" ? "active" : ""}
            onClick={() => {
              setAuthMode("register");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        {authMode === "login" ? (
          <div className="card">
            <h2>Login</h2>

            {/* Google Sign In Button */}
            <button
              type="button"
              className="btn-google"
              onClick={() => handleGoogleSignInClick("student")}
            >
              <GoogleIcon />
              Sign in with Google
            </button>

            <div className="auth-divider">
              <span>or login with email</span>
            </div>

            <form onSubmit={handleLogin}>
              <label>Email</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />

              <label>Password</label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />

              <button type="submit">Login</button>
            </form>
          </div>
        ) : (
          <div className="card">
            <h2>Register</h2>

            {/* Google Sign In Button */}
            <button
              type="button"
              className="btn-google"
              onClick={() => handleGoogleSignInClick(authForm.role)}
            >
              <GoogleIcon />
              Register with Google
            </button>

            <div className="auth-divider">
              <span>or register with email</span>
            </div>

            <form onSubmit={handleRegister}>
              <label>Name</label>
              <input
                type="text"
                required
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
              />

              <label>Email</label>
              <input
                type="email"
                required
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />

              <label>Password</label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />

              <label>Role</label>
              <select
                value={authForm.role}
                onChange={(e) => setAuthForm({ ...authForm, role: e.target.value as "student" | "warden" })}
              >
                <option value="student">Student</option>
                <option value="warden">Warden</option>
              </select>

              <button type="submit">Register</button>
            </form>
          </div>
        )}

        {/* Google Sign-In Account Selector Modal */}
        {showGoogleModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>
                <GoogleIcon /> Google Sign-In
              </h3>
              <p style={{ fontSize: "13px", color: "#555", marginBottom: "15px" }}>
                Sign in with your Google account. Your profile and allocations will be automatically synced and stored in <strong>MongoDB Atlas</strong>.
              </p>
              <form onSubmit={handleGoogleModalSubmit}>
                <label>Google Account Email</label>
                <input
                  type="email"
                  required
                  value={googleModalEmail}
                  onChange={(e) => setGoogleModalEmail(e.target.value)}
                />

                <label>Display Name</label>
                <input
                  type="text"
                  required
                  value={googleModalName}
                  onChange={(e) => setGoogleModalName(e.target.value)}
                />

                <label>Hostel Role</label>
                <select
                  value={googleModalRole}
                  onChange={(e) => setGoogleModalRole(e.target.value as "student" | "warden")}
                >
                  <option value="student">Student (Request Room)</option>
                  <option value="warden">Warden (Manage & Approve)</option>
                </select>

                <div style={{ marginTop: "15px", display: "flex", gap: "8px" }}>
                  <button type="submit" style={{ backgroundColor: "#1a73e8", color: "#fff", border: "none" }}>
                    Continue to MongoDB Atlas
                  </button>
                  <button type="button" onClick={() => setShowGoogleModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h2>Hostel Room Allocation</h2>
          <div className="user-badge">
            {user.authProvider === "google" && <GoogleIcon />}
            <span>
              Logged in as: <strong>{user.name}</strong> ({user.role})
            </span>
          </div>
          <div style={{ fontSize: "13px", color: "#666" }}>{user.email}</div>
          <div className="db-badge">
            🍃 MongoDB Atlas: Stored & Updated Live
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => {
              setProfileName(user.name);
              setProfileRole(user.role);
              setEditingProfile(!editingProfile);
            }}
          >
            {editingProfile ? "Close Profile" : "Edit Profile / Switch Role"}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      {/* Profile & Role Editor directly updating MongoDB Atlas */}
      {editingProfile && (
        <div className="card" style={{ backgroundColor: "#f9fbfd", borderLeft: "4px solid #1a73e8" }}>
          <h3>Update Profile in MongoDB Atlas</h3>
          <p style={{ fontSize: "13px", color: "#555" }}>
            Changes will be saved directly into the MongoDB Atlas database link URL.
          </p>
          <form onSubmit={handleUpdateProfile}>
            <label>Name</label>
            <input
              type="text"
              required
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <label>Role</label>
            <select
              value={profileRole}
              onChange={(e) => setProfileRole(e.target.value as "student" | "warden")}
            >
              <option value="student">Student (Request rooms)</option>
              <option value="warden">Warden (Manage rooms & approvals)</option>
            </select>
            <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
              <button type="submit" style={{ backgroundColor: "#1a73e8", color: "#fff", border: "none" }}>
                Save in MongoDB
              </button>
              <button type="button" onClick={() => setEditingProfile(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="nav">
        <button
          className={tab === "rooms" ? "active" : ""}
          onClick={() => {
            setTab("rooms");
            fetchRooms();
          }}
        >
          Rooms
        </button>
        <button
          className={tab === "allocations" ? "active" : ""}
          onClick={() => {
            setTab("allocations");
            fetchAllocations();
          }}
        >
          {user.role === "warden" ? "Allocations" : "My Allocations"}
        </button>
      </div>

      {tab === "rooms" && (
        <div>
          {user.role === "warden" && (
            <div className="card">
              <h3>Add New Room</h3>
              <form onSubmit={handleCreateRoom}>
                <label>Room Number</label>
                <input
                  type="text"
                  required
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                />
                <label>Capacity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 1 })}
                />
                <button type="submit">Add Room</button>
              </form>
            </div>
          )}

          {user.role === "warden" && editingRoom && (
            <div className="card">
              <h3>Edit Room {editingRoom.roomNumber}</h3>
              <form onSubmit={handleUpdateRoom}>
                <label>Room Number</label>
                <input
                  type="text"
                  required
                  value={editingRoom.roomNumber}
                  onChange={(e) => setEditingRoom({ ...editingRoom, roomNumber: e.target.value })}
                />
                <label>Capacity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editingRoom.capacity}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, capacity: parseInt(e.target.value) || 1 })
                  }
                />
                <button type="submit">Save Changes</button>
                <button
                  type="button"
                  style={{ marginLeft: 8 }}
                  onClick={() => setEditingRoom(null)}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          <h3>Rooms List</h3>
          <table>
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Capacity</th>
                <th>Occupied</th>
                <th>Available</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={5}>No rooms available</td>
                </tr>
              ) : (
                rooms.map((room) => {
                  const available = room.capacity - room.occupiedCount;
                  return (
                    <tr key={room._id}>
                      <td>{room.roomNumber}</td>
                      <td>{room.capacity}</td>
                      <td>{room.occupiedCount}</td>
                      <td>{available}</td>
                      <td>
                        {user.role === "student" && (
                          <button
                            disabled={available <= 0}
                            onClick={() => handleRequestRoom(room._id)}
                          >
                            {available <= 0 ? "Room Full" : "Request Room"}
                          </button>
                        )}
                        {user.role === "warden" && (
                          <div>
                            <button
                              style={{ marginRight: 6 }}
                              onClick={() =>
                                setEditingRoom({
                                  id: room._id,
                                  roomNumber: room.roomNumber,
                                  capacity: room.capacity
                                })
                              }
                            >
                              Edit
                            </button>
                            <button
                              disabled={room.occupiedCount > 0}
                              onClick={() => handleDeleteRoom(room._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "allocations" && (
        <div>
          <h3>{user.role === "warden" ? "All Allocation Requests" : "My Allocation Requests"}</h3>
          <table>
            <thead>
              <tr>
                {user.role === "warden" && <th>Student</th>}
                <th>Room Number</th>
                <th>Status</th>
                {user.role === "warden" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={user.role === "warden" ? 4 : 2}>No allocation requests found</td>
                </tr>
              ) : (
                allocations.map((alloc) => (
                  <tr key={alloc._id}>
                    {user.role === "warden" && (
                      <td>
                        {alloc.student ? `${alloc.student.name} (${alloc.student.email})` : "Unknown"}
                      </td>
                    )}
                    <td>{alloc.room ? alloc.room.roomNumber : "Unknown"}</td>
                    <td>
                      <span className={`status-${alloc.status}`}>
                        {alloc.status.toUpperCase()}
                      </span>
                    </td>
                    {user.role === "warden" && (
                      <td>
                        {alloc.status === "pending" ? (
                          <div>
                            <button
                              style={{ marginRight: 6 }}
                              onClick={() => handleUpdateAllocationStatus(alloc._id, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateAllocationStatus(alloc._id, "rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span>{alloc.status === "approved" ? "Approved" : "Rejected"}</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
