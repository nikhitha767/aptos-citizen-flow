module citizen_flow_v18::nft_mint_v18 {
    use std::string::{Self, String};
    use std::signer;
    use std::vector;

    use aptos_token::token;
    use aptos_framework::event;

    use citizen_flow_v18::citizen_flow_v18 as citizen_flow;

    const COLLECTION_NAME: vector<u8> = b"Citizen Flow Receipts";

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

    /// Initialize the collection if it doesn't exist
    public entry fun create_collection_if_missing(account: &signer) {
        let collection_name = string::utf8(COLLECTION_NAME);
        let collection_description = string::utf8(b"Official receipts for complaints submitted via Citizen Flow.");
        let collection_uri = string::utf8(b"https://move-book.com/img/aptos-logo.png"); 
        
        let mutate_setting = vector::empty<bool>();
        vector::push_back(&mut mutate_setting, false); // description
        vector::push_back(&mut mutate_setting, false); // uri
        vector::push_back(&mut mutate_setting, false); // maximum

        let account_addr = signer::address_of(account);
        if (!token::check_collection_exists(account_addr, collection_name)) {
            token::create_collection(
                account,
                collection_name,
                collection_description,
                collection_uri,
                0, // maximum supply
                mutate_setting,
            );
        };
    }

   

    /// Mint an NFT proof receipt with custom metadata URI as a Standard Aptos Token
    public entry fun mint_proof_with_metadata(
        account: &signer, 
        station: String,
        category: String,
        _full_name: String,
        _phone: String,
        _email: String,
        _aadhar: String,
        _address: String,
        incident_date: String,
        _incident_time: String,
        _incident_location: String,
        _description: String,
        _witnesses: String,
        _evidence_cids: String,
        metadata_uri: String
    ) acquires NFTReceiptBook {
        let account_addr = signer::address_of(account);
        
        // Fetch latest complaint from the main module for ID

        // Note: usage of citizen_flow::get_complaints is now optional/validating
        // To fix simulation error (where no state exists), we handle the empty case
        
        let complaints = citizen_flow::get_complaints(account_addr);
        let complaints_len = vector::length(&complaints);
        
        let complaint_id = if (complaints_len > 0) {
            let latest_complaint = vector::borrow(&complaints, complaints_len - 1);
            let (id, _st, _cat, _ev, _ts) = citizen_flow::get_complaint_data(latest_complaint);
            id
        } else {
            0 // Fallback ID for simulation or isolated testing
        };

        // Create token name and description
        let token_name = string::utf8(b"Complaint Receipt #");
        let complaint_id_str = u64_to_string(complaint_id);
        string::append(&mut token_name, complaint_id_str);
        string::append(&mut token_name, string::utf8(b" - ")); 
        string::append(&mut token_name, category);
        
        let token_description = string::utf8(b"Official proof of complaint submission - ");
        string::append(&mut token_description, category);
        string::append(&mut token_description, string::utf8(b" at "));
        string::append(&mut token_description, station);
        string::append(&mut token_description, string::utf8(b" on "));
        string::append(&mut token_description, incident_date);

        // --- Standard Aptos Token Logic ---
        // --- Standard Aptos Token Logic ---
        let collection_name = string::utf8(COLLECTION_NAME);
        let collection_description = string::utf8(b"Official receipts for complaints submitted via Citizen Flow.");
        let collection_uri = string::utf8(b"https://move-book.com/img/aptos-logo.png"); 
        
        let mutate_setting = vector::empty<bool>();
        vector::push_back(&mut mutate_setting, false); // description
        vector::push_back(&mut mutate_setting, false); // uri
        vector::push_back(&mut mutate_setting, false); // maximum

        // Ensure collection exists
        if (!token::check_collection_exists(account_addr, collection_name)) {
            token::create_collection(
                account,
                collection_name,
                collection_description,
                collection_uri,
                0, // maximum supply
                mutate_setting,
            );
        };

        let token_mutate_setting = vector::empty<bool>();
        vector::push_back(&mut token_mutate_setting, false);
        vector::push_back(&mut token_mutate_setting, false);
        vector::push_back(&mut token_mutate_setting, false);
        vector::push_back(&mut token_mutate_setting, false);
        vector::push_back(&mut token_mutate_setting, false);

        // Mint the Standard Token
        token::create_token_script(
            account,
            collection_name,
            token_name,
            token_description,
            1, // balance
            1, // maximum
            metadata_uri, // uri
            account_addr, // royalty_payee_address
            0, // royalty_points_denominator
            0, // royalty_points_numerator
            token_mutate_setting,
            vector::empty<String>(),
            vector::empty<vector<u8>>(),
            vector::empty<String>(),
        );
        // ----------------------------------
        
        // Create NFT receipt (Internal Tracking)
        let receipt = NFTReceipt {
            complaint_id,
            token_name,
            token_description,
            image_uri: metadata_uri, 
            minted_at: aptos_framework::timestamp::now_microseconds(),
        };
        
        // Initialize receipt book if it doesn't exist
        if (!exists<NFTReceiptBook>(account_addr)) {
            move_to(account, NFTReceiptBook {
                receipts: vector::empty<NFTReceipt>(),
            });
        };
        
        // Store the receipt
        let receipt_book = borrow_global_mut<NFTReceiptBook>(account_addr);
        vector::push_back(&mut receipt_book.receipts, receipt);
        
        // Emit event
        event::emit(NFTMinted {
            account: account_addr,
            complaint_id,
            token_name,
            image_uri: metadata_uri,
        });
    }

    /// Get all NFT receipts for an account
    public fun get_nft_receipts(account: address): vector<NFTReceipt> acquires NFTReceiptBook {
        if (!exists<NFTReceiptBook>(account)) {
            return vector::empty<NFTReceipt>()
        };
        borrow_global<NFTReceiptBook>(account).receipts
    }

    // Helper function to convert u64 to string
    fun u64_to_string(value: u64): String {
        if (value == 0) {
            return string::utf8(b"0")
        };
        
        let buffer = vector::empty<u8>();
        let temp = value;
        
        while (temp > 0) {
            let digit = ((temp % 10) as u8) + 48; // 48 is ASCII '0'
            vector::push_back(&mut buffer, digit);
            temp = temp / 10;
        };
        
        vector::reverse(&mut buffer);
        string::utf8(buffer)
    }
}
