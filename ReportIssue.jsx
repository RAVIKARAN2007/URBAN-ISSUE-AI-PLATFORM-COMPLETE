import React, { useState, useEffect } from "react";
import { cities } from "../data/cities";
import { problems } from "../data/problems";
import Navbar from "../components/Navbar";
import { db } from "../firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- AI INITIALIZATION ---
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

export default function ReportIssue() {
  const [citizen, setCitizen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const [issue, setIssue] = useState({
    problem: "",
    city: "",
    location: "",
    priority: "Low", 
    description: "",
    image: null,
    latitude: null,
    longitude: null,
    isAiVerified: false,
    aiAnalysis: ""
  });

  useEffect(() => {
    const savedCitizen = JSON.parse(localStorage.getItem("citizen"));
    setCitizen(savedCitizen);
    setLoading(false);
  }, []);

  // --- SMART & SIMPLE AI LOGIC ---
  const analyzeWithAI = async (base64Image, selectedCategory) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const pureBase64 = base64Image.split(",")[1];

      const prompt = `
        Act as a Smart City Infrastructure Inspector. 
        I am showing you a photo reported as: "${selectedCategory}".
        
        TASK:
        1. Does this photo show real-world physical evidence of "${selectedCategory}"? (True/False)
        2. REJECT (set matchesCategory to false) if the image is:
           - A screenshot of code or programming text.
           - A selfie or a person's face.
           - A meme or unrelated indoor object.
        3. Assign Severity: "High" (dangerous/blockage), "Medium", or "Low".
        4. Provide a 1-sentence technical summary of the issue visible.

        RESPONSE FORMAT (JSON ONLY):
        {
          "matchesCategory": true,
          "priority": "Medium",
          "summary": "Visible cracks and minor potholes on a residential road asphalt."
        }
      `;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: pureBase64, mimeType: "image/jpeg" } },
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const cleanJson = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleanJson);

      // Extra Safety: Double check if AI summary mentions 'code' or 'text'
      if (data.summary.toLowerCase().includes("code") || data.summary.toLowerCase().includes("text")) {
        return { matchesCategory: false, priority: "Low", summary: "Invalid image content." };
      }

      return data;
    } catch (error) {
      console.error("AI Analysis Error:", error);
      // Fallback: If AI is busy, we allow the report but flag it for manual review
      return { 
        matchesCategory: true, 
        priority: "Medium", 
        summary: "Manual verification required (AI scan failed)." 
      };
    }
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (!issue.problem) {
      alert("⚠️ Please select an Issue Category first!");
      return;
    }

    if (file) {
      setIsVerifying(true);
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const img = new Image();
        img.src = reader.result;
        
        img.onload = async () => {
          // Compress Image before sending to AI
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          // 1. RUN SMART AI SCAN
          const aiResult = await analyzeWithAI(compressedBase64, issue.problem);

          // 2. CHECK IF VALID
          if (!aiResult.matchesCategory) {
            alert(`🚫 INVALID IMAGE: This photo does not visually match "${issue.problem}". Please take a real photo of the physical issue.`);
            setIssue({ ...issue, image: null, isAiVerified: false }); 
            setIsVerifying(false);
            return;
          }

          // 3. GET GEOLOCATION
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setIssue({
                ...issue,
                image: compressedBase64,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                priority: aiResult.priority,
                aiAnalysis: aiResult.summary,
                isAiVerified: true 
              });
              setIsVerifying(false);
              alert(`✅ AI Verified: ${aiResult.priority} Priority.`);
            },
            (err) => {
              alert("⚠️ Location Access Denied. GPS is required for reporting.");
              setIsVerifying(false);
            }
          );
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const submitIssue = async () => {
    if (!issue.problem || !issue.city || !issue.description || !issue.image) {
      alert("⚠️ Please complete all fields and verify your photo.");
      return;
    }

    setIsVerifying(true); 

    try {
      const reportData = {
        ...issue,
        email: citizen.email,
        citizenName: citizen.name || citizen.fullName || "Verified Citizen",
        status: "Pending",
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString()
      };

      await addDoc(collection(db, "reports"), reportData);
      alert("🚀 SUCCESS: Your report is now live on the dashboard!");
      window.location.href = "/citizen";

    } catch (error) {
      console.error("Cloud Error:", error);
      alert("❌ Submission Failed. Check connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!loading && !citizen) {
    return (
      <div className="report-wrapper">
        <Navbar />
        <div style={{textAlign: 'center', marginTop: '100px'}}>
          <h2 style={{fontSize: '2rem', color: '#ef4444'}}>🔒 Login Required</h2>
          <button className="submit-trigger" style={{width: 'auto', marginTop: '20px'}} onClick={() => window.location.href = "/login"}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-wrapper">
      <style>{`
        .report-wrapper { background: #050816; min-height: 100vh; color: white; font-family: 'Inter', sans-serif; }
        .report-main { max-width: 1200px; margin: 0 auto; padding: 40px 20px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; }
        .form-card { background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.1); padding: 30px; border-radius: 24px; backdrop-filter: blur(10px); }
        .input-stack { display: flex; flex-direction: column; gap: 20px; margin-top: 20px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        .field label { font-size: 0.7rem; color: #3b82f6; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
        .field input, .field select, .field textarea { background: #0f172a; border: 1px solid #1e293b; padding: 14px; border-radius: 12px; color: white; outline: none; }
        .upload-box { border: 2px dashed #3b82f6; padding: 40px; border-radius: 15px; text-align: center; cursor: pointer; background: rgba(59, 130, 246, 0.05); transition: 0.3s; }
        .upload-box.disabled { border-color: #1e293b; color: #475569; cursor: not-allowed; }
        .submit-trigger { background: #3b82f6; color: white; border: none; padding: 16px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .submit-trigger:disabled { background: #1e293b; color: #475569; }
        .priority-badge { display: inline-block; padding: 6px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; }
        .High { background: #ef4444; } .Medium { background: #f59e0b; } .Low { background: #10b981; }
        .preview-card { background: #0f172a; padding: 25px; border-radius: 20px; border: 1px solid #1e293b; position: sticky; top: 100px; }
        @media (max-width: 900px) { .report-main { grid-template-columns: 1fr; } }
      `}</style>

      <Navbar />

      <div className="report-main">
        <div className="form-card">
          <h1 style={{fontSize: '2.2rem'}}>Citizen Report</h1>
          <p style={{color: '#64748b'}}>AI automatically verifies your photo and location.</p>

          <div className="input-stack">
            <div className="field">
              <label>1. Select Problem</label>
              <select value={issue.problem} onChange={(e) => setIssue({...issue, problem: e.target.value, image: null, isAiVerified: false})}>
                <option value="">Choose category...</option>
                {problems.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="field">
              <label>2. Photo Evidence</label>
              <div className={`upload-box ${!issue.problem ? 'disabled' : ''}`} onClick={() => issue.problem && document.getElementById('cameraInput').click()}>
                {!issue.problem ? "Select category first" : isVerifying ? "🤖 ANALYZING..." : (issue.image ? "✅ VERIFIED" : "📸 OPEN CAMERA")}
                <input type="file" id="cameraInput" hidden accept="image/*" capture="environment" onChange={handleCapture} disabled={!issue.problem} />
              </div>
            </div>

            <div className="field">
              <label>3. Target City</label>
              <select value={issue.city} onChange={(e) => setIssue({...issue, city: e.target.value})}>
                <option value="">Select City...</option>
                {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="field">
              <label>4. Description</label>
              <textarea placeholder="Tell us more details..." rows="3" onChange={(e) => setIssue({...issue, description: e.target.value})} />
            </div>

            <button className="submit-trigger" onClick={submitIssue} disabled={isVerifying || !issue.isAiVerified}>
              {isVerifying ? "Processing AI..." : "Submit to Authorities"}
            </button>
          </div>
        </div>

        <div className="preview-pane">
          <div className="preview-card">
            {issue.isAiVerified && <span className={`priority-badge ${issue.priority}`}>{issue.priority} Priority</span>}
            <h2 style={{marginBottom: '8px'}}>{issue.problem || "Live Preview"}</h2>
            <p style={{color: '#3b82f6', fontSize: '0.85rem', marginBottom: '15px'}}>
              📍 {issue.latitude ? `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}` : "GPS tagging pending"}
            </p>
            
            {issue.image ? (
              <img src={issue.image} style={{width: '100%', borderRadius: '15px', border: '2px solid #3b82f6'}} alt="Preview" />
            ) : (
              <div style={{height: '180px', background: '#050816', borderRadius: '15px', border: '1px dashed #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569'}}>Preview Window</div>
            )}

            {issue.aiAnalysis && (
              <div style={{marginTop: '20px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', borderLeft: '4px solid #10b981'}}>
                <p style={{color: '#10b981', fontSize: '0.9rem'}}><b>🤖 AI Report:</b> {issue.aiAnalysis}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}