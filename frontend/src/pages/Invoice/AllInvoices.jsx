import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import moment from "moment";
import { toast } from "react-hot-toast";
import Button from "../../components/ui/Button";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Search,
  FileText,
  AlertCircle,
  Sparkles,
  Mail,
} from "lucide-react";
import CreateWithAIModal from "../../components/invoices/CreateWithAIModal";
import RemainderModal from "../../components/invoices/RemainderModal";

const AllInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState(null); // Tracks ID of invoice being updated
  const [deletingId, setDeletingId] = useState(null); // Tracks ID of invoice being deleted
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          API_PATHS.INVOICE.GET_ALL_INVOICES
        );
        setInvoices(
          response.data.sort(
            (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
          )
        );
      } catch (error) {
        setError("Failed to fetch invoices. Please try again later.");
        toast.error("Failed to fetch invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setDeletingId(id);
      try {
        await axiosInstance.delete(API_PATHS.INVOICE.DELETE_INVOICE(id));
        setInvoices((prevInvoices) =>
          prevInvoices.filter((invoice) => invoice._id !== id)
        );
        toast.success("Invoice deleted successfully!");
      } catch (error) {
        setError("Failed to delete invoice. Please try again.");
        toast.error("Failed to delete invoice.");
        console.error(error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleStatusChange = async (invoice) => {
    setStatusChangeLoading(invoice._id);
    try {
      const newStatus = invoice.status === "Paid" ? "Unpaid" : "Paid";
      // The API call is awaited to ensure the update is successful on the server first
      const response = await axiosInstance.put(
        API_PATHS.INVOICE.UPDATE_INVOICE(invoice._id),
        { ...invoice, status: newStatus } // Send the updated status in the request body
      );

      // Use the response from the server as the source of truth
      const updatedInvoice = response.data;

      setInvoices((prevInvoices) =>
        prevInvoices.map((inv) =>
          inv._id === updatedInvoice._id ? updatedInvoice : inv
        )
      );
      toast.success(`Invoice marked as ${newStatus}`);
    } catch (error) {
      setError("Failed to update invoice status. Please try again.");
      toast.error("Failed to update invoice status.");
      console.error(error);
    } finally {
      setStatusChangeLoading(null);
    }
  };

  const handleOpenRemainderModal = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsReminderModalOpen(true);
  };

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(
        (invoice) => statusFilter === "All" || invoice.status === statusFilter
      )
      .filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.billTo.clientName // Corrected to search billTo.clientName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
  }, [invoices, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Modals */}
      <CreateWithAIModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
      <RemainderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        invoiceId={selectedInvoiceId}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, track, and send all your invoices.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={() => setIsAiModalOpen(true)}
            icon={Sparkles}
            className="w-1/2 sm:w-auto"
          >
            Create with AI
          </Button>
          <Button
            onClick={() => navigate("/invoice/new")}
            icon={Plus}
            className="w-1/2 sm:w-auto"
          >
            New Invoice
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-1">
                An error occurred
              </h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="bg-white shadow-lg rounded-xl border border-slate-200">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Invoice # or Client Name"
              className="w-full h-10 pl-10 pr-4 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <select
            className="w-full sm:w-auto h-10 px-3 border border-slate-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        {/* Invoices List / Table */}
        <div className="overflow-x-auto">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-lg font-semibold text-slate-800">
                No Invoices Found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Adjust your search or create a new invoice to get started.
              </p>
              {invoices.length === 0 && (
                <Button
                  onClick={() => navigate("/invoice/new")}
                  className="mt-4"
                  icon={Plus}
                >
                  Create Your First Invoice
                </Button>
              )}
            </div>
          ) : (
            <div>
              {/* Desktop Table View */}
              <table className="w-full min-w-max hidden md:table">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                        onClick={() => navigate(`/invoice/${invoice._id}`)}
                      >
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {invoice.billTo.clientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">
                        ₹{invoice.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {moment(invoice.dueDate).format("MMM DD, YYYY")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => handleStatusChange(invoice)}
                            isLoading={statusChangeLoading === invoice._id}
                            disabled={statusChangeLoading === invoice._id}
                          >
                            {invoice.status === "Paid"
                              ? "Mark as Unpaid"
                              : "Mark as Paid"}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Edit Invoice"
                            onClick={() => navigate(`/invoice/${invoice._id}`)}
                          >
                            <Edit className="h-4 w-4 text-slate-500" />
                          </Button>
                          {invoice.status !== "Paid" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Send Reminder"
                              onClick={() =>
                                handleOpenRemainderModal(invoice._id)
                              }
                            >
                              <Mail className="w-4 h-4 text-blue-500" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Delete Invoice"
                            onClick={() => handleDelete(invoice._id)}
                            isLoading={deletingId === invoice._id}
                            disabled={deletingId === invoice._id}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-slate-200">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p
                          className="font-semibold text-blue-600 cursor-pointer"
                          onClick={() => navigate(`/invoice/${invoice._id}`)}
                        >
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-slate-600">
                          {invoice.billTo.clientName}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          ₹{invoice.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Due: {moment(invoice.dueDate).format("MMM DD, YYYY")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Edit Invoice"
                          onClick={() => navigate(`/invoice/${invoice._id}`)}
                        >
                          <Edit className="h-4 w-4 text-slate-500" />
                        </Button>
                        {invoice.status !== "Paid" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Send Reminder"
                            onClick={() =>
                              handleOpenRemainderModal(invoice._id)
                            }
                          >
                            <Mail className="w-4 h-4 text-blue-500" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Delete Invoice"
                          onClick={() => handleDelete(invoice._id)}
                          isLoading={deletingId === invoice._id}
                          disabled={deletingId === invoice._id}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handleStatusChange(invoice)}
                      isLoading={statusChangeLoading === invoice._id}
                      disabled={statusChangeLoading === invoice._id}
                      className="w-full mt-4"
                    >
                      {invoice.status === "Paid"
                        ? "Mark as Unpaid"
                        : "Mark as Paid"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllInvoices;