// src/data/data.js

export const initialClusters = [
  {
    status: 'Running',
    name: 'Mega cluster testing redis',
    timeRemaining: '68 Hrs 44 Mins',
    gpu: { type: 'Ryzen 7000', count: 'x32' },
    clusterType: 'Mega Cluster',
    cpuUsage: 78,
    memoryUsage: 65
  },
  {
    status: 'Failed',
    name: 'Testing new QTY',
    timeRemaining: '68 Hrs 44 Mins',
    gpu: { type: 'RTX 3090', count: 'x7' },
    incident: true,
    cpuUsage: 0,
    memoryUsage: 0
  },
  {
    status: 'Running',
    name: 'TESTNET HK',
    timeRemaining: '56 Hrs 22 Mins',
    gpu: { type: 'RTX 4090', count: 'x2' },
    cpuUsage: 45,
    memoryUsage: 32
  },
  {
    status: 'Failed',
    name: 'taiwo mega cluster connectivity 1',
    timeRemaining: '49 Hrs 23 Mins',
    gpu: { type: 'M2 ULTRA', count: 'x55' },
    clusterType: 'Mega Cluster',
    incident: true,
    cpuUsage: 0,
    memoryUsage: 0
  },
  {
    status: 'Deploying',
    name: 'taiwo mega cluster connectivity 2',
    timeRemaining: '12 Hrs 13 Sec',
    gpu: { type: 'M2 ULTRA', count: 'x69' },
    clusterType: 'Mega Cluster',
    cpuUsage: 22,
    memoryUsage: 18
  },
  {
    status: 'Running',
    name: 'taiwo mega cluster connectivity 3',
    timeRemaining: '12 Hrs 21 Mins',
    gpu: { type: 'Ryzen 7000', count: 'x1' },
    cpuUsage: 91,
    memoryUsage: 87
  },
  {
    status: 'Deploying',
    name: 'Latitude.sh test',
    timeRemaining: '12 Hrs 13 Sec',
    gpu: { type: 'M2 ULTRA', count: 'x1' },
    cpuUsage: 12,
    memoryUsage: 9
  },
  {
    status: 'Running',
    name: 'TESTNET HK',
    timeRemaining: '56 Hrs 22 Mins',
    gpu: { type: 'RTX 4090', count: 'x2' },
    cpuUsage: 45,
    memoryUsage: 32
  },
  {
    status: 'Failed',
    name: 'taiwo mega cluster connectivity 1',
    timeRemaining: '49 Hrs 23 Mins',
    gpu: { type: 'M2 ULTRA', count: 'x55' },
    clusterType: 'Mega Cluster',
    incident: true,
    cpuUsage: 0,
    memoryUsage: 0
  },
  {
    status: 'Deploying',
    name: 'taiwo mega cluster connectivity 2',
    timeRemaining: '12 Hrs 13 Sec',
    gpu: { type: 'M2 ULTRA', count: 'x69' },
    clusterType: 'Mega Cluster',
    cpuUsage: 22,
    memoryUsage: 18
  },
  {
    status: 'Running',
    name: 'taiwo mega cluster connectivity 3',
    timeRemaining: '12 Hrs 21 Mins',
    gpu: { type: 'Ryzen 7000', count: 'x1' },
    cpuUsage: 91,
    memoryUsage: 87
  },
  {
    status: 'Deploying',
    name: 'Latitude.sh test',
    timeRemaining: '12 Hrs 13 Sec',
    gpu: { type: 'M2 ULTRA', count: 'x1' },
    cpuUsage: 12,
    memoryUsage: 9
  }
];

// You can add more data exports here, like:
export const gpuTypes = ['RTX 3090', 'RTX 4090', 'M2 ULTRA', 'Ryzen 7000'];

export const clusterTypes = ['Standard Cluster', 'Mega Cluster'];

// For usage in charts or statistics
export const usageThresholds = {
  low: 60,
  high: 80
};