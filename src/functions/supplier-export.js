import baseExport from "./base-export";

const exportSupplier = (type, datatable, rows, cols, tbType) => {
  let records = datatable.getSelectedRows();
  if (!records?.length) {
    records = rows;
  }

  const filename = "Customers Log";

  if (type === "csv" || type === "txt") {
    let result = "";
    const coldelimiter = ",";
    const linedelimiter = "\n";
    records.map((item) => {
      cols
        .filter((d) => !d.hide)
        .map((d, index) => {
          if (index > 0) {
            result += coldelimiter;
          }
          const val = d.field
            .split(".")
            .reduce((acc, part) => acc && acc[part], item);
          let line = "";
          if (d.field == "produced") {
            for (let i = 0; i < val.length; i++) {
              line += val[i].item.name + " " + val[i].bundle_added;

              if (item?.bundle_measure && item.bundle_measure != "") {
                line += " " + val[i].item.bundle_measure + "(s)";
              }
            }
            result += line;
          } else if (d.field == "used") {
            for (let i = 0; i < val.length; i++) {
              line += val[i].item.name + " " + val[i].bundle_removed;
              if (item?.bundle_measure && item.bundle_measure != "") {
                line += " " + val[i].item.bundle_measure + "(s)";
              }
            }
            result += line;
          } else {
            result += val;
          }
        });
      result += linedelimiter;
    });

    baseExport(type, result, cols, filename);
  } else if (type === "print") {
    let rowhtml = "";

    records.map((item) => {
      rowhtml += "<tr>";
      cols
        .filter((d) => !d.hide)
        .map((d) => {
          if (d.field != "actions") {
            const val = d.field
              .split(".")
              .reduce((acc, part) => acc && acc[part], item);

            if (d.field == "produced") {
              rowhtml += "<td>";
              for (let i = 0; i < val.length; i++) {
                rowhtml += val[i].item.name + " - ";
                rowhtml += val[i].bundle_added;
                if (item?.bundle_measure && item.bundle_measure != "") {
                  rowhtml += " " + val[i].item?.bundle_measure + "(s)";
                }
                rowhtml += "<br>";
              }
              rowhtml += "</td>";
            } else if (d.field == "used") {
              rowhtml += "<td>";
              for (let i = 0; i < val.length; i++) {
                rowhtml += val[i].item.name + " - ";
                rowhtml += val[i].bundle_removed;
                rowhtml += " " + val[i].item?.bundle_measure + "(s)";
                rowhtml += "<br>";
              }
              rowhtml += "</td>";
            } else {
              rowhtml += "<td>" + val + "</td>";
            }
          }
        });
      rowhtml += "</tr>";
    });

    baseExport(type, rowhtml, cols, filename);
  }
};

export default exportSupplier;
