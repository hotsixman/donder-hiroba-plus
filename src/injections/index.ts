import { parseDonderInfo, updateDonderInfo } from '../lib/donder'

export default async (): Promise<void> => {
  const donderInfo = parseDonderInfo()
  await updateDonderInfo(donderInfo)

  // eslint-disable-next-line
  document.querySelector('body')?.insertAdjacentHTML(`afterbegin`, `<a href='/#/'>해시로 이동</a>`)
}
