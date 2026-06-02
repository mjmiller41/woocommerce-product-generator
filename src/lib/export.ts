import { HistoryItem } from "../types";

export const exportToCSV = (items: HistoryItem[]) => {
  if (!items || items.length === 0) return;

  const headers = [
    "ID", "Type", "Name", "Short description", "Description", 
    "Published", "Is featured?", "Visibility in catalog", "Tax status", 
    "In stock?", "Sold individually?", "Weight (lbs)", "Length (in)", "Width (in)", "Height (in)",
    "Allow customer reviews?", "Categories", "Tags", "Images",
    "Attribute 1 name", "Attribute 1 value(s)", "Attribute 1 visible", "Attribute 1 global",
    "Attribute 2 name", "Attribute 2 value(s)", "Attribute 2 visible", "Attribute 2 global"
  ];

  // Group items by analysis name and create grouped items if there are multiple variations?
  // Let's just create simple products for each history item or use the last analysis for all.
  
  const escapeCSV = (str: string | undefined | null) => {
    if (!str) return '""';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = items.map((item, idx) => {
    const analysis = item.analysis;
    if (!analysis) return "";

    const type = "simple";
    const name = analysis.name || "Untitled Product";
    const shortDesc = analysis.shortDescription || "";
    const description = analysis.description || "";
    const published = "1";
    const featured = "0";
    const visibility = "visible";
    const taxStatus = "taxable";
    const inStock = "1";
    const soldIndividually = "0";
    const weight = analysis.weightLbs || "";
    const length = analysis.lengthIn || "";
    const width = analysis.widthIn || "";
    const height = analysis.heightIn || "";
    const reviews = "1";
    const categories = analysis.category || analysis.productType || "";
    const tags = analysis.tags || "";
    
    // Instead of using local data uris for images in a real export, you'd have urls.
    // For this prototype, we just export what we have (even if data URIs are huge).
    const images = "Generated Image Data Included";

    const attr1Name = analysis.colors && analysis.colors.length > 0 ? "Color" : "";
    const attr1Values = analysis.colors ? analysis.colors.join(", ") : "";
    const attr2Name = analysis.material ? "Material" : "";
    const attr2Values = analysis.material || "";

    return [
      idx + 1, type, name, shortDesc, description,
      published, featured, visibility, taxStatus,
      inStock, soldIndividually, weight, length, width, height,
      reviews, categories, tags, images,
      attr1Name, attr1Values, attr1Name ? "1" : "0", attr1Name ? "1" : "0",
      attr2Name, attr2Values, attr2Name ? "1" : "0", attr2Name ? "1" : "0"
    ].map(val => escapeCSV(String(val))).join(",");
  });

  const csvContent = headers.join(",") + "\n" + rows.filter(r => r).join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `woocommerce_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
