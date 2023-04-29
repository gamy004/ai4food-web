import { v4 } from "uuid";

export interface PresignedPostData {
  file: File;
  uploadObject: Blob;
  prefix: string;
}

export interface PresignedOutput {
  url: string;
  fields: PresignedFields;
}

export interface PresignedFields {
  ContentType: string;
  ACL: string;
  "X-Amz-Algorithm": string;
  "X-Amz-Credential": string;
  "X-Amz-Date": string;
  key: string;
  Policy: string;
  "X-Amz-Signature": string;
}

export type PresignedFieldKey = keyof PresignedFields;

export type UpsertFileData = {
  id?: string;
  fileKey?: string;
  fileName?: string;
  fileSource?: string;
  fileContentType?: string;
  fileSize?: number;
};

export const useUpload = () => {
  const { post } = useRequest();

  const uploadFile = async (
    presignedPostData: PresignedPostData
  ): Promise<UpsertFileData> => {
    const { prefix, file, uploadObject } = presignedPostData;

    const fileName = file.name;
    const originalFileExt = fileName.split(".").pop();
    const savedFileName = `${v4()}.${originalFileExt}`;

    const fileKey = `${prefix}/${savedFileName}`;
    const fileSize = file.size;
    const fileContentType = file.type;

    const data = await post<PresignedOutput>("/s3/presigned", {
      key: fileKey,
      contentType: fileContentType,
    });

    const formData = new FormData();

    Object.keys(data.fields).forEach((fieldKey) => {
      formData.append(fieldKey, data.fields[fieldKey]);
    });

    formData.append("file", uploadObject, fileKey);

    const response = await fetch(data.url, {
      body: formData,
      method: "post",
    });

    if (response.ok) {
      const fileSource = `${data.url}${data.fields.key}`;

      const uploadedFile = {
        fileKey,
        fileName,
        fileContentType,
        fileSize,
        fileSource,
      };

      return uploadedFile;
    } else {
      console.log(`upload to provider failed with status ${response.status}`);

      throw new Error("Upload to provider failed");
    }
  };

  return {
    uploadFile,
  };
};
