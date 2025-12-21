import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase,
  MessageCircle,
  CheckCircle,
  Search
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
  },
];

const AdvocatesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdvocate, setSelectedAdvocate] = useState<typeof advocates[0] | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const filteredAdvocates = advocates.filter(advocate =>
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

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
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
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-display font-bold text-primary">
                    {advocate.name.split(' ').pop()?.charAt(0)}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    advocate.available 
                      ? 'bg-success/20 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {advocate.available ? 'Available' : 'Busy'}
                  </div>
                </div>

                <h3 className="text-lg font-display font-semibold mb-1">{advocate.name}</h3>
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

                <GlowingButton
                  variant={advocate.available ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => advocate.available && handleContactAdvocate(advocate)}
                  disabled={!advocate.available}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  {advocate.available ? 'Contact Advocate' : 'Currently Unavailable'}
                </GlowingButton>
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
            <GlassCard className="p-6" hover={false}>
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl font-display font-bold text-primary mb-4">
                  {selectedAdvocate.name.split(' ').pop()?.charAt(0)}
                </div>
                <h3 className="text-xl font-display font-bold">{selectedAdvocate.name}</h3>
                <p className="text-primary">{selectedAdvocate.specialization}</p>
              </div>

              <div className="space-y-4 mb-6">
                <a
                  href={`tel:${selectedAdvocate.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Phone className="text-primary" size={20} />
                  <span>{selectedAdvocate.phone}</span>
                </a>
                <a
                  href={`mailto:${selectedAdvocate.email}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Mail className="text-primary" size={20} />
                  <span>{selectedAdvocate.email}</span>
                </a>
              </div>

              <div className="p-3 rounded-lg bg-success/10 border border-success/30 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-success" size={18} />
                  <span className="text-sm">Verified on CivicChain</span>
                </div>
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
                >
                  Start Chat
                </GlowingButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdvocatesPage;
