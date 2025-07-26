import baseExport from "./base-export";

const exportWareHouseRec = (
  type,
  records,
  cols,
  title,
  from = null,
  to = null
) => {
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

    records.forEach((rec) => {
      rowhtml += `
      <tr>
        <td>${rec.created}</td>
        <td>${rec.item?.name}</td>
        <td>${rec.bundle_added}</td>
        <td>${rec.bundle_removed}</td>
        <td>${rec.unit_added}</td>
        <td>${rec.unit_removed}</td>
        <td>${rec.weight}</td>
        <td>${rec.price.toLocaleString("en-US")}</td>
        <td>${rec.sale_order_dispatched}</td>
        <td>${rec.add_note}</td>
        <td>${rec.remove_note}</td>
      </tr>
      `;
    });

    baseExport(type, rowhtml, cols, filename);
  }
};

export default exportWareHouseRec;

/* 
  
  <tr v-for="rec in wareHouseData.data" :key="rec.id">
  <td>{{ rec.created }}</td>
  <td>{{ rec.item?.name }}</td>
  <td>{{ rec.bundle_added }}</td>
  <td>{{ rec.bundle_removed }}</td>
  <td>{{ rec.unit_added }}</td>
  <td>{{ rec.unit_removed }}</td>
  <td>{{ rec.weight }}</td>
  <td>{{
    store.fmtNum ? store.fmtNum(rec.price) : rec.price
  }}</td>
  <td>{{ rec.sale_order_dispatched }}</td>
  <td>{{ rec.add_note }}</td>
  <td>{{ rec.remove_note }}</td>
</tr> 

*/
