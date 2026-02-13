import React, { useMemo, useState } from 'react';
import { Calendar, Clock, DollarSign, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Agronomist, OrchardOwner } from '../types';

interface BookingModalProps {
  agronomist: Agronomist;
  orchardOwner: OrchardOwner;
  upiId: string;
  onClose: () => void;
  onBook: (bookingData: {
    agronomistId: string;
    orchardOwnerId: string;
    orchardId?: string | null;
    orchardDetails: unknown;
    scheduledDate: string;
    problems: string[];
    notes: string;
    fee: number;
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
  }) => void;
  isLoading?: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  agronomist,
  orchardOwner,
  upiId,
  onClose,
  onBook,
  isLoading = false,
}) => {
  const paymentEnabled = !import.meta.env.PROD;
  const [selectedOrchard, setSelectedOrchard] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commonProblems = [
    'Pest Infestation',
    'Disease Management',
    'Nutrient Deficiency',
    'Irrigation Issues',
    'Soil Problems',
    'Yield Optimization',
    'Crop Planning',
    'Organic Farming',
    'Post-Harvest Management',
    'Weather Damage',
  ];

  const selectedOrchardData = useMemo(
    () => orchardOwner.orchards.find((o) => o.id === selectedOrchard),
    [selectedOrchard, orchardOwner.orchards]
  );
  const qrValue = useMemo(() => {
    const payeeName = encodeURIComponent(`Consultation - ${agronomist.name}`);
    const txnNote = encodeURIComponent(`Agronomist booking fee`);
    return `upi://pay?pa=${upiId}&pn=${payeeName}&am=${agronomist.consultationFee}&cu=INR&tn=${txnNote}`;
  }, [agronomist.consultationFee, agronomist.name, upiId]);

  const handleProblemToggle = (problem: string) => {
    setSelectedProblems((prev) =>
      prev.includes(problem) ? prev.filter((p) => p !== problem) : [...prev, problem]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!scheduledDate || !scheduledTime) {
      setError('Please select date and time.');
      return;
    }
    if (paymentEnabled && !upiId) {
      setError('UPI ID is not configured. Please update payment settings.');
      return;
    }
    if (paymentEnabled && !paymentConfirmed) {
      setError('Please complete QR payment and confirm before booking.');
      return;
    }

    const bookingDateTime = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    const orchardId = selectedOrchard === '__none__' || !selectedOrchard ? null : selectedOrchard;

    onBook({
      agronomistId: agronomist.id,
      orchardOwnerId: orchardOwner.id,
      orchardId,
      orchardDetails: selectedOrchardData,
      scheduledDate: bookingDateTime,
      problems: selectedProblems,
      notes,
      fee: agronomist.consultationFee,
      paymentStatus: paymentEnabled ? 'paid' : 'unpaid',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Book Consultation</h2>
              <p className="text-gray-600 mt-1">with {agronomist.name}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-green-50 p-4 rounded-xl flex items-center gap-4">
            <img src={agronomist.image} alt={agronomist.name} className="w-16 h-16 rounded-full object-cover" />
            <div>
              <h3 className="text-lg font-semibold">{agronomist.name}</h3>
              <p className="text-sm text-gray-600">{agronomist.experience}+ years experience</p>
              <div className="flex items-center text-green-700 font-bold mt-1">
                <DollarSign size={16} />
                Rs {agronomist.consultationFee}
              </div>
            </div>
          </div>

          <select
            value={selectedOrchard}
            onChange={(e) => setSelectedOrchard(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="__none__">General Consultation (No orchard linked)</option>
            {orchardOwner.orchards.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} - {o.cropType} ({o.size} acres)
              </option>
            ))}
          </select>

          {selectedOrchardData && (
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p>
                <strong>Location:</strong> {selectedOrchardData.location}
              </p>
              <p>
                <strong>Crop:</strong> {selectedOrchardData.cropType}
              </p>
              <p>
                <strong>Trees:</strong> {selectedOrchardData.trees.length}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                <Calendar size={14} className="inline mr-1" />
                Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                <Clock size={14} className="inline mr-1" />
                Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {commonProblems.map((problem) => (
              <label
                key={problem}
                className={`p-3 border rounded-lg cursor-pointer text-sm ${
                  selectedProblems.includes(problem) ? 'bg-green-50 border-green-500' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedProblems.includes(problem)}
                  onChange={() => handleProblemToggle(problem)}
                />
                {problem}
              </label>
            ))}
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional notes (optional)"
            className="w-full border rounded-lg px-4 py-3"
          />

          {paymentEnabled ? (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Pay Consultation Fee via QR</h4>
              <p className="text-xs text-gray-600 mb-3">
                Scan this code in your UPI app and pay Rs {agronomist.consultationFee}.
              </p>
              <div className="flex flex-col items-center gap-3">
                <div className="bg-white p-3 rounded-lg border">
                  <QRCodeSVG value={qrValue} size={180} />
                </div>
                <p className="text-xs text-gray-500">UPI ID: {upiId}</p>
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={paymentConfirmed}
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                />
                I have completed the payment via QR
              </label>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50 text-sm text-gray-700">
              Payment is disabled in production. Consultation will be booked with unpaid status.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex gap-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-3">
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white rounded-lg py-3 hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Booking...' : `Book for Rs ${agronomist.consultationFee}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
