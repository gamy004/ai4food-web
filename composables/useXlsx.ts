import { read, utils } from "xlsx";

export const useXlsx = () => {
  const workbook = ref(null);

  return {
    workbook,

    async readFile (e) {
      const file = e.target.files[0];

      const data = await file.arrayBuffer();

      /* data is an ArrayBuffer */
      workbook.value = read(data);

      return workbook;
    },

    readSheetJson (sheetName) {
      if (workbook && workbook.value) {
        const { Sheets = {} } = workbook.value;

        if (Sheets[sheetName]) {
          return utils.sheet_to_json(Sheets[sheetName]);
        }
      }
    }
  };
};
