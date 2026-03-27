import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setPrimaryBankAccount,
  BankAccount,
  AccountType,
  CreateBankAccountPayload,
} from '../services/driverService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const scale = (s: number) => (SCREEN_WIDTH / 375) * s;
const verticalScale = (s: number) => (SCREEN_HEIGHT / 812) * s;
const moderateScale = (s: number, f = 0.5) => s + (scale(s) - s) * f;

type Screen = 'list' | 'add' | 'edit';

const EMPTY_FORM = {
  account_holder_name: '',
  bank_name: '',
  account_number: '',
  confirm_account_number: '',
  ifsc_code: '',
  branch: '',
  account_type: 'savings' as AccountType,
};

export default function BankDetailsScreen({navigation}: any) {
  const [screen, setScreen] = useState<Screen>('list');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({...EMPTY_FORM});

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBankAccounts();
      setAccounts(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data.find(a => a.is_primary)?.id ?? data[0].id);
      }
    } catch {
      Alert.alert('Error', 'Could not load bank accounts');
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {fetchAccounts();}, []);

  // ── Form helpers ─────────────────────────────────────────────────
  const setField = (key: keyof typeof form, value: string) =>
    setForm(f => ({...f, [key]: value}));

  const openAdd = () => {
    setForm({...EMPTY_FORM});
    setEditingId(null);
    setScreen('add');
  };

  const openEdit = (account: BankAccount) => {
    setForm({
      account_holder_name: account.account_holder_name,
      bank_name: account.bank_name,
      account_number: account.account_number,
      confirm_account_number: account.account_number,
      ifsc_code: account.ifsc_code,
      branch: account.branch,
      account_type: account.account_type,
    });
    setEditingId(account.id);
    setScreen('edit');
  };

  const validate = (): string | null => {
    if (!form.account_holder_name.trim()) {return 'Account holder name is required';}
    if (!form.bank_name.trim()) {return 'Bank name is required';}
    if (!/^\d{9,18}$/.test(form.account_number)) {return 'Account number must be 9–18 digits';}
    if (form.account_number !== form.confirm_account_number) {return 'Account numbers do not match';}
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code.toUpperCase())) {return 'Invalid IFSC code (e.g. SBIN0001234)';}
    if (!form.branch.trim()) {return 'Branch is required';}
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {Alert.alert('Validation Error', err); return;}
    setSaving(true);
    try {
      const payload: CreateBankAccountPayload = {
        account_holder_name: form.account_holder_name.trim(),
        bank_name: form.bank_name.trim(),
        account_number: form.account_number,
        ifsc_code: form.ifsc_code.toUpperCase(),
        branch: form.branch.trim(),
        account_type: form.account_type,
      };
      if (editingId) {
        await updateBankAccount(editingId, payload);
        Alert.alert('Updated', 'Bank account updated successfully');
      } else {
        await addBankAccount(payload);
        Alert.alert('Saved', 'Bank account added successfully');
      }
      await fetchAccounts();
      setScreen('list');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to save bank account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (account: BankAccount) => {
    Alert.alert(
      'Delete Account',
      `Remove ${account.bank_name} (••••${account.account_number.slice(-4)})?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBankAccount(account.id);
              if (selectedId === account.id) {setSelectedId(null);}
              await fetchAccounts();
            } catch {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ],
    );
  };

  const handleSetPrimary = async (account: BankAccount) => {
    if (account.is_primary) {return;}
    try {
      await setPrimaryBankAccount(account.id);
      await fetchAccounts();
    } catch {
      Alert.alert('Error', 'Failed to set primary account');
    }
  };

  const selectedAccount = accounts.find(a => a.id === selectedId) ?? accounts[0];

  // ── Render ───────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (screen === 'list' ? navigation.goBack() : setScreen('list'))}
          hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {screen === 'list' ? 'Bank Details' : screen === 'add' ? 'Add Bank Account' : 'Edit Account'}
        </Text>
        {screen === 'list' ? (
          <TouchableOpacity
            onPress={openAdd}
            hitSlop={{top:10,bottom:10,left:10,right:10}}>
            <Ionicons name="add" size={moderateScale(26)} color="#3B82F6" />
          </TouchableOpacity>
        ) : (
          <View style={{width: moderateScale(26)}} />
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : screen === 'list' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {accounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={moderateScale(64)} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Bank Account</Text>
              <Text style={styles.emptySubtitle}>
                Add a bank account to receive your earnings
              </Text>
              <TouchableOpacity style={styles.addFirstBtn} onPress={openAdd} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={moderateScale(18)} color="#FFFFFF" />
                <Text style={styles.addFirstBtnText}>Add Bank Account</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Account selector chips (multiple accounts) */}
              {accounts.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipRow}
                  contentContainerStyle={{paddingHorizontal: scale(16), gap: scale(8)}}>
                  {accounts.map(acc => (
                    <TouchableOpacity
                      key={acc.id}
                      style={[styles.chip, selectedId === acc.id && styles.chipActive]}
                      onPress={() => setSelectedId(acc.id)}
                      activeOpacity={0.7}>
                      <Text style={[styles.chipText, selectedId === acc.id && styles.chipTextActive]}>
                        {acc.bank_name}
                        {acc.is_primary ? ' ★' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Bank hero card */}
              {selectedAccount && (
                <View style={styles.bankHero}>
                  <View style={styles.bankHeroLeft}>
                    <Text style={styles.bankHeroIcon}>🏦</Text>
                    <View>
                      <Text style={styles.bankHeroName}>{selectedAccount.bank_name}</Text>
                      <Text style={styles.bankHeroNum}>
                        •••• •••• {selectedAccount.account_number.slice(-4)}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.verifiedBadge,
                    selectedAccount.is_verified ? styles.verifiedBadgeGreen : styles.verifiedBadgePending,
                  ]}>
                    <Text style={[
                      styles.verifiedText,
                      selectedAccount.is_verified ? styles.verifiedTextGreen : styles.verifiedTextPending,
                    ]}>
                      {selectedAccount.is_verified ? '✓ Verified' : '⏳ Pending'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Details card */}
              {selectedAccount && (
                <View style={styles.detailCard}>
                  <DetailRow label="Account Holder" value={selectedAccount.account_holder_name} />
                  <DetailRow
                    label="Account Number"
                    value={`•••• •••• ${selectedAccount.account_number.slice(-4)}`}
                  />
                  <DetailRow label="IFSC Code" value={selectedAccount.ifsc_code} />
                  <DetailRow label="Branch" value={selectedAccount.branch} />
                  <DetailRow
                    label="Account Type"
                    value={selectedAccount.account_type.charAt(0).toUpperCase() + selectedAccount.account_type.slice(1)}
                  />
                  <DetailRow
                    label="Primary"
                    value={selectedAccount.is_primary ? 'Yes ★' : 'No'}
                  />
                </View>
              )}

              {/* Action buttons for selected account */}
              {selectedAccount && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEdit(selectedAccount)}
                    activeOpacity={0.8}>
                    <Ionicons name="create-outline" size={moderateScale(16)} color="#3B82F6" />
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                  {!selectedAccount.is_primary && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleSetPrimary(selectedAccount)}
                      activeOpacity={0.8}>
                      <Ionicons name="star-outline" size={moderateScale(16)} color="#F59E0B" />
                      <Text style={[styles.actionBtnText, {color: '#F59E0B'}]}>Set Primary</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDelete]}
                    onPress={() => handleDelete(selectedAccount)}
                    activeOpacity={0.8}>
                    <Ionicons name="trash-outline" size={moderateScale(16)} color="#EF4444" />
                    <Text style={[styles.actionBtnText, {color: '#EF4444'}]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Info box */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={moderateScale(20)} color="#3B82F6" />
                <Text style={styles.infoText}>
                  Your earnings are transferred to the primary (★) account every Monday.
                </Text>
              </View>

              {/* Add another */}
              <TouchableOpacity style={styles.addAnotherBtn} onPress={openAdd} activeOpacity={0.8}>
                <Ionicons name="add-circle-outline" size={moderateScale(18)} color="#3B82F6" />
                <Text style={styles.addAnotherText}>Add Another Account</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      ) : (
        /* ── Add / Edit Form ── */
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <FormField
              label="Account Holder Name *"
              placeholder="Full name as on bank account"
              value={form.account_holder_name}
              onChangeText={v => setField('account_holder_name', v)}
            />
            <FormField
              label="Bank Name *"
              placeholder="e.g. State Bank of India"
              value={form.bank_name}
              onChangeText={v => setField('bank_name', v)}
            />
            <FormField
              label="Account Number *"
              placeholder="9–18 digit account number"
              value={form.account_number}
              onChangeText={v => setField('account_number', v.replace(/\D/g, ''))}
              keyboardType="numeric"
              secureTextEntry
            />
            <FormField
              label="Confirm Account Number *"
              placeholder="Re-enter account number"
              value={form.confirm_account_number}
              onChangeText={v => setField('confirm_account_number', v.replace(/\D/g, ''))}
              keyboardType="numeric"
            />
            <FormField
              label="IFSC Code *"
              placeholder="e.g. SBIN0001234"
              value={form.ifsc_code}
              onChangeText={v => setField('ifsc_code', v.toUpperCase())}
              autoCapitalize="characters"
            />
            <FormField
              label="Branch *"
              placeholder="Branch name and city"
              value={form.branch}
              onChangeText={v => setField('branch', v)}
            />

            {/* Account type toggle */}
            <Text style={styles.fieldLabel}>Account Type</Text>
            <View style={styles.typeRow}>
              {(['savings', 'current'] as AccountType[]).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, form.account_type === t && styles.typeBtnActive]}
                  onPress={() => setField('account_type', t)}
                  activeOpacity={0.8}>
                  <Text style={[styles.typeBtnText, form.account_type === t && styles.typeBtnTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editingId ? 'Update Account' : 'Save Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setScreen('list')}
              activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function FormField({
  label, placeholder, value, onChangeText, keyboardType, autoCapitalize, secureTextEntry,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8F9FA'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
    paddingBottom: verticalScale(14),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#1C1C1E',
  },
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  scrollContent: {padding: scale(20), paddingBottom: verticalScale(100)},
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: verticalScale(60),
  },
  emptyTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: verticalScale(16),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(24),
  },
  addFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    gap: scale(8),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addFirstBtnText: {fontSize: moderateScale(16), fontWeight: '700', color: '#FFFFFF'},
  // Chip selector
  chipRow: {marginBottom: verticalScale(14), marginHorizontal: -scale(20)},
  chip: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {backgroundColor: '#3B82F6', borderColor: '#3B82F6'},
  chipText: {fontSize: moderateScale(13), fontWeight: '600', color: '#6B7280'},
  chipTextActive: {color: '#FFFFFF'},
  // Bank hero card
  bankHero: {
    backgroundColor: '#1E3A5F',
    borderRadius: moderateScale(16),
    padding: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    shadowColor: '#1E3A5F',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  bankHeroLeft: {flexDirection: 'row', alignItems: 'center', gap: scale(12)},
  bankHeroIcon: {fontSize: moderateScale(36)},
  bankHeroName: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: verticalScale(4),
  },
  bankHeroNum: {fontSize: moderateScale(13), color: 'rgba(255,255,255,0.7)'},
  verifiedBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(20),
  },
  verifiedBadgeGreen: {backgroundColor: 'rgba(22,163,74,0.15)'},
  verifiedBadgePending: {backgroundColor: 'rgba(245,158,11,0.15)'},
  verifiedText: {fontSize: moderateScale(12), fontWeight: '700'},
  verifiedTextGreen: {color: '#16A34A'},
  verifiedTextPending: {color: '#F59E0B'},
  // Detail card
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(13),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {fontSize: moderateScale(14), color: '#6B7280', flex: 1},
  detailValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    textAlign: 'right',
  },
  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: scale(10),
    marginBottom: verticalScale(16),
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(11),
    borderRadius: moderateScale(10),
    gap: scale(6),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  actionBtnDelete: {borderColor: '#FEE2E2'},
  actionBtnText: {fontSize: moderateScale(13), fontWeight: '600', color: '#3B82F6'},
  // Info box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: moderateScale(12),
    padding: scale(14),
    gap: scale(10),
    marginBottom: verticalScale(16),
  },
  infoText: {flex: 1, fontSize: moderateScale(13), color: '#1D4ED8', lineHeight: moderateScale(18)},
  // Add another
  addAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    gap: scale(8),
  },
  addAnotherText: {fontSize: moderateScale(14), fontWeight: '700', color: '#3B82F6'},
  // Form
  fieldGroup: {marginBottom: verticalScale(18)},
  fieldLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(13),
    fontSize: moderateScale(15),
    color: '#1C1C1E',
  },
  typeRow: {flexDirection: 'row', gap: scale(12), marginBottom: verticalScale(24)},
  typeBtn: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  typeBtnActive: {backgroundColor: '#3B82F6', borderColor: '#3B82F6'},
  typeBtnText: {fontSize: moderateScale(15), fontWeight: '600', color: '#6B7280'},
  typeBtnTextActive: {color: '#FFFFFF'},
  saveBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    marginBottom: verticalScale(12),
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {backgroundColor: '#9CA3AF', shadowOpacity: 0, elevation: 0},
  saveBtnText: {fontSize: moderateScale(16), fontWeight: '700', color: '#FFFFFF'},
  cancelBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
  },
  cancelBtnText: {fontSize: moderateScale(15), fontWeight: '600', color: '#6B7280'},
});
