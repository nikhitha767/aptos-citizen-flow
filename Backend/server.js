
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Email Transporter (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schema Definition
const EvidenceSchema = new mongoose.Schema({
    transactionHash: { type: String, required: true, unique: true },
    ipfsCid: { type: String }, // Made optional if just submitting text initially
    ipfsUrl: { type: String },
    metadataUri: { type: String },
    station: { type: String },
    category: { type: String },
    walletAddress: { type: String },
    status: { type: String, default: 'pending' },
    formData: {
        fullName: String,
        phone: String,
        email: String,
        aadhar: String,
        address: String,
        incidentDate: String,
        incidentTime: String,
        incidentLocation: String,
        description: String,
        witnesses: String
    },
    nftTxHash: { type: String },
    firCid: { type: String },
    firNftTxHash: { type: String },
    updates: [{
        date: String,
        message: String
    }],
    createdAt: { type: Date, default: Date.now }
});

const Evidence = mongoose.model('Evidence', EvidenceSchema);

// API Routes
app.post('/api/record-evidence', async (req, res) => {
    try {
        console.log('Received record-evidence request:', req.body);
        const {
            transactionHash,
            ipfsCid,
            ipfsUrl,
            metadataUri,
            station,
            category,
            walletAddress,
            formData,
            status
        } = req.body;

        if (!transactionHash) {
            return res.status(400).json({ message: 'transactionHash is required' });
        }

        // Check if duplicate (idempotency)
        const existing = await Evidence.findOne({ transactionHash });
        if (existing) {
            console.log('Evidence already exists for hash:', transactionHash);
            // If it exists, maybe we update it? 
            // For now, return existing.
            return res.status(200).json({ message: 'Evidence already recorded', data: existing });
        }

        const newEvidence = new Evidence({
            transactionHash,
            ipfsCid,
            ipfsUrl,
            metadataUri,
            station,
            category,
            walletAddress,
            status: status || 'pending',
            formData: formData || {},
            updates: [{ date: new Date().toLocaleDateString(), message: 'Complaint submitted' }]
        });

        const savedEvidence = await newEvidence.save();
        console.log('Evidence recorded successfully:', savedEvidence._id);

        // --- EMAIL NOTIFICATION LOGIC (NEW) ---
        if (formData && formData.email) {
            console.log(`Sending Complaint Confirmation to: ${formData.email}`);
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: formData.email,
                subject: `Complaint Registered - ${status === 'pending' ? 'Pending Review' : status}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Complaint Registered</h2>
                        <p>Dear ${formData.fullName || 'Citizen'},</p>
                        <p>Your complaint has been successfully recorded on the Aptos Blockchain and our internal systems.</p>
                        
                        <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Station:</strong> ${station}</p>
                            <p style="margin: 5px 0;"><strong>Category:</strong> ${category}</p>
                            <p style="margin: 5px 0;"><strong>Transaction Hash:</strong> <span style="font-family: monospace;">${transactionHash}</span></p>
                        </div>

                        <p>The police station has been notified. You will receive further updates here when an officer processes your case.</p>

                        <p style="font-size: 12px; color: #6c757d; margin-top: 30px;">
                            This is an automated message. Please do not reply directly to this email.<br>
                            Your complaint reference ID is your transaction hash.
                        </p>
                    </div>
                `
            };

            // Send email (fire and forget to avoid blocking response too long, or await if critical)
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) console.error("Error sending confirmation email:", err);
                else console.log("Confirmation email sent:", info.response);
            });
        }
        // --------------------------------------

        res.status(201).json({ message: 'Evidence recorded successfully', data: savedEvidence });

    } catch (error) {
        console.error('Error recording evidence:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Evidence.find().sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching complaints' });
    }
});

