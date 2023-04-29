import File from "~~/models/File";

export const useFilePresenter = () => {
  const { post } = useRequest();
  const config = useRuntimeConfig();

  const cdnURL = config.public.cdnUrl || "";

  const getFileSource = (file: File): string =>
    cdnURL.length ? `${cdnURL}/${file.fileKey}` : file.fileSource;

  const downloadFile = async (file: File) => {
    const presignedUrl = await post<string>("/s3/presigned-url", {
      key: file.fileKey,
      fileName: file.fileName,
    });

    const link = document.createElement("a");

    link.setAttribute("href", presignedUrl);
    link.setAttribute("download", file.fileName);
    link.style.display = "none";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return {
    getFileSource,
    downloadFile,
  };
};
