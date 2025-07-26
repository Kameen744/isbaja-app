import baseExport from "./base-export";
import moment from "moment-timezone";

const exportSaleOrder = (type, datatable, rows, cols, tbType) => {
  let records = datatable.getSelectedRows();
  if (!records?.length) {
    records = rows;
  }

  function fmtDate(date) {
    return moment(date, "YYYYMMDD").tz("Africa/Lagos").format("ll");
  }

  const filename = "Sale Order Log";

  if (type === "csv" || type === "txt") {
    let result = "";
    const coldelimiter = ",";
    const linedelimiter = "\n";
    records.map((item) => {
      cols
        .filter((d) => !d.hide && d.field != "actions")
        .map((d, index) => {
          if (index > 0 && d.field != "actions") {
            result += coldelimiter;
          }
          let val = d.field
            .split(".")
            .reduce((acc, part) => acc && acc[part], item);

          let line = "";
          if (d.field == "product") {
            val = "items"
              .split(".")
              .reduce((acc, part) => acc && acc[part], item);

            for (let i = 0; i < val.length; i++) {
              line += val[i].item.name + " " + val[i].bundle_removed + " | ";
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
      rowhtml += `
      <td>
        ${item?.name ? item.name : item.customer.name}
      </td>
      `;

      rowhtml += "<td>";

      for (let i = 0; i < item.items.length; i++) {
        let prod = item.items[i];
        let prodName = null;
        if (prod?.item?.name) {
          prodName = prod.item.name;
        } else {
          prodName = "pd name";
        }
        rowhtml += `
            ${prodName} - ${prod.bundle_removed}
          <br>
        `;
      }

      rowhtml += "</td>";

      rowhtml += `<td>${item.order_no}</td>`;
      rowhtml += `
      <td>${item.tp ?? "system"}</td>
      <td>${item.created_by ?? "system"}</td>
      <td>${fmtDate(item.order_date)}</td>
      `;

      rowhtml += "</tr>";
      // Object.keys(item).forEach((k) => {
      //   rowhtml += `<pre>${k}</pre>`;
      // });
    });

    baseExport(type, rowhtml, cols, filename);
  }
};

export default exportSaleOrder;
