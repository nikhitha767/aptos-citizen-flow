import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Car,
  Users,
  Wallet as WalletIcon,
  Home as HomeIcon,
  FileText,
  ArrowLeft,
  ArrowRight,
  Upload,
  CheckCircle,
  Shield,
  X,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import GlassCard from '@/components/ui/GlassCard';
import GlowingButton from '@/components/ui/GlowingButton';

const problemCategories = [
  { id: 'theft', label: 'Theft & Robbery', icon: WalletIcon, color: 'text-red-400' },
  { id: 'assault', label: 'Assault & Violence', icon: AlertTriangle, color: 'text-orange-400' },
  { id: 'accident', label: 'Road Accident', icon: Car, color: 'text-yellow-400' },
  { id: 'harassment', label: 'Harassment', icon: Users, color: 'text-pink-400' },
  { id: 'property', label: 'Property Dispute', icon: HomeIcon, color: 'text-blue-400' },
  { id: 'other', label: 'Other', icon: FileText, color: 'text-purple-400' },
];

const ComplaintPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const station = location.state?.station;

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    aadhar: '',
    address: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    description: '',
    witnesses: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (!station) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <AlertTriangle className="mx-auto text-warning mb-4" size={48} />
          <h2 className="text-xl font-display font-semibold mb-2">No Station Selected</h2>
          <p className="text-muted-foreground mb-4">Please select a police station first</p>
          <GlowingButton onClick={() => navigate('/home')}>Go to Home</GlowingButton>
        </GlassCard>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative">
        <ParticleBackground />
        <Navbar />
        <div className="relative z-10 pt-24 pb-12 px-4 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-lg w-full"
          >
            <GlassCard className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center"
              >
                <CheckCircle className="text-success" size={48} />
              </motion.div>
              <h2 className="text-2xl font-display font-bold mb-2">Complaint Submitted!</h2>
              <p className="text-muted-foreground mb-4">
                Your complaint has been recorded on the blockchain
              </p>
              <div className="glass rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">Transaction Hash</p>
                <p className="font-mono text-primary text-sm break-all">
                  0x{Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <GlowingButton variant="secondary" onClick={() => navigate('/history')}>
                  View History
                </GlowingButton>
                <GlowingButton onClick={() => navigate('/home')}>
                  Back to Home
                </GlowingButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    );
  }

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
            className="mb-8"
          >
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Station Selection
            </button>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="text-primary" size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">File a Complaint</h1>
                <p className="text-muted-foreground">{station.name}</p>
              </div>
            </div>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
            {['Select Problem', 'Personal Details', 'Incident Info', 'Evidence', 'Review'].map((label, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap ${
                  step === index + 1 
                    ? 'bg-primary/20 text-primary' 
                    : step > index + 1 
                      ? 'text-success' 
                      : 'text-muted-foreground'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === index + 1 
                      ? 'bg-primary text-primary-foreground' 
                      : step > index + 1 
                        ? 'bg-success text-background' 
                        : 'bg-muted'
                  }`}>
                    {step > index + 1 ? '✓' : index + 1}
                  </div>
                  <span className="text-sm font-medium hidden md:inline">{label}</span>
                </div>
                {index < 4 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-2 ${step > index + 1 ? 'bg-success' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard className="p-6 md:p-8" hover={false}>
                  <h2 className="text-xl font-display font-semibold mb-2">Choose Your Problem Category</h2>
                  <p className="text-muted-foreground mb-6">Select the type of issue you want to report</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {problemCategories.map((category) => (
                      <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`p-4 md:p-6 rounded-xl border-2 transition-all ${
                          selectedCategory === category.id
                            ? 'border-primary bg-primary/10'
                            : 'border-glass-border hover:border-primary/50'
                        }`}
                      >
                        <category.icon className={`${category.color} mx-auto mb-3`} size={32} />
                        <p className="font-medium text-sm md:text-base">{category.label}</p>
                      </motion.button>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard className="p-6 md:p-8" hover={false}>
                  <h2 className="text-xl font-display font-semibold mb-2">Personal Details</h2>
                  <p className="text-muted-foreground mb-6">Your information will be securely stored on blockchain</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Aadhar Number *</label>
                      <input
                        type="text"
                        name="aadhar"
                        value={formData.aadhar}
                        onChange={handleInputChange}
                        className="w-full bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="XXXX XXXX XXXX"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Residential Address *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Enter your complete address"
                      />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard className="p-6 md:p-8" hover={false}>
                  <h2 className="text-xl font-display font-semibold mb-2">Incident Information</h2>
                  <p className="text-muted-foreground mb-6">Provide details about the incident</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Incident *</label>
                      <input
                        type="date"
                        name="incidentDate"
                        value={formData.incidentDate}
                        onChange={handleInputChange}
                        className="w-full bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Approximate Time</label>
                      <input
                        type="time"
                        name="incidentTime"
                        value={formData.incidentTime}
                        onChange={handleInputChange}
                        className="w-full bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Incident Location *</label>
                      <input
                        type="text"
                        name="incidentLocation"
                        value={formData.incidentLocation}
                        onChange={handleInputChange}
                        className="w-full bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Where did the incident occur?"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Detailed Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Describe the incident in detail..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Witness Details (if any)</label>
                      <textarea
                        name="witnesses"
                        value={formData.witnesses}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full bg-input border border-glass-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Names and contact information of witnesses"
                      />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard className="p-6 md:p-8" hover={false}>
                  <h2 className="text-xl font-display font-semibold mb-2">Upload Evidence</h2>
                  <p className="text-muted-foreground mb-6">Upload photos, documents, or any supporting evidence (stored on IPFS)</p>
                  
                  <div className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mx-auto text-muted-foreground mb-4" size={48} />
                      <p className="font-medium mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG, PDF, DOC up to 10MB each
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h3 className="font-medium">Uploaded Files ({uploadedFiles.length})</h3>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="text-primary" size={20} />
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-destructive/20 rounded transition-colors"
                          >
                            <X className="text-destructive" size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard className="p-6 md:p-8" hover={false}>
                  <h2 className="text-xl font-display font-semibold mb-2">Review Your Complaint</h2>
                  <p className="text-muted-foreground mb-6">Please verify all details before submitting to the blockchain</p>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="glass rounded-lg p-4">
                        <h3 className="text-sm text-muted-foreground mb-2">Police Station</h3>
                        <p className="font-medium">{station.name}</p>
                      </div>
                      <div className="glass rounded-lg p-4">
                        <h3 className="text-sm text-muted-foreground mb-2">Problem Category</h3>
                        <p className="font-medium capitalize">
                          {problemCategories.find(c => c.id === selectedCategory)?.label || 'Not selected'}
                        </p>
                      </div>
                    </div>

                    <div className="glass rounded-lg p-4">
                      <h3 className="text-sm text-muted-foreground mb-3">Personal Information</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <p><span className="text-muted-foreground">Name:</span> {formData.fullName || '-'}</p>
                        <p><span className="text-muted-foreground">Phone:</span> {formData.phone || '-'}</p>
                        <p><span className="text-muted-foreground">Email:</span> {formData.email || '-'}</p>
                        <p><span className="text-muted-foreground">Aadhar:</span> {formData.aadhar || '-'}</p>
                      </div>
                    </div>

                    <div className="glass rounded-lg p-4">
                      <h3 className="text-sm text-muted-foreground mb-3">Incident Details</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Date:</span> {formData.incidentDate || '-'}</p>
                        <p><span className="text-muted-foreground">Location:</span> {formData.incidentLocation || '-'}</p>
                        <p><span className="text-muted-foreground">Description:</span> {formData.description || '-'}</p>
                      </div>
                    </div>

                    <div className="glass rounded-lg p-4">
                      <h3 className="text-sm text-muted-foreground mb-2">Evidence Files</h3>
                      <p className="font-medium">{uploadedFiles.length} file(s) uploaded</p>
                    </div>

                    <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                      <p className="text-sm text-warning">
                        ⚠️ Once submitted, this complaint will be permanently recorded on the Aptos blockchain and cannot be modified.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <GlowingButton
              variant="secondary"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Previous
            </GlowingButton>

            {step < 5 ? (
              <GlowingButton
                onClick={() => setStep(Math.min(5, step + 1))}
                disabled={step === 1 && !selectedCategory}
                className="flex items-center gap-2"
              >
                Next Step
                <ArrowRight size={18} />
              </GlowingButton>
            ) : (
              <GlowingButton
                variant="accent"
                onClick={handleSubmit}
                loading={isSubmitting}
                className="flex items-center gap-2"
              >
                <Shield size={18} />
                Submit to Blockchain
              </GlowingButton>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComplaintPage;
