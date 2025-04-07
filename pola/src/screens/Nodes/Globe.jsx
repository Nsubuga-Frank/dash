import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from "react";
import Globe from 'react-globe.gl';
import * as THREE from "three";
import db from '../firebase/config';
import ElectricityStats from "./ElectricityStats";
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
                                        <div className="font-medium text-gray-900">{miner.username}</div>
                                        <div className="text-sm text-gray-500">Status: {miner.status}</div>
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

const World = ({darkMode}) => {
    const globeEl = useRef();
    const [spriteMap, setSpriteMap] = useState(null);
    const [minerLocations, setMinerLocations] = useState([]);
    const [connectionsData, setConnectionsData] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 800,
        height: typeof window !== 'undefined' ? window.innerHeight : 600
    });

    useEffect(() => {
        const minersRef = collection(db, "miners");
        
        const unsubscribe = onSnapshot(minersRef, (snapshot) => {
            const locations = new Map();
            
            snapshot.docs.forEach(doc => {
                const miner = doc.data();
                const locationRaw = miner.location?.toLowerCase() || '';
                const locationParts = locationRaw.split(',').map(part => part.trim());
                let coordinates = null;
                
                for (const part of locationParts) {
                    if (coordinatesDB[part]) {
                        coordinates = coordinatesDB[part];
                        break;
                    }
                }
                
                if (coordinates) {
                    const locationKey = `${coordinates.lat},${coordinates.lng}`;
                    if (!locations.has(locationKey)) {
                        locations.set(locationKey, {
                            name: miner.location,
                            lat: coordinates.lat,
                            lng: coordinates.lng,
                            miners: []
                        });
                    }
                    
                    const locationData = locations.get(locationKey);
                    locationData.miners.push({
                        username: miner.username,
                        status: miner.status,
                        metrics: miner.metrics
                    });
                }
            });
            
            const locationArray = Array.from(locations.values());
            setMinerLocations(locationArray);
            
            if (locationArray.length > 1) {
                setConnectionsData(
                    locationArray.map((location, index) => ({
                        startLat: location.lat,
                        startLng: location.lng,
                        endLat: locationArray[(index + 1) % locationArray.length].lat,
                        endLng: locationArray[(index + 1) % locationArray.length].lng,
                        color: darkMode ? '#FFD700' : '#342907FF',
                    }))
                );
            }
        });

        return () => unsubscribe();
    }, [darkMode]);

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

    useEffect(() => {
        if (globeEl.current) {
            const { altitude } = getGlobeDimensions();
            globeEl.current.pointOfView({ lat: 20, lng: 0, altitude });
        }
    }, [dimensions]);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = "";
        loader.load(
            "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png",
            (texture) => setSpriteMap(texture),
            undefined,
            (error) => console.error("An error occurred while loading the texture:", error)
        );
    }, []);

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
                    <div className="w-full">
                        <ElectricityStats darkMode={darkMode} />
                    </div>
                     <div className="flex-1 flex justify-center items-center min-h-[280px] md:min-h-[360px]"> 
                        <Globe
                            ref={globeEl}
                            width={width}
                            height={height}
                            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                            backgroundImageUrl={darkMode ? "//unpkg.com/three-globe/example/img/night-sky.png" : ""}
                            backgroundColor={darkMode ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"}
                            showAtmosphere={true}
                            objectsData={minerLocations}
                            arcsData={connectionsData}
                            objectLat="lat"
                            objectLng="lng"
                            objectAltitude={0.04}
                            objectLabel={(d) => `${d.name} (${d.miners.length} miners)`}
                            objectThreeObject={(d) => {
                                const spriteMaterial = new THREE.SpriteMaterial({ 
                                    map: spriteMap, 
                                    color: d.miners.some(m => m.status === 'active') ? 0x00ff00 : 0xff0000 
                                });
                                const sprite = new THREE.Sprite(spriteMaterial);
                                const scale = dimensions.width < 768 ? 1.2 : 2;
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

export default World;