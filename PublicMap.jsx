import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/Navbar";
import { cities } from "../data/cities";
// --- FIREBASE IMPORTS ---
import { db } from "../firebase"; 
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import "leaflet/dist/leaflet.css";

// 1. HIGH-PERFORMANCE GOOGLE-STYLE MARKER
const getIcon = (category) => {
  const colors = {
    "Road Damage": "#EA4335",   // Google Red
    "Garbage": "#FBBC04",       // Google Yellow
    "Water Supply": "#4285F4",  // Google Blue
    "Electricity": "#34A853",   // Google Green
    "Default": "#1a73e8"
  };

  const color = colors[category] || colors["Default"];

  return L.divIcon({
    html: `
      <div class="pin-wrapper">
        <div class="pin-main" style="background: ${color};">
          <div class="pin-inner"></div>
        </div>
        <div class="pin-shadow"></div>
      </div>`,
    className: "custom-google-pin",
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });
};

// AUTO-ZOOM COMPONENT
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function PublicMap() {
  const [issues, setIssues] = useState([]);
  const [activeCity, setActiveCity] = useState("All"); // Changed to "All" by default
  const [filterType, setFilterType] = useState("All");
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default Center of India
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    // REAL-TIME SYNC: Fetches up to 10,000 reports for massive scale
    const q = query(collection(db, "reports"), limit(10000));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cloudData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setIssues(cloudData);
    }, (error) => {
      console.error("Firebase Sync Error:", error);
    });

    return () => unsubscribe();
  }, []);

  // MASTER FILTERING LOGIC
  const filteredIssues = issues.filter(iss => {
    const categoryMatch = filterType === "All" || iss.problem === filterType || iss.category === filterType;
    const cityMatch = activeCity === "All" || iss.city === activeCity;
    return categoryMatch && cityMatch;
  });

  const handleCityChange = (cityName) => {
    setActiveCity(cityName);
    if (cityName === "All") {
      setMapCenter([20.5937, 78.9629]); // Pan out to India view
      setZoom(5);
    } else {
      const cityData = cities.find(c => c.name === cityName);
      if (cityData) {
        setMapCenter([cityData.lat, cityData.lng]);
        setZoom(13);
      }
    }
  };

  return (
    <div className="map-page">
      <style>{`
        .map-page { background: #f8f9fa; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .map-header {
          background: #ffffff; padding: 12px 30px;
          display: flex; align-items: center; gap: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 1001;
        }

        .control-select {
          padding: 10px 18px; border-radius: 25px; border: 1px solid #e0e0e0;
          background: #fff; font-size: 0.85rem; font-weight: 500; color: #3c4043;
          outline: none; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .control-select:hover { border-color: #3b82f6; background: #f8faff; }

        .map-container-wrapper { height: calc(100vh - 130px); width: 100%; position: relative; }

        /* PROFESSIONAL PIN STYLES */
        .pin-wrapper { position: relative; width: 30px; height: 30px; }
        .pin-main {
          width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;
          border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        .pin-inner { width: 10px; height: 10px; background: white; border-radius: 50%; }
        .pin-shadow {
          width: 14px; height: 4px; background: rgba(0,0,0,0.25);
          border-radius: 50%; position: absolute; bottom: -10px; left: 8px; filter: blur(1.5px);
        }

        .leaflet-popup-content-wrapper { border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .popup-card { width: 250px; }
        .popup-img { width: 100%; height: 140px; object-fit: cover; background: #eee; }
        .popup-info { padding: 15px; }
        .popup-info h4 { margin: 0 0 5px; color: #1a1a1a; font-size: 1.1rem; font-weight: 700; }
        .popup-info p { margin: 0; color: #5f6368; font-size: 0.85rem; line-height: 1.4; }
        
        .status-badge {
          display: inline-block; margin-top: 10px; padding: 4px 10px;
          border-radius: 6px; font-weight: 800; font-size: 0.7rem; text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .map-header { padding: 10px; flex-direction: column; align-items: stretch; gap: 8px; }
          .control-select { width: 100%; }
        }
      `}</style>

      <Navbar />

      <div className="map-header">
        <select className="control-select" value={activeCity} onChange={(e) => handleCityChange(e.target.value)}>
          <option value="All">All Jurisdictions (India)</option>
          {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>

        <select className="control-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Road Damage">Road & Potholes</option>
          <option value="Water Supply">Water & Drainage</option>
          <option value="Garbage">Waste Management</option>
          <option value="Electricity">Electricity</option>
        </select>
        
        <div style={{marginLeft: 'auto', fontWeight: '600', color: '#1a73e8', fontSize: '0.9rem'}}>
          {filteredIssues.length.toLocaleString()} LIVE REPORTS
        </div>
      </div>

      <div className="map-container-wrapper">
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <ChangeView center={mapCenter} zoom={zoom} />
          
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />

          {filteredIssues.map((iss) => (
            <Marker 
              key={iss.id} 
              position={[iss.latitude, iss.longitude]} 
              icon={getIcon(iss.problem || iss.category)}
            >
              <Popup>
                <div className="popup-card">
                  {(iss.imageURL || iss.image) && (
                    <img src={iss.imageURL || iss.image} alt="Report" className="popup-img" />
                  )}
                  <div className="popup-info">
                    <h4>{iss.problem || iss.category}</h4>
                    <p>{iss.description || "No further details provided."}</p>
                    <div className="status-badge" style={{ 
                      background: iss.status === 'Resolved' ? '#e6f4ea' : '#fff4e5',
                      color: iss.status === 'Resolved' ? '#1e7e34' : '#b45309',
                      border: `1px solid ${iss.status === 'Resolved' ? '#1e7e34' : '#b45309'}`
                    }}>
                      ● {iss.status || 'Pending'}
                    </div>
                    <div style={{fontSize: '0.65rem', color: '#999', marginTop: '10px'}}>
                      Report ID: {iss.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}