import downloadPdf from "./downloadPdf.js";

const basePrint = (table, filename) => {
  // PRINT

  // let rowhtml = `<style> @media print {
  //   button {
  //     display: none;
  //   }
  // }</style>
  // <p>
  // <button onclick='window.close()'>Close X</button>
  // <button onclick='window.print()'>Print</button>
  // </p>`;

  let rowhtml = "<p>" + filename + "</p>";

  rowhtml += table;
  downloadPdf(rowhtml, filename);
  // const screenWidth = window.screen.width;
  // const screenHeight = window.screen.height;

  // const winPrint = window.open(
  //   "",
  //   "",
  //   `left=0, top=0, width=${screenWidth * 0.7}, height=${
  //     screenHeight * 0.7
  //   }, toolbar=0, scrollbars=0, status=0`
  // );

  // const screenWidth = window.screen.width;
  // const screenHeight = window.screen.height;

  // const windowWidth = Math.floor(screenWidth * 0.7);
  // const windowHeight = Math.floor(screenHeight * 0.7);

  // const winPrint = window.open(
  //   "",
  //   "_blank",
  //   `width=${windowWidth},height=${windowHeight},left=${Math.floor(
  //     (screenWidth - windowWidth) / 2
  //   )},top=${Math.floor(
  //     (screenHeight - windowHeight) / 2
  //   )},resizable=yes,scrollbars=yes`
  // );

  // Ensure the window is not maximized

  // rowhtml = ` ${rowhtml}`;

  // winPrint.document.write("<title>" + filename + "</title>" + rowhtml);
  // // if (winPrint) {
  // winPrint.resizeTo(windowWidth, windowHeight);
  // winPrint.moveTo(
  //   Math.floor((screenWidth - windowWidth) / 2),
  //   Math.floor((screenHeight - windowHeight) / 2)
  // );
  // // }
  // winPrint.document.close();
  // winPrint.focus();
  // winPrint.onafterprint = () => {
  //   // winPrint.close();
  // };
  // setTimeout(() => {
  //   winPrint.print();
  // }, 3000);
};

export default basePrint;
