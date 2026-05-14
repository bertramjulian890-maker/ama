import { redirect } from 'next/navigation';

/** 旧链接 /print 已合并至 /letter */
export default function PrintLegacyRedirect() {
  redirect('/letter');
}
