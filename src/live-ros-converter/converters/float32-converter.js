//import * as THREE from 'three';
export default class Float32Converter{
	constructor(topicConfig,option) {
    this.option=option;
    this.topicConfig=topicConfig;
    this.streamName =topicConfig.config.xvizStream;
    this.unit=topicConfig.config.unit?topicConfig.config.unit:"";
	}
	
	getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.streamName)
      .category('time_series')
      .type('float')
      .unit(this.unit);
  }
	convertMessage(synchronizedData,xvizBuilder) {
    const msg=synchronizedData.get(this.topicConfig.topic);
    const stamp=synchronizedData.get("/pose").timestamp;
    if(msg)
      xvizBuilder
            .timeSeries(this.streamName)
            .timestamp(stamp)
            .value(msg.data);
  }
}