import baseExport from "./base-export";
import moment from "moment-timezone";

const exportSaleDispatchLog = (type, datatable, rows, cols, tbType) => {
  let records = datatable.getSelectedRows();
  if (!records?.length) {
    records = rows;
  }

  function fmtDate(date) {
    return moment(date, "YYYYMMDD").tz("Africa/Lagos").format("ll");
  }

  const filename = "Sale Order Dispatch Log";

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
      rowhtml += `
      <tr>
        <td>
          ${fmtDate(item.order_date)}
        </td>
        <td>
          ${fmtDate(item.created)}
        </td>
        <td>
          ${item.customer_name}
        </td>
        <td>
          ${item.order_no}
        </td>
        <td>
          ${item.product}
        </td>
        <td>
          ${item.dispatched}
        </td>
      </tr>
      `;
    });

    // order_date
    // created
    // customer_name
    // order_no
    // product
    // dispatched

    baseExport(type, rowhtml, cols, filename);
  }
};

export default exportSaleDispatchLog;
