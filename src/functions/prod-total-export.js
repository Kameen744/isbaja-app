import baseExport from "./base-export";

const exportProdTotal = (
  type,
  records,
  cols,
  title,
  from = null,
  to = null
) => {
  let filename = title;
  const toLoc = (val) => val.toLocaleString("en-US");
  if (from) {
    filename += " from " + from;
  }
  if (to) {
    filename += " to " + to;
  }
  if (type === "csv" || type === "txt") {
    let result = "";
    // const coldelimiter = ",";
    // const linedelimiter = "\n";

    // records.map((item) => {
    //   cols
    //     .filter((d) => !d.hide)
    //     .map((d, index) => {
    //       if (index > 0) {
    //         result += coldelimiter;
    //       }
    //       const val = d.field
    //         .split(".")
    //         .reduce((acc, part) => acc && acc[part], item);
    //       result += val;
    //     });
    //   result += linedelimiter;
    // });

    // baseExport(type, result, cols, filename);
  } else if (type === "print") {
    let rowhtml = "";

    for (const [whs, whsData] of Object.entries(records)) {
      let index = 0;
      for (const [item, dt] of Object.entries(whsData)) {
        rowhtml += "<tr>";

        if (index === 0) {
          rowhtml += `<td rowspan="${Object.keys(whsData).length}">
            ${whs}
          </td>`;
        }

        rowhtml += `
          <td>${item}</td>
          <td>${toLoc(
            Number(dt.total_prod_bundle_added) + Number(dt.total_transfer_in)
          )}</td>
          <td>${toLoc(
            Number(dt.total_prod_bundle_removed) + Number(dt.total_transfer_out)
          )}</td>
          <td>${toLoc(Number(dt.total_prod_bundle_dispatched))}</td>
          <td>₦ ${toLoc(Number(dt.total_prod_amount_sold))}</td>
          <td>₦ ${toLoc(Number(dt.total_prod_amount_dispatched))}</td>
          <td>${toLoc(
            Number(dt.total_prod_bundle_added) +
              Number(dt.total_transfer_in) -
              (Number(dt.total_prod_bundle_dispatched) +
                Number(dt.total_transfer_out))
          )}
          </td>
        `;
        rowhtml += "</tr>";
        index++;
      }
    }

    baseExport(type, rowhtml, cols, filename);
  }
};

export default exportProdTotal;
