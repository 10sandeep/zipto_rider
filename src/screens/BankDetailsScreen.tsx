import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, Alert, Dimensions, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Responsive helpers
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;

export default function BankDetailsScreen({ navigation }: any) {
  // State to track if user has bank details
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Bank account details state
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [branch, setBranch] = useState('');
  const [accountType, setAccountType] = useState('Savings');

  // Saved bank accounts (can have multiple)
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(0);

  const handleSaveAccount = () => {
    // Validation
    if (!accountHolder || !accountNumber || !confirmAccountNumber || !ifscCode || !bankName || !branch) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      Alert.alert('Error', 'Account numbers do not match');
      return;
    }

    const newAccount = {
      accountHolder,
      accountNumber,
      ifscCode,
      bankName,
      branch,
      accountType,
      verified: false,
    };

    if (isEditing && hasBankDetails) {
      // Update existing account
      const updatedAccounts = [...bankAccounts];
      updatedAccounts[selectedAccount] = newAccount;
      setBankAccounts(updatedAccounts);
      setIsEditing(false);
    } else {
      // Add new account
      setBankAccounts([...bankAccounts, newAccount]);
      setHasBankDetails(true);
      setShowAddForm(false);
    }

    // Clear form
    clearForm();
    Alert.alert('Success', 'Bank account saved successfully');
  };

  const clearForm = () => {
    setAccountHolder('');
    setAccountNumber('');
    setConfirmAccountNumber('');
    setIfscCode('');
    setBankName('');
    setBranch('');
    setAccountType('Savings');
  };

  const handleEdit = () => {
    const currentAccount = bankAccounts[selectedAccount];
    setAccountHolder(currentAccount.accountHolder);
    setAccountNumber(currentAccount.accountNumber);
    setConfirmAccountNumber(currentAccount.accountNumber);
    setIfscCode(currentAccount.ifscCode);
    setBankName(currentAccount.bankName);
    setBranch(currentAccount.branch);
    setAccountType(currentAccount.accountType);
    setIsEditing(true);
  };

  const handleAddAnother = () => {
    clearForm();
    setShowAddForm(true);
  };

  // Render form for adding/editing bank details
  const renderBankForm = () => (
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>
          {isEditing ? 'Edit Bank Account' : 'Add Bank Account'}
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Account Holder Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter account holder name"
            placeholderTextColor="#999"
            value={accountHolder}
            onChangeText={setAccountHolder}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bank Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter bank name"
            placeholderTextColor="#999"
            value={bankName}
            onChangeText={setBankName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Account Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter account number"
            placeholderTextColor="#999"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Confirm Account Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter account number"
            placeholderTextColor="#999"
            value={confirmAccountNumber}
            onChangeText={setConfirmAccountNumber}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>IFSC Code *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter IFSC code"
            placeholderTextColor="#999"
            value={ifscCode}
            onChangeText={(text) => setIfscCode(text.toUpperCase())}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Branch *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter branch name"
            placeholderTextColor="#999"
            value={branch}
            onChangeText={setBranch}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Account Type</Text>
          <View style={styles.accountTypeContainer}>
            <TouchableOpacity
              style={[styles.accountTypeBtn, accountType === 'Savings' && styles.accountTypeBtnActive]}
              onPress={() => setAccountType('Savings')}
              activeOpacity={0.7}
            >
              <Text style={[styles.accountTypeText, accountType === 'Savings' && styles.accountTypeTextActive]}>
                Savings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.accountTypeBtn, accountType === 'Current' && styles.accountTypeBtnActive]}
              onPress={() => setAccountType('Current')}
              activeOpacity={0.7}
            >
              <Text style={[styles.accountTypeText, accountType === 'Current' && styles.accountTypeTextActive]}>
                Current
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAccount} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save Account</Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => {
              setIsEditing(false);
              clearForm();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  // Render bank details view
  const renderBankDetails = () => {
    const currentAccount = bankAccounts[selectedAccount];
    
    return (
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {bankAccounts.length > 1 && (
          <View style={styles.accountSelector}>
            <Text style={styles.selectorLabel}>Select Account</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {bankAccounts.map((account, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.accountChip,
                    selectedAccount === index && styles.accountChipActive
                  ]}
                  onPress={() => setSelectedAccount(index)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.accountChipText,
                    selectedAccount === index && styles.accountChipTextActive
                  ]}>
                    {account.bankName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.bankCard}>
          <Text style={styles.bankIcon}>🏦</Text>
          <Text style={styles.bankName}>{currentAccount.bankName}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>
              {currentAccount.verified ? '✓ Verified' : '⏳ Pending Verification'}
            </Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.detailCard}>
            <DetailRow label="Account Holder" value={currentAccount.accountHolder} />
            <DetailRow 
              label="Account Number" 
              value={`•••• •••• ${currentAccount.accountNumber.slice(-4)}`} 
            />
            <DetailRow label="IFSC Code" value={currentAccount.ifscCode} />
            <DetailRow label="Branch" value={currentAccount.branch} />
            <DetailRow label="Account Type" value={currentAccount.accountType} />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.addAnotherButton} 
          onPress={handleAddAnother}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={moderateScale(20)} color="#3B82F6" />
          <Text style={styles.addAnotherText}>Add Another Bank Account</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Payment Schedule</Text>
            <Text style={styles.infoText}>Your earnings are credited to this account every Monday.</Text>
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TransactionItem date="Jan 20, 2026" amount="₹18,500" status="Completed" />
          <TransactionItem date="Jan 13, 2026" amount="₹16,200" status="Completed" />
          <TransactionItem date="Jan 6, 2026" amount="₹19,800" status="Completed" />
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Details</Text>
        {hasBankDetails && !isEditing && !showAddForm && (
          <TouchableOpacity 
            onPress={handleEdit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
        {(isEditing || showAddForm || !hasBankDetails) && <View style={{ width: scale(40) }} />}
      </View>

      {!hasBankDetails || isEditing || showAddForm ? renderBankForm() : renderBankDetails()}
    </View>
  );
}

const DetailRow = ({ label, value }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
  </View>
);

const TransactionItem = ({ date, amount, status }: any) => (
  <View style={styles.transactionCard}>
    <View style={styles.transactionInfo}>
      <Text style={styles.transactionAmount}>{amount}</Text>
      <Text style={styles.transactionDate}>{date}</Text>
    </View>
    <View style={styles.statusBadge}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: scale(20), 
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40), 
    paddingBottom: verticalScale(16), 
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  headerTitle: { 
    fontSize: moderateScale(18), 
    fontWeight: '700',
    fontFamily: 'Poppins-Regular', 
    color: '#1C1C1E' 
  },
  editText: { 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    fontFamily: 'Poppins-Regular',
    color: '#3B82F6' 
  },
  scrollContent: { 
    padding: scale(20), 
    paddingBottom: verticalScale(100) 
  },
  
  // Form styles
  formSection: { 
    flex: 1 
  },
  formTitle: { 
    fontSize: moderateScale(isSmallDevice ? 22 : 24), 
    fontWeight: '800', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E', 
    marginBottom: verticalScale(24) 
  },
  inputGroup: { 
    marginBottom: verticalScale(20) 
  },
  inputLabel: { 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E', 
    marginBottom: verticalScale(8) 
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: moderateScale(12),
    padding: scale(16),
    fontSize: moderateScale(16),
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    minHeight: verticalScale(50),
  },
  accountTypeContainer: { 
    flexDirection: 'row', 
    gap: scale(12) 
  },
  accountTypeBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: moderateScale(12),
    padding: scale(16),
    alignItems: 'center',
    minHeight: verticalScale(50),
    justifyContent: 'center',
  },
  accountTypeBtnActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  accountTypeText: { 
    fontSize: moderateScale(16), 
    fontWeight: '600',
    fontFamily: 'Poppins-Regular', 
    color: '#666' 
  },
  accountTypeTextActive: { 
    color: '#FFFFFF' 
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    borderRadius: moderateScale(12),
    padding: scale(16),
    alignItems: 'center',
    marginTop: verticalScale(12),
    minHeight: verticalScale(50),
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: { 
    fontSize: moderateScale(16), 
    fontWeight: '700',
    fontFamily: 'Poppins-Regular', 
    color: '#FFFFFF' 
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(12),
    padding: scale(16),
    alignItems: 'center',
    marginTop: verticalScale(12),
    minHeight: verticalScale(50),
    justifyContent: 'center',
  },
  cancelButtonText: { 
    fontSize: moderateScale(16), 
    fontWeight: '600',
    fontFamily: 'Poppins-Regular', 
    color: '#666' 
  },
  
  // Bank details view styles
  accountSelector: { 
    marginBottom: verticalScale(20) 
  },
  selectorLabel: { 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    fontFamily: 'Poppins-Regular',
    color: '#666', 
    marginBottom: verticalScale(12) 
  },
  accountChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  accountChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  accountChipText: { 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    fontFamily: 'Poppins-Regular',
    color: '#666' 
  },
  accountChipTextActive: { 
    color: '#FFFFFF' 
  },
  bankCard: { 
    backgroundColor: '#FFFFFF', 
    padding: scale(24), 
    borderRadius: moderateScale(16), 
    alignItems: 'center', 
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bankIcon: { 
    fontSize: moderateScale(isSmallDevice ? 50 : 60), 
    marginBottom: verticalScale(12) 
  },
  bankName: { 
    fontSize: moderateScale(20), 
    fontWeight: '800', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E', 
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  verifiedBadge: { 
    backgroundColor: '#F0FDF4', 
    paddingHorizontal: scale(16), 
    paddingVertical: verticalScale(6), 
    borderRadius: moderateScale(20) 
  },
  verifiedText: { 
    fontSize: moderateScale(13), 
    fontWeight: '600',
    fontFamily: 'Poppins-Regular', 
    color: '#50C878' 
  },
  detailsSection: { 
    marginBottom: verticalScale(20) 
  },
  sectionTitle: { 
    fontSize: moderateScale(16), 
    fontWeight: '700',
    fontFamily: 'Poppins-Regular', 
    color: '#1C1C1E', 
    marginBottom: verticalScale(12) 
  },
  detailCard: { 
    backgroundColor: '#FFFFFF', 
    padding: scale(16), 
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: verticalScale(12), 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5',
    alignItems: 'center',
  },
  detailLabel: { 
    fontSize: moderateScale(14), 
    color: '#666',
    flex: 1,
  },
  detailValue: { 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'right',
  },
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: scale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    minHeight: verticalScale(50),
  },
  addAnotherText: { 
    fontSize: moderateScale(14), 
    fontWeight: '600',
    fontFamily: 'Poppins-Regular', 
    color: '#3B82F6', 
    marginLeft: scale(8) 
  },
  infoBox: { 
    flexDirection: 'row', 
    backgroundColor: '#F0F9FF', 
    padding: scale(16), 
    borderRadius: moderateScale(12), 
    marginBottom: verticalScale(20) 
  },
  infoIcon: { 
    fontSize: moderateScale(24), 
    marginRight: scale(12) 
  },
  infoContent: { 
    flex: 1 
  },
  infoTitle: { 
    fontSize: moderateScale(14), 
    fontWeight: '700', 
    fontFamily: 'Poppins-Regular',
    color: '#1C1C1E', 
    marginBottom: verticalScale(4) 
  },
  infoText: { 
    fontSize: moderateScale(13), 
    color: '#666', 
    fontFamily: 'Poppins-Regular',
    lineHeight: moderateScale(18) 
  },
  transactionsSection: { 
    marginBottom: verticalScale(20) 
  },
  transactionCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: scale(16), 
    borderRadius: moderateScale(12), 
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: { 
    fontSize: moderateScale(18), 
    fontWeight: '800', 
    fontFamily: 'Poppins-Regular',
    color: '#50C878', 
    marginBottom: verticalScale(4) 
  },
  transactionDate: { 
    fontSize: moderateScale(13),
    fontFamily: 'Poppins-Regular', 
    color: '#8E8E93' 
  },
  statusBadge: { 
    backgroundColor: '#F0FDF4', 
    paddingHorizontal: scale(12), 
    paddingVertical: verticalScale(4), 
    borderRadius: moderateScale(12),
    marginLeft: scale(8),
  },
  statusText: { 
    fontSize: moderateScale(12), 
    fontWeight: '600', 
    fontFamily: 'Poppins-Regular',
    color: '#50C878' 
  },
});