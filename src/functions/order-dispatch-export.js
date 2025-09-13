import baseExport from "./base-export";
import moment from "moment-timezone";

const exportDispatchOrderList = (records, allData) => {
  console.log("all data: ", allData);
  // console.log(records);

  let filename = `${allData?.customer?.name} - Order ${allData?.order_no} - Dispatched Items`;
  const cols = [
    { title: "Item" },
    { title: "Qty Ordered" },
    { title: "Dispatched" },
    { title: "Date" },
    // { title: "Status" },
  ];

  function fmtDate(date) {
    return moment(date, "YYYYMMDD").tz("Africa/Lagos").format("ll");
  }

  function fmtNum(num) {
    return num.toLocaleString("en-US");
  }

  let rowhtml = `
    <div style="display: flex; justify-content: space-between; width: 100%; gap: 20px; margin-bottom: 20px;">
  <div style="flex: 1; padding: 12px; border-right: 1px solid #eee;">
    <div style="margin: 0 0 8px 0; color: #212529; font-weight: 600;">
      <strong>Customer:</strong> <small>${allData?.customer?.name}</small>
    </div>
    <div style="margin: 0 0 8px 0; color: #495057;">
      <strong>Phone:</strong> <small>${allData?.customer?.phone}</small>
    </div>
    <div style="margin: 0 0 8px 0; color: #495057;">
      <strong>Order Date:</strong> <small>${allData?.order_date}</small>
    </div>
    <div style="margin: 0 0 8px 0; color: #495057;">
      <strong>Order No:</strong> <small>${allData?.order_no}</small>
    </div>
    <div style="margin: 0 0 0 0; color: #495057;">
      <strong>TP:</strong> <small>${allData?.tp}</small> 
    </div>
  </div>
  
</div>
  `;

  // <div style="flex: 1; padding: 12px; border-left: 1px solid #eee; border-radius: 4px;">
  //   <div style="margin: 0 0 8px 0; color: #212529; font-weight: 600;">
  //     Company: <small>${allData?.company.name}</small>
  //   </div>
  //   <div style="margin: 0 0 8px 0; color: #495057;">
  //     Address: <small>${allData?.company.address}</small>
  //   </div>
  //   <div style="margin: 0 0 0 0; color: #495057;">
  //     RC-No: <small>${allData?.company.rc_no}</small>
  //   </div>
  // </div>

  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    rowhtml += `
      <tr>
        <td>${item.product}</td>
        <td>${item?.order?.items[i]?.bundle_removed}</td>
        <td>${item.dispatched}</td>
        <td>${fmtDate(item.created)}</td>
      </tr>
    `;
    // for (let j = 0; j < order.items.length; j++) {
    //   const item = order.items[j];
    //   rowhtml += "<tr>";

    //   if (j === 0) {
    //     rowhtml += `
    //       <td rowspan="${order.items.length}">
    //         ${order.order_no}
    //       </td>
    //       <td rowspan="${order.items.length}">
    //         ${order.order_date}
    //       </td>
    //       <td rowspan="${order.items.length}">
    //         ${order.customer?.name}
    //       </td>
    //       <td rowspan="${order.items.length}">
    //         ${order.customer?.company}
    //       </td>
    //   `;
    //   }

    //   if (
    //     Number(item.bundle_removed ?? 0) >
    //     Number(item.sale_order_dispatched ?? 0)
    //   ) {
    //     rowhtml += `
    //       <td>${item.item?.name}</td>
    //       <td>${item.bundle_removed}</td>
    //       <td>${item.sale_order_dispatched}</td>
    //       <td>₦${fmtNum(Number(item.price ?? 0))}</td>
    //   `;
    //   }

    //   rowhtml += "</tr>";
    // }
  }

  let type = "print";
  baseExport(type, rowhtml, cols, filename);
};

export default exportDispatchOrderList;
