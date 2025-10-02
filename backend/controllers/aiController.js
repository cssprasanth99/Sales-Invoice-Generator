const { GoogleGenAI } = require("@google/genai");
const Invoice = require("../models/Invoice");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const parseInvoiceFromText = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }
  try {
    const prompt = `Your are an expert invoice data extraction AI, Analyse the following text and extract the relevant information to create an invoice.The output MUST be a valid JSON object.
    
    The JSON object should have the following structure: 
    {
        "clientName":"string",
        "email":"string (if available)",
        "address":"string (if available)",
        "items":[
        {
            "name":"string",
            "unitPrice":"number",
            "quantity":"number",
        }
        ]
    }

    Here is the text to parse:
    ----- TEXT START --------
    ${text}
    ----- TEXT END ----------

    Extract the data and provide only the JSON obejct.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: prompt,
    });
    let responseText = response.text;
    console.log("responseText", responseText);
    if (typeof responseText !== "string") {
      if (typeof response.text === "function") {
        responseText = response.text();
      } else {
        throw new Error("Invalid response format");
      }
    }

    const cleanedJSON = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedData = JSON.parse(cleanedJSON);
    res.status(200).json(parsedData);

    // // Extract JSON even if wrapped in markdown code fences or extra text
    // let jsonCandidate = responseText;
    // // Prefer fenced code block: ```json ... ``` or ``` ... ```
    // const fenced = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    // if (fenced && fenced[1]) {
    //   jsonCandidate = fenced[1];
    // }
    // // Clean remnants of alternative fences like '''json ... '''
    // jsonCandidate = jsonCandidate
    //   .replace(/^\s*json\s*/i, "")
    //   .replace(/'''json/gi, "")
    //   .replace(/'''/g, "")
    //   .trim();
    // // If still contains surrounding text, slice between first { and last }
    // const firstBrace = jsonCandidate.indexOf("{");
    // const lastBrace = jsonCandidate.lastIndexOf("}");
    // if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    //   jsonCandidate = jsonCandidate.slice(firstBrace, lastBrace + 1);
    // }
    // console.log("cleanedJSON", jsonCandidate);
    // let invoiceData;
    // try {
    //   invoiceData = JSON.parse(jsonCandidate);
    // } catch (parseErr) {
    //   console.error("Failed to JSON.parse cleaned content:", parseErr);
    //   console.error("Cleaned content was:\n", jsonCandidate);
    //   return res.status(500).json({
    //     message: "Failed to parse invoice",
    //     details: parseErr.message,
    //   });
    // }
    // // Success

    // const cleanedJSON = jsonCandidate; // keep for backward compatibility in logs if needed

    // res.status(200).json(invoiceData);
  } catch (error) {
    console.error("Error parsing invoice from text:", error);
    res.status(500).json({ message: "Failed to parse invoice" });
  }
};

const generateRemainderEmail = async (req, res) => {
  const { invoiceId } = req.body;

  if (!invoiceId) {
    res.status(400).json({ message: "Invoice Id is required" });
  }

  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const prompt = `
      You are a professional and polite accounting assistant. Write a friendly remainder email to a client about overdue or upcoming invoice payment.

      Use the following details to personalize the email:
      - Client Name:${invoice.billTo.clientName}
      - Invoice Number:${invoice.invoiceNumber}
      - Amount Due:${invoice.total.toFixed(2)}
      - Due Date:${new Date(invoice.dueDate).toLocaleDateString()}

      The tone should be friendly but clear, keep it concise, Start the "Subject:"
      `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: prompt,
    });

    res.status(200).json({ remainderText: response.text });
  } catch (error) {
    console.error("Error parsing invoice from text:", error);
    res.status(500).json({ message: "Failed to parse invoice" });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id });

    if (invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }

    //Process and Summarize
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
    const unpaidInvoices = invoices.filter((inv) => inv.status !== "Paid");
    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.total, 0);
    const totalOutstanding = unpaidInvoices.reduce(
      (acc, inv) => acc + inv.total,
      0
    );
    const dataSummary = `
    -Total Invoices: ${totalInvoices}
    -Total Paid Invoices: ${paidInvoices.length}
    -Total Unpaid/pending Invoices: ${unpaidInvoices.length}
    -Total Revenue from paid invoices: ${totalRevenue.toFixed(2)}
    -Total Outstanding from unpaid/pending invoices: ${totalOutstanding.toFixed(
      2
    )}
    -Recent invoices (last 5): ${invoices
      .slice(0, 5)
      .map(
        (inv) =>
          `Invoice ${inv.invoiceNumber} for ${inv.total.toFixed(
            2
          )} with status ${inv.status}`
      )
      .join(", ")}
    `;

    const prompt = `
    Your are a friendly and insight analyst for a small business owner. 
    Based on the following summary of their invoice date, provide 2-3 days concise and actionable insights.
    Each insight should be a short string a JSON array.
    The insights should be encouraging and helpful. Do not just repeat the date.
    For example, if there is a high outstanding amount, suggest sending reminders. If revenue is high, be encouraging.

    Data Summary:
    ${dataSummary}

    Return your response as a valid JSON object witha single key "insights" that contains an array of strings.
    Example format: {"insights":["Your revenue is looking strong this month!", "You have 5 overdue invoices. Consider sending remainders to get paid faster"]}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: prompt,
    });

    console.log("response", response);

    const responseText = response.text;

    const cleanedJSON = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsedDate = JSON.parse(cleanedJSON);

    res.status(200).json(parsedDate);
  } catch (error) {
    console.error("Error parsing invoice from text:", error);
    res.status(500).json({ message: "Failed to parse invoice" });
  }
};

module.exports = {
  parseInvoiceFromText,
  getDashboardSummary,
  generateRemainderEmail,
};
