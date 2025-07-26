import baseExport from "./base-export";

const exportRawTotal = (type, records, cols, title, from = null, to = null) => {
  let filename = title;
  let toLoc = (val) => val.toLocaleString("en-US");
  if (from) {
    filename += " from " + from;
  }
  if (to) {
    filename += " to " + to;
  }
  if (type === "csv" || type === "txt") {
    let result = "";
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
            Number(dt.total_raw_bundle_added) + Number(dt.total_transfer_in)
          )}</td>
          <td>${toLoc(
            Number(dt.total_raw_bundle_removed) + Number(dt.total_transfer_out)
          )}</td>
          <td>${toLoc(
            Number(dt.total_raw_bundle_added) +
              Number(dt.total_transfer_in) -
              (Number(dt.total_raw_bundle_removed) +
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

export default exportRawTotal;
