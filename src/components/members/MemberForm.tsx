'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Upload, Plus, Check, User, Save } from 'lucide-react';
import { memberSchema, type MemberFormValues } from '@/lib/member-schema';
import { MINISTRIES } from '@/lib/ministries';
import type { Member } from '@/lib/site';
import type { ChurchCustomField } from '@/lib/church-branding';

// ── Constants ─────────────────────────────────────────────────────────────────

const ZONES = ['North', 'South', 'East', 'West', 'Central'];

const DENOMINATIONS = [
  'Pentecostal', 'Charismatic', 'Baptist', 'Methodist', 'Presbyterian',
  'Anglican', 'Catholic', 'Seventh-day Adventist', 'Lutheran', 'Non-denominational', 'Other',
];

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="amf-field">
      <label className="amf-label">
        {label}{required && <span className="amf-required" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <p className="amf-error" role="alert">{error}</p>}
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function Section({ title }: { title: string }) {
  return <p className="amf-section-title">{title}</p>;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

function baseDefaults(): Partial<MemberFormValues> {
  return {
    status:     'active',
    role:       'member',
    joinedDate: new Date().toISOString().slice(0, 10),
    ministries: [],
    baptised:   false,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

export type MemberFormProps = {
  /** 'add' creates a new member (POST); 'edit' updates an existing one (PUT). */
  mode: 'add' | 'edit';
  /** Required in edit mode — the id of the member being updated. */
  memberId?: string;
  /** Pre-populated values (edit mode); merged over the base defaults. */
  initialValues?: Partial<MemberFormValues>;
  /** Existing photo URL to preview in edit mode. */
  initialPhotoUrl?: string | null;
  onClose: () => void;
  onSaved: (member: { id: string; fullName: string }) => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function MemberForm({
  mode,
  memberId,
  initialValues,
  initialPhotoUrl,
  onClose,
  onSaved,
}: MemberFormProps) {
  const isEdit = mode === 'edit';

  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl ?? null);
  const [photoFile,    setPhotoFile]    = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [serverError,  setServerError]  = useState('');
  const [members,      setMembers]      = useState<Pick<Member, 'id' | 'fullName'>[]>([]);
  const [customFields, setCustomFields] = useState<ChurchCustomField[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | boolean>>({});
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Church-defined custom fields (Day 49) — rendered dynamically below Notes.
  useEffect(() => {
    fetch('/api/church/custom-fields')
      .then((r) => r.json())
      .then((j: { data?: ChurchCustomField[] }) => setCustomFields(j.data ?? []))
      .catch(() => setCustomFields([]));
  }, []);

  // Household-head dropdown options — exclude self in edit mode.
  useEffect(() => {
    fetch('/api/members?pageSize=48')
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (!j?.data) return;
        const opts = (j.data as Member[])
          .filter((m) => m.id !== memberId)
          .map((m) => ({ id: m.id, fullName: m.fullName }));
        setMembers(opts);
      })
      .catch(() => {});
  }, [memberId]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { ...baseDefaults(), ...initialValues },
  });

  const selectedMinistries = watch('ministries') ?? [];

  // ── Photo handling ────────────────────────────────────────────────────────

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setServerError('Photo must be under 2 MB.');
      return;
    }
    setPhotoFile(file);
    setPhotoRemoved(false);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhotoPreview(null);
    setPhotoFile(null);
    setPhotoRemoved(true);
    if (photoInputRef.current) photoInputRef.current.value = '';
  }

  // ── Ministry toggle ───────────────────────────────────────────────────────

  function toggleMinistry(name: string) {
    const current = selectedMinistries;
    setValue(
      'ministries',
      current.includes(name) ? current.filter((m) => m !== name) : [...current, name],
      { shouldValidate: true },
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function onSubmit(data: MemberFormValues) {
    setSaving(true);
    setServerError('');

    try {
      const body = new FormData();
      if (photoFile) body.append('photo', photoFile);
      // Edit mode: signal an explicit photo removal (no replacement uploaded).
      if (isEdit && photoRemoved && !photoFile) body.append('removePhoto', '1');
      body.append('data', JSON.stringify(data));
      body.append('customFieldValues', JSON.stringify(customFieldValues));

      const url    = isEdit ? `/api/members/${memberId}` : '/api/members';
      const method = isEdit ? 'PUT' : 'POST';

      const res  = await fetch(url, { method, body });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? `Failed to ${isEdit ? 'update' : 'create'} member.`);
        return;
      }

      onSaved({ id: json.id ?? memberId ?? '', fullName: `${data.firstName} ${data.lastName}` });
      onClose();
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const title = isEdit ? 'Edit Member' : 'Add Member';

  return (
    <div
      className="amf-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit member' : 'Add new member'}
    >
      <div className="amf-sheet">

        {/* Header */}
        <div className="amf-header">
          <h2 className="amf-header__title">{title}</h2>
          <button type="button" className="amf-header__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          className="amf-body"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          encType="multipart/form-data"
        >

          {/* ── Photo upload ─────────────────────────────────────────────── */}
          <Section title="Photo" />
          <div className="amf-photo-row">
            {photoPreview ? (
              <div className="amf-photo-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview" className="amf-photo-preview__img" />
                <button type="button" className="amf-photo-preview__remove" onClick={removePhoto} aria-label="Remove photo">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div className="amf-photo-placeholder" aria-hidden="true">
                <User size={28} strokeWidth={1.5} />
              </div>
            )}
            <div className="amf-photo-actions">
              <button
                type="button"
                className="amf-upload-btn"
                onClick={() => photoInputRef.current?.click()}
              >
                <Upload size={14} aria-hidden="true" />
                {photoPreview ? 'Change photo' : 'Upload photo'}
              </button>
              <p className="amf-photo-hint">JPEG, PNG or WebP · max 2 MB</p>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="amf-hidden-input"
              aria-label="Photo file input"
              onChange={handlePhotoChange}
            />
          </div>

          {/* ── Personal details ──────────────────────────────────────────── */}
          <Section title="Personal Details" />
          <div className="amf-two-col">
            <Field label="First name" required error={errors.firstName?.message}>
              <input className={`amf-input${errors.firstName ? ' amf-input--error' : ''}`} {...register('firstName')} placeholder="e.g. Abena" autoComplete="given-name" />
            </Field>
            <Field label="Last name" required error={errors.lastName?.message}>
              <input className={`amf-input${errors.lastName ? ' amf-input--error' : ''}`} {...register('lastName')} placeholder="e.g. Mensah" autoComplete="family-name" />
            </Field>
          </div>

          <div className="amf-two-col">
            <Field label="Date of birth" error={errors.dateOfBirth?.message}>
              <input type="date" className="amf-input" {...register('dateOfBirth')} />
            </Field>
            <Field label="Gender" error={errors.gender?.message}>
              <select className="amf-select" {...register('gender')}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </Field>
          </div>

          {/* ── Contact info ──────────────────────────────────────────────── */}
          <Section title="Contact Information" />
          <Field label="Email address" required error={errors.email?.message}>
            <input type="email" className={`amf-input${errors.email ? ' amf-input--error' : ''}`} {...register('email')} placeholder="name@example.com" autoComplete="email" />
          </Field>

          <Field label="Phone number" error={errors.phone?.message}>
            <input type="tel" className={`amf-input${errors.phone ? ' amf-input--error' : ''}`} {...register('phone')} placeholder="+233 24 000 0000" autoComplete="tel" />
          </Field>

          <Field label="Address" error={errors.address?.message}>
            <input className="amf-input" {...register('address')} placeholder="Street address" autoComplete="street-address" />
          </Field>

          <div className="amf-two-col">
            <Field label="City" error={errors.city?.message}>
              <input className="amf-input" {...register('city')} placeholder="Accra" autoComplete="address-level2" />
            </Field>
            <Field label="Country" error={errors.country?.message}>
              <input className="amf-input" {...register('country')} placeholder="Ghana" autoComplete="country-name" />
            </Field>
          </div>

          {/* ── Church details ────────────────────────────────────────────── */}
          <Section title="Church Details" />
          <div className="amf-two-col">
            <Field label="Status" required error={errors.status?.message}>
              <select className="amf-select" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="visitor">Visitor</option>
              </select>
            </Field>
            <Field label="Role" required error={errors.role?.message}>
              <select className="amf-select" {...register('role')}>
                <option value="member">Member</option>
                <option value="staff">Staff</option>
                <option value="ministry_leader">Ministry Leader</option>
                <option value="pastor">Pastor</option>
                <option value="finance">Finance</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
          </div>

          <div className="amf-two-col">
            <Field label="Join date" required error={errors.joinedDate?.message}>
              <input type="date" className={`amf-input${errors.joinedDate ? ' amf-input--error' : ''}`} {...register('joinedDate')} />
            </Field>
            <Field label="Age group" error={errors.ageGroup?.message}>
              <select className="amf-select" {...register('ageGroup')}>
                <option value="">Select…</option>
                <option value="child">Child (0–12)</option>
                <option value="youth">Youth (13–17)</option>
                <option value="young_adult">Young Adult (18–35)</option>
                <option value="adult">Adult (36–59)</option>
                <option value="senior">Senior (60+)</option>
              </select>
            </Field>
          </div>

          <div className="amf-two-col">
            <Field label="Geographic zone" error={errors.zone?.message}>
              <select className="amf-select" {...register('zone')}>
                <option value="">Select…</option>
                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </Field>
            <Field label="Denomination" error={errors.denomination?.message}>
              <select className="amf-select" {...register('denomination')}>
                <option value="">Select…</option>
                {DENOMINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Baptised" error={errors.baptised?.message}>
            <label className="amf-checkbox-label">
              <Controller
                name="baptised"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    className="amf-checkbox"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                )}
              />
              Yes, this member has been baptised
            </label>
          </Field>

          {/* ── Family linking ────────────────────────────────────────────── */}
          <Section title="Family & Household" />
          <div className="amf-two-col">
            <Field label="Household head" error={errors.householdHeadId?.message}>
              <select className="amf-select" {...register('householdHeadId')}>
                <option value="">None / New household</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
            </Field>
            <Field label="Role in household" error={errors.householdRole?.message}>
              <select className="amf-select" {...register('householdRole')}>
                <option value="">Select…</option>
                <option value="head">Head</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>

          {/* ── Ministry assignment ───────────────────────────────────────── */}
          <Section title="Ministry Assignment" />
          <Controller
            name="ministries"
            control={control}
            render={() => (
              <div className="amf-ministry-grid" role="group" aria-label="Select ministries">
                {MINISTRIES.map((m) => {
                  const active = selectedMinistries.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`amf-ministry-pill${active ? ' amf-ministry-pill--active' : ''}`}
                      aria-pressed={active}
                      onClick={() => toggleMinistry(m)}
                    >
                      {active && <Check size={11} aria-hidden="true" />}
                      {m}
                    </button>
                  );
                })}
              </div>
            )}
          />

          {/* ── Notes ────────────────────────────────────────────────────── */}
          <Section title="Notes" />
          <Field label="Pastoral notes" error={errors.notes?.message}>
            <textarea
              className="amf-textarea"
              {...register('notes')}
              placeholder="Any notes about this member…"
              rows={3}
            />
          </Field>

          {/* ── Custom fields (Day 49) ───────────────────────────────────── */}
          {customFields.length > 0 && (
            <>
              <Section title="Additional information" />
              {customFields.map((cf) => (
                <Field key={cf.id} label={cf.label} required={cf.required}>
                  {cf.type === 'boolean' ? (
                    <label className="amf-checkbox-row">
                      <input
                        type="checkbox"
                        checked={Boolean(customFieldValues[cf.id])}
                        onChange={(e) => setCustomFieldValues((v) => ({ ...v, [cf.id]: e.target.checked }))}
                      />
                      {cf.label}
                    </label>
                  ) : cf.type === 'dropdown' ? (
                    <select
                      className="amf-input"
                      value={String(customFieldValues[cf.id] ?? '')}
                      onChange={(e) => setCustomFieldValues((v) => ({ ...v, [cf.id]: e.target.value }))}
                    >
                      <option value="">Select…</option>
                      {(cf.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      className="amf-input"
                      type={cf.type === 'date' ? 'date' : cf.type === 'number' ? 'number' : 'text'}
                      value={String(customFieldValues[cf.id] ?? '')}
                      onChange={(e) => setCustomFieldValues((v) => ({ ...v, [cf.id]: e.target.value }))}
                    />
                  )}
                </Field>
              ))}
            </>
          )}

          {/* ── Server error ──────────────────────────────────────────────── */}
          {serverError && (
            <p className="amf-server-error" role="alert">{serverError}</p>
          )}

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="amf-footer">
            <button type="button" className="amf-btn amf-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="amf-btn amf-btn--primary" disabled={saving}>
              {saving
                ? 'Saving…'
                : isEdit
                  ? <><Save size={15} aria-hidden="true" /> Save Changes</>
                  : <><Plus size={15} aria-hidden="true" /> Add Member</>
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default MemberForm;
