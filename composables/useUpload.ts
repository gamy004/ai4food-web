import { v4 } from "uuid";
import { useRepo } from "pinia-orm";
import { ResponseErrorT } from "./useRequest";
import FileEntity from "~~/models/File";

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

export type UpsertFileData = {
    id?: string;
    fileKey?: string;
    fileName?: string;
    fileSource?: string;
    fileContentType?: string;
    fileSize?: number;
}

export const useUpload = () => {
  const { post } = useRequest();

  const uploadFile = async (presignedPostData: PresignedPostData): Promise<UpsertFileData> => {
    return new Promise((resolve, reject) => {
      console.log(presignedPostData);

      const {
        prefix,
        file,
        uploadObject
      } = presignedPostData;

      const fileName = file.name;
      const originalFileExt = fileName.split(".").pop();
      const savedFileName = `${v4()}.${originalFileExt}`;

      const fileKey = `${prefix}/${savedFileName}`;
      const fileSize = file.size;
      const fileContentType = file.type;

      const { data, error } = post<PresignedOutput>("/s3/presigned", {
        key: fileKey,
        contentType: fileContentType
      });

      watch(data, async (presignedOutput: PresignedOutput) => {
        const formData = new FormData();

        Object.keys(presignedOutput.fields).forEach((fieldKey) => {
          formData.append(fieldKey, presignedOutput.fields[fieldKey]);
        });

        formData.append("file", uploadObject, fileKey);

        const response = await fetch(presignedOutput.url, {
          body: formData,
          method: "post"
        });

        if (response.ok) {
          const fileSource = `${presignedOutput.url}/${presignedOutput.fields.key}`;

          const uploadedFile = {
            fileKey,
            fileName,
            fileContentType,
            fileSize,
            fileSource
          };

          resolve(uploadedFile);
        } else {
          console.log(`upload to provider failed with status ${response.status}`);

          reject("Upload to provider failed");
        }

        // watch(uploadData, (uploadResponse) => {
        //     console.log(uploadResponse);

        //     const fileUrl = `${presignedOutput.url}/${presignedOutput.fields.key}`;

        //     resolve(fileUrl);
        // });

        // watch(uploadError, (uploadErrorResponse) => {
        //     console.log(uploadErrorResponse);

        //     reject("Upload to provider failed");
        // });
      });

      watch(error, (e) => {
        console.log(e);

        reject("Getting upload request failed");
      });
    });
  };

  return {
    uploadFile
  };
};
