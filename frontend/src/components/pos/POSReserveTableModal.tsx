import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { Calendar, Clock, User, Phone, Users, FileText, CheckCircle2, Trash2, Utensils } from 'lucide-react';
import { toast } from '../../context/ToastContext';
import type { Table } from '../../types/app.types';

export interface ReservationData {
  guestName: string;
  phone?: string;
  time: string;
  guests?: number;
  notes?: string;
  createdAt?: string;
}

export interface POSReserveTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  existingReservation?: ReservationData | null;
  onSaveReservation: (tableId: string | number, data: ReservationData) => void;
  onCancelReservation: (tableId: string | number) => void;
  onSeatGuest?: (tableId: string | number) => void;
}

export const POSReserveTableModal: React.FC<POSReserveTableModalProps> = ({
  isOpen,
  onClose,
  table,
  existingReservation,
  onSaveReservation,
  onCancelReservation,
  onSeatGuest,
}) => {
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('7:00 PM');
  const [guests, setGuests] = useState('4');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Suggested quick times for dinner/lunch service
  const timePresets = ['1:00 PM', '1:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];

  useEffect(() => {
    if (existingReservation) {
      setGuestName(existingReservation.guestName || '');
      setPhone(existingReservation.phone || '');
      setTime(existingReservation.time || '7:00 PM');
      setGuests(String(existingReservation.guests || table?.seats || 4));
      setNotes(existingReservation.notes || '');
    } else if (table) {
      setGuestName('');
      setPhone('');
      setTime('7:00 PM');
      setGuests(String(table.seats || 4));
      setNotes('');
    }
    setError(null);
  }, [existingReservation, table, isOpen]);

  if (!isOpen || !table) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guestName.trim()) {
      setError('Guest Name is required for reservations.');
      return;
    }
    if (!time.trim()) {
      setError('Reservation time is required.');
      return;
    }

    onSaveReservation(table.id, {
      guestName: guestName.trim(),
      phone: phone.trim(),
      time: time.trim(),
      guests: parseInt(guests, 10) || table.seats || 4,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    });

    toast.success(`Table "${table.name}" reserved for ${guestName.trim()} at ${time.trim()}!`);
    onClose();
  };

  const handleCancelReservation = () => {
    onCancelReservation(table.id);
    toast.info(`Reservation for table "${table.name}" cancelled.`);
    onClose();
  };

  const handleSeatGuests = () => {
    if (onSeatGuest) {
      onSeatGuest(table.id);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingReservation ? `Manage Reservation: ${table.name}` : `Reserve Table: ${table.name}`}
      description={`Table capacity: ${table.seats || 4} guests. Reserve table for dining guests.`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {existingReservation && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleCancelReservation}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="cursor-pointer"
              >
                Cancel Reservation
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            {existingReservation && onSeatGuest && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleSeatGuests}
                leftIcon={<Utensils className="w-4 h-4" />}
                className="cursor-pointer"
              >
                Seat Guest Now
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="cursor-pointer"
            >
              {existingReservation ? 'Update Reservation' : 'Confirm Reservation'}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50">
            {error}
          </div>
        )}

        {/* Guest Name */}
        <Input
          label="Guest / Host Name"
          required
          placeholder="e.g. John Doe / Sharma Family"
          value={guestName}
          onChange={(e) => {
            setGuestName(e.target.value);
            if (error) setError(null);
          }}
          leftIcon={<User className="w-4 h-4" />}
        />

        {/* Phone & Party Size in a Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Contact Phone (Optional)"
            placeholder="e.g. +91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Input
            type="number"
            label="Party Size (Pax)"
            min="1"
            max={table.seats ? table.seats + 4 : 20}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            leftIcon={<Users className="w-4 h-4" />}
          />
        </div>

        {/* Reservation Time & Presets */}
        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Reservation Time</span>
          </label>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-2 no-scrollbar">
            {timePresets.map((preset) => {
              const isSelected = time.toLowerCase() === preset.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTime(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          <Input
            placeholder="e.g. 7:00 PM, 8:15 PM"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Special Requests / Notes */}
        <div>
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span>Special Requests / Notes (Optional)</span>
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Window side table requested, anniversary celebration..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-800/80 hover:bg-stone-100/80 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-xs px-3.5 py-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/80 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
