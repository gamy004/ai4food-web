import File from "~~/models/File";

export const useFilePresenter = () => {
  const config = useRuntimeConfig();

  const cdnURL = config.public.cdnUrl || "";

  const getFileSource = (file: File): string =>
    cdnURL.length ? `${cdnURL}/${file.fileKey}` : file.fileSource;

  return {
    getFileSource,
  };
};
