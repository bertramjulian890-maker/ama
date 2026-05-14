/** sessionStorage 键：首页「寄出」写入，/letter 信笺页读取 */
export const QIAOPI_PRINT_STORAGE_KEY = 'qiaopi-print-payload';

export type QiaopiPrintPayload = {
  receiverTitle: string;
  content: string;
  senderName: string;
  republicYearDisplay: string;
  location: string;
};
