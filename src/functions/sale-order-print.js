import basePrint from "./base-print";

const printSaleOrder = (data) => {
  const filename = "Sale Order";
  let rowhtml = "";
  rowhtml += `
    <div style="display:flex; justify-content: space-between; width:100%;">
      <div style="border-right: 1px solid black; padding-right: 20px; flex: 2;">
        <h6 style="text-align:right; 20px;">
          RC: ${
            data.company?.rc_no ?? " "
          } <small style="font-size: 10px;">Rcpt No: ${
    data?.order_no ?? " "
  }</small>
        </h6>
        <div>
          <img src="/isb.png" alt="ISBJ" style="width: 100%; height: auto;">
        </div>
      </div>
      <div style="padding-left: 15px; padding-top: 30px; max-width: 200px;">
        <div><stron><b>ADDRESS:</b> </stron></div>
        <div>${data.company.address}</div>
        <div style="margin-top: 15px;"><stron><b>EMAIL:</b> </stron></div>
        <div>${data.company?.email ?? "contactus@isbaja.com"}</div>
      </div>
    </div>
    <hr />
    <div style="display:flex; justify-content: center;">
      <div>
        <img src="/authload.png" alt="ISBJ" style="width: 150px; height: auto;">
      </div>
    </div>
    
    <div style="margin-top: 30px; margin-bottom: 20px;">
        <div style="display:flex; justify-content: between;">
          <div style="flex: 3;">
            <b>Customer's Name:</b> 
            <span style="text-decoration: underline;">${
              data?.customer?.name
            }</span>
          </div>
          <div style="flex: 1;">
            <b>Date:</b>
            <span style="text-decoration: underline;">${data.order_date}</span>
          </div>
        </div>
        <div style="display:flex; justify-content: between; margin-top: 20px;">
          <div style="flex: 3;"><b>Vehicle No:</b>
          <span style="text-decoration: underline;">${
            data?.vehicle_no ?? " "
          }</span>
          </div>
          <div style="flex: 1;"><b>T.P:</b> <span style="text-decoration: underline;">${
            data?.tp ?? " "
          }</span></div>
        </div>
    </div>
  `;
  rowhtml +=
    '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';

  rowhtml += `
    <th style="width: 10px;">S/N</th>
    <th>ITEM</th>
    <th>QTY</th>
    <th>PRICE</th>
    </tr></thead>
    <tbody>
  `;

  let total = 0;

  for (let i = 0; i < data.items.length; i++) {
    let price = 0;

    if (data.items[i].price > 0) {
      price = data.items[i].price;
    } else {
      price = data.items[i].item.bundle_price;
    }

    rowhtml += `
      <tr>
      <td>${i + 1}</td>
      <td>${data.items[i].item.name}</td>
      <td>${data.items[i].bundle_removed}</td>
      <td>₦${price.toLocaleString("en-US")}</td>
      </tr>
    `;

    // total += price;
    total += price * Number(data.items[i].bundle_removed);
  }

  rowhtml += `
    <tr>
      <td colspan="3" class="total">TOTAL</td>
      <td class="total">₦${total.toLocaleString("en-US")}</td>
    </tr>
  `;

  // records.map((item) => {
  //   rowhtml += "<tr>";
  //   rowhtml += `
  //     <td>
  //       ${item?.name ? item.name : item.customer.name}
  //     </td>
  //     `;
  //   for (let i = 0; i < item.items.length; i++) {
  //     let prod = item.items[i];
  //     let prodName = null;
  //     if (prod?.item?.name) {
  //       prodName = prod.item.name;
  //     } else {
  //       prodName = "pd name";
  //     }
  //     rowhtml += `
  //         <td>
  //           ${prodName} - ${prod.bundle_removed}
  //         </td>
  //       `;
  //   }
  //   rowhtml += `<td>${item.status}</td><td>${item.date}</td>`;
  //   rowhtml += "</tr>";
  // });

  rowhtml +=
    "<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px; border: 0.5px solid silver; padding-left: 6px;}th{padding:8px 6px; border: 0.5px solid silver;}tr:nth-child(2n-1){background:#f7f7f7; }.total{text-align: center; font-weight: bolder; font-size: 15px;} </style>";
  rowhtml += "</tbody></table>";

  basePrint(rowhtml, filename);
};

export default printSaleOrder;
