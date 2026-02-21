import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { cities } from "../data/cities";
// --- FIREBASE IMPORTS ---
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";

export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All"); // New Status Filter
  const [selectedCategory, setSelectedCategory] = useState("All"); // New Category Filter
  const [viewingIssue, setViewingIssue] = useState(null);

  useEffect(() => {
    // --- REAL-TIME CLOUD SYNC ---
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIssues(data);
    });

    return () => unsubscribe(); 
  }, []);

  // MASTER FILTERING (Handles City, Category, and Status)
  const filteredIssues = issues.filter((i) => {
    const cityMatch = selectedCity === "All" || i.city === selectedCity;
    const statusMatch = selectedStatus === "All" || i.status === selectedStatus;
    const categoryMatch = selectedCategory === "All" || (i.problem === selectedCategory || i.category === selectedCategory);
    return cityMatch && statusMatch && categoryMatch;
  });

  // Statistics Calculation
  const stats = {
    total: filteredIssues.length,
    pending: filteredIssues.filter(i => i.status === "Pending").length,
    resolved: filteredIssues.filter(i => i.status === "Resolved").length,
    critical: filteredIssues.filter(i => i.priority === "Emergency").length
  };

  const updateStatus = async (docId, newStatus) => {
    try {
      const reportRef = doc(db, "reports", docId);
      // Now updates status instead of deleting, so it counts in "Resolved" stats
      await updateDoc(reportRef, { status: newStatus });
      alert(`✅ Status updated to ${newStatus}`);
      setViewingIssue(null);
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("❌ Error updating issue.");
    }
  };

  const deleteReport = async (docId) => {
    if(window.confirm("Are you sure you want to permanently DELETE this report?")) {
        try {
            await deleteDoc(doc(db, "reports", docId));
            alert("🗑️ Report permanently removed.");
        } catch (error) {
            alert("❌ Error deleting.");
        }
    }
  };

  return (
    <div className="admin-page-wrapper">
      <style>{`
        .admin-page-wrapper { background: #020617; min-height: 100vh; color: #f8fafc; font-family: 'Inter', sans-serif; }
        .admin-container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
        
        .admin-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px;
        }

        .header-title h1 {
          font-size: 2.2rem; background: linear-gradient(to right, #fff, #3b82f6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800;
        }

        .selectors-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .admin-select {
          background: #0f172a; color: white; border: 1px solid #3b82f6;
          padding: 10px 15px; border-radius: 10px; outline: none; cursor: pointer;
        }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 25px; border-radius: 20px; text-align: center; }
        .stat-card h2 { font-size: 2.5rem; margin-top: 10px; }
        .border-blue { border-left: 5px solid #3b82f6; } .border-orange { border-left: 5px solid #f59e0b; }
        .border-green { border-left: 5px solid #10b981; } .border-red { border-left: 5px solid #ef4444; }

        /* SCROLLABLE TABLE AREA FOR 1000+ REPORTS */
        .table-section {
          background: rgba(255, 255, 255, 0.02); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden; backdrop-filter: blur(10px);
        }
        .table-scroll { max-height: 600px; overflow-y: auto; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: rgba(255,255,255,0.05); padding: 20px; font-size: 0.75rem; color: #64748b; text-transform: uppercase; position: sticky; top: 0; }
        .admin-table td { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.03); }

        .citizen-tag b { color: white; display: block; }
        .citizen-tag span { font-size: 0.8rem; color: #64748b; }
        .priority-pill { font-size: 0.7rem; font-weight: 800; padding: 4px 10px; border-radius: 6px; }
        .Emergency { background: #ef4444; } .High { background: #f97316; } .Normal { background: #3b82f6; }
        .status-dot { font-size: 0.85rem; font-weight: 600; }
        .Pending { color: #f59e0b; } .Resolved { color: #10b981; } .In-Progress { color: #3b82f6; }

        .action-btn { background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; color: #3b82f6; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-right: 5px; }
        .delete-btn { background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; padding: 8px; border-radius: 8px; cursor: pointer; }

        /* MODAL STYLES */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .modal-card { background: #0f172a; width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; padding: 40px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); position: relative; }
        .investigation-img { width: 100%; border-radius: 20px; border: 1px solid #3b82f6; object-fit: cover; height: 250px; }
        .btn-resolve { background: #10b981; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 700; }
        .btn-progress { background: #3b82f6; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 700; margin-left: 10px; }
        .btn-close { position: absolute; top: 25px; right: 25px; background: #1e293b; border: none; color: white; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; }
      `}</style>

      <Navbar />

      <div className="admin-container">
        <header className="admin-header">
          <div className="header-title">
            <h1>Command Center</h1>
            <p>Review and verify AI-reported urban issues.</p>
          </div>
          <div className="selectors-row">
            <select className="admin-select" onChange={(e) => setSelectedCity(e.target.value)}>
              <option value="All">All Cities</option>
              {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <select className="admin-select" onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Road Damage">Roads</option>
              <option value="Garbage">Garbage</option>
              <option value="Water Supply">Water</option>
            </select>
            <select className="admin-select" onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card border-blue"><span>Total</span><h2>{stats.total}</h2></div>
          <div className="stat-card border-orange"><span>Pending</span><h2>{stats.pending}</h2></div>
          <div className="stat-card border-red"><span>Emergency</span><h2>{stats.critical}</h2></div>
          <div className="stat-card border-green"><span>Resolved</span><h2>{stats.resolved}</h2></div>
        </div>

        <div className="table-section">
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Citizen</th>
                  <th>Category</th>
                  <th>Area</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((i) => (
                  <tr key={i.id}>
                    <td><div className="citizen-tag"><b>{i.citizenName}</b><span>{i.email}</span></div></td>
                    <td style={{color: '#60a5fa', fontWeight: 'bold'}}>{i.problem || i.category}</td>
                    <td>{i.city}</td>
                    <td><span className={`priority-pill ${i.priority}`}>{i.priority}</span></td>
                    <td><span className={`status-dot ${i.status}`}>● {i.status}</span></td>
                    <td>
                      <button className="action-btn" onClick={() => setViewingIssue(i)}>View</button>
                      <button className="delete-btn" onClick={() => deleteReport(i.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewingIssue && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="btn-close" onClick={() => setViewingIssue(null)}>×</button>
            <h2>{viewingIssue.problem || viewingIssue.category}</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px'}}>
              <div>
                {viewingIssue.image && <img src={viewingIssue.image} className="investigation-img" />}
                <p style={{marginTop: '10px', fontSize: '0.8rem'}}>Location: {viewingIssue.latitude}, {viewingIssue.longitude}</p>
              </div>
              <div>
                <h4>Citizen Statement</h4>
                <p>{viewingIssue.description || "No details."}</p>
                <div style={{marginTop: '30px'}}>
                  <button className="btn-resolve" onClick={() => updateStatus(viewingIssue.id, "Resolved")}>Mark Resolved</button>
                  <button className="btn-progress" onClick={() => updateStatus(viewingIssue.id, "In-Progress")}>Deploy Team</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}