import React, { useState } from 'react';
import { Room, SubscriptionRecord, User } from '../types';
import { UPI_QR_SVG } from '../assets/upiQrCode';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  QrCode,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { storage } from '../services/storageService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoom?: Room;
  allRooms: Room[];
  currentUser: User;
  onSubscriptionUpdated: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  activeRoom,
  allRooms,
  currentUser,
  onSubscriptionUpdated,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    activeRoom?.id || (allRooms.length > 0 ? allRooms[0].id : '')
  );
  const [desiredSlots, setDesiredSlots] = useState<number>(
    activeRoom ? Math.max(activeRoom.maxSlots, 3) : 3
  );
  const [utrInput, setUtrInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'subscribe' | 'history' | 'admin'>('subscribe');
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<boolean>(false);

  if (!isOpen) return null;

  const targetRoom = allRooms.find((r) => r.id === selectedRoomId) || activeRoom;
  const currentSlots = targetRoom?.maxSlots || 2;
  const extraSlots = Math.max(0, desiredSlots - 2);
  const monthlyPrice = extraSlots * 20; // Exact formula: max(0, total - 2) * ₹20

  const subscriptions = storage.getSubscriptions();
  const roomSubscriptions = subscriptions.filter((s) => s.roomId === selectedRoomId);
  const pendingOrActiveSub = subscriptions.find(
    (s) => s.roomId === selectedRoomId && (s.status === 'active' || s.status === 'pending')
  );

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrInput.trim()) {
      setErrorMsg('Please enter the 12-digit UPI Reference Number / UTR from your payment app.');
      return;
    }
    if (utrInput.trim().length < 8) {
      setErrorMsg('Invalid UTR format. Please provide a valid transaction reference.');
      return;
    }

    if (!targetRoom) {
      setErrorMsg('Please select a valid room to upgrade.');
      return;
    }

    const newSub: SubscriptionRecord = {
      id: `sub_${Date.now()}`,
      roomId: targetRoom.id,
      roomName: targetRoom.name,
      ownerId: currentUser.id,
      ownerEmail: currentUser.email,
      extraSlots,
      totalSlots: desiredSlots,
      monthlyAmount: monthlyPrice,
      status: 'pending',
      utrNumber: utrInput.trim(),
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    storage.saveSubscription(newSub);
    setSubmitSuccess(
      `Payment submitted with UTR ${utrInput.trim()}! Status is now PENDING VERIFICATION. It will be reviewed and activated.`
    );
    setErrorMsg(null);
    setUtrInput('');
    onSubscriptionUpdated();
  };

  const handleApprove = (subId: string) => {
    const success = storage.verifyAndApproveSubscription(subId);
    if (success) {
      setSubmitSuccess('Payment verified and room member slots successfully unlocked!');
      onSubscriptionUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131d31]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Room Capacity & Subscription Billing</h2>
              <p className="text-xs text-slate-400">
                ₹20/month per additional member slot (first 2 members free)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-[#0d1422] text-xs font-medium">
          <button
            onClick={() => setActiveTab('subscribe')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'subscribe'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upgrade Capacity (UPI QR)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Payment History & Invoices
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Verification Console
          </button>
        </div>

        {/* Tab 1: Subscribe / Upgrade */}
        {activeTab === 'subscribe' && (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {submitSuccess && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">Update Status</span>
                  <span>{submitSuccess}</span>
                </div>
              </div>
            )}

            {/* Target Room Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Select Coding Room to Upgrade</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {allRooms.length === 0 ? (
                  <option value="">No rooms created yet. Launch a room first.</option>
                ) : (
                  allRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (Code: {r.code}) — Currently {r.maxSlots} slots
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Slot Counter & Dynamic Pricing Math */}
            <div className="bg-[#131d31] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Desired Total Room Slots</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Current capacity: <span className="font-mono text-slate-200">{currentSlots} members</span>
                  </p>
                </div>

                {/* Counter controls */}
                <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setDesiredSlots((prev) => Math.max(3, prev - 1))}
                    className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-base text-white px-2 tabular-nums">
                    {desiredSlots} members
                  </span>
                  <button
                    type="button"
                    onClick={() => setDesiredSlots((prev) => Math.min(20, prev + 1))}
                    className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 text-[11px]">Quick Presets:</span>
                {[
                  { slots: 3, label: '3 Members (₹20/mo)' },
                  { slots: 4, label: '4 Members (₹40/mo)' },
                  { slots: 5, label: '5 Members (₹60/mo)' },
                  { slots: 8, label: '8 Members (₹120/mo)' },
                  { slots: 10, label: '10 Members (₹160/mo)' },
                ].map((preset) => (
                  <button
                    key={preset.slots}
                    type="button"
                    onClick={() => setDesiredSlots(preset.slots)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                      desiredSlots === preset.slots
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Exact Formula Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Free Included Slots</span>
                  <span className="text-sm font-bold text-white mt-1 block">2 Members (₹0)</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Extra Slots Requested</span>
                  <span className="text-sm font-bold text-indigo-400 mt-1 block font-mono">
                    {extraSlots} slots
                  </span>
                </div>
                <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-800/40">
                  <span className="text-indigo-300 block text-[11px]">Monthly Subscription Price</span>
                  <span className="text-base font-extrabold text-white mt-1 block font-mono">
                    ₹{monthlyPrice} / month
                  </span>
                </div>
              </div>
            </div>

            {/* UPI QR Code & Payment Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#131d31] border border-slate-800 rounded-xl p-5">
              {/* Left Column: Visual UPI QR Code */}
              <div className="flex flex-col items-center justify-center text-center">
                <div
                  className="w-56 h-60 rounded-xl overflow-hidden shadow-xl border border-slate-700 bg-[#0d1117] p-2 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: UPI_QR_SVG }}
                />
                <span className="text-[11px] text-slate-400 mt-2 font-mono">
                  Scan with GPay, PhonePe, Paytm, or BHIM
                </span>
              </div>

              {/* Right Column: Instructions & Manual Verification */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white">How to Pay with UPI</h4>
                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-700">
                    <span className="text-[11px] text-slate-400">UPI ID:</span>
                    <code className="text-xs font-mono font-bold text-cyan-300 flex-1">
                      dhanushj2007@oksbi
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('dhanushj2007@oksbi');
                        setCopiedUtr(true);
                        setTimeout(() => setCopiedUtr(false), 2000);
                      }}
                      className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-600 transition-colors cursor-pointer"
                    >
                      {copiedUtr ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <ol className="text-xs text-slate-300 space-y-1.5 mt-2 list-decimal list-inside leading-relaxed">
                    <li>Scan the UPI QR code using any UPI application.</li>
                    <li>
                      Enter the exact subscription amount:{' '}
                      <strong className="text-white font-mono">₹{monthlyPrice}</strong>.
                    </li>
                    <li>Complete the transaction on your banking app.</li>
                    <li>
                      Copy the <strong className="text-indigo-300">12-digit UPI UTR / Reference No</strong> from
                      your receipt.
                    </li>
                    <li>Paste the UTR number below to initiate verification.</li>
                  </ol>
                </div>

                <form onSubmit={handleSubmitPayment} className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Enter UPI Reference / UTR Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20261014984321"
                    value={utrInput}
                    onChange={(e) => setUtrInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                  />
                  {errorMsg && <p className="text-[11px] text-rose-400">{errorMsg}</p>}

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    Submit Payment for Verification
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    Note: Slots unlock automatically once the transaction is verified by our billing manager.
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: History & Invoices */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-white">Subscription Records & Invoices</h3>
            <div className="space-y-3">
              {subscriptions.length === 0 ? (
                <p className="text-xs text-slate-400">No payment history found.</p>
              ) : (
                subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{sub.roomName}</span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                            sub.status === 'active'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : sub.status === 'pending'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        Slots: {sub.totalSlots} members (+{sub.extraSlots} extra) · ₹{sub.monthlyAmount}/mo
                      </p>
                      {sub.utrNumber && (
                        <p className="text-[11px] text-slate-400 font-mono">UTR: {sub.utrNumber}</p>
                      )}
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-400 block">Expires</span>
                      <span className="font-mono text-slate-200">
                        {new Date(sub.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Admin Verification Console */}
        {activeTab === 'admin' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-xl p-4 flex items-start gap-3 text-xs text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Billing Administrator Panel</span>
                <span>
                  Inspect submitted UPI transactions, verify UTR reference numbers from bank statements, and
                  approve extra room member slots.
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {subscriptions.filter((s) => s.status === 'pending').length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  All submitted payments have been verified. No pending approvals.
                </div>
              ) : (
                subscriptions
                  .filter((s) => s.status === 'pending')
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-[#131d31] border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{sub.roomName}</span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                            PENDING VERIFICATION
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Requested Capacity: <strong className="text-white">{sub.totalSlots} Slots</strong> (+
                          {sub.extraSlots} additional slots)
                        </p>
                        <p className="text-xs font-mono text-indigo-400">
                          UTR / Ref: <span className="font-bold">{sub.utrNumber}</span> · Amount: ₹
                          {sub.monthlyAmount}
                        </p>
                        <p className="text-[11px] text-slate-400">User: {sub.ownerEmail}</p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleApprove(sub.id)}
                          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
                        >
                          Verify & Unlock Slots
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
