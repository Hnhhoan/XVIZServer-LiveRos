//const rosnodejs = require('rosnodejs');
import Rosnodejs from 'rosnodejs';
import TopicBuffer from "./topic-buffer";
import {getPose} from "../common/synchronize";
//Rosnodejs.loadAllPackages();
export default class RosSubscriber {
    /*{poseTopic:{config,topic,type},topics:[{config,topic,type}]}*/
    constructor(option) {
      this.option =option;
      this.topics=option.topics;
      this.namespaces=new Set();
      this.exTopics=option.exTopics.map(exTopic=>{
        const t={...exTopic};
        t.topic=t.namespace+t.topic;
        t.config.xvizStream=t.namespace+t.config.xvizStream;
        this.namespaces.add(t.namespace);
        return t;
      });
      this.poseTopic=option.poseTopic;
      this.poseBuffer=[];
      this.start_timestamp=undefined;
      this.buffer=((topics,exTopics)=>{
      const map=new Map();
      const atopics= [...topics, ...exTopics];
      atopics.forEach(t=>{
          map.set(t.topic,new TopicBuffer(t));
      })
      return map;
      })(this.topics,this.exTopics);
    }
    start(){
       return new Promise((resolve,reject)=>{Rosnodejs.initNode('/ros_node',{ROS_MASTER_URI:"http://docker-desktop:11311/"})
       .then(() => {
         const nh = Rosnodejs.nh;
         this.subscribe(nh);
         resolve(true);
       }).catch((err)=>{console.log(err); reject(false)});}) 
    }
    shutdown(){
        Rosnodejs.shutdown();
    }
    subscribe=(nh)=>{
    const pose_sub = nh.subscribe(this.poseTopic.topic, this.poseTopic.type, (msg) => {
              this.start_timestamp=this.start_timestamp==undefined?msg.header.stamp.secs+msg.header.stamp.nsecs*Math.pow(10,-9):this.start_timestamp;
              this.poseBuffer.push(msg);
          }, {
            transports: ["TCPROS", "UDPROS"],  // specify transports, default ["TCPROS"]
            dgramSize: this.poseTopic.datagram?this.poseTopic.datagram:1500 // optional: datagram packet size, default: 1500 bytes
          });
      const topics=this.getTopicConfig();
      topics.forEach(t=>{
          const sub = nh.subscribe(t.topic, t.type, (msg) => {
              this.push(t,msg);
          }, {
            transports: ["TCPROS", "UDPROS"],  // specify transports, default ["TCPROS"]
            dgramSize: t.datagram?t.datagram:1500 // optional: datagram packet size, default: 1500 bytes
          });
      })
    }
    push(t,msg){
      this.buffer.get(t.topic).push(msg);
    }
    
    synchronizeData(synchronizeMode){
      const map=new Map();
      //&&this.topics.every(t=>this.buffer.get(t.topic).buffer.length)
      //&&this.buffer.get(imu).buffer.length
      const gps="/gps/fix";
      const imu="/gps/imu";
      if(this.poseBuffer.length&&this.buffer.get(imu).buffer.length){
        map.set(this.poseTopic.topic,this.poseBuffer.shift());
        Array.from(this.buffer.keys()).forEach(k=>{
          //this.buffer.get(k).buffer.length
          map.set(k,this.buffer.get(k).read());
        });
        if(map.get(gps)&&map.get(imu))
          map.set("/pose",getPose(map.get(gps),map.get(imu),{yaw:+Math.PI/35}));
        this.namespaces.forEach(namespace=>{
          const gpsData=map.get(namespace+gps);
          const imuData=map.get(namespace+imu);
          if(gpsData&&imuData){
            map.set(namespace+"_pose",getPose(gpsData,imuData,{yaw:+Math.PI/35}));
          }
        });
      }
      return map;
    }
    
    getStartTimestamp(){
      return this.start_timestamp;
    }
    getTopicConfig(){
      return [...this.topics,...this.exTopics];
    }
  }

