"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";
import { formatDate } from "@/lib/utils";
import { deriveStaffStatus } from "@/lib/staff-status";

export interface FacilityAdminDetail {
  id: string;
  phone: string;
  facilityId: string | null;
  facilityName: string | null;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
  auditLogs: { id: string; action: string; createdAt: string }[];
}

const ACTION_LABELS: Record<string, string> = {
  FACILITY_ADMIN_CREATED: "Account created",
  FACILITY_ADMIN_ACTIVATED: "Account activated",
  FACILITY_ADMIN_DEACTIVATED: "Account deactivated",
  FACILITY_ADMIN_REACTIVATED: "Account reactivated",
  FACILITY_ADMIN_FACILITY_CHANGED: "Facility reassigned",
  FACILITY_ADMIN_UPDATED: "Details updated",
  FACILITY_ADMIN_OTP_RESENT: "Activation OTP resent",
};

export default function FacilityAdminDetailClient({
  admin,
  facilities,
}: {
  admin: FacilityAdminDetail;
  facilities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [facilityId, setFacilityId] = useState(admin.facilityId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const status = deriveStaffStatus(admin.isActive, admin.hasPassword);

  async function handleUpdate(data: Record<string, unknown>) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/facility-admins/${admin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        setError(typeof json.error === "string" ? json.error : "Something went wrong.");
        return;
      }
      setFacilityOpen(false);
      setDeactivateOpen(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setSubmitting(true);
    setOtpMessage(null);
    try {
      const res = await fetch(`/api/admin/facility-admins/${admin.id}/resend-otp`, { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setOtpMessage(typeof json.error === "string" ? json.error : "Something went wrong.");
        return;
      }
      setOtpMessage(
        json.data.devOtp ? `OTP resent. Dev OTP: ${json.data.devOtp}` : `OTP resent to ${json.data.phone}.`
      );
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A2E]">{admin.facilityName ?? "Facility Admin"}</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Facility Admin</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-[#6B7280]">Phone</dt>
            <dd className="mt-0.5 text-[#1A1A2E]">{admin.phone}</dd>
          </div>
          <div>
            <dt className="text-[#6B7280]">Facility</dt>
            <dd className="mt-0.5 text-[#1A1A2E]">{admin.facilityName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[#6B7280]">Created at</dt>
            <dd className="mt-0.5 text-[#1A1A2E]">{formatDate(admin.createdAt)}</dd>
          </div>
        </dl>

        {otpMessage && <p className="mt-4 rounded-md bg-[#F8FAFC] px-3 py-2 text-sm text-[#1A1A2E]">{otpMessage}</p>}
        {error && <p className="mt-4 text-sm text-[#DC2626]">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          {status === "Pending" && (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={submitting}
              className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E] disabled:opacity-60"
            >
              Resend OTP
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setFacilityId(admin.facilityId ?? "");
              setFacilityOpen(true);
            }}
            className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]"
          >
            Change facility
          </button>
          {status === "Active" && (
            <button
              type="button"
              onClick={() => setDeactivateOpen(true)}
              className="rounded-md border border-[#FEF2F2] bg-[#FEF2F2] px-4 py-2 text-sm font-medium text-[#DC2626]"
            >
              Deactivate account
            </button>
          )}
          {status === "Inactive" && (
            <button
              type="button"
              onClick={() => handleUpdate({ isActive: true })}
              disabled={submitting}
              className="rounded-md border border-[#F0FDF4] bg-[#F0FDF4] px-4 py-2 text-sm font-medium text-[#16A34A] disabled:opacity-60"
            >
              Reactivate account
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
        <h3 className="text-sm font-semibold text-[#1A1A2E]">Audit log</h3>
        <div className="mt-3 flex flex-col divide-y divide-[#E2E8F0]">
          {admin.auditLogs.length === 0 && <p className="py-3 text-sm text-[#6B7280]">No actions recorded yet.</p>}
          {admin.auditLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-[#1A1A2E]">{ACTION_LABELS[log.action] ?? log.action}</span>
              <span className="text-[#6B7280]">{formatDate(log.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>

      <Modal open={facilityOpen} onClose={() => setFacilityOpen(false)} title="Change facility">
        <FormField label="Facility" required>
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="h-10 w-full rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </FormField>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setFacilityOpen(false)} className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleUpdate({ facilityId })}
            disabled={submitting}
            className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </Modal>

      <Modal open={deactivateOpen} onClose={() => setDeactivateOpen(false)} title="Deactivate account">
        <p className="text-sm text-[#6B7280]">
          Are you sure you want to deactivate this Facility Admin&apos;s account? They will immediately lose access
          to the admin portal.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setDeactivateOpen(false)} className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleUpdate({ isActive: false })}
            disabled={submitting}
            className="rounded-md bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Deactivating…" : "Deactivate"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