app.post('/api/update-complaint', async (req, res) => {
    try {
        const { id, updates, status, firCid, nftTxHash } = req.body;
        // Search by transactionHash (which acts as ID) or _id. Currently frontend uses ID? 
        // Frontend 'id' in localStorage was 'C-...' but here we use transactionHash as key?
        // Let's assume frontend will pass the MongoDB _id or we use transactionHash.
        // For easiest integration, let's allow finding by transactionHash.

        const filter = { transactionHash: id }; // Assuming ID passed is txHash for now
        const updateDoc = {};

        if (status) updateDoc.status = status;
        if (firCid) updateDoc.firCid = firCid;
        if (nftTxHash) updateDoc.nftTxHash = nftTxHash;

        // Add support for firNftTxHash
        if (req.body.firNftTxHash) updateDoc.firNftTxHash = req.body.firNftTxHash;

        let query = await Evidence.findOne(filter);
        if (!query) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        if (updates) {
            // updates is a single object {date, message} to push
            console.log(`[DB] Storing Update Msg: "${updates.message}"`);
            query.updates.push(updates);
        }

        Object.assign(query, updateDoc);
        await query.save();

        // Helper to send email (promisified)
        const sendEmail = (mailOptions) => {
            return new Promise((resolve, reject) => {
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) reject(err);
                    else resolve(info);
                });
            });
        };

        // Send Email Notification if FIR is filed
        if (firCid && query.formData && query.formData.email) {
            const email = query.formData.email;
            console.log(`Sending FIR filing notification to: ${email}`);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: `FIR Filed - Complaint Status Update`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">FIR Filed Successfully</h2>
                        <p>Dear ${query.formData.fullName || 'Citizen'},</p>
                        <p>We are writing to inform you that an <strong>First Information Report (FIR)</strong> has been officially filed for your complaint.</p>
                        
                        <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Complaint ID:</strong> ${id}</p>
                            <p style="margin: 5px 0;"><strong>Status:</strong> In Progress</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>

                        ${updates && updates.message ? `
                        <div style="background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 10px; margin-bottom: 20px; border-radius: 4px;">
                            <strong>Officer Remarks:</strong> ${updates.message}
                        </div>
                        ` : ''}

                        <p>You can view the digital FIR document using the link below:</p>
                        <p>
                            <a href="https://gateway.pinata.cloud/ipfs/${firCid}" 
                               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                               View FIR Document
                            </a>
                        </p>

                        <p style="font-size: 12px; color: #6c757d; margin-top: 30px;">
                            This is an automated message. Please do not reply directly to this email.<br>
                            Your complaint is securely recorded on the Aptos Blockchain.
                        </p>
                    </div>
                `
            };

            // Non-blocking for FIR flow (catch error internally)
            try {
                await sendEmail(mailOptions);
                console.log("FIR Email sent successfully");
            } catch (err) {
                console.error("Error sending FIR email:", err);
            }
        } else if (req.body.notify) {
            console.log("CHECKING NOTIFICATION LOGIC:");
            console.log("- Notify Flag:", req.body.notify);

            if (updates && query.formData && query.formData.email) {
                // GENERIC MESSAGE NOTIFICATION
                const email = query.formData.email;
                console.log(`Sending general notification to: ${email}`);

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: `Update on your Complaint - ${id}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #2c3e50;">New Message from Police Station</h2>
                            <p>Dear ${query.formData.fullName || 'Citizen'},</p>
                            
                            <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
                                <p style="margin: 5px 0; font-size: 16px;">"${updates.message}"</p>
                                <p style="margin: 10px 0 0; font-size: 12px; color: #666;">- ${query.station || 'Station Officer'}</p>
                            </div>

                            <p style="font-size: 12px; color: #6c757d; margin-top: 30px;">
                                This is an automated notification of an update to your case. <br>
                                You can view the full status on the citizen portal.
                            </p>
                        </div>
                    `
                };

                try {
                    await sendEmail(mailOptions);
                    console.log("Update email sent successfully");
                } catch (err) {
                    console.error("CRITICAL: Error sending update email:", err);
                    // Throw so frontend sees it
                    throw new Error(`Email failed to send: ${err.message}`);
                }
            } else {
                console.log("SKIPPING EMAIL: Missing updates object or email address in record.");
            }
        }

        res.json({ message: 'Updated successfully', data: query });
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ message: 'Error updating complaint', error: error.message, stack: error.stack });
    }
});


app.get('/', (req, res) => {
    res.send('Citizen Flow Backend Running');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
