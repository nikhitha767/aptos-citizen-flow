import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  Star,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  MessageCircle,
  Search,
  BadgeCheck,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle,
  Camera,
  Upload
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlowingButton from '@/components/ui/GlowingButton';

const advocates = [
  {
    id: 1,
    name: 'Adv. Ramesh Kumar',
    specialization: 'Criminal Law',
    experience: '15 years',
    rating: 4.8,
    cases: 520,
    location: 'Vijayawada',
    phone: '+91 98765 43210',
    email: 'ramesh.kumar@lawfirm.com',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 2,
    name: 'Adv. Priya Sharma',
    specialization: 'Civil Rights',
    experience: '12 years',
    rating: 4.9,
    cases: 380,
    location: 'Vijayawada',
    phone: '+91 98765 43211',
    email: 'priya.sharma@lawfirm.com',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 3,
    name: 'Adv. Suresh Reddy',
    specialization: 'Property Disputes',
    experience: '20 years',
    rating: 4.7,
    cases: 750,
    location: 'Vijayawada',
    phone: '+91 98765 43212',
    email: 'suresh.reddy@lawfirm.com',
    available: false,
    imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 4,
    name: 'Adv. Lakshmi Devi',
    specialization: 'Family Law',
    experience: '10 years',
    rating: 4.6,
    cases: 290,
    location: 'Vijayawada',
    phone: '+91 98765 43213',
    email: 'lakshmi.devi@lawfirm.com',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 5,
    name: 'Adv. Venkat Rao',
    specialization: 'Cyber Crime',
    experience: '8 years',
    rating: 4.9,
    cases: 180,
    location: 'Vijayawada',
    phone: '+91 98765 43214',
    email: 'venkat.rao@lawfirm.com',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 6,
    name: 'Adv. Anjali Prasad',
    specialization: 'Consumer Rights',
    experience: '14 years',
    rating: 4.5,
    cases: 420,
    location: 'Vijayawada',
    phone: '+91 98765 43215',
    email: 'anjali.prasad@lawfirm.com',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200&h=200'
  },
];

