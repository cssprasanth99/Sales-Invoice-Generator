import React, { useState, useEffect, useRef } from "react";
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
  const [invoice, setInvoice] = useState();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isRemainderModalOpen, setIsRemainderModalOpen] = useState(false);
  const invoiceRef = useRef();

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

    fetchInvoice();
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

  return (
    <>
      <RemainderModal
        isOpen={isRemainderModalOpen}
        onClose={() => setIsRemainderModalOpen(false)}
        invoice={invoice}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">
          Invoice{" "}
          <span className="text-gray-500">#{invoice.invoiceNumber}</span>
        </h1>
        <div className="flex flex-wrap gap-2">
          {invoice.status !== "Paid" && (
            <Button onClick={() => setIsRemainderModalOpen(true)} icon={Mail}>
              Send Reminder
            </Button>
          )}
          <Button onClick={() => setIsEditing(true)} icon={Edit}>
            Edit
          </Button>
          <Button onClick={handlePrint} icon={Printer}>
            Print / Download
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div
        id="invoice-content-wrapper"
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8"
      >
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b pb-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold">Invoice</h2>
            <p className="text-gray-500">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Status</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold mb-2">Bill From</h3>
            <p className="text-gray-700 font-medium">
              {invoice.billFrom.businessName}
            </p>
            <p className="text-gray-600">{invoice.billFrom.address}</p>
            <p className="text-gray-600">{invoice.billFrom.email}</p>
            <p className="text-gray-600">{invoice.billFrom.phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Bill To</h3>
            <p className="text-gray-700 font-medium">
              {invoice.billTo.clientName}
            </p>
            <p className="text-gray-600">{invoice.billTo.address}</p>
            <p className="text-gray-600">{invoice.billTo.email}</p>
            <p className="text-gray-600">{invoice.billTo.phone}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold">Invoice Date</h3>
            <p className="text-gray-700">
              {new Date(invoice.invoiceDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Due Date</h3>
            <p className="text-gray-700">
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold">Payment Terms</h3>
          <p className="text-gray-700">{invoice.paymentTerms}</p>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Unit Price</th>
                <th className="px-4 py-2">Tax (%)</th>
                <th className="px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-slate-50 transition">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-2">{item.taxPercentage}%</td>
                  <td className="px-4 py-2 font-medium">
                    ₹{item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex flex-col items-end gap-2 mb-6">
          <div className="flex justify-between w-64">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-64">
            <span className="text-gray-600">Tax Total</span>
            <span className="font-medium">₹{invoice.taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-64 border-t pt-2">
            <span className="text-gray-900 font-semibold">Total</span>
            <span className="text-lg font-bold text-blue-600">
              ₹{invoice.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-1">Notes</h3>
            <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
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
            }
          }
        `}
      </style>
    </>
  );
};

export default InvoiceDetail;
