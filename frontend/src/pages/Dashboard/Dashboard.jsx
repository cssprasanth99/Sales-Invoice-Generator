import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Loader2, FileText, DollarSign, Plus, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import AIInsightsCard from "../../components/AIInsightsCard";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalPaid: 0,
    totalUnpaid: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          API_PATHS.INVOICE.GET_ALL_INVOICES
        );
        const invoices = response.data;

        const totalInvoices = invoices.length;
        const totalPaid = invoices
          .filter((inv) => inv.status === "Paid")
          .reduce((acc, inv) => acc + inv.total, 0);
        const totalUnpaid = invoices
          .filter((inv) => inv.status !== "Paid")
          .reduce((acc, inv) => acc + inv.total, 0);

        setStats({
          totalInvoices,
          totalPaid,
          totalUnpaid,
        });

        setRecentInvoices(
          invoices
            .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
            .slice(0, 5) // show only recent 5 invoices if needed
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Function to format currency in Indian format (INR)
  const formatCurrencyINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const statsData = [
    {
      icon: FileText,
      title: "Total Invoices",
      value: stats.totalInvoices,
      color: "blue",
    },
    {
      icon: IndianRupee,
      title: "Total Paid",
      value: formatCurrencyINR(stats.totalPaid),
      color: "emerald",
    },
    {
      icon: IndianRupee,
      title: "Total Unpaid",
      value: formatCurrencyINR(stats.totalUnpaid),
      color: "red",
    },
  ];

  const colorClasses = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[24rem]">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-600">
          A quick overview of your business finances.
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {statsData.map((item, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 ${
                    colorClasses[item.color].bg
                  } rounded-lg flex items-center justify-center`}
                >
                  <item.icon
                    className={`w-6 h-6 ${colorClasses[item.color].text}`}
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{item.title}</div>
                  <div className="text-lg font-semibold">{item.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Insights Section */}
        {/* <AIInsightsCard /> */}

        {/* Recent Invoices */}
        <div className="w-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-800">
              Recent Invoices
            </h3>
            <button
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              onClick={() => navigate("/invoices")}
            >
              View All
            </button>
          </div>

          {recentInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => navigate(`/invoice/${invoice._id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-800">
                          {invoice.billTo.clientName}
                        </div>
                        <div className="text-xs text-slate-500">
                          #{invoice.invoiceNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {formatCurrencyINR(invoice.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : invoice.status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {moment(invoice.dueDate).format("MMM D, YYYY")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                No Invoices Found
              </h3>
              <p className="text-sm text-slate-600">
                Start creating invoices now.
              </p>
              <button
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => navigate("/invoices/new")}
              >
                <Plus className="w-4 h-4" />
                Create Invoice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;