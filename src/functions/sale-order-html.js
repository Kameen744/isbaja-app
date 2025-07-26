const SaleOrderReceiptHTML = (data) => {
  const filename = "Sale Order";
  let rowhtml = "";
  rowhtml += `
    <div style="display:flex; justify-content: space-between; width:400px; padding: 10px; padding-bottom: 0px;">
      <div style="border-right: 1px solid black; padding-right: 20px; flex: 2;">
        <h6 style="text-align:right; 20px;">
          RC: ${
            data.company?.rc_no ?? " "
          } <small style="font-size: 10px;">Rcpt No: ${
    data?.order_no ?? " "
  }</small>
        </h6>
        <div>
          <img src="/isb.png" alt="ISBJ" style="max-width: 230px; height: auto;">
        </div>
      </div>
      <div style="padding-left: 15px; padding-top: 0px; max-width: 180px;">
        <div><strong><b style="font-size:10px;">ADDRESS:</b> </strong></div>
        <div style="font-size:10px;">${data.company.address}</div>
        <div style="margin-top: 2px;"><strong><b style="font-size:10px;">EMAIL:</b> </strong></div>
        <div style="font-size:10px;">${
          data.company?.email ?? "contactus@isbaja.com"
        }</div>
      </div>
    </div>
    
    <hr style="margin: 0px; padding: 0px;" />

    <div style="display:flex; justify-content: center; width: 370px; margin-left: 10px; margin-right: 10px; margin-top: 10px;">
      <div style="margin-left: 30%; margin-right: 30%;">
        <img src="/authload.png" alt="ISBJ" style="width: 100px; height: auto; margin-left: 0px; margin-right: 0px;">
      </div>
    </div>
    
    <div style="margin-top: 10px; margin-bottom: 20px; width: 380px;">
        <div style="display:flex; justify-content: between; margin-right: 10px; margin-left:20px;">
          <div style="flex: 3;">
            <b style="font-size: 10px;">Customer's Name:</b> 
            <span style="text-decoration: underline; font-size: 10px;">${
              data?.customer?.name
            }</span>
          </div>
          <div style="flex: 1;">
            <b style="font-size: 10px;">Date:</b>
            <span style="text-decoration: underline; font-size: 10px;">
            ${data.order_date}
            </span>
          </div>
        </div>
        <div style="display:flex; justify-content: between; margin-top: 5px; margin-right: 10px; margin-left: 20px;">
          <div style="flex: 3;">
            <b style="font-size: 10px;">Vehicle No:
          </b>
            <span style="text-decoration: underline; font-size: 10px;">${
              data?.vehicle_no ?? " "
            }</span>
          </div>
          <div style="flex: 1;"><b style="font-size: 10px;">T.P:</b> <span style="text-decoration: underline; font-size: 10px;">${
            data?.tp ?? " "
          }</span></div>
        </div>
    </div>
  `;
  rowhtml += `<div style="display:flex; justify-content: space-between;">
      <table style="width: 360px; margin-left: 20px; margin-right: 10px; margin-bottom: 20px;" cellpadding="0" cellcpacing="0">
      <thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact;">
    `;

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

    total += price * Number(data.items[i].bundle_removed);
  }

  rowhtml += `
    <tr>
      <td colspan="3" class="total">TOTAL</td>
      <td class="total">₦${total.toLocaleString("en-US")}</td>
    </tr>
  `;

  rowhtml += `<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px; border: 0.5px solid silver; padding-left: 6px;}th{padding:8px 6px; border: 0.5px solid silver;}tr:nth-child(2n-1){background:#f7f7f7; }.total{text-align: center; font-weight: bolder; font-size: 15px;}</style>
  </tbody></table></div>`;

  return rowhtml;
};

export default SaleOrderReceiptHTML;