const AdvocatesPage: React.FC = () => {
  const [advocatesList, setAdvocatesList] = useState(() => {
    const saved = localStorage.getItem('advocatesList');
    if (saved) {
      return JSON.parse(saved);
    }
    return advocates.map(a => ({ ...a, verified: true }));
  });

  useEffect(() => {
    localStorage.setItem('advocatesList', JSON.stringify(advocatesList));
  }, [advocatesList]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdvocate, setSelectedAdvocate] = useState<typeof advocates[0] & { verified?: boolean } | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // Advocate Registration State
  const [showAdvocateModal, setShowAdvocateModal] = useState(false);
  const [newAdvocate, setNewAdvocate] = useState({
    name: '',
    specialization: '',
    experience: '',
    contact: '',
    email: '',
    location: '', // Mapped to Office Address
    barId: '',
    imageUrl: '',
    stateBarCouncil: '',
    yearOfEnrollment: '',
    idProof: ''
  });

  const handleVerify = (id: number) => {
    setVerifyingId(id);
    // Simulate API/Blockchain call
    setTimeout(() => {
      setAdvocatesList(prev => prev.map(adv =>
        adv.id === id ? { ...adv, verified: true } : adv
      ));
      setVerifyingId(null);
      alert("Identity Verified Successfully against Bar Council Records!");
    }, 2000);
  };

  const handleAdvocateSubmit = () => {
    if (!newAdvocate.name || !newAdvocate.specialization || !newAdvocate.contact || !newAdvocate.location) {
      alert("Please fill in required fields (Name, Specialization, Contact, Location)");
      return;
    }

    const newAdv = {
      id: Date.now(),
      name: newAdvocate.name,
      specialization: newAdvocate.specialization || 'General Practice',
      experience: `${new Date().getFullYear() - parseInt(newAdvocate.yearOfEnrollment || '2020')} years`,
      rating: 0,
      cases: 0,
      location: newAdvocate.location,
      phone: newAdvocate.contact,
      email: newAdvocate.email || 'N/A',
      available: true,
      verified: false,
      imageUrl: newAdvocate.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(newAdvocate.name)}&background=random`
    };

    setAdvocatesList([newAdv, ...advocatesList]);
    setShowAdvocateModal(false);
    setNewAdvocate({
      name: '', specialization: '', experience: '', contact: '', email: '', location: '', barId: '', imageUrl: '',
      stateBarCouncil: '', yearOfEnrollment: '', idProof: ''
    });
    alert("Advocate Registered! Profile pending verification.");
  };

  const handleIdProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);

      // Simulate OCR / Auto-extraction delay
      setTimeout(() => {
        setNewAdvocate(prev => ({
          ...prev,
          idProof: file.name,
          imageUrl: objectUrl,
          // Auto-filled simulation data
          name: 'Adv. Simulationsky',
          barId: 'KAR/2024/999',
          stateBarCouncil: 'Vijayawada',
          yearOfEnrollment: '2015',
          experience: '9',
          specialization: 'Civil Litigation',
          location: '123, Legal Lane, Vijayawada',
          email: 'adv.sim@example.com',
          contact: '+91 98989 89898'
        }));
        alert("ID Card Scanned! Details auto-filled.");
      }, 1000);
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setNewAdvocate(prev => ({ ...prev, imageUrl: objectUrl }));
    }
  };

  const filteredAdvocates = advocatesList.filter(advocate =>
    advocate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    advocate.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactAdvocate = (advocate: typeof advocates[0]) => {
    setSelectedAdvocate(advocate);
    setShowContactModal(true);
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <Navbar />

      <main className="relative z-10 pt-24 md:pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
              <Scale className="text-accent" size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Legal <span className="gradient-text">Advocates</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with verified advocates to proceed with your legal case. All communications are secured on blockchain.
            </p>
          </motion.div>

          {/* Search and Advocate Wallet */}
          <div className="max-w-xl mx-auto mb-8 flex flex-col gap-4">
            <div className="flex justify-center">
              <GlowingButton onClick={() => setShowAdvocateModal(true)}>
                <div className="flex items-center gap-2">
                  <Briefcase size={20} />
                  <span>Advocate Wallet</span>
                </div>
              </GlowingButton>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-input border border-glass-border rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Advocates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdvocates.map((advocate, index) => (
              <GlassCard key={advocate.id} delay={index * 0.1}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-display font-bold text-primary relative overflow-hidden">
                    {(advocate as any).imageUrl ? (
                      <img src={(advocate as any).imageUrl} alt={advocate.name} className="w-full h-full object-cover" />
                    ) : (
                      advocate.name.split(' ').pop()?.charAt(0)
                    )}
                    {(advocate as any).verified && (
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm z-10">
                        <ShieldCheck className="text-success" size={14} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${advocate.available
                    ? 'bg-success/20 text-success'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {advocate.available ? 'Available' : 'Busy'}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-display font-semibold">{advocate.name}</h3>
                  {(advocate as any).verified && <BadgeCheck size={16} className="text-primary" />}
                </div>
                <p className="text-primary text-sm mb-3">{advocate.specialization}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase size={14} />
                    <span>{advocate.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={14} />
                    <span>{advocate.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="text-accent" size={14} />
                    <span className="text-accent font-medium">{advocate.rating}</span>
                    <span className="text-muted-foreground">({advocate.cases} cases)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Verification Button for Unverified Profiles */}
                  {!(advocate as any).verified && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerify(advocate.id);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-warning/10 hover:bg-warning/20 text-warning text-xs font-medium flex items-center justify-center gap-1 transition-colors border border-warning/20"
                      disabled={verifyingId === advocate.id}
                    >
                      {verifyingId === advocate.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ShieldAlert size={14} />
                      )}
                      {verifyingId === advocate.id ? 'Verifying...' : 'Verify'}
                    </button>
                  )}

                  <GlowingButton
                    variant={advocate.available ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setSelectedAdvocate(advocate as any);
                      setShowContactModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={16} />
                    View Details
                  </GlowingButton>
                </div>
              </GlassCard>
            ))}
          </div>

          {filteredAdvocates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No advocates found matching your search.</p>
            </div>
          )}
        </div>
      </main>

      {/* Contact Modal */}
      {showContactModal && selectedAdvocate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowContactModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <GlassCard className="p-6 relative overflow-hidden" hover={false}>
              {/* Profile Header */}
              <div className="text-center mb-6 relative z-10">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-primary/20 p-1 mb-4 relative">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl font-display font-bold text-primary">
                    {selectedAdvocate.imageUrl ? (
                      <img src={selectedAdvocate.imageUrl} alt={selectedAdvocate.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedAdvocate.name.split(' ').pop()?.charAt(0)
                    )}
                  </div>
                  {selectedAdvocate.verified && (
                    <div className="absolute bottom-0 right-0 bg-background rounded-full p-1 shadow-lg border border-success/20">
                      <ShieldCheck className="text-success" size={24} fill="currentColor" />
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-display font-bold flex items-center justify-center gap-2">
                  {selectedAdvocate.name}
                  {selectedAdvocate.verified ? (
                    <BadgeCheck size={20} className="text-primary" />
                  ) : (
                    <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded-full border border-warning/20">Unverified</span>
                  )}
                </h3>
                <p className="text-primary font-medium">{selectedAdvocate.specialization}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{selectedAdvocate.location}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-secondary/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-bold text-lg">{selectedAdvocate.experience}</p>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg text-center">
                  <p className="font-bold text-lg">{selectedAdvocate.cases}+</p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-3 mb-6">
                <div className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contact Number</p>
                    <p className="font-medium">{selectedAdvocate.phone}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="font-medium">{selectedAdvocate.email}</p>
                  </div>
                </div>
              </div>

              {/* Verification Banner */}
              <div className={`p-3 rounded-lg mb-6 border ${selectedAdvocate.verified
                ? 'bg-success/5 border-success/20'
                : 'bg-warning/5 border-warning/20'
                }`}>
                <div className="flex items-center gap-3">
                  {selectedAdvocate.verified ? (
                    <ShieldCheck className="text-success shrink-0" size={24} />
                  ) : (
                    <ShieldAlert className="text-warning shrink-0" size={24} />
                  )}
                  <div>
                    <p className={`font-bold text-sm ${selectedAdvocate.verified ? 'text-success' : 'text-warning'}`}>
                      {selectedAdvocate.verified ? 'Verified Practitioner' : 'Verification Pending'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedAdvocate.verified
                        ? 'Identity and Bar Council credentials verified on blockchain.'
                        : 'This profile has not yet been verified against official records.'}
                    </p>
                  </div>
                </div>
                {!selectedAdvocate.verified && (
                  <button
                    onClick={() => handleVerify(selectedAdvocate.id)}
                    className="mt-3 w-full py-1.5 rounded-md bg-warning text-warning-foreground text-xs font-bold shadow-sm hover:opacity-90"
                  >
                    Verify Now
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <GlowingButton
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowContactModal(false)}
                >
                  Close
                </GlowingButton>
                <GlowingButton
                  variant="primary"
                  className="flex-1"
                  disabled={!selectedAdvocate.available}
                >
                  <MessageCircle size={16} className="mr-2" />
                  Request Consultation
                </GlowingButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
      {/* Advocate Registration Modal */}
      {showAdvocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdvocateModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
            >
              <span className="text-xl">×</span>
            </button>

            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2 sticky top-0 bg-background/50 backdrop-blur-md pb-2 pt-1 z-10">
              <Briefcase className="text-primary" size={24} />
              Advocate <span className="gradient-text">Registration</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Register your profile to receive cases.
            </p>

            <div className="space-y-4">
              {/* ID Proof (File Upload) - FIRST FIELD */}
              <div className="p-4 bg-secondary/50 rounded-xl border border-dashed border-primary/30">
                <label className="block text-sm font-medium mb-2 text-center text-primary">Upload Bar Council ID Card</label>
                <div className="flex gap-2 items-center justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleIdProofUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground hover:text-primary transition-colors">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload size={24} />
                      </div>
                      <span className="text-sm font-medium">{newAdvocate.idProof ? "Change File" : "Click to Upload ID Card"}</span>
                    </div>
                  </label>
                </div>
                {newAdvocate.idProof && (
                  <div className="mt-2 text-center bg-success/10 py-1 rounded-lg">
                    <p className="text-xs text-success font-bold flex items-center justify-center gap-1">
                      <CheckCircle size={12} /> File selected: {newAdvocate.idProof}
                    </p>
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={newAdvocate.name}
                  onChange={(e) => setNewAdvocate({ ...newAdvocate, name: e.target.value })}
                  className="w-full bg-input border border-glass-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="e.g. Adv. Rajesh Kumar"
                />
              </div>

              {/* Bar Council Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bar Council Number</label>
                  <input
                    type="text"
                    value={newAdvocate.barId}
                    onChange={(e) => setNewAdvocate({ ...newAdvocate, barId: e.target.value })}
                    className="w-full bg-input border border-glass-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="e.g. KAR/123/2010"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State Bar Council</label>
                  <input
                    type="text"
                    value="Vijayawada"
                    readOnly
                    className="w-full bg-input/50 border border-glass-border rounded-lg px-4 py-2 text-muted-foreground cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              {/* Enrollment & Specialization */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Year of Enrollment</label>
                  <input
                    type="number"
                    value={newAdvocate.yearOfEnrollment}
                    onChange={(e) => setNewAdvocate({ ...newAdvocate, yearOfEnrollment: e.target.value })}
                    className="w-full bg-input border border-glass-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="e.g. 2010"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Specialization</label>
                  <input
                    type="text"
                    value={newAdvocate.specialization}
                    onChange={(e) => setNewAdvocate({ ...newAdvocate, specialization: e.target.value })}
                    className="w-full bg-input border border-glass-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="e.g. Criminal Law"
                  />
                </div>
              </div>

              {/* Office Address */}
              <div>
                <label className="block text-sm font-medium mb-1">Office Address</label>
                <textarea
                  value={newAdvocate.location}
                  onChange={(e) => setNewAdvocate({ ...newAdvocate, location: e.target.value })}
                  className="w-full bg-input border border-glass-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 h-20 resize-none"
                  placeholder="Enter full office address..."
                />
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Official Email</label>
                  <input
                    type="email"
                    value={newAdvocate.email}
                    onChange={(e) => setNewAdvocate({ ...newAdvocate, email: e.target.value })}
                    className="w-full bg-input border border-glass-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newAdvocate.contact}
                    onChange={(e) => setNewAdvocate({ ...newAdvocate, contact: e.target.value })}
                    className="w-full bg-input border border-glass-border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="+91..."
                  />
                </div>
              </div>

              {/* Profile Image Upload (Optional Override) */}
              <div>
                <label className="block text-sm font-medium mb-1">Profile Photo (Optional)</label>
                <div className="flex gap-2 items-center">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                    <div className="w-full bg-input border border-glass-border border-dashed rounded-lg px-4 py-2 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                      <Camera size={18} />
                      <span className="text-sm">
                        {newAdvocate.imageUrl && !newAdvocate.imageUrl.startsWith('blob')
                          ? "Change Profile Photo"
                          : (newAdvocate.imageUrl ? "Photo Selected" : "Upload Profile Photo")}
                      </span>
                    </div>
                  </label>
                  {newAdvocate.imageUrl && (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-glass-border">
                      <img src={newAdvocate.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>





              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowAdvocateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <GlowingButton
                  onClick={handleAdvocateSubmit}
                  className="flex-1"
                >
                  Register Profile
                </GlowingButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
export default AdvocatesPage;
