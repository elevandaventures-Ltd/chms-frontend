'use client';

/**
 * ScheduleControls — Day 34.
 * "Send Now" vs "Schedule" toggle, plus a date + time picker and an
 * Africa-focused timezone selector for the scheduled case.
 */
import { Clock, Send } from 'lucide-react';
import { AFRICA_TIMEZONES } from '@/lib/communication';

export type SendMode = 'now' | 'schedule';

type Props = {
  mode: SendMode;
  onModeChange: (m: SendMode) => void;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  timezone: string;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
  onTimezoneChange: (v: string) => void;
  error?: string;
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ScheduleControls({ mode, onModeChange, date, time, timezone, onDateChange, onTimeChange, onTimezoneChange, error }: Props) {
  return (
    <div className="sched-controls">
      <div className="sched-controls__toggle" role="tablist" aria-label="Send timing">
        <button
          type="button" role="tab" aria-selected={mode === 'now'}
          className={`sched-controls__toggle-btn${mode === 'now' ? ' sched-controls__toggle-btn--active' : ''}`}
          onClick={() => onModeChange('now')}
        >
          <Send size={13} aria-hidden="true" /> Send Now
        </button>
        <button
          type="button" role="tab" aria-selected={mode === 'schedule'}
          className={`sched-controls__toggle-btn${mode === 'schedule' ? ' sched-controls__toggle-btn--active' : ''}`}
          onClick={() => onModeChange('schedule')}
        >
          <Clock size={13} aria-hidden="true" /> Schedule
        </button>
      </div>

      {mode === 'schedule' && (
        <div className="sched-controls__fields">
          <label className="sched-controls__field">
            <span>Date</span>
            <input type="date" value={date} min={todayStr()} onChange={(e) => onDateChange(e.target.value)} />
          </label>
          <label className="sched-controls__field">
            <span>Time</span>
            <input type="time" value={time} onChange={(e) => onTimeChange(e.target.value)} />
          </label>
          <label className="sched-controls__field sched-controls__field--tz">
            <span>Timezone</span>
            <select value={timezone} onChange={(e) => onTimezoneChange(e.target.value)}>
              {AFRICA_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {error && <p className="sched-controls__error">{error}</p>}
    </div>
  );
}

export default ScheduleControls;
