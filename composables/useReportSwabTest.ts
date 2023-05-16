import SwabTest from "~/models/SwabTest";

export interface ReportSwabTestData {
  reportReason: string;
  reportDetail?: string | null;
}

export interface ReportSwabTestResponse {
  ok: string;
  message: string;
  result: SwabTest;
}

export interface RemoveReportSwabTestResponse extends ReportSwabTestResponse {}

export const useReportSwabTest = () => {
  const { put } = useRequest();

  const swabTestRepo = useRepo(SwabTest);

  const showModalReport = ref(false);

  const reportedSwabTestId = ref<string | null>(null);

  const openModalReport = (swabTestId: string) => {
    showModalReport.value = true;
    reportedSwabTestId.value = swabTestId;
  };

  const report = async (
    swabTestId: string,
    body: ReportSwabTestData
  ): Promise<void> => {
    const data = await put<ReportSwabTestResponse>(
      `/swab-test/${swabTestId}/report`,
      body
    );

    swabTestRepo.save(data.result);
  };

  const remove = async (swabTestId: string): Promise<void> => {
    const data = await put<RemoveReportSwabTestResponse>(
      `/swab-test/${swabTestId}/remove-report`,
      {}
    );

    swabTestRepo.save(data.result);
  };

  return {
    showModalReport,
    reportedSwabTestId,
    openModalReport,
    api() {
      return {
        report,
        remove,
      };
    },
  };
};
