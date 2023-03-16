import { read, utils } from "xlsx";

export const useXlsx = () => {
  const workbook = ref(null);

  return {
    workbook,

    async readFile(e) {
      const file = e.target.files[0];

      const data = await file.arrayBuffer();

      /* data is an ArrayBuffer */
      workbook.value = read(data);

      workbook.file = file;

      return workbook;
    },

    readSheetJson(sheetName) {
      if (workbook && workbook.value) {
        const { Sheets = {} } = workbook.value;

        if (Sheets[sheetName]) {
          return utils.sheet_to_json(Sheets[sheetName]);
        }
      }
    },

    setWidthColumn(ws, header, data, fixedLengthHeader = {}) {
      const objectMaxLength = header.map(
        (h) => fixedLengthHeader[h] || h.length
      );

      for (let i = 0; i < data.length; i++) {
        header.forEach((key, j) => {
          if (!fixedLengthHeader[key]) {
            const valueString = data[i][key];
            objectMaxLength[j] =
              objectMaxLength[j] >= valueString.length
                ? objectMaxLength[j]
                : valueString.length;
          }
        });
      }

      ws["!cols"] = objectMaxLength.map((obj) => ({ width: obj }));

      return ws;
    },
  };
};
