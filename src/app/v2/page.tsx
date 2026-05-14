import { redirect } from 'next/navigation';

/** 旧版 /v2 已并入首页，保留路径避免书签失效 */
export default function LegacyV2Redirect() {
  redirect('/');
}
