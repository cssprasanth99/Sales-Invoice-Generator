import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { Loader2, Edit, Printer, AlertCircle, Mail } from "lucide-react";
import RemainderModal from "../../components/invoices/RemainderModal";
import Button from "../../components/ui/Button";
import CreateInvoice from "./CreateInvoice";

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isRemainderModalOpen, setIsRemainderModalOpen] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          API_PATHS.INVOICE.GET_INVOICE_BY_ID(id)
        );
        setInvoice(response.data);
      } catch (error) {
        toast.error("Failed to fetch invoice");
        console.error("Failed to fetch invoice", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      const response = await axiosInstance.put(
        API_PATHS.INVOICE.UPDATE_INVOICE(id),
        formData
      );
      toast.success("Invoice updated successfully");
      setIsEditing(false);
      setInvoice(response.data);
    } catch (error) {
      toast.error("Failed to update invoice");
      console.error("Failed to update invoice", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="h-96 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <AlertCircle className="w-10 h-10 text-red-600 mb-2" />
        <h3 className="text-lg font-semibold">Invoice not found</h3>
        <p className="text-gray-600 mb-4">
          The invoice you are looking for does not exist or could not be loaded.
        </p>
        <Button onClick={() => navigate("/invoices")}>
          Back to All Invoices
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return <CreateInvoice existingInvoice={invoice} onSave={handleUpdate} />;
  }

  const formatCurrencyINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-6">
      <RemainderModal
        isOpen={isRemainderModalOpen}
        onClose={() => setIsRemainderModalOpen(false)}
        invoice={invoice}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">
          Invoice{" "}
          <span className="text-gray-500 font-medium">
            #{invoice.invoiceNumber}
          </span>
        </h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {invoice.status !== "Paid" && (
            <Button
              className="w-full sm:w-auto"
              onClick={() => setIsRemainderModalOpen(true)}
              icon={Mail}
            >
              Send Reminder
            </Button>
          )}
          <Button
            className="w-full sm:w-auto"
            onClick={() => setIsEditing(true)}
            icon={Edit}
          >
            Edit
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={handlePrint}
            icon={Printer}
          >
            Print / Download
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div
        id="invoice-content-wrapper"
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6 md:p-8"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 mb-4 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Invoice</h2>
            <p className="text-gray-500">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                invoice.status === "Paid"
                  ? "bg-emerald-100 text-emerald-800"
                  : invoice.status === "Pending"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Bill From / Bill To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="text-sm">
            <h3 className="font-semibold mb-2 text-slate-600">Bill From</h3>
            <p className="text-gray-800 font-medium">
              {invoice.billFrom.businessName}
            </p>
            <p className="text-gray-600">{invoice.billFrom.address}</p>
            <p className="text-gray-600">{invoice.billFrom.email}</p>
            <p className="text-gray-600">{invoice.billFrom.phone}</p>
          </div>
          <div className="text-sm">
            <h3 className="font-semibold mb-2 text-slate-600">Bill To</h3>
            <p className="text-gray-800 font-medium">
              {invoice.billTo.clientName}
            </p>
            <p className="text-gray-600">{invoice.billTo.address}</p>
            <p className="text-gray-600">{invoice.billTo.email}</p>
            <p className="text-gray-600">{invoice.billTo.phone}</p>
          </div>
        </div>

        {/* Dates & Payment Terms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-sm">
          <div>
            <h3 className="font-semibold text-slate-600">Invoice Date</h3>
            <p className="text-gray-700 mt-1">
              {new Date(invoice.invoiceDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-600">Due Date</h3>
            <p className="text-gray-700 mt-1">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-600">Payment Terms</h3>
            <p className="text-gray-700 mt-1">{invoice.paymentTerms}</p>
          </div>
        </div>

        {/* Items Table - Mobile: Card view, Desktop: Table view */}
        <div className="md:hidden">
          {invoice.items.map((item, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-lg p-4 mb-3"
            >
              <p className="font-semibold text-slate-800 mb-2">{item.name}</p>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Quantity</span>
                <span>{item.quantity}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Unit Price</span>
                <span>{formatCurrencyINR(item.unitPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>{item.taxPercentage}%</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-800 mt-2 pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrencyINR(item.total)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto mb-6">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-slate-600">Item</th>
                <th className="px-4 py-2 font-medium text-slate-600 text-center">
                  Quantity
                </th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">
                  Unit Price
                </th>
                <th className="px-4 py-2 font-medium text-slate-600 text-center">
                  Tax (%)
                </th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-slate-50 transition">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2 text-center">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrencyINR(item.unitPrice)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {item.taxPercentage}%
                  </td>
                  <td className="px-4 py-2 font-medium text-right">
                    {formatCurrencyINR(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex flex-col items-center sm:items-end gap-2 mt-6">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {formatCurrencyINR(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax Total</span>
              <span className="font-medium">
                {formatCurrencyINR(invoice.taxTotal)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-300 pt-2 mt-2">
              <span className="text-gray-900 font-semibold">Total</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrencyINR(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-4 border-t">
            <h3 className="text-sm font-semibold mb-1">Notes</h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>
        {`
          @page { padding: 10px; }
          @media print {
            body * { visibility: hidden; }
            #invoice-content-wrapper, #invoice-content-wrapper * {
              visibility: visible;
            }
            #invoice-content-wrapper {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none;
              box-shadow: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default InvoiceDetail;
