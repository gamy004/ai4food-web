// import Compressor from "compressorjs";
import ImageCompressor from "js-image-compressor";

export interface ReadImageAsBase64Output {
  originalImage: File;
  compressedImage: Blob;
  dataURL: string | ArrayBuffer;
}

export interface ReadFileAsBase64Output {
  original: File;
  compressed: Blob;
  dataURL: string | ArrayBuffer;
}

export const useFileReader = () => {
  const readImageAsBase64 = (
    fileList: FileList,
    compressorOptions = {}
  ): Promise<ReadImageAsBase64Output[]> => {
    return new Promise((resolve, reject) => {
      const output: ReadImageAsBase64Output[] = [];
      const convertedFileList = Array.from(fileList);

      if (!convertedFileList.length) {
        resolve(output);
      }

      convertedFileList.forEach(async (file: File) => {
        new ImageCompressor({
          file,
          quality: 0.8,
          mimeType: "image/jpeg",
          maxWidth: 2000,
          maxHeight: 2000,
          convertSize: Infinity,
          loose: true,
          redressOrientation: false,
          success: function (result) {
            console.log("result:", result);
            console.log("Image size after compression:", result.size);
            console.log("mime type:", result.type);
            console.log(
              "Actual compression ratio:",
              (((file.size - result.size) / file.size) * 100).toFixed(2) + "%"
            );

            const reader = new FileReader();

            reader.onload = (e) => {
              output.push({
                originalImage: file,
                compressedImage: result,
                dataURL: e.target.result,
              });

              if (output.length === fileList.length) {
                resolve(output);
              }
            };

            reader.onerror = (e) => {
              reject(e);
            };

            reader.readAsDataURL(file);
          },

          ...compressorOptions,
        });
      });
    });
  };

  const readFileAsBase64 = (file: File): Promise<ReadFileAsBase64Output> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (e) {
        resolve({
          original: file,
          compressed: new Blob([file], { type: file.type }),
          dataURL: e.target.result,
        });
      };
      reader.onerror = (e) => {
        reject(e);
      };
    });
  };

  return {
    readImageAsBase64,
    readFileAsBase64,
  };
};
