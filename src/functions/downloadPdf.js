import html2pdf from "html2pdf.js";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import * as dialog from "@tauri-apps/plugin-dialog";
import { downloadDir } from "@tauri-apps/api/path";

const downloadPdf = async (contentToPdf, filename = "document") => {
  if (!contentToPdf) return;
  let nowDate = new Date().toISOString().slice(0, 10);
  filename = `${filename}.pdf`;
  const options = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };

  if (window?.__TAURI_INTERNALS__) {
    let dwdir = await downloadDir();
    const filePath = await dialog.save({
      defaultPath: dwdir + "/" + filename,
    });

    // await writeFile(filePath, uint8Array, {
    //   baseDir: BaseDirectory.AppConfig,
    // });

    html2pdf()
      .set(options)
      .from(contentToPdf)
      .outputPdf("blob") // Output as Blob
      .then(async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await writeFile(filePath, uint8Array, {
          baseDir: BaseDirectory.AppConfig,
        });
      })
      .catch((err) => {
        alert("Failed to generate PDF. Please try again.");
      });
  } else {
    html2pdf()
      .set(options)
      .from(contentToPdf)
      .save()
      .catch((err) => {
        alert("Failed to generate PDF. Please try again.");
      });
  }
};

export default downloadPdf;
