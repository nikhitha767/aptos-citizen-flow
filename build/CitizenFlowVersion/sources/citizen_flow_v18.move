module citizen_flow_v18::citizen_flow_v18 {
    use std::string::{Self, String};
    use std::signer;
    use std::vector;
    use aptos_framework::event;

    struct CitizenProfile has key {
        name: string::String,
        bio: string::String,
    }

    #[event]
    struct ProfileUpdated has drop, store {
        account: address,
        new_name: string::String,
    }

    struct Complaint has store, drop, copy {
        complaint_id: u64,
        station: string::String,
        category: string::String,
        full_name: string::String,
        phone: string::String,
        email: string::String,
        aadhar: string::String,
        address: string::String,
        incident_date: string::String,
        incident_time: string::String,
        incident_location: string::String,
        description: string::String,
        witnesses: string::String,
        evidence_cids: string::String,
        timestamp: u64,
    }

    struct ComplaintBook has key {
        complaints: vector<Complaint>,
        complaint_counter: u64,
    }

    #[event]
    struct ComplaintSubmitted has drop, store {
        account: address,
        complaint_id: u64,
        category: string::String,
    }

    public entry fun create_profile(account: &signer, name: string::String, bio: string::String) {
        let account_addr = signer::address_of(account);
        if (!exists<CitizenProfile>(account_addr)) {
            move_to(account, CitizenProfile {
                name,
                bio,
            });
        };
        if (!exists<ComplaintBook>(account_addr)) {
            move_to(account, ComplaintBook {
                complaints: vector::empty<Complaint>(),
                complaint_counter: 0,
            });
        };
    }

    public entry fun submit_complaint(
        account: &signer,
        station: string::String,
        category: string::String,
        full_name: string::String,
        phone: string::String,
        email: string::String,
        aadhar: string::String,
        address: string::String,
        incident_date: string::String,
        incident_time: string::String,
        incident_location: string::String,
        description: string::String,
        witnesses: string::String,
        evidence_cids: string::String,
    ) acquires ComplaintBook {
        let account_addr = signer::address_of(account);
        
        if (!exists<ComplaintBook>(account_addr)) {
            move_to(account, ComplaintBook {
                complaints: vector::empty<Complaint>(),
                complaint_counter: 0,
            });
        };

        let complaint_book = borrow_global_mut<ComplaintBook>(account_addr);
        let counter = complaint_book.complaint_counter + 1;
        let timestamp = aptos_framework::timestamp::now_microseconds();

        let new_complaint = Complaint {
            complaint_id: counter,
            station,
            category,
            full_name,
            phone,
            email,
            aadhar,
            address,
            incident_date,
            incident_time,
            incident_location,
            description,
            witnesses,
            evidence_cids,
            timestamp,
        };

        vector::push_back(&mut complaint_book.complaints, new_complaint);
        complaint_book.complaint_counter = counter;

        event::emit(ComplaintSubmitted {
            account: account_addr,
            complaint_id: counter,
            category,
        });
    }

    public entry fun update_profile(account: &signer, name: string::String, bio: string::String) acquires CitizenProfile {
        let account_addr = signer::address_of(account);
        let profile = borrow_global_mut<CitizenProfile>(account_addr);
        profile.name = name;
        profile.bio = bio;

        event::emit(ProfileUpdated {
            account: account_addr,
            new_name: name,
        });
    }

    public fun get_profile(account: address): (string::String, string::String) acquires CitizenProfile {
        let profile = borrow_global<CitizenProfile>(account);
        (profile.name, profile.bio)
    }

    public fun get_complaints(account: address): vector<Complaint> acquires ComplaintBook {
        if (!exists<ComplaintBook>(account)) {
            return vector::empty<Complaint>()
        };
        borrow_global<ComplaintBook>(account).complaints
    }

    /// Helper to expose Complaint data to other modules (like nft_mint)
    public fun get_complaint_data(complaint: &Complaint): (u64, String, String, String, u64) {
        (
            complaint.complaint_id,
            complaint.station,
            complaint.category,
            complaint.evidence_cids,
            complaint.timestamp
        )
    }

    // --- Legacy / Deprecated Structs (Kept for compatibility) ---
    struct NFTReceipt has store, drop, copy {
        complaint_id: u64,
        token_name: String,
        token_description: String,
        image_uri: String,
        minted_at: u64,
    }

    struct NFTReceiptBook has key {
        receipts: vector<NFTReceipt>,
    }

    #[event]
    struct NFTMinted has drop, store {
        account: address,
        complaint_id: u64,
        token_name: String,
        image_uri: String,
    }
}
