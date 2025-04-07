import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from "react";
import Globe from 'react-globe.gl';
import * as THREE from "three";
import db from '../firebase/config';
import { coordinatesDB } from './coordinates';

const Modal = ({ locationData, onClose }) => {
  if (!locationData) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 relative">
          <div className="flex justify-center">
            <div className="p-3 inline-block">
              <div className="flex items-center justify-center flex-wrap gap-1">
                <span className="text-lg md:text-xl font-semibold text-white">
                  {locationData.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-600 font-medium">Active Miners</span>
                </div>
                <span className="text-blue-600 font-bold">{locationData.miners.length}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {locationData.miners.map((miner, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {miner.username}
                    </div>
                    {/* Now showing status from miner_states */}
                    <div className="text-sm text-gray-500">
                      Status: {miner.current_status ?? 'N/A'}
                    </div>
                  </div>
                  {miner.metrics?.currentLoss && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Loss: {miner.metrics.currentLoss.toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Best: {miner.metrics.bestLoss.toFixed(4)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white 
                  rounded-full hover:from-pink-600 hover:to-pink-700 transition-all 
                  duration-300 shadow-lg shadow-pink-500/20 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComputeMiners = ({ darkMode }) => {
  const globeEl = useRef();
  const [spriteMap, setSpriteMap] = useState(null);

  // We'll store data from "miners" and "miner_states"
  const [miners, setMiners] = useState([]);
  const [minerStates, setMinerStates] = useState({}); // keyed by doc ID or miner_id

  const [minerLocations, setMinerLocations] = useState([]);
  const [connectionsData, setConnectionsData] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600
  });

  // 1) Listen to "miners" collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'miners'), (snapshot) => {
      const newMiners = [];
      snapshot.forEach((doc) => {
        newMiners.push({ id: doc.id, ...doc.data() });
      });
      setMiners(newMiners);
    });
    return () => unsub();
  }, []);

  // 2) Listen to "miner_states" collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'miner_states'), (snapshot) => {
      const states = {};
      snapshot.forEach((doc) => {
        // doc.id or doc.data().miner_id
        // if you are sure doc.id matches the miner's id in "miners", use doc.id
        const msData = doc.data();
        states[doc.id] = msData; // store entire doc
      });
      setMinerStates(states);
    });
    return () => unsub();
  }, []);

  // 3) Combine data => build location array
  useEffect(() => {
    // We only build "minerLocations" once we have both:
    // - the "miners" array
    // - the "minerStates" dictionary
    const locationsMap = new Map();

    miners.forEach((miner) => {
      const locationRaw = miner.location?.toLowerCase() || '';
      const locationParts = locationRaw.split(',').map((p) => p.trim());
      let coordinates = null;

      // Try to find matching coordinates from coordinatesDB
      for (const part of locationParts) {
        if (coordinatesDB[part]) {
          coordinates = coordinatesDB[part];
          break;
        }
      }

      if (!coordinates) return; // skip if no location match

      const locationKey = `${coordinates.lat},${coordinates.lng}`;
      if (!locationsMap.has(locationKey)) {
        locationsMap.set(locationKey, {
          name: miner.location,
          lat: coordinates.lat,
          lng: coordinates.lng,
          miners: [],
        });
      }

      // Merge in the current status from miner_states
      const stateDoc = minerStates[miner.id] || {};
      // For instance, 'stateDoc.current_status' or 'stateDoc.system_info' etc.
      const currentStatus = stateDoc.current_status ?? miner.status ?? 'unknown';

      const locationData = locationsMap.get(locationKey);
      locationData.miners.push({
        username: miner.username || 'Unnamed Miner',
        current_status: currentStatus,
        metrics: miner.metrics,
      });
    });

    const locArray = Array.from(locationsMap.values());
    setMinerLocations(locArray);

    // Simple arcs between each location in order
    if (locArray.length > 1) {
      setConnectionsData(
        locArray.map((location, index) => ({
          startLat: location.lat,
          startLng: location.lng,
          endLat: locArray[(index + 1) % locArray.length].lat,
          endLng: locArray[(index + 1) % locArray.length].lng,
          color: darkMode ? '#FFD700' : '#342907FF',
        }))
      );
    } else {
      setConnectionsData([]);
    }
  }, [miners, minerStates, darkMode]);

  // 4) Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 5) Determine globe dimension rules
  const getGlobeDimensions = () => {
    const isMobile = dimensions.width < 768;
    const isTablet = dimensions.width >= 768 && dimensions.width < 1024;
    
    if (isMobile) {
      return {
        width: Math.min(dimensions.width - 24, 360),
        height: 280,
        altitude: 2.5
      };
    } else if (isTablet) {
      return {
        width: Math.min(dimensions.width - 48, 440),
        height: 360,
        altitude: 2
      };
    } else {
      return {
        width: 580,
        height: 400,
        altitude: 1.5
      };
    }
  };

  // 6) Point the globe to a certain altitude
  useEffect(() => {
    if (globeEl.current) {
      const { altitude } = getGlobeDimensions();
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude });
    }
  }, [dimensions]);

  // 7) Load the marker texture
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "";
    loader.load(
      "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png",
      (texture) => setSpriteMap(texture),
      undefined,
      (error) => console.error("Error loading marker texture:", error)
    );
  }, []);

  // 8) Slow rotation
  useEffect(() => {
    const rotationSpeed = 0.1;
    const rotateGlobe = () => {
      if (globeEl.current) {
        const { lat, lng } = globeEl.current.pointOfView();
        globeEl.current.pointOfView({ lat, lng: lng + rotationSpeed });
      }
    };
    const interval = setInterval(rotateGlobe, 100);
    return () => clearInterval(interval);
  }, []);

  const { width, height } = getGlobeDimensions();

  return (
    <div className="max-w-7xl mx-auto px-3">
      <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-4 lg:space-y-0">
        <div className="flex-1 flex justify-center items-center min-h-[280px] md:min-h-[360px]">
          <Globe
            ref={globeEl}
            width={width}
            height={height}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            backgroundImageUrl={
              darkMode ? "//unpkg.com/three-globe/example/img/night-sky.png" : ""
            }
            backgroundColor={darkMode ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"}
            showAtmosphere={true}
            objectsData={minerLocations}
            arcsData={connectionsData}
            objectLat="lat"
            objectLng="lng"
            objectAltitude={0.04}
            objectLabel={(d) => `${d.name} (${d.miners.length} miners)`}
            objectThreeObject={(d) => {
              // Make the markers bigger
              const spriteMaterial = new THREE.SpriteMaterial({ 
                map: spriteMap, 
                color: d.miners.some(m => m.current_status === 'active') ? 0x00ff00 : 0xff0000 
              });

              const sprite = new THREE.Sprite(spriteMaterial);
              
              // Larger scale
              const isMobile = dimensions.width < 768;
              const scale = isMobile ? 2 : 3; // bigger pointer
              sprite.scale.set(scale, scale, scale);

              return sprite;
            }}
            arcStartLat="startLat"
            arcStartLng="startLng"
            arcEndLat="endLat"
            arcEndLng="endLng"
            arcColor="color"
            arcDashLength={0.1}
            arcDashGap={0.02}
            arcDashInitialGap={(d) => Math.random()}
            arcStroke={0.15}
            arcDashAnimateTime={15000}
            onObjectClick={(location) => {
              // Show the modal with the location's data
              setSelectedLocation(location);
              setShowModal(true);
            }}
          />

          {showModal && (
            <Modal
              locationData={selectedLocation}
              onClose={() => setShowModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComputeMiners;
