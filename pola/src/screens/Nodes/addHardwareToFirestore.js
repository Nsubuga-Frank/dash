// addHardwareToFirestore.js
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import db from '../firebase/config';

const addHardwareToFirestore = async () => {
  const gpuData = [
    {
      name: 'NVIDIA A4000 x2',
      brand: 'Nvidia',  // Added brand
      status: 'available',
      location: 'Alchemy',
      ipAddress: '192.168.10.129',
      sshAccess: 'tang@24.83.13.62 -p12000',
      portRange: '12001-12101',
      model: 'T5820',
      specifications: {
        cpuInfo: 'Intel Xeon W-2125 CPU @ 4.00GHz',
        cores: 8,
        cpuMaxMHz: 4500.0000,
        memory: '48G',
        storage: '2T NVME',
      },
      containers: [
        { name: 'user1_container', status: 'in-use' },
        { name: 'user2_container', status: 'available' }
      ],
      costPerHour: '0.8'
    },
    {
      name: 'NVIDIA A4000 x2',
      brand: 'Nvidia',  // Added brand
      status: 'available',
      location: 'Alchemy',
      ipAddress: '192.168.10.130',
      sshAccess: 'tang@24.83.13.62 -p12001',
      portRange: '12002-12102',
      model: 'T5820',
      specifications: {
        cpuInfo: 'Intel Xeon W-2125 CPU @ 4.00GHz',
        cores: 8,
        cpuMaxMHz: 4500.0000,
        memory: '48G',
        storage: '2T NVME',
      },
      containers: [],
      costPerHour: '0.5'
    }
  ];

  const cpuData = [
    {
      name: 'HP DL360 G9',
      brand: 'Intel',  // Added brand
      status: 'in-use',
      location: 'Alchemy',
      ipAddress: '192.168.10.131',
      sshAccess: 'tang@24.83.13.62 -p12002',
      portRange: '12102-12202',
      model: 'Server',
      specifications: {
        cpuInfo: 'Intel Xeon E5-2680 v4 @ 2.40GHz',
        cores: 16,
        cpuMaxMHz: 2400.0000,
        memory: '128G',
        storage: '1.8T NVME',
      },
      containers: [],
      costPerHour: '0.35'
    },
    {
      name: 'HP DL360 G9',
      brand: 'Intel',  // Added brand
      status: 'available',
      location: 'Alchemy',
      ipAddress: '192.168.10.132',
      sshAccess: 'tang@24.83.13.62 -p12003',
      portRange: '12103-12203',
      model: 'Server',
      specifications: {
        cpuInfo: 'Intel Xeon E5-2680 v4 @ 2.40GHz',
        cores: 16,
        cpuMaxMHz: 2400.0000,
        memory: '128G',
        storage: '1.8T NVME',
      },
      containers: [
        { name: 'backup_container', status: 'available' }
      ],
      costPerHour: '0.35'
    }
  ];

  try {
    // Reference to GPU and CPU subcollections
    const gpuCollection = collection(db, 'hardware', 'gpu', 'items');
    const cpuCollection = collection(db, 'hardware', 'cpu', 'items');

    // Add GPU data
    gpuData.forEach(async (gpu) => {
      const gpuDocRef = doc(gpuCollection); // Automatically generate document ID
      const existingDoc = await getDoc(gpuDocRef);

      if (!existingDoc.exists()) {
        await setDoc(gpuDocRef, gpu);
      }
    });

    // Add CPU data
    cpuData.forEach(async (cpu) => {
      const cpuDocRef = doc(cpuCollection); // Automatically generate document ID
      const existingDoc = await getDoc(cpuDocRef);

      if (!existingDoc.exists()) {
        await setDoc(cpuDocRef, cpu);
      }
    });

    console.log("Hardware data added to Firestore!");
  } catch (error) {
    console.error("Error adding hardware data: ", error);
  }
};

export default addHardwareToFirestore;
