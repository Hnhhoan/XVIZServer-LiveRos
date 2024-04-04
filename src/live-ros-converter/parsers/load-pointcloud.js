import { PCDLoader } from './PCDLoader';
export async function loadPointCloud(filePath){
    const loader = new PCDLoader();
    return await loader.load(filePath);
}
