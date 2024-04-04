//import * as THREE from 'three';
export default class VehiclePose{
	constructor(topicConfig,option) {
    this.option=option;
    this.topicConfig=topicConfig;
    this.streamName =topicConfig.config.xvizStream;
	}
	getMetadata(xvizMetaBuilder) {
        const xb = xvizMetaBuilder;
        xb.stream(this.streamName)
        .category('variables');
   }
	convertMessage(synchronizedData,xvizBuilder) {
        const vehiclePose=synchronizedData.get(this.topicConfig.namespace+"_pose");
        xvizBuilder.variable(this.streamName).values([vehiclePose]);
        console.log(vehiclePose);
  }
}