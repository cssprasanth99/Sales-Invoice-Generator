import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { Sparkles, X } from "lucide-react";
import TextareaField from "../ui/TextareaField";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const CreateWithAIModal = ({ isOpen, onClose }) => {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to generate an invoice.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.PARSE_INVOICE, {
        text,
      });
      const invoiceData = response.data;
      toast.success("Invoice generated successfully!");
      onClose();
      navigate("/invoice/new", { state: { aiData: invoiceData } });
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span>Create Invoice with AI</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Paste any text that contains invoice details (like client name,
            items, quantity, and prices) and AI will attempt to create an
            invoice from it.
          </p>
          <TextareaField
            name="invoiceText"
            label="Paste Invoice Text Here"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., 'Invoice for ClientCorp: 2 hours of design work at $51/hr and ...'"
            rows={6}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} isLoading={isLoading}>
            {isLoading ? "Generating..." : "Generate Invoice"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateWithAIModal;
