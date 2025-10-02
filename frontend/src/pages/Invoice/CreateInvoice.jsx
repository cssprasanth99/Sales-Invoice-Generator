import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import InputField from "../../components/ui/InputField";
import TextareaField from "../../components/ui/TextareaField";
import Button from "../../components/ui/Button";
import { Plus, Trash2, FileText } from "lucide-react";
import SelectField from "../../components/ui/SelectField";

const CreateInvoice = ({ existingInvoice, onSave }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [formData, setFormData] = useState(
    existingInvoice || {
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      billFrom: {
        businessName: user?.businessName || "",
        email: user?.email || "",
        address: user?.address || "",
        phone: user?.phone || "",
      },
      billTo: {
        clientName: "",
        email: "",
        address: "",
        phone: "",
      },
      items: [
        {
          name: "",
          quantity: 1,
          unitPrice: 0,
          taxPercentage: 0,
        },
      ],
      notes: "",
      paymentTerms: "Net 15",
    }
  );

  const [loading, setLoading] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);

  useEffect(() => {
    const aiData = location.state?.aiData;
    if (aiData) {
      setFormData((prev) => ({
        ...prev,
        billTo: {
          clientName: aiData.clientName || "",
          email: aiData.email || "",
          address: aiData.address || "",
          phone: aiData.phone || "",
        },
        items: aiData.items || [
          {
            name: "",
            quantity: 1,
            unitPrice: 0,
            taxPercentage: 0,
          },
        ],
      }));
    }

    if (existingInvoice) {
      setFormData({
        ...existingInvoice,
        invoiceDate: moment(existingInvoice.invoiceDate).format("YYYY-MM-DD"),
        dueDate: moment(existingInvoice.dueDate).format("YYYY-MM-DD"),
      });
    } else {
      const generateNewInvoiceNumber = async () => {
        setIsGeneratingNumber(true);
        try {
          const response = await axiosInstance.get(
            API_PATHS.INVOICE.GET_ALL_INVOICES
          );
          const invoices = response.data;
          let maxNum = 0;
          invoices.forEach((invoice) => {
            const num = parseInt(invoice.invoiceNumber.split("-")[1]);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          });
          const newInvoiceNumber = `INV-${(maxNum + 1)
            .toString()
            .padStart(4, "0")}`;
          setFormData((prev) => ({ ...prev, invoiceNumber: newInvoiceNumber }));
        } catch (error) {
          console.error(error);
          setFormData((prev) => ({
            ...prev,
            invoiceNumber: "INV-0001",
          }));
        } finally {
          setIsGeneratingNumber(false);
        }
      };
      generateNewInvoiceNumber();
    }
  }, [existingInvoice, location.state, user]);

  // Calculate totals using useMemo for performance
  const { subtotal, taxTotal, total } = useMemo(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);

    const taxTotal = formData.items.reduce((sum, item) => {
      const itemSubtotal =
        (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      const itemTax = itemSubtotal * ((Number(item.taxPercentage) || 0) / 100);
      return sum + itemTax;
    }, 0);

    const total = subtotal + taxTotal;

    return { subtotal, taxTotal, total };
  }, [formData.items]);

  const handleInputChange = (e, section = null, index = null) => {
    const { name, value } = e.target;

    if (section) {
      // Handles changes for 'billFrom' and 'billTo'
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    } else if (index !== null) {
      // Handles changes for items in the 'items' array
      setFormData((prev) => {
        const newItems = [...prev.items];
        newItems[index] = {
          ...newItems[index],
          [name]: value,
        };
        return {
          ...prev,
          items: newItems,
        };
      });
    } else {
      // Handles changes for top-level properties
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", quantity: 1, unitPrice: 0, taxPercentage: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) {
      toast.error("At least one item is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (existingInvoice) {
        await axiosInstance.put(
          `${API_PATHS.INVOICE.UPDATE_INVOICE(existingInvoice._id)}`,
          formData
        );
        toast.success("Invoice updated successfully!");
      } else {
        await axiosInstance.post(API_PATHS.INVOICE.CREATE, formData);
        toast.success("Invoice created successfully!");
      }

      if (onSave) onSave(formData);
      navigate("/invoices");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-7 w-7 text-blue-600" />
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {existingInvoice ? "Edit Invoice" : "Create New Invoice"}
                </h2>
              </div>
              <Button
                type="submit"
                isLoading={loading || isGeneratingNumber}
                className="w-full sm:w-auto"
              >
                {existingInvoice ? "Update Invoice" : "Save Invoice"}
              </Button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Invoice Details */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Invoice Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="Invoice Number"
                  name="invoiceNumber"
                  readOnly
                  value={formData.invoiceNumber}
                  placeholder={isGeneratingNumber ? "Generating..." : ""}
                  disabled
                />
                <InputField
                  label="Invoice Date"
                  name="invoiceDate"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Bill From / Bill To */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bill From */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Bill From
                </h3>
                <div className="space-y-4">
                  <InputField
                    label="Business Name"
                    name="businessName"
                    value={formData.billFrom.businessName}
                    onChange={(e) => handleInputChange(e, "billFrom")}
                    required
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.billFrom.email}
                    onChange={(e) => handleInputChange(e, "billFrom")}
                    required
                  />
                  <TextareaField
                    label="Address"
                    name="address"
                    value={formData.billFrom.address}
                    onChange={(e) => handleInputChange(e, "billFrom")}
                    required
                  />
                  <InputField
                    label="Phone"
                    name="phone"
                    value={formData.billFrom.phone}
                    onChange={(e) => handleInputChange(e, "billFrom")}
                    required
                  />
                </div>
              </div>

              {/* Bill To */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Bill To
                </h3>
                <div className="space-y-4">
                  <InputField
                    label="Client Name"
                    name="clientName"
                    value={formData.billTo.clientName}
                    onChange={(e) => handleInputChange(e, "billTo")}
                    required
                  />
                  <InputField
                    label="Client Email"
                    name="email"
                    type="email"
                    value={formData.billTo.email}
                    onChange={(e) => handleInputChange(e, "billTo")}
                    required
                  />
                  <TextareaField
                    label="Client Address"
                    name="address"
                    value={formData.billTo.address}
                    onChange={(e) => handleInputChange(e, "billTo")}
                    required
                  />
                  <InputField
                    label="Client Phone"
                    name="phone"
                    value={formData.billTo.phone}
                    onChange={(e) => handleInputChange(e, "billTo")}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Invoice Items
              </h3>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                        Item Name
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600 w-24">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600 w-32">
                        Price (₹)
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600 w-24">
                        Tax (%)
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600 w-32">
                        Total (₹)
                      </th>
                      <th className="p-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {formData.items.map((item, index) => {
                      const itemTotal =
                        (Number(item.quantity) || 0) *
                        (Number(item.unitPrice) || 0) *
                        (1 + (Number(item.taxPercentage) || 0) / 100);
                      return (
                        <tr key={index}>
                          <td className="p-2">
                            <input
                              type="text"
                              name="name"
                              value={item.name}
                              onChange={(e) =>
                                handleInputChange(e, null, index)
                              }
                              className="w-full border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Item name"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              name="quantity"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleInputChange(e, null, index)
                              }
                              className="w-full border-slate-300 rounded-md p-2 text-sm text-center focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              name="unitPrice"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleInputChange(e, null, index)
                              }
                              className="w-full border-slate-300 rounded-md p-2 text-sm text-center focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              name="taxPercentage"
                              min="0"
                              max="100"
                              value={item.taxPercentage}
                              onChange={(e) =>
                                handleInputChange(e, null, index)
                              }
                              className="w-full border-slate-300 rounded-md p-2 text-sm text-center focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                            ₹{itemTotal.toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-md"
                              disabled={formData.items.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {formData.items.map((item, index) => {
                  const itemTotal =
                    (Number(item.quantity) || 0) *
                    (Number(item.unitPrice) || 0) *
                    (1 + (Number(item.taxPercentage) || 0) / 100);
                  return (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-slate-200"
                    >
                      <InputField
                        label="Item Name"
                        name="name"
                        value={item.name}
                        onChange={(e) => handleInputChange(e, null, index)}
                        required
                        placeholder="Enter item name"
                      />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <InputField
                          label="Quantity"
                          name="quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleInputChange(e, null, index)}
                          required
                        />
                        <InputField
                          label="Unit Price (₹)"
                          name="unitPrice"
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleInputChange(e, null, index)}
                          required
                        />
                      </div>
                      <div className="mt-4">
                        <InputField
                          label="Tax (%)"
                          name="taxPercentage"
                          type="number"
                          value={item.taxPercentage}
                          onChange={(e) => handleInputChange(e, null, index)}
                          required
                        />
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-2 border-t">
                        <span className="text-sm font-semibold text-slate-700">
                          Item Total: ₹{itemTotal.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-md"
                          disabled={formData.items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddItem}
                  icon={Plus}
                >
                  Add Another Item
                </Button>
              </div>
            </div>

            {/* Notes, Terms & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Notes & Terms */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Notes & Payment Terms
                </h3>
                <div className="space-y-4">
                  <TextareaField
                    label="Additional Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="E.g., thank you for your business"
                  />
                  <SelectField
                    label="Payment Terms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    options={["Net 15", "Net 30", "Net 60", "Due on Receipt"]}
                  />
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Invoice Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Tax Total:</span>
                    <span className="font-semibold text-slate-800">
                      ₹{taxTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 mt-2 bg-slate-200 rounded-lg px-4">
                    <span className="font-bold text-slate-800">
                      Grand Total:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-slate-200">
              <Button
                type="submit"
                isLoading={loading || isGeneratingNumber}
                className="w-full sm:w-auto px-8 py-3"
              >
                {existingInvoice ? "Update Invoice" : "Create Invoice"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;