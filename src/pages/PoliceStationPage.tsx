import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Filter,
    Search,
    Bell,
    ChevronDown,
    MapPin,
    User,
    Phone,
    Calendar
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlowingButton from '@/components/ui/GlowingButton';

interface Complaint {
    id: string;
    category: string;
    station: string;
    date: string;
    status: 'pending' | 'in_progress' | 'resolved';
    txHash: string;
    nftTxHash?: string;
    formData: {
        fullName: string;
        phone: string;
        email: string;
        aadhar: string;
        address: string;
        incidentDate: string;
        incidentTime: string;
        incidentLocation: string;
        description: string;
        witnesses: string;
    };
    evidenceCids: string;
    timestamp: number;
}

const statusConfig = {
    pending: { label: 'Pending', color: 'text-warning bg-warning/20', icon: Clock },
    in_progress: { label: 'In Progress', color: 'text-primary bg-primary/20', icon: AlertCircle },
    resolved: { label: 'Resolved', color: 'text-success bg-success/20', icon: CheckCircle },
};

const PoliceStationPage: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedStation, setSelectedStation] = useState<string>('all');

    useEffect(() => {
        loadComplaints();
        // Reload every 10 seconds to check for new complaints
        const interval = setInterval(loadComplaints, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadComplaints = () => {
        const stored = localStorage.getItem('complaints');
        if (stored) {
            const parsed = JSON.parse(stored);
            setComplaints(parsed);
        }
    };

    // Get unique stations
    const stations = ['all', ...Array.from(new Set(complaints.map(c => c.station)))];

    // Filter complaints
    const filteredComplaints = complaints.filter(complaint => {
        const matchesFilter = filter === 'all' || complaint.status === filter;
        const matchesStation = selectedStation === 'all' || complaint.station === selectedStation;
        const matchesSearch = searchQuery === '' ||
            complaint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            complaint.formData.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            complaint.category.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesStation && matchesSearch;
    });

    // Count by status
    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

    return (
        <div className="min-h-screen relative">
            <ParticleBackground />
            <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />

            <Navbar />

            <main className="relative z-10 pt-24 md:pt-28 pb-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                                <Shield className="text-primary" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold">
                                    Police Station <span className="gradient-text">Dashboard</span>
                                </h1>
                                <p className="text-muted-foreground">
                                    Monitor and manage all citizen complaints
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                            <GlassCard className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Complaints</p>
                                        <p className="text-2xl font-bold">{complaints.length}</p>
                                    </div>
                                    <FileText className="text-primary" size={32} />
                                </div>
                            </GlassCard>
                            <GlassCard className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending</p>
                                        <p className="text-2xl font-bold text-warning">{pendingCount}</p>
                                    </div>
                                    <Clock className="text-warning" size={32} />
                                </div>
                            </GlassCard>
                            <GlassCard className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">In Progress</p>
                                        <p className="text-2xl font-bold text-primary">{inProgressCount}</p>
                                    </div>
                                    <AlertCircle className="text-primary" size={32} />
                                </div>
                            </GlassCard>
                            <GlassCard className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Resolved</p>
                                        <p className="text-2xl font-bold text-success">{resolvedCount}</p>
                                    </div>
                                    <CheckCircle className="text-success" size={32} />
                                </div>
                            </GlassCard>
                        </div>
                    </motion.div>

                    {/* Filters and Search */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, name, or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-input border border-glass-border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        </div>

                        {/* Station Filter */}
                        <select
                            value={selectedStation}
                            onChange={(e) => setSelectedStation(e.target.value)}
                            className="bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            {stations.map(station => (
                                <option key={station} value={station}>
                                    {station === 'all' ? 'All Stations' : station}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            {(['all', 'pending', 'in_progress', 'resolved'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${filter === status
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Complaints List */}
                    <div className="space-y-4">
                        {filteredComplaints.length === 0 ? (
                            <GlassCard className="p-12 text-center">
                                <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
                                <p className="text-muted-foreground">No complaints found</p>
                            </GlassCard>
                        ) : (
                            filteredComplaints.map((complaint, index) => {
                                const StatusIcon = statusConfig[complaint.status].icon;
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
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={14} />
                                                                {complaint.station}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                {complaint.date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig[complaint.status].color}`}>
                                                        <StatusIcon size={14} />
                                                        {statusConfig[complaint.status].label}
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
                                                {/* Complainant Details */}
                                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                                    <div className="glass rounded-lg p-4">
                                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                                            <User size={18} />
                                                            Complainant Details
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <p><span className="text-muted-foreground">Name:</span> {complaint.formData.fullName}</p>
                                                            <p><span className="text-muted-foreground">Phone:</span> {complaint.formData.phone}</p>
                                                            <p><span className="text-muted-foreground">Email:</span> {complaint.formData.email}</p>
                                                            <p><span className="text-muted-foreground">Aadhar:</span> {complaint.formData.aadhar}</p>
                                                            <p><span className="text-muted-foreground">Address:</span> {complaint.formData.address}</p>
                                                        </div>
                                                    </div>

                                                    <div className="glass rounded-lg p-4">
                                                        <h4 className="font-medium mb-3">Incident Details</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <p><span className="text-muted-foreground">Date:</span> {complaint.formData.incidentDate}</p>
                                                            <p><span className="text-muted-foreground">Time:</span> {complaint.formData.incidentTime}</p>
                                                            <p><span className="text-muted-foreground">Location:</span> {complaint.formData.incidentLocation}</p>
                                                            <p><span className="text-muted-foreground">Witnesses:</span> {complaint.formData.witnesses || 'None'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="glass rounded-lg p-4 mb-4">
                                                    <h4 className="font-medium mb-2">Description</h4>
                                                    <p className="text-sm text-muted-foreground">{complaint.formData.description}</p>
                                                </div>

                                                {/* Evidence */}
                                                {complaint.evidenceCids && (
                                                    <div className="glass rounded-lg p-4 mb-4">
                                                        <h4 className="font-medium mb-2">Evidence (IPFS)</h4>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-xs text-primary font-mono truncate flex-1">
                                                                {complaint.evidenceCids}
                                                            </code>
                                                            <a
                                                                href={`https://ipfs.io/ipfs/${complaint.evidenceCids.split(',')[0]}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:text-primary/80"
                                                            >
                                                                <ExternalLink size={16} />
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Transaction Hashes */}
                                                <div className="glass rounded-lg p-4 mb-4">
                                                    <h4 className="font-medium mb-3">Blockchain Verification</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground mb-1">Complaint Submission</p>
                                                            <div className="flex items-center gap-2">
                                                                <code className="text-xs text-primary font-mono truncate flex-1">
                                                                    {complaint.txHash}
                                                                </code>
                                                                <a
                                                                    href={`https://explorer.aptoslabs.com/txn/${complaint.txHash}?network=testnet`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary hover:text-primary/80"
                                                                >
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                            </div>
                                                        </div>
                                                        {complaint.nftTxHash && (
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">NFT Receipt</p>
                                                                <div className="flex items-center gap-2">
                                                                    <code className="text-xs text-success font-mono truncate flex-1">
                                                                        {complaint.nftTxHash}
                                                                    </code>
                                                                    <a
                                                                        href={`https://explorer.aptoslabs.com/txn/${complaint.nftTxHash}?network=testnet`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-success hover:text-success/80"
                                                                    >
                                                                        <ExternalLink size={16} />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-3">
                                                    <GlowingButton variant="primary" size="sm">
                                                        Update Status
                                                    </GlowingButton>
                                                    <GlowingButton variant="secondary" size="sm">
                                                        Assign Officer
                                                    </GlowingButton>
                                                    <GlowingButton variant="secondary" size="sm">
                                                        <Phone size={16} className="mr-2" />
                                                        Contact Complainant
                                                    </GlowingButton>
                                                </div>
                                            </motion.div>
                                        )}
                                    </GlassCard>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PoliceStationPage;
