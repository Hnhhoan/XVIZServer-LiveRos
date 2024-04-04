import {LiveRosXVIZConverter} from "../live-ros-converter/converters/live-ros-xviz-converter"
import { BaseXVIZLiveDataProvider } from "./base-xviz-live-data-provider"
export class LiveRosDataProvider extends BaseXVIZLiveDataProvider {
    constructor(options){
        super(new LiveRosXVIZConverter(options));
    }
    xvizMessage()
    {
        return this.getXvizMessage();
    }
    isSubcribed(){
        return this.converter.isSubcribed();
    }
    getStartTimestamp(){
        return this.converter.getStartTimestamp();
    }
    getEndTimestamp(){
        return this.converter.getEndTimestamp();
    }
    shutdown()
    {
        this.converter.shutdown();
    }
}