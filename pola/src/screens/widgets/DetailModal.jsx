// DetailModal.js

import { MemoryOutlined } from '@material-ui/icons';
import {
    AlertCircle,
    Cpu,
    Globe,
    Network,
    X
} from 'lucide-react';
import React from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const DetailModal = ({ miner, onClose }) => {
  // Extended metrics with more detail for the expanded view
  const extendedMetrics = miner.metrics.map((m, i) => ({
    ...m,
    epoch: i + 1,
    timestamp: new Date(Date.now() - (miner.metrics.length - i) * 3600000).toISOString(),
    learningRate: 0.001 * Math.pow(0.95, i),
    batchesProcessed: 1000 + i * 1000,
    timeElapsed: i * 3600,
    validationLoss: m.loss + 0.02,
    gpuUtil: 85 + Math.random() * 10,
    memoryUtil: 90 + Math.random() * 5,
    throughput: 156 + Math.random() * 20,
  }));

  const Stats = ({ label, value, icon: Icon, secondary }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <span className="text-gray-900 font-medium">{value}</span>
        </div>
        {secondary && <span className="text-sm text-gray-500">{secondary}</span>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  ${
                    miner.rank === 1
                      ? 'bg-yellow-100 text-yellow-700'
                      : miner.rank === 2
                      ? 'bg-gray-100 text-gray-700'
                      : miner.rank === 3
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
            >
              {miner.rank}
            </span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{miner.name}</h2>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {miner.location}
              </div>
            </div>
            {miner.rank <= 3 && (
              <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                {miner.prize} τ Daily Reward
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <Stats label="Status" value={miner.status} secondary={miner.uptime} icon={AlertCircle} />
            <Stats label="Hardware" value="4x NVIDIA A100" secondary="GPU" icon={Cpu} />
            <Stats label="Memory Usage" value="124GB / 128GB" secondary="96.8%" icon={MemoryOutlined} />
            <Stats label="Network Throughput" value="2.4 GB/s" secondary="Peak" icon={Network} />
          </div>

          {/* Training Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Training Progress</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Epoch {extendedMetrics.length} of 100
                </span>
                <span className="text-sm text-gray-500">Time Remaining: ~42h</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={extendedMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="epoch"
                    stroke="#6b7280"
                    label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    yAxisId="left"
                    label={{ value: 'Loss', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Accuracy', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="loss"
                    stroke="#dc2626"
                    name="Training Loss"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="validationLoss"
                    stroke="#ea580c"
                    name="Validation Loss"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="acc"
                    stroke="#059669"
                    name="Accuracy"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Training Details and Updates */}
          <div className="grid grid-cols-2 gap-6">
            {/* Training Parameters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Training Parameters</h3>
              <div className="space-y-3">
                {[
                  ['Learning Rate', '0.001', 'Adaptive'],
                  ['Batch Size', '32', 'Global'],
                  ['Optimizer', 'Adam', 'β1=0.9, β2=0.999'],
                  ['Model Size', '1.2B parameters', '4.8GB'],
                  ['Dataset Size', '2.5M samples', '156GB'],
                  ['Training Steps', '500K', 'Completed'],
                ].map(([label, value, secondary]) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-500">{label}</span>
                    <div className="text-right">
                      <span className="text-gray-900 font-medium">{value}</span>
                      {secondary && (
                        <span className="text-gray-500 text-sm ml-2">({secondary})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Updates</h3>
              <div className="space-y-4">
                {extendedMetrics
                  .slice(-5)
                  .reverse()
                  .map((metric, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        {idx !== extendedMetrics.length - 1 && (
                          <div className="absolute top-3 left-1 w-px h-full -ml-px bg-gray-200"></div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Epoch {metric.epoch} completed
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Loss: {metric.loss.toFixed(3)} | Accuracy:{' '}
                          {(metric.acc * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          GPU Util: {metric.gpuUtil.toFixed(1)}% | Memory:{' '}
                          {metric.memoryUtil.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(metric.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
