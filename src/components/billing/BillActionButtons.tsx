"use client";

import { formatINR } from "@/lib/money";

type BillActionButtonsProps = {
  playerName: string;
  playerPhone: string | null;
  billingMonth: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDateText: string;
};

function normalizeIndianPhone(phone: string | null) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }

  return digits;
}

export default function BillActionButtons({
  playerName,
  playerPhone,
  billingMonth,
  totalAmount,
  paidAmount,
  balance,
  dueDateText,
}: BillActionButtonsProps) {
  function handlePrint() {
    window.print();
  }

  function handleShareBill() {
    const message = `Levo Sports Monthly Bill

Player: ${playerName}
Month: ${billingMonth}

Total: ${formatINR(totalAmount)}
Paid: ${formatINR(paidAmount)}
Balance: ${formatINR(balance)}

Due Date: ${dueDateText}

Please pay the balance amount by the due date.

Thank you,
Levo Sports`;

    const encodedMessage = encodeURIComponent(message);
    const normalizedPhone = normalizeIndianPhone(playerPhone);

    const whatsappUrl = normalizedPhone
      ? `https://wa.me/${normalizedPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  }

  return (
    <>
      <button
        type="button"
        onClick={handlePrint}
        className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
      >
        Print Bill
      </button>

      <button
        type="button"
        onClick={handleShareBill}
        className="rounded-md bg-cyan-500 px-5 py-3 font-semibold text-white hover:bg-cyan-600"
      >
        Share Bill
      </button>
    </>
  );
}