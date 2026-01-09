import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  History as HistoryIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  ChevronDown,
  Shield,
  Image as ImageIcon
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlowingButton from '@/components/ui/GlowingButton';

const statusConfig = {
  pending: { label: 'Pending', color: 'text-warning bg-warning/20', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-primary bg-primary/20', icon: AlertCircle },
  resolved: { label: 'Resolved', color: 'text-success bg-success/20', icon: CheckCircle },
};

const HistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/complaints');
        // Map MongoDB data to UI expected format if needed
        const mappedData = response.data.map((item: any) => ({
          ...item,
          id: item.transactionHash, // Use txHash as ID for UI
          formData: item.formData || {}, // Ensure formData exists
          txHash: item.transactionHash // Ensure txHash exists
        }));
        setComplaints(mappedData);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };
    fetchComplaints();
  }, []);

  const filteredComplaints = filter === 'all'
    ? complaints
    : complaints.filter(c => c.status === filter);

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
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === status
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
              const statusInfo = statusConfig[complaint.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;
              const isExpanded = expandedId === complaint.id;

              return (
                <GlassCard key={complaint.id} delay={index * 0.05} hover={false}>
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
                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon size={14} />
                          {statusInfo.label}
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
                      {/* Complaint Details */}
                      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold mb-1">Description</p>
                          <p className="text-sm text-muted-foreground">{complaint.formData?.description || "No description provided."}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-1">Incident Date</p>
                          <p className="text-sm text-muted-foreground">{complaint.formData?.incidentDate || "N/A"}</p>
                        </div>
                      </div>

                      {/* Transaction Hash */}
                      <div className="glass rounded-lg p-3 mb-4">
                        <p className="text-xs text-muted-foreground mb-1">Complaint Transaction Hash</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-primary font-mono truncate flex-1">
                            {complaint.txHash}
                          </code>
                          <a
                            href={`https://explorer.aptoslabs.com/txn/${complaint.txHash}?network=mainnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>

                      {/* NFT & Minting Details */}
                      {complaint.nftTxHash ? (
                        <div className="glass rounded-lg p-3 mb-4 border border-primary/20 bg-primary/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield size={14} className="text-primary" />
                            <p className="text-xs font-semibold text-primary">NFT Receipt Minted</p>
                          </div>

                          <p className="text-xs text-muted-foreground mb-1 mt-2">NFT Transaction Hash</p>
                          <div className="flex items-center gap-2 mb-3">
                            <code className="text-xs text-primary font-mono truncate flex-1">
                              {complaint.nftTxHash}
                            </code>
                            <a
                              href={`https://explorer.aptoslabs.com/txn/${complaint.nftTxHash}?network=mainnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>

                          {complaint.nftMetadataUri && (
                            <a
                              href={complaint.nftMetadataUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-primary hover:underline"
                            >
                              <ImageIcon size={14} />
                              View NFT Metadata
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="glass rounded-lg p-3 mb-4 bg-muted/20">
                          <p className="text-xs text-muted-foreground">NFT Receipt not yet minted.</p>
                        </div>
                      )}

                      {/* FIR Details */}
                      {complaint.firCid && (
                        <div className="glass rounded-lg p-3 mb-4 border border-success/20 bg-success/5">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={14} className="text-success" />
                            <p className="text-xs font-semibold text-success">FIR Filed</p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Police have filed the First Information Report.
                          </p>
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${complaint.firCid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2 bg-success/10 hover:bg-success/20 rounded-lg text-success text-xs font-medium transition-colors"
                          >
                            <FileText size={14} />
                            View FIR Document
                          </a>
                        </div>
                      )}

                      {/* Case Timeline / Notifications */}
                      {complaint.updates && complaint.updates.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3">Case Updates</h4>
                          <div className="space-y-4">
                            {complaint.updates.map((update: any, i: number) => (
                              <div key={i} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className={`w-2 h-2 rounded-full ${i === complaint.updates.length - 1 ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                                  {i < complaint.updates.length - 1 && (
                                    <div className="w-0.5 h-full bg-muted mt-1" />
                                  )}
                                </div>
                                <div className="pb-2">
                                  <p className="text-xs text-muted-foreground">{update.date}</p>
                                  <p className="text-sm">{update.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
