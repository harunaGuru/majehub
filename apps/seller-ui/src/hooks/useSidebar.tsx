import { useAtom } from 'jotai';
import { activeSideBarItem } from '@/config/constant';

const useSidebar = ()=>{
  const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem)
  return {activeSidebar, setActiveSidebar}
}
export default useSidebar;