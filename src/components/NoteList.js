import { useState, useEffect } from "react";
import { api_uri } from "../config";
import { jwtDecode } from "jwt-decode";
import "./NoteList.css";
import { useNavigate } from "react-router-dom";

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [role, setRole] = useState(null);
  const [tenantPlan, setTenantPlan] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let decoded

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      console.log("Decoded:", decoded);

      setRole(decoded.role);
      setTenantPlan(decoded.tenantPlan);

      fetchNotes();
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });  
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${api_uri}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${api_uri}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create note");
      }

      const newNote = await res.json();
      setNotes([...notes, newNote]);
      setTitle("");
      setContent("");
    } catch (err) {
      alert(err.message);
    }
  };

  
  const handleEdit = (note) => {
    const newTitle = prompt("Edit Title", note.title);
    const newContent = prompt("Edit Content", note.content);
    if (newTitle !== null && newContent !== null) {
      fetch(`${api_uri}/api/notes/${note._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      })
      .then(res => res.json())
      .then(updatedNote => {
        setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n));
      })
      .catch(() => alert("Update failed"));
    }
  };

  
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${api_uri}/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotes(notes.filter((n) => n._id !== id));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete note");
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };


  
  const handleUpgrade = async () => {
    const confirmUpgrade = window.confirm("Do you really want to upgrade to Pro?");
    if (!confirmUpgrade) return; 

    try {
      decoded = jwtDecode(token);
      const res = await fetch(`${api_uri}/api/tenants/${decoded.tenantSlug}/upgrade`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert("Upgraded to Pro!");
        setTenantPlan("Pro");
      }
    } catch (err) {
      alert("Upgrade failed");
    }
  };


  return (
    <div className="notes-page">
      <div className="notes-header">
        <h2>Notes</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>


      <div className="notes-actions">
        {role === "Admin" && (
          tenantPlan === "Pro" ? (
            <p><strong>Pro Version !!</strong></p>
          ) : (
            <button onClick={handleUpgrade} className="upgrade-btn">
              Upgrade to Pro
            </button>
          )
        )}
      </div>


      <div className="notes-grid">
        {notes.map((note) => (
          <div className="note-card" key={note._id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>

            {role === "Member" && (
              <div className="note-actions">
                <button className="edit-btn" onClick={() => handleEdit(note)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(note._id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>


      {role === "Member" && (
        <form onSubmit={handleCreate} className="note-form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <button type="submit" className="create-btn">Create Note</button>
        </form>
      )}
    </div>
  );
};

export default NoteList;
