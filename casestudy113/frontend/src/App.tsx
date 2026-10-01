import React, { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "warden";
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
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Logged in successfully");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleLogout = () => {
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
          <form className="card" onSubmit={handleLogin}>
            <h2>Login</h2>
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
        ) : (
          <form className="card" onSubmit={handleRegister}>
            <h2>Register</h2>
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
        )}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h2>Hostel Room Allocation</h2>
          <p>
            Logged in as: <strong>{user.name}</strong> ({user.role})
          </p>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {message && <div className="message">{message}</div>}

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
