import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSuppliers } from '../hooks/useSuppliers';
import { useMasterData } from '../hooks/useMasterData';
import { useMasterSuggestions } from '../hooks/useMasterSuggestions';
import { Building2, FileText, Plus, Receipt, Wallet, Lightbulb } from 'lucide-react';

type LedgerEntry = {
  id: string;
  date: string;
  type: 'purchase' | 'payment';
  description: string;
  amount: number;
  reference?: string | null;
};

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

const toDateOnly = (value: string) => new Date(value + 'T00:00:00');

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

export function SupplierLedger() {
  const { user } = useAuth();
  const {
    suppliers,
    purchases,
    payments,
    loading,
    error,
    addSupplier,
    updateSupplier,
    addPurchase,
    updatePurchase,
    addPayment,
    uploadSupplierBill,
  } = useSuppliers();
  const { suppliers: masterSuppliers } = useMasterData();
  const { addSuggestion } = useMasterSuggestions();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuggestError, setFormSuggestError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [supplierForm, setSupplierForm] = useState({
    vendorCode: '',
    name: '',
    nameOther: '',
    showNameSuggestion: false,
    phone: '',
    email: '',
    address: '',
    creditDays: '0',
    rating: '3',
    notes: '',
  });

  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: '',
    invoiceNumber: '',
    purchaseDate: '',
    dueDate: '',
    subtotal: '',
    tax: '',
    totalAmount: '',
    notes: '',
  });

  const [billFile, setBillFile] = useState<File | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    supplierId: '',
    purchaseId: '',
    paymentDate: '',
    amount: '',
    method: 'cash',
    reference: '',
    notes: '',
  });

  const suppliersById = useMemo(() => {
    return suppliers.reduce<Record<string, typeof suppliers[number]>>((acc, supplier) => {
      acc[supplier.id] = supplier;
      return acc;
    }, {});
  }, [suppliers]);

  const purchasesBySupplier = useMemo(() => {
    return purchases.reduce<Record<string, typeof purchases>>((acc, purchase) => {
      if (!acc[purchase.supplier_id]) acc[purchase.supplier_id] = [];
      acc[purchase.supplier_id].push(purchase);
      return acc;
    }, {} as Record<string, typeof purchases>);
  }, [purchases]);

  const paymentsBySupplier = useMemo(() => {
    return payments.reduce<Record<string, typeof payments>>((acc, payment) => {
      if (!acc[payment.supplier_id]) acc[payment.supplier_id] = [];
      acc[payment.supplier_id].push(payment);
      return acc;
    }, {} as Record<string, typeof payments>);
  }, [payments]);

  const supplierTotals = useMemo(() => {
    return suppliers.reduce<Record<string, { purchases: number; payments: number }>>((acc, supplier) => {
      const totalPurchases = (purchasesBySupplier[supplier.id] || []).reduce(
        (sum, purchase) => sum + (purchase.total_amount || 0),
        0
      );
      const totalPayments = (paymentsBySupplier[supplier.id] || []).reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );
      acc[supplier.id] = { purchases: totalPurchases, payments: totalPayments };
      return acc;
    }, {});
  }, [suppliers, purchasesBySupplier, paymentsBySupplier]);

  const summaryTotals = useMemo(() => {
    const totalPurchases = purchases.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    return {
      suppliers: suppliers.length,
      outstanding: totalPurchases - totalPayments,
      purchases: totalPurchases,
      payments: totalPayments,
    };
  }, [suppliers.length, purchases, payments]);

  const selectedSupplier = selectedSupplierId ? suppliersById[selectedSupplierId] : null;

  const supplierLedger = useMemo(() => {
    if (!selectedSupplierId) return [] as LedgerEntry[];
    const supplierPurchases = purchasesBySupplier[selectedSupplierId] || [];
    const supplierPayments = paymentsBySupplier[selectedSupplierId] || [];

    const entries: LedgerEntry[] = [
      ...supplierPurchases.map(purchase => ({
        id: purchase.id,
        date: purchase.purchase_date,
        type: 'purchase' as const,
        description: `Purchase${purchase.invoice_number ? ` (${purchase.invoice_number})` : ''}`,
        amount: purchase.total_amount || 0,
        reference: purchase.invoice_number,
      })),
      ...supplierPayments.map(payment => ({
        id: payment.id,
        date: payment.payment_date,
        type: 'payment' as const,
        description: `Payment${payment.reference ? ` (${payment.reference})` : ''}`,
        amount: payment.amount || 0,
        reference: payment.reference,
      })),
    ];

    return entries.sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedSupplierId, purchasesBySupplier, paymentsBySupplier]);

  const ledgerWithBalance = useMemo(() => {
    let runningBalance = 0;
    return supplierLedger.map(entry => {
      if (entry.type === 'purchase') {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.amount;
      }
      return { ...entry, balance: runningBalance };
    });
  }, [supplierLedger]);

  const resetSupplierForm = () => {
    setSupplierForm({
      vendorCode: '',
      name: '',
      nameOther: '',
      showNameSuggestion: false,
      phone: '',
      email: '',
      address: '',
      creditDays: '0',
      rating: '3',
      notes: '',
    });
    setFormError(null);
    setFormSuggestError(null);
  };

  const resetPurchaseForm = () => {
    setPurchaseForm({
      supplierId: selectedSupplierId || '',
      invoiceNumber: '',
      purchaseDate: '',
      dueDate: '',
      subtotal: '',
      tax: '',
      totalAmount: '',
      notes: '',
    });
    setBillFile(null);
    setFormError(null);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      supplierId: selectedSupplierId || '',
      purchaseId: '',
      paymentDate: '',
      amount: '',
      method: 'cash',
      reference: '',
      notes: '',
    });
    setFormError(null);
  };

  const handleSupplierSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const nameToUse = supplierForm.name === 'other' ? supplierForm.nameOther : supplierForm.name;

    if (!supplierForm.vendorCode.trim() || !nameToUse.trim()) {
      setFormError('Vendor code and supplier name are required.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addSupplier({
      vendor_code: supplierForm.vendorCode.trim(),
      name: nameToUse.trim(),
      phone: supplierForm.phone.trim() || null,
      email: supplierForm.email.trim() || null,
      address: supplierForm.address.trim() || null,
      credit_period_days: Number(supplierForm.creditDays || 0),
      rating: Number(supplierForm.rating || 3),
      status: 'active',
      notes: supplierForm.notes.trim() || null,
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    resetSupplierForm();
    setShowSupplierForm(false);
  };

  const handlePurchaseSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!purchaseForm.supplierId || !purchaseForm.purchaseDate) {
      setFormError('Supplier and purchase date are required.');
      return;
    }

    setFormSubmitting(true);

    let billUrl: string | null = null;
    if (billFile && user?.id) {
      const upload = await uploadSupplierBill(billFile, user.id);
      if (upload.error) {
        setFormSubmitting(false);
        setFormError(upload.error);
        return;
      }
      billUrl = upload.url;
    }

    const supplier = suppliersById[purchaseForm.supplierId];
    const creditDays = supplier?.credit_period_days || 0;

    const purchaseDate = purchaseForm.purchaseDate;
    const dueDate = purchaseForm.dueDate
      ? purchaseForm.dueDate
      : creditDays > 0
        ? toISODate(addDays(toDateOnly(purchaseDate), creditDays))
        : null;

    const subtotal = Number(purchaseForm.subtotal || 0);
    const tax = Number(purchaseForm.tax || 0);
    const totalAmount = Number(purchaseForm.totalAmount || subtotal + tax);

    const { data, error: submitError } = await addPurchase({
      supplier_id: purchaseForm.supplierId,
      invoice_number: purchaseForm.invoiceNumber.trim() || null,
      purchase_date: purchaseDate,
      due_date: dueDate || null,
      subtotal,
      tax,
      total_amount: totalAmount,
      status: 'open',
      bill_url: billUrl,
      notes: purchaseForm.notes.trim() || null,
    });

    if (!submitError && data?.id && totalAmount === 0) {
      await updatePurchase(data.id, { status: 'paid' });
    }

    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    resetPurchaseForm();
    setShowPurchaseForm(false);
  };

  const handlePaymentSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!paymentForm.supplierId || !paymentForm.paymentDate || !paymentForm.amount) {
      setFormError('Supplier, date, and amount are required.');
      return;
    }

    setFormSubmitting(true);
    const { error: submitError } = await addPayment({
      supplier_id: paymentForm.supplierId,
      purchase_id: paymentForm.purchaseId || null,
      payment_date: paymentForm.paymentDate,
      amount: Number(paymentForm.amount || 0),
      method: paymentForm.method || null,
      reference: paymentForm.reference.trim() || null,
      notes: paymentForm.notes.trim() || null,
    });
    setFormSubmitting(false);

    if (submitError) {
      setFormError(submitError);
      return;
    }

    resetPaymentForm();
    setShowPaymentForm(false);
  };

  const handleBillFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setBillFile(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading suppliers: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Supplier Ledger</h2>
          <p className="text-sm text-gray-600 mt-1">Track purchases, payments, and dues per vendor</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              resetSupplierForm();
              setShowSupplierForm(true);
            }}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Supplier</span>
          </button>
          <button
            onClick={() => {
              resetPurchaseForm();
              setShowPurchaseForm(true);
            }}
            className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Receipt size={16} />
            <span>Add Purchase</span>
          </button>
          <button
            onClick={() => {
              resetPaymentForm();
              setShowPaymentForm(true);
            }}
            className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Wallet size={16} />
            <span>Add Payment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 font-medium">Suppliers</p>
          <p className="text-2xl font-bold text-blue-800">{summaryTotals.suppliers}</p>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <p className="text-amber-700 font-medium">Outstanding Balance</p>
          <p className="text-2xl font-bold text-amber-800">{formatCurrency(summaryTotals.outstanding)}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">Total Purchases</p>
          <p className="text-2xl font-bold text-green-800">{formatCurrency(summaryTotals.purchases)}</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
          <p className="text-purple-700 font-medium">Total Payments</p>
          <p className="text-2xl font-bold text-purple-800">{formatCurrency(summaryTotals.payments)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">Suppliers</h3>
          <div className="mt-3 space-y-3">
            {suppliers.length === 0 && (
              <p className="text-sm text-gray-500">No suppliers yet.</p>
            )}
            {suppliers.map(supplier => {
              const totals = supplierTotals[supplier.id];
              const balance = (totals?.purchases || 0) - (totals?.payments || 0);
              const isSelected = selectedSupplierId === supplier.id;
              return (
                <button
                  key={supplier.id}
                  onClick={() => setSelectedSupplierId(supplier.id)}
                  className={`w-full text-left border rounded-lg p-3 transition-colors ${
                    isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{supplier.name}</p>
                      <p className="text-xs text-gray-500">{supplier.vendor_code}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${balance > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {formatCurrency(balance)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Credit: {supplier.credit_period_days || 0} days</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Ledger</h3>
            <Building2 size={18} className="text-gray-500" />
          </div>
          {!selectedSupplier && (
            <div className="mt-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-600">
              <p className="font-medium">Select a supplier to view transactions.</p>
            </div>
          )}
          {selectedSupplier && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedSupplier.name}</p>
                  <p className="text-sm text-gray-500">{selectedSupplier.vendor_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Outstanding</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency((supplierTotals[selectedSupplier.id]?.purchases || 0) - (supplierTotals[selectedSupplier.id]?.payments || 0))}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2 text-right">Debit</th>
                      <th className="pb-2 text-right">Credit</th>
                      <th className="pb-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerWithBalance.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-500">No transactions yet.</td>
                      </tr>
                    )}
                    {ledgerWithBalance.map(entry => (
                      <tr key={entry.id} className="border-b last:border-b-0">
                        <td className="py-3">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="py-3 capitalize">{entry.type}</td>
                        <td className="py-3">{entry.description}</td>
                        <td className="py-3 text-right">{entry.type === 'purchase' ? formatCurrency(entry.amount) : '-'}</td>
                        <td className="py-3 text-right">{entry.type === 'payment' ? formatCurrency(entry.amount) : '-'}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(entry.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(purchasesBySupplier[selectedSupplier.id] || []).map(purchase => {
                  const paidAmount = payments.filter(payment => payment.purchase_id === purchase.id).reduce(
                    (sum, payment) => sum + (payment.amount || 0),
                    0
                  );
                  const balance = (purchase.total_amount || 0) - paidAmount;
                  const dueDate = purchase.due_date ? toDateOnly(purchase.due_date) : null;
                  const overdue = dueDate ? dueDate < toDateOnly(new Date().toISOString().slice(0, 10)) : false;
                  return (
                    <div key={purchase.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {purchase.invoice_number ? `Invoice ${purchase.invoice_number}` : 'Purchase'}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${overdue && balance > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {purchase.status || 'open'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Total: {formatCurrency(purchase.total_amount || 0)}</p>
                        <p>Paid: {formatCurrency(paidAmount)}</p>
                        <p>Balance: {formatCurrency(balance)}</p>
                        {purchase.due_date && (
                          <p className={overdue && balance > 0 ? 'text-red-600' : ''}>
                            Due: {new Date(purchase.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {purchase.bill_url && (
                        <a
                          href={purchase.bill_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-700"
                        >
                          <FileText size={12} className="mr-1" />
                          View Bill
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showSupplierForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Supplier</h3>
                <button onClick={() => setShowSupplierForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handleSupplierSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Code</label>
                    <input
                      type="text"
                      value={supplierForm.vendorCode}
                      onChange={event => setSupplierForm({ ...supplierForm, vendorCode: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                    <div className="flex gap-2">
                      <select
                        value={supplierForm.name}
                        onChange={event => {
                          setSupplierForm({ ...supplierForm, name: event.target.value, nameOther: '' });
                        }}
                        required
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="">Select supplier</option>
                        {masterSuppliers.filter(s => s.is_active !== false).map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                        <option value="other">+ Add new</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setSupplierForm({ ...supplierForm, showNameSuggestion: !supplierForm.showNameSuggestion })}
                        className="text-green-600 hover:text-green-700"
                        title="Suggest new supplier"
                      >
                        <Lightbulb size={20} />
                      </button>
                    </div>
                    {supplierForm.name === 'other' && (
                      <input
                        type="text"
                        placeholder="Enter new supplier name"
                        value={supplierForm.nameOther}
                        onChange={e => setSupplierForm({ ...supplierForm, nameOther: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2"
                      />
                    )}
                    {supplierForm.showNameSuggestion && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm font-medium text-amber-900 mb-2">Suggest a new supplier</p>
                        {formSuggestError && (
                          <p className="text-xs text-red-600 mb-2">{formSuggestError}</p>
                        )}
                        <input
                          type="text"
                          placeholder="Supplier name (e.g., XYZ Chemicals)"
                          value={supplierForm.nameOther}
                          onChange={e => setSupplierForm({ ...supplierForm, nameOther: e.target.value })}
                          className="w-full border border-amber-300 rounded px-2 py-1 mb-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!supplierForm.nameOther.trim()) {
                              setFormSuggestError('Supplier name is required');
                              return;
                            }
                            const { error } = await addSuggestion('supplier', supplierForm.nameOther.trim(), supplierForm.nameOther.trim());
                            if (error) {
                              setFormSuggestError(error);
                            } else {
                              setSupplierForm({ ...supplierForm, nameOther: '', showNameSuggestion: false });
                              setFormSuggestError(null);
                            }
                          }}
                          className="bg-amber-600 text-white px-2 py-1 rounded text-xs hover:bg-amber-700 w-full"
                        >
                          Submit Suggestion
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={supplierForm.phone}
                      onChange={event => setSupplierForm({ ...supplierForm, phone: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={supplierForm.email}
                      onChange={event => setSupplierForm({ ...supplierForm, email: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={supplierForm.address}
                    onChange={event => setSupplierForm({ ...supplierForm, address: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credit Period (days)</label>
                    <input
                      type="number"
                      min={0}
                      value={supplierForm.creditDays}
                      onChange={event => setSupplierForm({ ...supplierForm, creditDays: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <select
                      value={supplierForm.rating}
                      onChange={event => setSupplierForm({ ...supplierForm, rating: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={supplierForm.notes}
                    onChange={event => setSupplierForm({ ...supplierForm, notes: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Add Supplier'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSupplierForm(false);
                      resetSupplierForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPurchaseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Purchase</h3>
                <button onClick={() => setShowPurchaseForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handlePurchaseSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <select
                      value={purchaseForm.supplierId}
                      onChange={event => setPurchaseForm({ ...purchaseForm, supplierId: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier.vendor_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={purchaseForm.invoiceNumber}
                      onChange={event => setPurchaseForm({ ...purchaseForm, invoiceNumber: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                    <input
                      type="date"
                      value={purchaseForm.purchaseDate}
                      onChange={event => setPurchaseForm({ ...purchaseForm, purchaseDate: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={purchaseForm.dueDate}
                      onChange={event => setPurchaseForm({ ...purchaseForm, dueDate: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={purchaseForm.subtotal}
                      onChange={event => setPurchaseForm({ ...purchaseForm, subtotal: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={purchaseForm.tax}
                      onChange={event => setPurchaseForm({ ...purchaseForm, tax: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={purchaseForm.totalAmount}
                      onChange={event => setPurchaseForm({ ...purchaseForm, totalAmount: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Upload</label>
                  <input type="file" onChange={handleBillFile} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={purchaseForm.notes}
                    onChange={event => setPurchaseForm({ ...purchaseForm, notes: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Add Purchase'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPurchaseForm(false);
                      resetPurchaseForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Payment</h3>
                <button onClick={() => setShowPaymentForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form className="space-y-4" onSubmit={handlePaymentSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <select
                      value={paymentForm.supplierId}
                      onChange={event => setPaymentForm({ ...paymentForm, supplierId: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier.vendor_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase (optional)</label>
                    <select
                      value={paymentForm.purchaseId}
                      onChange={event => setPaymentForm({ ...paymentForm, purchaseId: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">No specific invoice</option>
                      {(purchasesBySupplier[paymentForm.supplierId] || []).map(purchase => (
                        <option key={purchase.id} value={purchase.id}>
                          {purchase.invoice_number || purchase.id.slice(0, 6)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={event => setPaymentForm({ ...paymentForm, paymentDate: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={event => setPaymentForm({ ...paymentForm, amount: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                    <select
                      value={paymentForm.method}
                      onChange={event => setPaymentForm({ ...paymentForm, method: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                    <input
                      type="text"
                      value={paymentForm.reference}
                      onChange={event => setPaymentForm({ ...paymentForm, reference: event.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={event => setPaymentForm({ ...paymentForm, notes: event.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  />
                </div>
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {formError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                  >
                    {formSubmitting ? 'Saving...' : 'Add Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentForm(false);
                      resetPaymentForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
