import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useNavigation } from '../../../shared/hooks/navigation';
import { useSearch } from '../../../shared/hooks/search';
import classes from './Details.module.scss';
import Value from '../../../shared/components/value/Value';
import Card from '../../../shared/components/card/Card';
import Label from '../../../shared/components/label/Label';
import ContentDetailsScript from './ContentDetailsScript';
import ContentDetailsKeys from './ContentDetailsKeys';

enum ContentDetails {
    SCRIPT = 'script',
    CONTRACTS = 'contracts',
    KEYS = 'keys',
}

const Details: FunctionComponent<any> = () => {
    const { setPlaceholder } = useSearch();
    const { showNavigationDrawer, showSubNavigation } = useNavigation();
    const [contentDetails, setContentDetails] = useState(ContentDetails.SCRIPT);

    useEffect(() => {
        setPlaceholder('search for block numbers or tx hashes');
        showNavigationDrawer(true);
        showSubNavigation(false);
    }, []);

    const showDetails = useCallback((contentDetails: ContentDetails) => {
        setContentDetails(contentDetails);
    }, []);

    // TODO: Remove
    const script =
        'import FungibleToken from 0xee82856bf20e2aa6\nimport FlowToken from 0x0ae53cb6e3f42a79\nimport FlowFees from 0xe5a8b7f23e8b548f\nimport FlowStorageFees from 0xf8d6e0586b0a20c7\n\npub contract FlowServiceAccount {\n\n    pub event TransactionFeeUpdated(newFee: UFix64)\n\n    pub event AccountCreationFeeUpdated(newFee: UFix64)\n\n    pub event AccountCreatorAdded(accountCreator: Address)\n\n    pub event AccountCreatorRemoved(accountCreator: Address)\n\n    pub event IsAccountCreationRestrictedUpdated(isRestricted: Bool)\n\n    /// A fixed-rate fee charged to execute a transaction\n    pub var transactionFee: UFix64\n\n    /// A fixed-rate fee charged to create a new account\n    pub var accountCreationFee: UFix64\n\n    /// The list of account addresses that have permission to create accounts\n    access(contract) var accountCreators: {Address: Bool}\n\n    /// Initialize an account with a FlowToken Vault and publish capabilities.\n    pub fun initDefaultToken(_ acct: AuthAccount) {\n        // Create a new FlowToken Vault and save it in storage\n        acct.save(<-FlowToken.createEmptyVault(), to: /storage/flowTokenVault)\n\n        // Create a public capability to the Vault that only exposes\n        // the deposit function through the Receiver interface\n        acct.link<&FlowToken.Vault{FungibleToken.Receiver}>(\n            /public/flowTokenReceiver,\n            target: /storage/flowTokenVault\n        )\n\n        // Create a public capability to the Vault that only exposes\n        // the balance field through the Balance interface\n        acct.link<&FlowToken.Vault{FungibleToken.Balance}>(\n            /public/flowTokenBalance,\n            target: /storage/flowTokenVault\n        )\n    }\n\n    /// Get the default token balance on an account\n    pub fun defaultTokenBalance(_ acct: PublicAccount): UFix64 {\n        let balanceRef = acct\n            .getCapability(/public/flowTokenBalance)\n            .borrow<&FlowToken.Vault{FungibleToken.Balance}>()!\n\n        return balanceRef.balance\n    }\n\n    /// Return a reference to the default token vault on an account\n    pub fun defaultTokenVault(_ acct: AuthAccount): &FlowToken.Vault {\n        return acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)\n            ?? panic("Unable to borrow reference to the default token vault")\n    }\n\n    /// Called when a transaction is submitted to deduct the fee\n    /// from the AuthAccount that submitted it\n    pub fun deductTransactionFee(_ acct: AuthAccount) {\n        if self.transactionFee == UFix64(0) {\n            return\n        }\n\n        let tokenVault = self.defaultTokenVault(acct)\n        let feeVault <- tokenVault.withdraw(amount: self.transactionFee)\n\n        FlowFees.deposit(from: <-feeVault)\n    }\n\n    /// - Deducts the account creation fee from a payer account.\n    /// - Inits the default token.\n    /// - Inits account storage capacity.\n    pub fun setupNewAccount(newAccount: AuthAccount, payer: AuthAccount) {\n        if !FlowServiceAccount.isAccountCreator(payer.address) {\n            panic("Account not authorized to create accounts")\n        }\n\n\n        if self.accountCreationFee < FlowStorageFees.minimumStorageReservation {\n            panic("Account creation fees setup incorrectly")\n        }\n\n        let tokenVault = self.defaultTokenVault(payer)\n        let feeVault <- tokenVault.withdraw(amount: self.accountCreationFee)\n        let storageFeeVault <- (feeVault.withdraw(amount: FlowStorageFees.minimumStorageReservation) as! @FlowToken.Vault)\n        FlowFees.deposit(from: <-feeVault)\n\n        FlowServiceAccount.initDefaultToken(newAccount)\n\n        let vaultRef = FlowServiceAccount.defaultTokenVault(newAccount)\n\n        vaultRef.deposit(from: <-storageFeeVault)\n    }\n\n    /// Returns true if the given address is permitted to create accounts, false otherwise\n    pub fun isAccountCreator(_ address: Address): Bool {\n        // If account creation is not restricted, then anyone can create an account\n        if !self.isAccountCreationRestricted() {\n            return true\n        }\n        return self.accountCreators[address] ?? false\n    }\n\n    /// Is true if new acconts can only be created by approved accounts `self.accountCreators`\n    pub fun isAccountCreationRestricted(): Bool {\n        return self.account.copy<Bool>(from: /storage/isAccountCreationRestricted) ?? false\n    }\n\n    // Authorization resource to change the fields of the contract\n    /// Returns all addresses permitted to create accounts\n    pub fun getAccountCreators(): [Address] {\n        return self.accountCreators.keys\n    }\n\n    /// Authorization resource to change the fields of the contract\n    pub resource Administrator {\n\n        /// Sets the transaction fee\n        pub fun setTransactionFee(_ newFee: UFix64) {\n            FlowServiceAccount.transactionFee = newFee\n            emit TransactionFeeUpdated(newFee: newFee)\n        }\n\n        /// Sets the account creation fee\n        pub fun setAccountCreationFee(_ newFee: UFix64) {\n            FlowServiceAccount.accountCreationFee = newFee\n            emit AccountCreationFeeUpdated(newFee: newFee)\n        }\n\n        /// Adds an account address as an authorized account creator\n        pub fun addAccountCreator(_ accountCreator: Address) {\n            FlowServiceAccount.accountCreators[accountCreator] = true\n            emit AccountCreatorAdded(accountCreator: accountCreator)\n        }\n\n        /// Removes an account address as an authorized account creator\n        pub fun removeAccountCreator(_ accountCreator: Address) {\n            FlowServiceAccount.accountCreators.remove(key: accountCreator)\n            emit AccountCreatorRemoved(accountCreator: accountCreator)\n        }\n\n         pub fun setIsAccountCreationRestricted(_ enabled: Bool) {\n            let path = /storage/isAccountCreationRestricted\n            let oldValue = FlowServiceAccount.account.load<Bool>(from: path)\n            FlowServiceAccount.account.save<Bool>(enabled, to: path)\n            if enabled != oldValue {\n                emit IsAccountCreationRestrictedUpdated(isRestricted: enabled)\n            }\n        }\n    }\n\n    init() {\n        self.transactionFee = 0.0\n        self.accountCreationFee = 0.0\n\n        self.accountCreators = {}\n\n        let admin <- create Administrator()\n        admin.addAccountCreator(self.account.address)\n\n        self.account.save(<-admin, to: /storage/flowServiceAdmin)\n    }\n}\n';

    // const script = `transaction(publicKeys: [String], contracts: {String: String}) {\n
    //     prepare(signer: AuthAccount) {\n
    //         let acct = AuthAccount(payer: signer)\n
    //     }\n
    // }`;

    // TODO: Remove
    const keys = [
        'G9DSJ4tOSLBqSFR2Ht4cs/GFh5UVb0F1LOl0F44ZZYreX2wQFc3Nzws9WSZhGQX6CW639pZOmvWuOgRRDItoig==',
        'G9DSJ4tOSLBqSFR2Ht4cs/GFh5UVb0F1LOl0F44ZZYreX2wQFc3Nzws9WSZhGQX6CW639pZOmvWuOgRRDItoig==',
    ];

    return (
        <div className={classes.root}>
            <div className={classes.firstRow}>
                <Label variant="medium">ADDRESS</Label>
                <Value variant="medium">0x0bdaAf23dDa4Ff97D0182D550E4BA9A74d6F291E</Value>
            </div>
            <Card className={classes.bigCard}>
                <div>
                    <Label variant="large" className={classes.label}>
                        BALANCE
                    </Label>
                    <Value variant="large">0.47000000 FLOW</Value>
                </div>
                <div>
                    <Label variant="large" className={classes.label}>
                        BLOCK ID
                    </Label>
                    <Value variant="large">18876000</Value>
                </div>
                <div>
                    <Label variant="large" className={classes.label}>
                        PAYER
                    </Label>
                    <Value variant="large">0x55ad22f01ef000a1</Value>
                </div>
            </Card>
            <div className={classes.threeCardsContainer}>
                <Card
                    active={contentDetails === ContentDetails.SCRIPT}
                    className={classes.smallCard}
                    onClick={() => showDetails(ContentDetails.SCRIPT)}
                >
                    <Label variant="medium">SCRIPT</Label>
                    <Value variant="large">
                        <a>{'<>'}</a>
                    </Value>
                </Card>
                <Card
                    active={contentDetails === ContentDetails.CONTRACTS}
                    className={classes.smallCard}
                    onClick={() => showDetails(ContentDetails.CONTRACTS)}
                >
                    <Label variant="medium">CONTRACTS</Label>
                    <Value variant="medium">33</Value>
                </Card>
                <Card
                    active={contentDetails === ContentDetails.KEYS}
                    className={classes.smallCard}
                    onClick={() => showDetails(ContentDetails.KEYS)}
                >
                    <Label variant="medium">KEYS</Label>
                    <Value variant="medium">
                        <a>2</a>
                    </Value>
                </Card>
            </div>
            <div className={classes.contentDetailsContainer}>
                {contentDetails === ContentDetails.SCRIPT && <ContentDetailsScript script={script} />}
                {contentDetails === ContentDetails.KEYS && <ContentDetailsKeys keys={keys} />}
            </div>
        </div>
    );
};

export default Details;
