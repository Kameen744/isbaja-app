import baseExport from "./base-export";
import moment from "moment-timezone";

const exportPendingOrder = (type, datatable, rows, filename) => {
  let records;
  if (datatable) {
    records = datatable.getSelectedRows();
  } else {
    records = rows;
  }

  const cols = [
    { title: "Order No" },
    { title: "Date" },
    { title: "Customer" },
    { title: "Company" },
    { title: "Item" },
    { title: "Qty" },
    { title: "Dispatched" },
    { title: "Price" },
  ];

  function fmtDate(date) {
    return moment(date, "YYYYMMDD").tz("Africa/Lagos").format("ll");
  }

  function fmtNum(num) {
    return num.toLocaleString("en-US");
  }

  // const filename = "Pending orders";

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

    for (let i = 0; i < records.data.length; i++) {
      const order = records.data[i];
      for (let j = 0; j < order.items.length; j++) {
        const item = order.items[j];
        rowhtml += "<tr>";

        if (j === 0) {
          rowhtml += `
            <td rowspan="${order.items.length}">
              ${order.order_no}
            </td>
            <td rowspan="${order.items.length}">
              ${order.order_date}
            </td>
            <td rowspan="${order.items.length}">
              ${order.customer?.name}
            </td>
            <td rowspan="${order.items.length}">
              ${order.customer?.company}
            </td>
        `;
        }

        if (
          Number(item.bundle_removed ?? 0) >
          Number(item.sale_order_dispatched ?? 0)
        ) {
          rowhtml += `
            <td>${item.item?.name}</td>
            <td>${item.bundle_removed}</td>
            <td>${item.sale_order_dispatched}</td>
            <td>₦${fmtNum(Number(item.price ?? 0))}</td>
        `;
        }

        rowhtml += "</tr>";
      }
    }

    baseExport(type, rowhtml, cols, filename);
  }
};

export default exportPendingOrder;
