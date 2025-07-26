import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import * as dialog from "@tauri-apps/plugin-dialog";
import { downloadDir } from "@tauri-apps/api/path";
import downloadPdf from "./downloadPdf.js";

const baseExport = (type, records, cols, filename) => {
  if (type === "csv" || type === "txt") {
    const coldelimiter = ",";
    const linedelimiter = "\n";
    let result = cols
      .filter((d) => !d.hide)
      .map((d) => {
        return d.title;
      })
      .join(coldelimiter);
    result += linedelimiter;
    result += records;

    if (result === null) return;

    if (type === "csv") {
      if (window?.__TAURI_INTERNALS__) {
        const csvBlob = new Blob([result], { type: "text/csv;charset=utf-8" });
        csvBlob.arrayBuffer().then(async (arrayBuffer) => {
          const dwdir = await downloadDir();
          const uint8Array = new Uint8Array(arrayBuffer);
          const filePath = await dialog.save({
            defaultPath: dwdir + "/" + filename + ".csv",
          });

          await writeFile(filePath, uint8Array, {
            baseDir: BaseDirectory.AppConfig,
          });
        });
      } else {
        var data =
          "data:application/csv;charset=utf-8," + encodeURIComponent(result);
        var link = document.createElement("a");
        link.setAttribute("href", data);
        link.setAttribute("download", filename + ".csv");
        link.click();
      }
    }
  } else if (type === "print") {
    let rowhtml = "<p>" + filename + "</p>";

    rowhtml +=
      '<table style="width: 100%;" cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; ">';
    cols
      .filter((d) => !d.hide)
      .map((d) => {
        if (d.field != "actions") {
          rowhtml += "<th>" + d.title + "</th>";
        }
      });
    rowhtml += "</tr></thead>";
    rowhtml += "<tbody>";
    rowhtml += records;

    rowhtml +=
      "<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px; border: 0.5px solid silver; padding-left: 6px;}th{padding:8px 6px; border: 0.5px solid silver;}tr:nth-child(2n-1){background:#f7f7f7; }</style>";
    rowhtml += "</tbody></table>";
    downloadPdf(rowhtml, filename);
  }
};

export default baseExport;
