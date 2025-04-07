import { countryToRegionMap } from "./countryToRegionMap";

export const transformHardwareData = (hardwareList) => {
  console.log('Starting hardware transformation with:', hardwareList);

  return hardwareList.map((hardware) => {
    // Existing resource logic (CPU, GPU, RAM, etc.)...
    const ramValue = parseFloat(hardware.ram?.replace(/GB/i, '').trim()) || 0;
    const vcpu = hardware.cpu_specs?.total_cpus || 0;
    const cpuName = hardware.cpu_specs?.cpu_name || hardware.cpu_name;

    const storage = {
      capacity: hardware.storage?.capacity
        ? parseFloat(hardware.storage.capacity.replace(/GB/i, '').trim())
        : 0,
      type: hardware.storage?.type || 'HDD',
      read_speed: hardware.storage?.read_speed,
      write_speed: hardware.storage?.write_speed,
    };

    let gpu = null;
    let vram = 0;
    if (hardware.resource_type === 'GPU') {
      const gpuMatch = hardware.gpu?.match(/^(\d+)x\s+(.+)/i);
      if (gpuMatch) {
        gpu = hardware.gpu;
        const gpuName = gpuMatch[2];
        const gpuVramMap = {
          'Nvidia RTX 4090': 24,
          'Nvidia RTX 4000 Ada': 20,
          'Nvidia L40S': 48,
          'Nvidia A100': 80,
          'Nvidia H100': 80,
        };
        vram = gpuVramMap[gpuName] || 0;
      }
    }

    // Determine region from location
    const locationParts = hardware.location?.split(',');
    const countryCode = locationParts?.[locationParts.length - 1]?.trim()?.toUpperCase() || '';
    const region = countryToRegionMap[countryCode] || 'Other';

    // ----- PARSE SSH + PASSWORD INTO ssh_config -----
    const sshString = hardware.network?.ssh;
    const sshPassword = hardware.network?.password;

    // Provide default values so we always have a well-formed object
    let ssh_config = {
      host: null,
      username: null,
      port: null,
      password: sshPassword || null,
    };

    if (sshString) {
      try {
        // Try parsing with the URL API
        const url = new URL(sshString);
        ssh_config.host = url.hostname;       // e.g. "24.83.13.62"
        ssh_config.username = url.username;   // e.g. "tang"
        ssh_config.port = url.port;           // e.g. "15000"
      } catch (err) {
        // Fallback to manual parsing if needed
        const sshWithoutProtocol = sshString.replace(/^ssh:\/\//, '');
        const [userAndHost, port] = sshWithoutProtocol.split(':');
        const [username, hostname] = userAndHost.split('@');

        ssh_config.host = hostname;
        ssh_config.username = username;
        ssh_config.port = port;
      }
    }
    
    // Log just for debugging (remove in production):
    console.log(`ssh_config for ${hardware.id}:`, ssh_config);

    return {
      id: hardware.id,
      name: cpuName || hardware.gpu_name || 'Unknown Instance',
      vcpu,
      ram: ramValue,
      vram,
      gpu,
      storage,
      price: hardware.hourly_price || 0,
      resource_type: hardware.resource_type || 'CPU',
      location: hardware.location,
      region,
      miner: hardware.miners?.[0] || null,
      // Attach the combined ssh_config
      ssh_config,
    };
  });
};
