import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { useWallet } from '@/contexts/WalletContext';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const MODULE_ADDRESS = "0x9d126517d68655aea9808d8267a298cb9226eaad30f0b9ad37b4b94685f637f9";

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
    firCid?: string;
    firNftTxHash?: string;
    updates?: { date: string; message: string }[];
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
    const [activeFirComplaintId, setActiveFirComplaintId] = useState<string | null>(null);
    const [selectedFirFile, setSelectedFirFile] = useState<File | null>(null);
    const [firDetails, setFirDetails] = useState({ accused: '', offense: '', message: '' });

    // Detailed Status State
    const [processingStatus, setProcessingStatus] = useState<string>("");

    // Message State
    const [messageModalOpen, setMessageModalOpen] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageRecipientId, setMessageRecipientId] = useState<string | null>(null);

    const { signAndSubmitTransaction, account, network } = useWallet(); // Wallet access for FIR Minting

    // Initialize Aptos Client dynamically based on Wallet Network
    const aptos = React.useMemo(() => {
        // Default to Testnet if network is not available or mainnet
        let networkName = Network.TESTNET;
        if (network && network.name) {
            const n = network.name.toLowerCase();
            if (n.includes('mainnet')) networkName = Network.MAINNET;
            else if (n.includes('testnet')) networkName = Network.TESTNET;
            else if (n.includes('devnet')) networkName = Network.DEVNET;
        }
        console.log("Using Aptos Network:", networkName);
        return new Aptos(new AptosConfig({ network: networkName }));
    }, [network]);

    const uploadToPinata = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const metadata = JSON.stringify({
            name: `FIR-${file.name}`,
        });
        formData.append('pinataMetadata', metadata);

        const options = JSON.stringify({
            cidVersion: 0,
        });
        formData.append('pinataOptions', options);

        try {
            const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                maxBodyLength: Infinity,
                headers: {
                    'Content-Type': `multipart/form-data;`,
                    'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
                    'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_API_KEY,
                }
            });
            return res.data.IpfsHash;
        } catch (error) {
            console.error("Error uploading file to Pinata:", error);
            throw error;
        }
    };

    const handleFileFir = async (complaintId: string, file: File) => {
        setProcessingStatus("Uploading FIR...");
        try {
            // 1. Upload FIR to Pinata
            console.log("Step 1: Uploading to IPFS...");
            const cid = await uploadToPinata(file);
            console.log("FIR Uploaded, CID:", cid);

            // 2. Mint FIR NFT
            let firTxHash = "";
            if (account) {
                setProcessingStatus("Minting NFT...");
                console.log("Step 2: Preparing Mint Transaction...");

                const complaint = complaints.find(c => c.id === complaintId);
                if (complaint) {
                    const payload = {
                        data: {
                            function: `${MODULE_ADDRESS}::police_fir_v1::register_fir`,
                            typeArguments: [],
                            functionArguments: [
                                complaint.id, // Complaint ID
                                complaint.station || "Unknown Station", // Station
                                firDetails.accused || "Unknown Accused", // Accused Name
                                firDetails.offense || "Pending Investigation", // Offense Section
                                cid, // IPFS CID
                                `https://gateway.pinata.cloud/ipfs/${cid}` // Metadata URI
                            ]
                        }
                    };

                    try {
                        const response = await signAndSubmitTransaction(payload);
                        firTxHash = response.hash;
                        console.log("FIR NFT Submitted:", firTxHash);

                        setProcessingStatus("Verifying on Chain...");
                        // Wait for transaction confirmation
                        const result = await aptos.waitForTransaction({ transactionHash: firTxHash });

                        if (!result.success) {
                            throw new Error(`Transaction failed on chain: ${result.vm_status}`);
                        }
                        console.log("FIR NFT Confirmed success:", result);

                    } catch (error: any) {
                        console.error("Minting cancelled or failed:", error);
                        alert(`Minting Failed! Error: ${error.message || "Unknown error"}`);
                        setProcessingStatus("");
                        return; // STOP EXECUTION
                    }
                }
            } else {
                alert("Wallet not connected! Cannot mint FIR NFT.");
                setProcessingStatus("");
                return;
            }

            // 3. Update Backend
            setProcessingStatus("Updating Database...");
            console.log("Step 3: Updating Backend...");

            const updatePayload = {
                id: complaintId, // Mapping to transactionHash in backend
                firCid: cid,
                firNftTxHash: firTxHash,
                status: 'in_progress',
                updates: {
                    date: new Date().toLocaleDateString(),
                    message: firDetails.message || `Submitted FIR file successfully. CID: ${cid}. NFT Minted: ${firTxHash}`
                }
            };

            await axios.post('http://localhost:5000/api/update-complaint', updatePayload, { timeout: 10000 }); // 10s timeout

            console.log("Backend Updated Successfully");

            // Refresh local state
            loadComplaints();
            setActiveFirComplaintId(null);
            setFirDetails({ accused: '', offense: '', message: '' });
            setSelectedFirFile(null);
            alert("FIR Filed Successfully! NFT Minted. Client has been notified via email.");

        } catch (error: any) {
            console.error("Error filing FIR:", error);
            alert(`Failed to file FIR. Step: ${processingStatus}. Error: ${error.message}`);
        } finally {
            setProcessingStatus("");
        }
    };

    const handleAcknowledge = async (complaintId: string) => {
        try {
            const updatePayload = {
                id: complaintId,
                status: 'in_progress', // Move to In Progress
                updates: {
                    date: new Date().toLocaleDateString(),
                    message: `Complaint received and under review by station officer. We are verifying details and will file an FIR shortly.`
                }
            };

            await axios.post('http://localhost:5000/api/update-complaint', updatePayload);
            loadComplaints();
            alert("Complaint Acknowledged!");
        } catch (error) {
            console.error("Error acknowledging complaint:", error);
            alert("Failed to acknowledge. See console.");
        }
    };

    const handleSendMessage = async () => {
        if (!currentMessage.trim() || !messageRecipientId) return;

        setProcessingStatus("Sending Message...");
        try {
            const updatePayload = {
                id: messageRecipientId,
                updates: {
                    date: new Date().toLocaleDateString(),
                    message: currentMessage
                },
                notify: true // Trigger email notification
            };

            await axios.post('http://localhost:5000/api/update-complaint', updatePayload);

            alert("Message sent to citizen successfully!");
            setMessageModalOpen(false);
            setCurrentMessage("");
            setMessageRecipientId(null);
            loadComplaints(); // Refresh updates list
        } catch (error: any) {
            console.error("Error sending message:", error);
            const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Unknown error";
            alert(`Failed to send message: ${errMsg}`);
        } finally {
            setProcessingStatus("");
        }
    };

    useEffect(() => {
        loadComplaints();
        // Reload every 10 seconds to check for new complaints
        const interval = setInterval(loadComplaints, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadComplaints = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/complaints');
            const mappedData = response.data.map((item: any) => ({
                ...item,
                id: item.transactionHash,
                date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
                formData: item.formData || {},
                evidenceCids: item.ipfsCid
            }));
            setComplaints(mappedData);
        } catch (error) {
            console.error("Error fetching complaints:", error);
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
                                                {/* Evidence */}
                                                {complaint.evidenceCids && (
                                                    <div className="glass rounded-lg p-4 mb-4">
                                                        <h4 className="font-medium mb-2">Evidence Details</h4>
                                                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">IPFS CID</p>
                                                                <div className="flex items-center gap-2">
                                                                    <code className="text-xs text-primary font-mono truncate flex-1">
                                                                        {complaint.evidenceCids.split(',')[0]}
                                                                    </code>
                                                                    <button
                                                                        onClick={() => navigator.clipboard.writeText(complaint.evidenceCids.split(',')[0])}
                                                                        className="p-1 hover:bg-primary/20 rounded"
                                                                        title="Copy"
                                                                    >
                                                                        <FileText size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                                                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Pinned & Distributed</span>
                                                            </div>
                                                        </div>

                                                        <a
                                                            href={`https://gateway.pinata.cloud/ipfs/${complaint.evidenceCids.split(',')[0]}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center gap-2 w-full py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors text-primary text-sm font-medium"
                                                        >
                                                            <ExternalLink size={16} />
                                                            View Evidence on IPFS
                                                        </a>
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
                                                <div className="flex flex-col gap-3">
                                                    {complaint.firCid ? (
                                                        <div className="flex flex-col gap-3">
                                                            <div className="glass rounded-lg p-4 border border-success/20 bg-success/5">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <CheckCircle className="text-success" size={18} />
                                                                    <span className="font-semibold text-success">FIR Filed Successfully</span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mb-3">
                                                                    FIR has been uploaded to IPFS and linked to this complaint.
                                                                </p>
                                                                <a
                                                                    href={`https://gateway.pinata.cloud/ipfs/${complaint.firCid}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-center gap-2 w-full py-2 bg-success/10 hover:bg-success/20 rounded-lg text-success text-sm font-medium transition-colors mb-2"
                                                                >
                                                                    <FileText size={16} />
                                                                    View FIR Document
                                                                </a>
                                                                {complaint.firNftTxHash && (
                                                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-success/20">
                                                                        <Shield size={14} className="text-success" />
                                                                        <span className="text-xs text-muted-foreground mr-1">FIR NFT:</span>
                                                                        <code className="text-xs text-success font-mono truncate flex-1">
                                                                            {complaint.firNftTxHash}
                                                                        </code>
                                                                        <a
                                                                            href={`https://explorer.aptoslabs.com/txn/${complaint.firNftTxHash}?network=testnet`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-success hover:text-success/80"
                                                                        >
                                                                            <ExternalLink size={14} />
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex justify-end">
                                                                <GlowingButton
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setMessageRecipientId(complaint.id);
                                                                        setMessageModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Phone size={16} className="mr-2" />
                                                                    Message Client
                                                                </GlowingButton>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-3">
                                                            {/* Step 1: Acknowledge (if Pending) */}
                                                            {complaint.status === 'pending' && (
                                                                <GlowingButton
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => handleAcknowledge(complaint.id)}
                                                                >
                                                                    <CheckCircle size={16} className="mr-2" />
                                                                    Acknowledge & Review
                                                                </GlowingButton>
                                                            )}

                                                            {/* Step 2: File FIR */}
                                                            {complaint.status !== 'pending' && (
                                                                activeFirComplaintId === complaint.id ? (
                                                                    <div className="flex-1 flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 glass p-3 rounded-lg">
                                                                        <h5 className="text-sm font-semibold">FIR Details</h5>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Accused Name"
                                                                            value={firDetails.accused}
                                                                            onChange={(e) => setFirDetails({ ...firDetails, accused: e.target.value })}
                                                                            className="w-full bg-input border border-glass-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                                                            disabled={!!processingStatus}
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Offense Section (e.g. IPC 420)"
                                                                            value={firDetails.offense}
                                                                            onChange={(e) => setFirDetails({ ...firDetails, offense: e.target.value })}
                                                                            className="w-full bg-input border border-glass-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                                                                            disabled={!!processingStatus}
                                                                        />

                                                                        <label className="text-xs text-muted-foreground mt-1">Upload FIR Document</label>
                                                                        <input
                                                                            type="file"
                                                                            accept="application/pdf,image/*"
                                                                            onChange={(e) => {
                                                                                if (e.target.files?.[0]) {
                                                                                    setSelectedFirFile(e.target.files[0]);
                                                                                }
                                                                            }}
                                                                            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                                                            disabled={!!processingStatus}
                                                                        />
                                                                        <div className="flex gap-2 justify-end mt-2">
                                                                            <GlowingButton
                                                                                variant="secondary"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setActiveFirComplaintId(null);
                                                                                    setSelectedFirFile(null);
                                                                                    setFirDetails({ accused: '', offense: '', message: '' });
                                                                                }}
                                                                                disabled={!!processingStatus}
                                                                            >
                                                                                Cancel
                                                                            </GlowingButton>
                                                                            <GlowingButton
                                                                                variant="primary"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    if (!selectedFirFile) {
                                                                                        alert("Please select a file first.");
                                                                                        return;
                                                                                    }
                                                                                    if (window.confirm("Are you sure you want to file this FIR? This will mint an NFT and update the record.")) {
                                                                                        handleFileFir(complaint.id, selectedFirFile);
                                                                                    }
                                                                                }}
                                                                                disabled={!!processingStatus}
                                                                            >
                                                                                {processingStatus ? processingStatus : "Submit FIR"}
                                                                            </GlowingButton>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <GlowingButton
                                                                        variant="primary"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setActiveFirComplaintId(complaint.id);
                                                                            setSelectedFirFile(null);
                                                                        }}
                                                                        disabled={!!processingStatus}
                                                                    >
                                                                        File FIR
                                                                    </GlowingButton>
                                                                )
                                                            )}

                                                            <GlowingButton variant="secondary" size="sm">
                                                                Assign Officer
                                                            </GlowingButton>
                                                            <GlowingButton variant="secondary" size="sm">
                                                                Contact Complainant
                                                            </GlowingButton>
                                                            <GlowingButton
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setMessageRecipientId(complaint.id);
                                                                    setMessageModalOpen(true);
                                                                }}
                                                            >
                                                                <Phone size={16} className="mr-2" />
                                                                Message User
                                                            </GlowingButton>
                                                        </div>
                                                    )}
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

            {/* Message Modal */}
            {messageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md"
                    >
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-bold mb-4 font-display">Send Message to Citizen</h3>
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground mb-1">
                                    To: <span className="font-semibold text-foreground">
                                        {complaints.find(c => c.id === messageRecipientId)?.formData?.email || "No email found"}
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Message will be sent via email and recorded in case history.
                                </p>
                            </div>

                            <textarea
                                value={currentMessage}
                                onChange={(e) => setCurrentMessage(e.target.value)}
                                placeholder="Type your message here..."
                                className="w-full h-32 bg-input border border-glass-border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                            ></textarea>

                            <div className="flex justify-end gap-3">
                                <GlowingButton
                                    variant="secondary"
                                    onClick={() => {
                                        setMessageModalOpen(false);
                                        setCurrentMessage("");
                                        setMessageRecipientId(null);
                                    }}
                                    disabled={!!processingStatus}
                                >
                                    Cancel
                                </GlowingButton>
                                <GlowingButton
                                    variant="primary"
                                    onClick={handleSendMessage}
                                    disabled={!!processingStatus || !currentMessage.trim()}
                                >
                                    {processingStatus ? 'Sending...' : 'Send Message'}
                                </GlowingButton>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}


        </div>
    );
};

export default PoliceStationPage;
