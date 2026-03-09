import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph } from "docx";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Generate chapter endpoint
app.post("/generate-chapter", async (req, res) => {
  const { title, genre, description, chapterNumber, previousContent } = req.body;

  if (!title || !genre) {
    return res.status(400).json({ error: "Missing title or genre" });
  }

  const prompt = previousContent
    ? `Continue the story of "${title}" in Chapter ${chapterNumber}. Previous chapter:\n${previousContent}\nGenerate the next chapter in the same style, keeping it engaging and connected.`
    : `Write Chapter 1 of a ${genre} book titled "${title}". Include this description: "${description}". Make it engaging and suitable for readers of all ages.`;

  try {
    const response = await ai.models.generateContent({
      model: process.env.AI_MODEL,
      contents: prompt
    });

    const text =
      response.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    res.json({ chapter: text });
  } catch (error) {
    console.error("Error generating chapter:", error);
    res.status(500).json({ error: "AI call failed" });
  }
});

// Download book endpoint
app.post("/download-book", async (req, res) => {
  const { book, format } = req.body; // book is the text string, format is 'pdf', 'docx', or 'txt'

  if (!book || book.trim() === "") {
    return res.status(400).json({ error: "Book content is empty" });
  }

  try {
    if (format === "txt") {
      res.setHeader("Content-Disposition", "attachment; filename=book.txt");
      res.send(book);
    } else if (format === "pdf") {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=book.pdf");

      doc.pipe(res);

      // Split text by double newline for paragraphs
      const sections = book.split("\n\n");
      sections.forEach((section) => {
        const trimmed = section.trim();
        if (trimmed.toLowerCase().startsWith("chapter")) {
          doc.moveDown();
          doc.fontSize(18).font("Times-Bold").text(trimmed, { align: "center" });
          doc.moveDown(0.5);
        } else {
          doc.fontSize(12).font("Times-Roman").text(trimmed, { align: "left", paragraphGap: 10 });
          doc.moveDown();
        }
      });

      doc.end();
    } else if (format === "docx") {
      const paragraphs = book.split("\n\n").map((para) => new Paragraph(para));
      const docxDoc = new Document({ sections: [{ children: paragraphs }] });

      const buffer = await Packer.toBuffer(docxDoc);
      res.setHeader("Content-Disposition", "attachment; filename=book.docx");
      res.send(buffer);
    } else {
      res.status(400).json({ error: "Unsupported format" });
    }
  } catch (err) {
    console.error("Download failed:", err);
    res.status(500).json({ error: "Download failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});