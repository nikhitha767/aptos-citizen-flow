module citizen_flow_v18::police_fir_v1 {
    use std::string::{Self, String};
    use std::signer;
    use std::vector;
    use aptos_token::token;

    use aptos_framework::timestamp;
    use aptos_framework::event;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;

    /// Constants
    const COLLECTION_NAME: vector<u8> = b"Police FIR Records";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Official First Information Reports (FIR) registered on-chain.";
    const COLLECTION_URI: vector<u8> = b"https://gateway.pinata.cloud/ipfs/QmYourDefaultCollectionImage";

    struct FIRRecord has store, drop, copy {
        complaint_id: String,
        fir_number: String,
        station: String,
        accused_name: String,
        offense_section: String,
        ipfs_cid: String,
        minted_at: u64,
    }

    struct FIRRegistry has key {
        records: vector<FIRRecord>,
        fir_counter: u64,
    }

    #[event]
    struct FIRMinted has drop, store {
        officer: address,
        complaint_id: String,
        fir_number: String,
        token_name: String,
    }

    /// Initialize the FIR collection and registry
    entry fun initialize_registry(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<FIRRegistry>(account_addr)) {
            move_to(account, FIRRegistry {
                records: vector::empty<FIRRecord>(),
                fir_counter: 0,
            });
        };

        let collection_name = string::utf8(COLLECTION_NAME);
        if (!token::check_collection_exists(account_addr, collection_name)) {
            token::create_collection(
                account,
                collection_name,
                string::utf8(COLLECTION_DESCRIPTION),
                string::utf8(COLLECTION_URI),
                0, // Maximum supply (0 = unlimited)
                vector<bool>[false, false, false], // Mutability settings
            );
        };
    }

    /// Mint an FIR NFT
    public entry fun register_fir(
        account: &signer,
        complaint_id: String,
        station: String,
        accused_name: String,
        offense_section: String,
        ipfs_cid: String,
        metadata_uri: String
    ) acquires FIRRegistry {
        let account_addr = signer::address_of(account);

        // 1. Ensure registry/collection exists (auto-initialize if needed)
        initialize_registry(account);
        
        let registry = borrow_global_mut<FIRRegistry>(account_addr);
        
        // 2. Generate FIR Number
        registry.fir_counter = registry.fir_counter + 1;
        let fir_number_str = u64_to_string(registry.fir_counter);
        let fir_full_number = string::utf8(b"FIR-");
        string::append(&mut fir_full_number, fir_number_str);

        // 3. Construct Token Data
        let token_name = fir_full_number; // e.g., "FIR-1"
        string::append(&mut token_name, string::utf8(b" : "));
        string::append(&mut token_name, complaint_id); // Ensure uniqueness by appending ID

        let description = string::utf8(b"FIR Filed at ");
        string::append(&mut description, station);
        string::append(&mut description, string::utf8(b". Offense: "));
        string::append(&mut description, offense_section);

        // 4. Mint Token (Aptos Standard Token)
        let collection_name = string::utf8(COLLECTION_NAME);
        token::create_token_script(
            account,
            collection_name,
            token_name,
            description,
            1, // Balance
            1, // Max
            metadata_uri,
            account_addr, // Royalty payee
            0, // Royalty denominator
            0, // Royalty numerator
            vector<bool>[false, false, false, false, false], // Mutability
            vector<String>[],
            vector<vector<u8>>[],
            vector<String>[],
        );

        // 5. Store Internal Record
        let record = FIRRecord {
            complaint_id,
            fir_number: fir_full_number,
            station,
            accused_name,
            offense_section,
            ipfs_cid,
            minted_at: timestamp::now_microseconds(),
        };
        vector::push_back(&mut registry.records, record);

        // 6. Emit Event
        event::emit(FIRMinted {
            officer: account_addr,
            complaint_id,
            fir_number: fir_full_number,
            token_name,
        });
    }

    // Helper: Convert u64 to String
    fun u64_to_string(value: u64): String {
        if (value == 0) {
            return string::utf8(b"0")
        };
        let buffer = vector::empty<u8>();
        let temp = value;
        while (temp > 0) {
            let digit = ((temp % 10) as u8) + 48;
            vector::push_back(&mut buffer, digit);
            temp = temp / 10;
        };
        vector::reverse(&mut buffer);
        string::utf8(buffer)
    }
}
