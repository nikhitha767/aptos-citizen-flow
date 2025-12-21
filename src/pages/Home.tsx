import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Building2, 
  FileText, 
  Users, 
  Clock,
  Shield,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlowingButton from '@/components/ui/GlowingButton';
import heroBlockchain from '@/assets/hero-blockchain.png';

const vijayawadaStations = [
  { id: 1, name: 'Vijayawada One Town Police Station', area: 'One Town' },
  { id: 2, name: 'Vijayawada Two Town Police Station', area: 'Two Town' },
  { id: 3, name: 'Governorpet Police Station', area: 'Governorpet' },
  { id: 4, name: 'Patamata Police Station', area: 'Patamata' },
  { id: 5, name: 'Suryaraopet Police Station', area: 'Suryaraopet' },
  { id: 6, name: 'Machavaram Police Station', area: 'Machavaram' },
  { id: 7, name: 'Benz Circle Police Station', area: 'Benz Circle' },
  { id: 8, name: 'Krishnalanka Police Station', area: 'Krishnalanka' },
  { id: 9, name: 'Penamaluru Police Station', area: 'Penamaluru' },
  { id: 10, name: 'Satyanarayanapuram Police Station', area: 'Satyanarayanapuram' },
  { id: 11, name: 'Ajit Singh Nagar Police Station', area: 'Ajit Singh Nagar' },
  { id: 12, name: 'Nunna Police Station', area: 'Nunna' },
];

const stats = [
  { label: 'Cases Resolved', value: '2,847', icon: FileText },
  { label: 'Active Officers', value: '156', icon: Users },
  { label: 'Avg Response Time', value: '2.4 hrs', icon: Clock },
  { label: 'Transparency Score', value: '98%', icon: Shield },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCity] = useState('Vijayawada');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStation, setSelectedStation] = useState<typeof vijayawadaStations[0] | null>(null);

  const filteredStations = vijayawadaStations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStationSelect = (station: typeof vijayawadaStations[0]) => {
    setSelectedStation(station);
    setShowDropdown(false);
    setSearchQuery(station.name);
  };

  const handleProceed = () => {
    if (selectedStation) {
      navigate('/complaint', { state: { station: selectedStation } });
    }
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <Navbar />

      <main className="relative z-10 pt-24 md:pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section with Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden mb-12"
          >
            <img 
              src={heroBlockchain} 
              alt="CivicChain - Blockchain Justice Network" 
              className="w-full h-48 md:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-2">
                File Your Complaint <span className="gradient-text">Securely</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Choose your location and police station to submit your complaint on the blockchain
              </p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => (
              <GlassCard key={index} delay={0.1 + index * 0.1} className="p-4 md:p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <stat.icon className="text-primary" size={20} />
                  </div>
                  <span className="text-xl md:text-2xl font-display font-bold text-foreground">{stat.value}</span>
                  <span className="text-xs md:text-sm text-muted-foreground">{stat.label}</span>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Location Selection */}
          <GlassCard className="p-6 md:p-8 mb-8" hover={false}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <MapPin className="text-accent" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">Choose Your Location</h2>
                <p className="text-sm text-muted-foreground">Select your area's police station</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* City Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">City</label>
                <div className="relative">
                  <div className="glass rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer border border-primary/30">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-primary" size={18} />
                      <span className="font-medium">{selectedCity}</span>
                    </div>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Selected</span>
                  </div>
                </div>
              </div>

              {/* Station Search */}
              <div>
                <label className="block text-sm font-medium mb-2 text-muted-foreground">Police Station</label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      placeholder="Search police stations..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                        setSelectedStation(null);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full bg-input border border-glass-border rounded-lg pl-12 pr-10 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                    <ChevronDown 
                      className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                      size={18} 
                    />
                  </div>

                  {/* Dropdown */}
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 glass rounded-lg border border-glass-border max-h-64 overflow-y-auto z-20"
                    >
                      {filteredStations.length > 0 ? (
                        filteredStations.map((station) => (
                          <button
                            key={station.id}
                            onClick={() => handleStationSelect(station)}
                            className="w-full px-4 py-3 text-left hover:bg-primary/10 flex items-center gap-3 transition-colors border-b border-glass-border/50 last:border-0"
                          >
                            <Building2 className="text-primary shrink-0" size={18} />
                            <div>
                              <p className="font-medium text-sm">{station.name}</p>
                              <p className="text-xs text-muted-foreground">{station.area}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-muted-foreground">
                          No stations found
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Station Info */}
            {selectedStation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg bg-success/10 border border-success/30"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="text-success" size={24} />
                    <div>
                      <p className="font-semibold">{selectedStation.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedStation.area}, Vijayawada</p>
                    </div>
                  </div>
                  <GlowingButton 
                    variant="primary" 
                    onClick={handleProceed}
                    className="flex items-center gap-2"
                  >
                    Proceed to Complaint
                    <ArrowRight size={18} />
                  </GlowingButton>
                </div>
              </motion.div>
            )}
          </GlassCard>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-display font-bold text-center mb-8">How CivicChain Works</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { step: 1, title: 'Connect Wallet', desc: 'Secure authentication via Petra' },
                { step: 2, title: 'Select Station', desc: 'Choose your local police station' },
                { step: 3, title: 'Submit Complaint', desc: 'File your case with evidence' },
                { step: 4, title: 'Track Progress', desc: 'Real-time updates on blockchain' },
              ].map((item, index) => (
                <GlassCard key={index} delay={0.5 + index * 0.1} className="relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {item.step}
                  </div>
                  <h3 className="font-display font-semibold mt-2 mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Home;
