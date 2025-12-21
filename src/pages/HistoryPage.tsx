import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  ExternalLink,
  Filter,
  ChevronDown
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlowingButton from '@/components/ui/GlowingButton';

const mockComplaints = [
  {
    id: 'CVC-2024-001',
    category: 'Theft & Robbery',
    station: 'Governorpet Police Station',
    date: '2024-01-15',
    status: 'resolved',
    txHash: '0x8f3a9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    updates: [
      { date: '2024-01-15', message: 'Complaint submitted' },
      { date: '2024-01-16', message: 'Assigned to Inspector Raju' },
      { date: '2024-01-18', message: 'Investigation in progress' },
      { date: '2024-01-25', message: 'FIR filed successfully' },
      { date: '2024-02-10', message: 'Case resolved' },
    ],
  },
  {
    id: 'CVC-2024-002',
    category: 'Road Accident',
    station: 'Benz Circle Police Station',
    date: '2024-02-20',
    status: 'in_progress',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    updates: [
      { date: '2024-02-20', message: 'Complaint submitted' },
      { date: '2024-02-21', message: 'Assigned to Inspector Kumar' },
      { date: '2024-02-23', message: 'Evidence collection ongoing' },
    ],
  },
  {
    id: 'CVC-2024-003',
    category: 'Harassment',
    station: 'Patamata Police Station',
    date: '2024-03-05',
    status: 'pending',
    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    updates: [
      { date: '2024-03-05', message: 'Complaint submitted' },
      { date: '2024-03-06', message: 'Under review' },
    ],
  },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'text-warning bg-warning/20', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-primary bg-primary/20', icon: AlertCircle },
  resolved: { label: 'Resolved', color: 'text-success bg-success/20', icon: CheckCircle },
};

const HistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredComplaints = filter === 'all' 
    ? mockComplaints 
    : mockComplaints.filter(c => c.status === filter);

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <Navbar />

      <main className="relative z-10 pt-24 md:pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
              <HistoryIcon className="text-primary" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Complaint <span className="gradient-text">History</span>
            </h1>
            <p className="text-muted-foreground">
              Track all your complaints and their blockchain-verified status
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {(['all', 'pending', 'in_progress', 'resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {filteredComplaints.map((complaint, index) => {
              const StatusIcon = statusConfig[complaint.status as keyof typeof statusConfig].icon;
              const isExpanded = expandedId === complaint.id;

              return (
                <GlassCard key={complaint.id} delay={index * 0.1} hover={false}>
                  <div 
                    className="cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="text-primary" size={24} />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold mb-1">{complaint.id}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{complaint.category}</p>
                          <p className="text-xs text-muted-foreground">{complaint.station}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig[complaint.status as keyof typeof statusConfig].color}`}>
                          <StatusIcon size={14} />
                          {statusConfig[complaint.status as keyof typeof statusConfig].label}
                        </span>
                        <ChevronDown 
                          className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          size={20} 
                        />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-glass-border"
                    >
                      {/* Transaction Hash */}
                      <div className="glass rounded-lg p-3 mb-4">
                        <p className="text-xs text-muted-foreground mb-1">Blockchain Transaction</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-primary font-mono truncate flex-1">
                            {complaint.txHash}
                          </code>
                          <a
                            href={`https://explorer.aptoslabs.com/txn/${complaint.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>

                      {/* Timeline */}
                      <h4 className="font-medium mb-4">Case Timeline</h4>
                      <div className="space-y-4">
                        {complaint.updates.map((update, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${i === complaint.updates.length - 1 ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                              {i < complaint.updates.length - 1 && (
                                <div className="w-0.5 h-full bg-muted mt-1" />
                              )}
                            </div>
                            <div className="pb-4">
                              <p className="text-xs text-muted-foreground">{update.date}</p>
                              <p className="text-sm font-medium">{update.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 mt-4">
                        <GlowingButton variant="secondary" size="sm">
                          Download FIR
                        </GlowingButton>
                        <GlowingButton variant="primary" size="sm">
                          Contact Officer
                        </GlowingButton>
                      </div>
                    </motion.div>
                  )}
                </GlassCard>
              );
            })}
          </div>

          {filteredComplaints.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">No complaints found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
