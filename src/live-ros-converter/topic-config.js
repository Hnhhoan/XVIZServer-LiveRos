const poseTopicConfig={
    "topic": "/gps/fix",
    "type": "sensor_msgs/NavSatFix",
    "config": {
          "xvizStream": "/vehicle_pose"
      }
};
const topicConfig= [
{
    "topic": "/current_pose",
    "type": "geometry_msgs/PoseStamped"
    
},
{
    "topic": "/gps/imu",
    "type": "sensor_msgs/Imu",
    "config": {
          "xvizStream": "/vehicle/acceleration"
      }
}
,
{
    "topic": "/detection/lidar_detector/objects_markers",
    "type": "visualization_msgs/MarkerArray",
    "config":{"xvizStream":"/object/marker"}
},

{
    "topic": "/detection/lidar_detector/objects",
    "type": "autoware_msgs/DetectedObjectArray",
    "config":{
          "xvizStream": "/detection/objects",
          "xvizStreamOfTrackingPoints":"/detection/lidar_detector/tracking_points",
          "xvizStreamOfLabel":"/detection/lidar_detector/labels"}
}
,

{
    "topic": "/points_raw",
    "type": "sensor_msgs/PointCloud2",
    "config":{"xvizStream":"/points/raw",
              "baseColor":{"r":10,"g":10,"b":10},"fill_color": "#707070"}//"convert":"LidarConverter"
},
{
    "topic": "/points_ground",
    "type": "sensor_msgs/PointCloud2",
    "config":{"xvizStream":"/points/ground",
              "baseColor":{"r":10,"g":10,"b":10},"fill_color": "#000"}//"convert":"LidarConverter"
},
{
    "topic": "/points_no_ground",
    "type": "sensor_msgs/PointCloud2",
    "config":{"xvizStream":"/points/no_ground",
              "baseColor":{"r":10,"g":10,"b":10},"fill_color": "#00a"}////"convert":"LidarConverter"
    
},
/*{
    "topic": "/ssc/turn_signal_command",
    "type": "automotive_platform_msgs/TurnSignalCommand",
    "config":{"xvizStream":"/vehicle/turn_signal"}
  },*/
{
    "topic": "/pacmod/as_tx/vehicle_speed",
    "type": "std_msgs/Float64",
    "config":{
      "xvizStream":"/vehicle/speed",
      "unit":"km/h"
    }
  }	
]

export {poseTopicConfig,topicConfig};