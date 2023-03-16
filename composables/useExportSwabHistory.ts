import { utils, writeFile } from "xlsx";
import { useRepo } from "pinia-orm";
import SwabAreaHistory from "~~/models/SwabAreaHistory";
import SwabProductHistory from "~~/models/SwabProductHistory";
import { useDate, Shift, DateRangeInterface } from "./useDate";
import { SearchParams } from "./useRequest";
import { SwabStatus } from "./useSwab";
import SwabTestBacteria from "~~/models/SwabTestBacteria";
import SwabTestBacteriaSpecie from "~~/models/SwabTestBacteriaSpecie";

export interface ExportSwabHistoryFilter {
  date?: string;
  dateRange?: DateRangeInterface;
  shift?: Shift;
  facilityId?: string;
  facilityItemId?: string;
  mainSwabAreaId?: string;
  swabPeriodId?: string;
  swabTestCode?: string;
  productId?: string;
  skip?: number;
  take?: number;
  swabStatus?: SwabStatus;
}

export interface ExportSwabHistoryResponse {
  swabAreaHistories: SwabAreaHistory[];
  swabProductHistories: SwabProductHistory[];
  totalSwabAreaHistories: number;
  totalSwabProductHistories: number;
}

export const useExportSwabHistory = () => {
  const { get } = useRequest();
  const swabAreaHistoryRepo = useRepo(SwabAreaHistory);
  const swabProductHistoryRepo = useRepo(SwabProductHistory);
  const swabTestBacteriaRepo = useRepo(SwabTestBacteria);
  const swabTestBacteriaSpecieRepo = useRepo(SwabTestBacteriaSpecie);
  const { getProductById } = useProduct();
  const {
    getSwabAreaById,
    getSwabPeriodById,
    getSwabTestById,
    loadBacteriaToSwabTest,
    loadBacteriaSpeciesToSwabTest,
  } = useSwab();
  const { getFacilityById, getFacilityItemById } = useFacility();
  const { onlyDate, formatThLocale, formatTimeThLocale, shiftToAbbreviation } =
    useDate();
  const { setWidthColumn } = useXlsx();

  const toDto = (data: ExportSwabHistoryFilter): SearchParams => {
    const {
      date,
      dateRange,
      shift,
      facilityId,
      facilityItemId,
      mainSwabAreaId,
      swabPeriodId,
      swabTestCode,
      productId,
      skip,
      take,
      swabStatus,
    } = data;

    const params: any = {};

    if (date) {
      params.date = onlyDate(new Date(date));
    }

    if (dateRange) {
      params.fromDate = onlyDate(new Date(dateRange.from));
      params.toDate = onlyDate(new Date(dateRange.to));
    }

    if (shift && shift !== Shift.ALL) {
      params.shift = shift;
    }

    if (facilityId) {
      params.facilityId = facilityId;
    }

    if (facilityItemId) {
      params.facilityItemId = facilityItemId;
    }

    if (mainSwabAreaId) {
      params.swabAreaId = mainSwabAreaId;
    }

    if (swabPeriodId) {
      params.swabPeriodId = swabPeriodId;
    }

    if (swabTestCode) {
      params.swabTestCode = swabTestCode;
    }

    if (productId) {
      params.productId = productId;
    }

    if (swabStatus && swabStatus !== SwabStatus.ALL) {
      params.swabStatus = swabStatus;
    }

    if (skip !== undefined) {
      params.skip = skip;
    }
    if (take !== undefined) {
      params.take = take;
    }

    return params;
  };

  const tranformRawSwabAreaHistory = (swabAreaHistory: SwabAreaHistory) => {
    let swabArea = swabAreaHistory.swabArea;

    if (!swabArea) {
      swabArea = getSwabAreaById(swabAreaHistory.swabAreaId);
    }

    const swabPeriod = getSwabPeriodById(swabAreaHistory.swabPeriodId);

    let facility = null;

    if (swabArea) {
      facility = swabArea.facility;

      if (!facility) {
        facility = getFacilityById(swabArea.facilityId);
      }
    }

    let facilityItem = swabAreaHistory.facilityItem;

    if (!facilityItem) {
      facilityItem = getFacilityItemById(swabAreaHistory.facilityItemId);
    }

    let swabTest = swabAreaHistory.swabTest;

    if (!swabTest) {
      swabTest = loadBacteriaSpeciesToSwabTest(
        loadBacteriaToSwabTest(getSwabTestById(swabAreaHistory.swabTestId))
      );
    }

    let status = SwabStatus.NOT_RECORDED;
    let bacteriaSpecieNames = "";

    if (swabAreaHistory.swabAreaSwabedAt !== null) {
      status = SwabStatus.PENDING;
    }

    if (swabTest && swabTest.swabTestRecordedAt !== null) {
      const { bacteria = [], bacteriaSpecies = [] } = swabTest;

      status = bacteria.length ? SwabStatus.DETECTED : SwabStatus.NORMAL;

      if (bacteria.length) {
        bacteriaSpecieNames = SwabStatusMapper[SwabStatus.PENDING];

        if (bacteriaSpecies.length) {
          bacteriaSpecieNames = bacteriaSpecies
            .map(({ bacteriaSpecieName }) => bacteriaSpecieName)
            .join(",");
        }
      }
    }

    return {
      วันที่ตรวจ: formatThLocale(
        new Date(swabAreaHistory.swabAreaDate),
        "ddMMyy"
      ),
      รหัส: swabTest ? swabTest.swabTestCode : "",
      กะ: swabAreaHistory.shift
        ? shiftToAbbreviation(swabAreaHistory.shift)
        : "",
      ช่วงตรวจ: swabPeriod ? swabPeriod.swabPeriodName : "",
      เครื่อง: facility ? facility.facilityName : "",
      จุดตรวจ: swabArea ? swabArea.swabAreaName : "",
      status,
      ผลตรวจ: SwabStatusMapper[status],
      เวลาที่ตรวจ: swabAreaHistory.swabAreaSwabedAt
        ? formatTimeThLocale(swabAreaHistory.swabAreaSwabedAt)
        : "",
      ไลน์ที่ตรวจ: facilityItem ? facilityItem.facilityItemName : "",
      สายพันธุ์เชื้อ: bacteriaSpecieNames,
      swabTestId: swabAreaHistory.swabTestId,
    };
  };

  const tranformRawSwabProductHistory = (
    swabProductHistory: SwabProductHistory
  ) => {
    let product = swabProductHistory.product;

    if (!product) {
      product = getProductById(swabProductHistory.productId);
    }

    let swabPeriod = swabProductHistory.swabPeriod;

    if (!swabPeriod) {
      swabPeriod = getSwabPeriodById(swabProductHistory.swabPeriodId);
    }

    let facilityItem = swabProductHistory.facilityItem;

    if (!facilityItem) {
      facilityItem = getFacilityItemById(swabProductHistory.facilityItemId);
    }

    let facility = null;

    if (facilityItem) {
      facility = facilityItem.facility;

      if (!facility) {
        facility = getFacilityById(facilityItem.facilityId);
      }
    }

    let swabTest = swabProductHistory.swabTest;

    if (!swabTest) {
      swabTest = loadBacteriaSpeciesToSwabTest(
        loadBacteriaToSwabTest(getSwabTestById(swabProductHistory.swabTestId))
      );
    }

    let status = SwabStatus.NOT_RECORDED;
    let bacteriaSpecieNames = "";

    if (swabProductHistory.swabProductSwabedAt !== null) {
      status = SwabStatus.PENDING;
    }

    if (swabTest && swabTest.swabTestRecordedAt !== null) {
      const { bacteria = [], bacteriaSpecies = [] } = swabTest;

      status = bacteria.length ? SwabStatus.DETECTED : SwabStatus.NORMAL;

      if (bacteria.length) {
        bacteriaSpecieNames = SwabStatusMapper[SwabStatus.PENDING];

        if (bacteriaSpecies.length) {
          bacteriaSpecieNames = bacteriaSpecies
            .map(({ bacteriaSpecieName }) => bacteriaSpecieName)
            .join(",");
        }
      }
    }

    return {
      วันที่ตรวจ: formatThLocale(
        new Date(swabProductHistory.swabProductDate),
        "ddMMyy"
      ),
      รหัส: swabTest ? swabTest.swabTestCode : "",
      กะ: swabProductHistory.shift
        ? shiftToAbbreviation(swabProductHistory.shift)
        : "",
      ช่วงตรวจ: swabPeriod ? swabPeriod.swabPeriodName : "",
      เครื่อง: facility ? facility.facilityName : "",
      สินค้า: product ? product.productName : "",
      status,
      ผลตรวจ: SwabStatusMapper[status],
      เวลาที่ตรวจ: swabProductHistory.swabProductSwabedAt
        ? formatTimeThLocale(swabProductHistory.swabProductSwabedAt)
        : "",
      ไลน์ที่ตรวจ: facilityItem ? facilityItem.facilityItemName : "",
      สายพันธุ์เชื้อ: bacteriaSpecieNames,
      swabTestId: swabProductHistory.swabTestId,
    };
  };

  const fetch = (
    filter: ExportSwabHistoryFilter,
    options = { save: true }
  ): Promise<ExportSwabHistoryResponse> => {
    const params: SearchParams = toDto(filter);

    return new Promise((resolve, reject) => {
      const { data, error } = get<ExportSwabHistoryResponse>("/swab/export", {
        params,
      });

      watch(data, (swabPlanData) => {
        let {
          swabAreaHistories = [],
          swabProductHistories = [],
          totalSwabAreaHistories = 0,
          totalSwabProductHistories = 0,
        } = swabPlanData;

        if (options.save) {
          swabAreaHistories.forEach((swabAreaHistory) => {
            swabTestBacteriaRepo
              .where("swabTestId", swabAreaHistory.swabTestId)
              .delete();

            swabTestBacteriaSpecieRepo
              .where("swabTestId", swabAreaHistory.swabTestId)
              .delete();
          });

          swabAreaHistories = swabAreaHistoryRepo.save(swabAreaHistories);

          swabProductHistories.forEach((swabProductHistory) => {
            swabTestBacteriaRepo
              .where("swabTestId", swabProductHistory.swabTestId)
              .delete();

            swabTestBacteriaSpecieRepo
              .where("swabTestId", swabProductHistory.swabTestId)
              .delete();
          });

          swabProductHistories =
            swabProductHistoryRepo.save(swabProductHistories);
        }

        resolve({
          swabAreaHistories,
          swabProductHistories,
          totalSwabAreaHistories,
          totalSwabProductHistories,
        });
      });

      watch(error, reject);
    });
  };

  const exportReport = async (filter: ExportSwabHistoryFilter) => {
    const wb = utils.book_new();

    const fromDateString = filter.dateRange.from;

    const toDateString = filter.dateRange.to;

    // const exportedPage = 200;

    // const exportedData = await fetchExport(exportedPage);

    const exportedData: ExportSwabHistoryResponse = await fetch(
      {
        ...filter,
      },
      { save: false }
    );

    let exportedSwabAreaHistory = [
      ...exportedData.swabAreaHistories.map((swabAreaHistory, idx) => {
        return {
          ลำดับ: idx + 1,
          ...tranformRawSwabAreaHistory(swabAreaHistory),
        };
      }),
    ];

    if (exportedSwabAreaHistory.length) {
      const wsSwabAreaHistoryHeaders = [
        "ลำดับ",
        "วันที่ตรวจ",
        "รหัส",
        "กะ",
        "ช่วงตรวจ",
        "เครื่อง",
        "จุดตรวจ",
        "ผลตรวจ",
        "เวลาที่ตรวจ",
        "ไลน์ที่ตรวจ",
        "สายพันธุ์เชื้อ",
      ];

      let wsSwabAreaHistory = utils.json_to_sheet(
        exportedSwabAreaHistory.map((swabAreaHistory) => {
          return wsSwabAreaHistoryHeaders.reduce((acc, header) => {
            acc[header] = swabAreaHistory[header];

            return acc;
          }, {});
        })
      );

      wsSwabAreaHistory = setWidthColumn(
        wsSwabAreaHistory,
        wsSwabAreaHistoryHeaders,
        exportedSwabAreaHistory,
        { ลำดับ: 10, กะ: 10 }
      );

      utils.book_append_sheet(wb, wsSwabAreaHistory, "รายการจุดตรวจ swab");

      exportedSwabAreaHistory = null;
    }

    let exportedSwabProductHistory = [
      ...exportedData.swabProductHistories.map((swabProductHistory, idx) => {
        return {
          ลำดับ: idx + 1,
          ...tranformRawSwabProductHistory(swabProductHistory),
        };
      }),
    ];

    if (exportedSwabProductHistory.length) {
      const wsSwabProductHistoryHeaders = [
        "ลำดับ",
        "วันที่ตรวจ",
        "รหัส",
        "กะ",
        "ช่วงตรวจ",
        "ผลตรวจ",
        "เวลาที่ตรวจ",
        "ไลน์ที่ตรวจ",
        "สายพันธุ์เชื้อ",
      ];

      let wsSwabProductHistory = utils.json_to_sheet(
        exportedSwabProductHistory.map((swabProductHistory) => {
          return wsSwabProductHistoryHeaders.reduce((acc, header) => {
            acc[header] = swabProductHistory[header];

            return acc;
          }, {});
        })
      );

      wsSwabProductHistory = setWidthColumn(
        wsSwabProductHistory,
        wsSwabProductHistoryHeaders,
        exportedSwabProductHistory,
        { ลำดับ: 10, กะ: 10 }
      );

      utils.book_append_sheet(wb, wsSwabProductHistory, "รายการตรวจสินค้า");

      exportedSwabProductHistory = null;
    }

    let fileNames = [
      "รายงานจุดswab",
      fromDateString === toDateString
        ? fromDateString
        : `${fromDateString}-${toDateString}`,
    ];

    if (filter.swabStatus !== SwabStatus.ALL) {
      fileNames.push(SwabStatusMapper[filter.swabStatus]);
    }

    writeFile(wb, `${fileNames.join("_")}.xlsx`);
  };

  return {
    toDto,
    tranformRawSwabAreaHistory,
    tranformRawSwabProductHistory,
    api() {
      return {
        fetch,
        exportReport,
      };
    },
  };
};
