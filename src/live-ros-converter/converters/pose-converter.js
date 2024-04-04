//import * as THREE from 'three';
export default class PoseConverter{
	constructor(topicConfig,option) {
    this.option=option;
    this.topicConfig=topicConfig;
    this.streamName =topicConfig.config.xvizStream;
	}
	
	getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.streamName)
      .category('pose')
  }
	convertMessage(synchronizedData,xvizBuilder) {
    //const stamp=synchronizedData.get(this.topicConfig.topic).header.stamp;
    const pose=synchronizedData.get("/pose");
    const stamp=pose.timestamp;
    xvizBuilder
      .pose(this.streamName)
      .timestamp(stamp)
      .mapOrigin(
        pose.longitude,
        pose.latitude,
        pose.altitude)
      .orientation(pose.roll, pose.pitch,pose.yaw)
      .position(0, 0, 0);
  }
}