'use client';

import React, { useState } from 'react';
import { api } from '../../../../lib/api-routes';
import type {
    SavingsAccount,
    CustomerLookup,
    ExistingSavingsAccount,
    TransactionModalProps,
} from '../../../../lib/api-types';

export const TransactionModal: React.FC<TransactionModalProps> = ({
    isOpen,
    onClose,
    account,
    transactionType,
    onSuccess,
}) => {
    const [phone, setPhone] = useState('');

    const [customer, setCustomer] =
        useState<CustomerLookup | null>(null);

    const [existingSavingsAccount, setExistingSavingsAccount] =
        useState<ExistingSavingsAccount | null>(null);

    const [customerSearched, setCustomerSearched] =
        useState(false);

    const [searchingCustomer, setSearchingCustomer] =
        useState(false);

    // New customer information
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [bvn, setBvn] = useState('');
    const [nin, setNin] = useState('');

    const [amount, setAmount] = useState('');

    const [paymentMethod, setPaymentMethod] =
        useState<
            'CASH'
            | 'BANK_TRANSFER'
            | 'POS'
            | 'MOBILE_MONEY'
        >('CASH');

    const [description, setDescription] = useState('');

    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const isProvision = transactionType === 'PROVISION';

    // ---------------------------------------------
    // CUSTOMER LOOKUP
    // ---------------------------------------------

    const handleCustomerSearch = async () => {
        const normalizedPhone = phone.trim();

        if (!normalizedPhone) {
            alert('Please enter a customer phone number.');
            return;
        }

        setSearchingCustomer(true);

        try {
            const response =
                await api.savings.findCustomerByPhone(
                    normalizedPhone
                );

            if (!response.success) {
                alert(
                    response.message ||
                    'Unable to search for customer.'
                );
                return;
            }

            const data = response.data;

            setCustomerSearched(true);

            /*
             * Backend returns:
             *
             * {
             *   exists: boolean,
             *   customer: ...,
             *   hasSavingsAccount: boolean,
             *   savingsAccount: ...
             * }
             */

            if (data.exists && data.customer) {
                // Existing customer
                setCustomer(data.customer);

                setFirstName(data.customer.firstName);
                setLastName(data.customer.lastName);

                setExistingSavingsAccount(
                    data.savingsAccount
                );

                /*
                 * Existing customer already has their
                 * information in the Customer table.
                 *
                 * We don't ask them to re-enter
                 * email/BVN/NIN here.
                 */
                setEmail('');
                setBvn('');
                setNin('');
            } else {
                // Customer does not exist
                setCustomer(null);
                setExistingSavingsAccount(null);

                setFirstName('');
                setLastName('');
                setEmail('');
                setBvn('');
                setNin('');
            }
        } catch (error: any) {
            console.error(
                'Customer lookup failed:',
                error
            );

            alert(
                error?.message ||
                'Unable to search for customer.'
            );
        } finally {
            setSearchingCustomer(false);
        }
    };

    // ---------------------------------------------
    // SUBMIT
    // ---------------------------------------------

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (isProvision) {
            // Customer must be searched first
            if (!customerSearched) {
                alert(
                    'Please search for the customer by phone number first.'
                );
                return;
            }

            // Prevent duplicate savings account
            if (existingSavingsAccount) {
                alert(
                    `This customer already has savings account ${existingSavingsAccount.accountNumber}.`
                );
                return;
            }

            // New customer requires name
            if (!customer && (!firstName.trim() || !lastName.trim())) {
                alert(
                    "Please provide the customer's first and last names."
                );
                return;
            }

            // Initial deposit validation
            if (!amount || Number(amount) <= 0) {
                alert(
                    'Please enter a valid initial deposit.'
                );
                return;
            }
        } else {
            // Deposit / withdrawal
            if (!account) return;

            if (!amount || Number(amount) <= 0) {
                alert(
                    'Please enter a valid amount.'
                );
                return;
            }
        }

        setSubmitting(true);

        try {
            // -----------------------------------------
            // PROVISION NEW SAVINGS ACCOUNT
            // -----------------------------------------

            if (isProvision) {
                const response =
                    await api.savings.provisionAccount({
                        phone: phone.trim(),

                        /*
                         * If customer exists, don't send
                         * firstName/lastName again.
                         *
                         * If customer doesn't exist,
                         * send the information required
                         * to create the Customer record.
                         */
                        firstName: customer
                            ? undefined
                            : firstName.trim(),

                        lastName: customer
                            ? undefined
                            : lastName.trim(),

                        email: customer
                            ? undefined
                            : email.trim() || undefined,

                        bvn: customer
                            ? undefined
                            : bvn.trim() || undefined,

                        nin: customer
                            ? undefined
                            : nin.trim() || undefined,

                        initialDeposit: Number(amount),

                        paymentMethod,

                        description:
                            description.trim() ||
                            undefined,
                    });

                if (!response.success) {
                    alert(
                        response.message ||
                        'Unable to create savings account.'
                    );
                    return;
                }

                clearForm();
                onSuccess();
                onClose();

                return;
            }

            // -----------------------------------------
            // NORMAL DEPOSIT / WITHDRAWAL
            // -----------------------------------------

            const payload = {
                savingsAccountId: account!.id,
                amount: Number(amount),
                paymentMethod,
                description:
                    description.trim() || undefined,
            };

            const response =
                transactionType === 'DEPOSIT'
                    ? await api.savings.deposit(payload)
                    : await api.savings.withdraw(payload);

            if (!response.success) {
                alert(
                    response.message ||
                    'Transaction could not be completed.'
                );
                return;
            }

            clearForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(
                'Savings transaction failed:',
                error
            );

            alert(
                error?.message ||
                'Transaction processing failed.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ---------------------------------------------
    // RESET FORM
    // ---------------------------------------------

    const clearForm = () => {
        setPhone('');

        setCustomer(null);

        setExistingSavingsAccount(null);

        setCustomerSearched(false);

        setFirstName('');
        setLastName('');
        setEmail('');
        setBvn('');
        setNin('');

        setAmount('');

        setDescription('');

        setPaymentMethod('CASH');
    };

    const handleClose = () => {
        clearForm();
        onClose();
    };

    // ---------------------------------------------
    // HEADING
    // ---------------------------------------------

    const getHeadingText = () => {
        if (transactionType === 'PROVISION') {
            return 'Provision New Savings Core';
        }

        return `Execute Savings ${
            transactionType === 'DEPOSIT'
                ? 'Deposit'
                : 'Withdrawal'
        }`;
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor:
                    'rgba(15, 23, 42, 0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '28px',
                    width: '460px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow:
                        '0 20px 25px -5px rgba(0,0,0,0.1)',
                }}
            >
                {/* -----------------------------------------
                    HEADING
                ------------------------------------------ */}

                <h3
                    style={{
                        margin: '0 0 6px',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#2c2a7a'
                    }}
                >
                    {getHeadingText()}
                </h3>

                {/* -----------------------------------------
                    EXISTING ACCOUNT TRANSACTION
                ------------------------------------------ */}

                {!isProvision && account && (
                    <p
                        style={{
                            margin: '0 0 20px',
                            fontSize: '14px',
                            color: '#64748b',
                        }}
                    >
                        Account Holder:{' '}
                        <strong>
                            {account.customer?.firstName}{' '}
                            {account.customer?.lastName}
                        </strong>{' '}
                        ({account.accountNumber})
                    </p>
                )}

                {/* -----------------------------------------
                    PROVISION FLOW
                ------------------------------------------ */}

                {isProvision && (
                    <>
                        {/* PHONE SEARCH */}

                        <div
                            style={{
                                marginBottom: '18px',
                            }}
                        >
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    marginBottom: '6px',
                                }}
                            >
                                Customer Phone Number
                            </label>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '8px',
                                }}
                            >
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        setPhone(
                                            e.target.value
                                        );

                                        setCustomerSearched(
                                            false
                                        );

                                        setCustomer(null);

                                        setExistingSavingsAccount(
                                            null
                                        );

                                        setFirstName('');
                                        setLastName('');
                                        setEmail('');
                                        setBvn('');
                                        setNin('');
                                    }}
                                    placeholder="08012345678"
                                    style={{
                                        flex: 1,
                                        padding:
                                            '10px 12px',
                                        borderRadius:
                                            '6px',
                                        border:
                                            '1px solid #cbd5e1',
                                        fontSize:
                                            '14px',
                                        outline: 'none',
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={
                                        handleCustomerSearch
                                    }
                                    disabled={
                                        searchingCustomer
                                    }
                                    style={{
                                        padding:
                                            '10px 14px',
                                        border: 'none',
                                        borderRadius:
                                            '6px',
                                        backgroundColor: '#2c2a7a',
                                        color: '#fff',
                                        fontWeight:
                                            '600',
                                        cursor:
                                            searchingCustomer
                                                ? 'not-allowed'
                                                : 'pointer',
                                    }}
                                >
                                    {searchingCustomer
                                        ? 'Searching...'
                                        : 'Find'}
                                </button>
                            </div>
                        </div>

                        {/* -----------------------------------------
                            NEW CUSTOMER DETAILS
                        ------------------------------------------ */}

                        {customerSearched && !customer && (
                            <div
                                style={{
                                    marginBottom: '18px',
                                }}
                            >
                                {/* CUSTOMER NOT FOUND */}

                                <div
                                    style={{
                                        marginBottom:
                                            '16px',
                                        padding: '14px',
                                        borderRadius:
                                            '8px',
                                        backgroundColor:
                                            '#fff7ed',
                                        border:
                                            '1px solid #fed7aa',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                '13px',
                                            fontWeight:
                                                '700',
                                            color:
                                                '#9a3412',
                                            marginBottom:
                                                '4px',
                                        }}
                                    >
                                        Customer Not Found
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                '12px',
                                            color:
                                                '#c2410c',
                                        }}
                                    >
                                        No customer is
                                        registered with
                                        this phone number.
                                        Enter the
                                        customer's
                                        information below
                                        to create a new
                                        customer.
                                    </div>
                                </div>

                                {/* NAME */}

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        marginBottom:
                                            '16px',
                                    }}
                                >
                                    <div
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <label
                                            style={{
                                                display:
                                                    'block',
                                                fontSize:
                                                    '13px',
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#475569',
                                                marginBottom:
                                                    '6px',
                                            }}
                                        >
                                            First Name
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                firstName
                                            }
                                            onChange={(e) =>
                                                setFirstName(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="First name"
                                            required
                                            style={{
                                                width:
                                                    '100%',
                                                padding:
                                                    '10px 12px',
                                                borderRadius:
                                                    '6px',
                                                border:
                                                    '1px solid #cbd5e1',
                                                fontSize:
                                                    '14px',
                                                outline:
                                                    'none',
                                            }}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <label
                                            style={{
                                                display:
                                                    'block',
                                                fontSize:
                                                    '13px',
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#475569',
                                                marginBottom:
                                                    '6px',
                                            }}
                                        >
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                lastName
                                            }
                                            onChange={(e) =>
                                                setLastName(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Last name"
                                            required
                                            style={{
                                                width:
                                                    '100%',
                                                padding:
                                                    '10px 12px',
                                                borderRadius:
                                                    '6px',
                                                border:
                                                    '1px solid #cbd5e1',
                                                fontSize:
                                                    '14px',
                                                outline:
                                                    'none',
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* EMAIL */}

                                <div
                                    style={{
                                        marginBottom:
                                            '16px',
                                    }}
                                >
                                    <label
                                        style={{
                                            display:
                                                'block',
                                            fontSize:
                                                '13px',
                                            fontWeight:
                                                '600',
                                            color:
                                                '#475569',
                                            marginBottom:
                                                '6px',
                                        }}
                                    >
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target
                                                    .value
                                            )
                                        }
                                        placeholder="customer@example.com"
                                        style={{
                                            width: '100%',
                                            padding:
                                                '10px 12px',
                                            borderRadius:
                                                '6px',
                                            border:
                                                '1px solid #cbd5e1',
                                            fontSize:
                                                '14px',
                                            outline:
                                                'none',
                                        }}
                                    />
                                </div>

                                {/* BVN + NIN */}

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        marginBottom:
                                            '16px',
                                    }}
                                >
                                    <div
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <label
                                            style={{
                                                display:
                                                    'block',
                                                fontSize:
                                                    '13px',
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#475569',
                                                marginBottom:
                                                    '6px',
                                            }}
                                        >
                                            BVN
                                        </label>

                                        <input
                                            type="text"
                                            value={bvn}
                                            onChange={(e) =>
                                                setBvn(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="BVN"
                                            maxLength={11}
                                            style={{
                                                width:
                                                    '100%',
                                                padding:
                                                    '10px 12px',
                                                borderRadius:
                                                    '6px',
                                                border:
                                                    '1px solid #cbd5e1',
                                                fontSize:
                                                    '14px',
                                                outline:
                                                    'none',
                                            }}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            flex: 1,
                                        }}
                                    >
                                        <label
                                            style={{
                                                display:
                                                    'block',
                                                fontSize:
                                                    '13px',
                                                fontWeight:
                                                    '600',
                                                color:
                                                    '#475569',
                                                marginBottom:
                                                    '6px',
                                            }}
                                        >
                                            NIN
                                        </label>

                                        <input
                                            type="text"
                                            value={nin}
                                            onChange={(e) =>
                                                setNin(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="NIN"
                                            maxLength={11}
                                            style={{
                                                width:
                                                    '100%',
                                                padding:
                                                    '10px 12px',
                                                borderRadius:
                                                    '6px',
                                                border:
                                                    '1px solid #cbd5e1',
                                                fontSize:
                                                    '14px',
                                                outline:
                                                    'none',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* -----------------------------------------
                            EXISTING SAVINGS ACCOUNT
                        ------------------------------------------ */}

                        {customerSearched &&
                            customer &&
                            existingSavingsAccount && (
                                <div
                                    style={{
                                        marginBottom:
                                            '18px',
                                        padding: '14px',
                                        borderRadius:
                                            '8px',
                                        backgroundColor:
                                            '#fef2f2',
                                        border:
                                            '1px solid #fecaca',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                '13px',
                                            fontWeight:
                                                '700',
                                            color:
                                                '#991b1b',
                                            marginBottom:
                                                '5px',
                                        }}
                                    >
                                        ⚠ Savings Account
                                        Already Exists
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                '14px',
                                            color:
                                                '#7f1d1d',
                                        }}
                                    >
                                        Account:{' '}
                                        <strong>
                                            {
                                                existingSavingsAccount.accountNumber
                                            }
                                        </strong>
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                '12px',
                                            color:
                                                '#991b1b',
                                            marginTop:
                                                '4px',
                                        }}
                                    >
                                        This customer
                                        cannot be
                                        provisioned
                                        another savings
                                        account.
                                    </div>
                                </div>
                            )}

                        {/* -----------------------------------------
                            EXISTING CUSTOMER FOUND
                        ------------------------------------------ */}

                        {customerSearched &&
                            customer &&
                            !existingSavingsAccount && (
                                <div
                                    style={{
                                        marginBottom:
                                            '18px',
                                        padding: '14px',
                                        borderRadius:
                                            '8px',
                                        backgroundColor:
                                            '#f0fdf4',
                                        border:
                                            '1px solid #bbf7d0',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize:
                                                '13px',
                                            fontWeight:
                                                '700',
                                            color:
                                                '#166534',
                                            marginBottom:
                                                '5px',
                                        }}
                                    >
                                        ✓ Customer Found
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                '14px',
                                            color:
                                                '#166534',
                                        }}
                                    >
                                        <strong>
                                            {
                                                customer.firstName
                                            }{' '}
                                            {
                                                customer.lastName
                                            }
                                        </strong>
                                    </div>

                                    <div
                                        style={{
                                            fontSize:
                                                '12px',
                                            color:
                                                '#15803d',
                                            marginTop:
                                                '4px',
                                        }}
                                    >
                                        Existing customer
                                        found. A new
                                        savings account
                                        will be created
                                        for this customer.
                                    </div>
                                </div>
                            )}
                    </>
                )}

                {/* -----------------------------------------
                    TRANSACTION FORM
                ------------------------------------------ */}

                <form onSubmit={handleSubmit}>
                    {/* AMOUNT */}

                    <div
                        style={{
                            marginBottom: '16px',
                        }}
                    >
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#475569',
                                marginBottom: '6px',
                            }}
                        >
                            {isProvision
                                ? 'Initial Deposit (₦)'
                                : 'Amount (₦)'}
                        </label>

                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) =>
                                setAmount(
                                    e.target.value
                                )
                            }
                            style={{
                                width: '100%',
                                padding:
                                    '10px 12px',
                                borderRadius: '6px',
                                border:
                                    '1px solid #cbd5e1',
                                fontSize: '15px',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* PAYMENT METHOD */}

                    <div
                        style={{
                            marginBottom: '16px',
                        }}
                    >
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#475569',
                                marginBottom: '6px',
                            }}
                        >
                            Payment Method
                        </label>

                        <select
                            value={paymentMethod}
                            onChange={(e) =>
                                setPaymentMethod(
                                    e.target.value as
                                        | 'CASH'
                                        | 'BANK_TRANSFER'
                                        | 'POS'
                                        | 'MOBILE_MONEY'
                                )
                            }
                            style={{
                                width: '100%',
                                padding:
                                    '10px 12px',
                                borderRadius: '6px',
                                border:
                                    '1px solid #cbd5e1',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor:
                                    '#fff',
                            }}
                        >
                            <option value="CASH">
                                Cash Office Counter
                            </option>

                            <option value="BANK_TRANSFER">
                                Bank Transfer
                            </option>

                            <option value="POS">
                                POS Terminal
                            </option>

                            <option value="MOBILE_MONEY">
                                Mobile Money
                            </option>
                        </select>
                    </div>

                    {/* DESCRIPTION */}

                    <div
                        style={{
                            marginBottom: '24px',
                        }}
                    >
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#475569',
                                marginBottom: '6px',
                            }}
                        >
                            Description
                        </label>

                        <textarea
                            placeholder="Transaction narration..."
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            style={{
                                width: '100%',
                                padding:
                                    '10px 12px',
                                borderRadius: '6px',
                                border:
                                    '1px solid #cbd5e1',
                                fontSize: '14px',
                                outline: 'none',
                                height: '70px',
                                resize: 'none',
                            }}
                        />
                    </div>

                    {/* ACTIONS */}

                    <div
                        style={{
                            display: 'flex',
                            justifyContent:
                                'flex-end',
                            gap: '12px',
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            style={{
                                padding:
                                    '10px 16px',
                                borderRadius: '6px',
                                border:
                                    '1px solid #cbd5e1',
                                backgroundColor:
                                    '#fff',
                                color: '#334155',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px',
                            }}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                (isProvision &&
                                    !!existingSavingsAccount)
                            }
                            style={{
                                padding:
                                    '10px 20px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor:
                                    transactionType ===
                                    'WITHDRAWAL'
                                        ? '#ef4444'
                                        : '#10b981',
                                color: '#fff',
                                cursor:
                                    submitting ||
                                    (isProvision &&
                                        !!existingSavingsAccount)
                                        ? 'not-allowed'
                                        : 'pointer',
                                fontWeight: '600',
                                fontSize: '14px',
                                opacity:
                                    submitting ||
                                    (isProvision &&
                                        !!existingSavingsAccount)
                                        ? 0.6
                                        : 1,
                            }}
                        >
                            {submitting
                                ? 'Processing...'
                                : isProvision
                                ? 'Create Savings Account'
                                : transactionType ===
                                  'DEPOSIT'
                                ? 'Record Deposit'
                                : 'Record Withdrawal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};