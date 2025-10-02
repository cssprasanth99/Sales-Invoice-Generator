const Invoice = require("../models/Invoice");

// @desc Create new Invoice
// @route POST /api/invoices
// @access Private
exports.createInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
    } = req.body;

    // Normalize items to match schema (taxPercentage) and compute per-item totals
    let subtotal = 0;
    let taxTotal = 0;
    const normalizedItems = (items || []).map((item) => {
      const unitPrice = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      const taxPercentage =
        Number(
          item.taxPercentage !== undefined
            ? item.taxPercentage
            : item.taxPercent || 0
        ) || 0;

      const lineSubtotal = unitPrice * quantity;
      const lineTax = (lineSubtotal * taxPercentage) / 100;
      const lineTotal = lineSubtotal + lineTax;

      subtotal += lineSubtotal;
      taxTotal += lineTax;

      return {
        name: item.name,
        unitPrice,
        quantity,
        taxPercentage,
        total: lineTotal,
      };
    });

    const total = subtotal + taxTotal;

    const invoice = new Invoice({
      userId,
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items: normalizedItems,
      notes,
      paymentTerms,
      subtotal,
      taxTotal,
      total,
    });

    const createdInvoice = await invoice.save();
    res.status(201).json(createdInvoice);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get all Invoices of Logged-in user
// @route GET /api/invoices
// @access Private
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get Single Invoices (by Id) of Logged-in user
// @route GET /api/invoices/:id
// @access Private
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    

    if (invoice && invoice.userId.toString() === req.user.id) {
      res.json(invoice);
    } else {
      res.status(404).json({ message: "Invoice not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update Invoice
// @route PUT /api/invoices/:id
// @access Private
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (invoice && invoice.userId.toString() === req.user.id) {
      const {
        invoiceNumber,
        dueDate,
        billFrom,
        billTo,
        items,
        notes,
        paymentTerms,
        status,
      } = req.body;

      invoice.invoiceNumber = invoiceNumber || invoice.invoiceNumber;
      invoice.dueDate = dueDate || invoice.dueDate;
      invoice.billFrom = billFrom || invoice.billFrom;
      invoice.billTo = billTo || invoice.billTo;
      invoice.notes = notes || invoice.notes;
      invoice.paymentTerms = paymentTerms || invoice.paymentTerms;
      invoice.status = status || invoice.status;

      // Recalculate items and totals (align with createInvoice logic)
      const sourceItems = (items && items.length ? items : invoice.items) || [];
      let subtotal = 0;
      let taxTotal = 0;
      const normalizedItems = sourceItems.map((item) => {
        const unitPrice = Number(item.unitPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        const taxPercentage =
          Number(
            item.taxPercentage !== undefined
              ? item.taxPercentage
              : item.taxPercent || 0
          ) || 0;

        const lineSubtotal = unitPrice * quantity;
        const lineTax = (lineSubtotal * taxPercentage) / 100;
        const lineTotal = lineSubtotal + lineTax;

        subtotal += lineSubtotal;
        taxTotal += lineTax;

        return {
          name: item.name,
          unitPrice,
          quantity,
          taxPercentage,
          total: lineTotal,
        };
      });

      const total = subtotal + taxTotal;

      // Assign normalized items if provided, else normalize existing
      invoice.items = normalizedItems;
      invoice.subtotal = subtotal;
      invoice.taxTotal = taxTotal;
      invoice.total = total;

      const updatedInvoice = await invoice.save();
      res.json(updatedInvoice);
    } else {
      res.status(404).json({ message: "Invoice not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Delete Invoice
// @route DELETE /api/invoices/:id
// @access Private

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
