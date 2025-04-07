// Sample cluster data
export const initialClusters = [
  {
    name: 'Node-GPU-A100',
    status: 'Running',
    cpuUsage: 45,
    memoryUsage: 32,
    createdAt: '2023-10-08',
    incident: false
  },
  {
    name: 'Node-CPU-Cluster1',
    status: 'Running',
    cpuUsage: 78,
    memoryUsage: 65,
    createdAt: '2023-10-10',
    incident: true
  },
  {
    name: 'Node-H100-Deployment',
    status: 'Deploying',
    cpuUsage: 18,
    memoryUsage: 24,
    createdAt: '2023-10-12',
    incident: false
  },
  {
    name: 'Node-RTX-A6000',
    status: 'Running',
    cpuUsage: 92,
    memoryUsage: 88,
    createdAt: '2023-10-05',
    incident: false
  },
  {
    name: 'Node-T4-Cluster',
    status: 'Failed',
    cpuUsage: 0,
    memoryUsage: 0,
    createdAt: '2023-10-11',
    incident: true
  },
  {
    name: 'Node-TPU-V4',
    status: 'Terminated',
    cpuUsage: 0,
    memoryUsage: 0,
    createdAt: '2023-09-28',
    incident: false
  },
  {
    name: 'Node-CPU-XS',
    status: 'Running',
    cpuUsage: 35,
    memoryUsage: 42,
    createdAt: '2023-10-01',
    incident: false
  },
  {
    name: 'Node-H100-Compute',
    status: 'Running',
    cpuUsage: 65,
    memoryUsage: 72,
    createdAt: '2023-10-03',
    incident: false
  }
]; 